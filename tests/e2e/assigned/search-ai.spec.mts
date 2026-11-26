import {test,expect,png} from "../../support/qa.mjs";
for(const role of ["ADMIN","STAFF"] as const){
  test.describe(role,()=>{
    test.use({role});
    test("mocked shelf match and correction permissions",async({page,account,key,db})=>{
      const vector=Array(512).fill(0); vector[0]=1;
      const product=await db.product.create({data:{name:key,sku:key,indexStatus:"INDEXED",
        images:{create:{objectKey:"qa/"+key,contentType:"image/png",embedding:vector,embeddingModel:"openclip-ViT-B-32-openai"}}}});
      await page.goto("/repository");
      await page.locator("#upload-photo").setInputFiles(png);
      const put=page.waitForResponse(r=>r.request().method()==="PUT" && r.url().includes("/shelf/"));
      await page.getByRole("button",{name:"Save photo"}).click();
      const id=new URL((await put).url()).pathname.split("/").pop()!;
      try {
        await expect(page.getByText("Photo saved.",{exact:true})).toBeVisible();
        await page.goto("/detection");
        await page.getByLabel("Saved shelf photo").selectOption(id);
        await page.getByRole("button",{name:"Find products",exact:true}).click();
        await expect(page.getByText("1 item found",{exact:true})).toBeVisible();
        const user=await db.user.findUniqueOrThrow({where:{email:account}});
        const history=await db.searchHistory.findFirstOrThrow({where:{userId:user.id,imageId:id},include:{matches:true}});
        expect(history.matches.map(m=>m.productId)).toEqual([product.id]);
        const save=page.getByRole("button",{name:"Save product choice"});
        if(role==="STAFF"){await expect(save).toHaveCount(0);return;}
        await page.getByLabel("Product",{exact:true}).selectOption("");
        await save.click();
        await expect(page.getByText("Product choice saved.")).toBeVisible();
        expect(await db.detectionMatch.findUnique({where:{id:history.matches[0].id}}))
          .toMatchObject({productId:null,manuallySet:true});
      }finally{
        await db.searchHistory.deleteMany({where:{imageId:id}});
        await db.repositoryImage.deleteMany({where:{id}});
      }
    });
  });
}
test("unavailable inference gives an actionable message",async({page,account})=>{
  expect(account).toBeTruthy();
  await page.goto("/search?mode=image");
  await page.getByLabel("Product photo").setInputFiles({...png,buffer:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP8z4AdMOEQH6QSAM1BAQ/oQeJvAAAAAElFTkSuQmCC","base64")});
  await page.getByRole("button",{name:"Find matching products"}).click();
  await expect(page.getByText("Photo search is unavailable right now. Please try again later.")).toBeVisible();
  await expect(page.getByRole("region",{name:"Image search results"})).toHaveCount(0);
});

test("image search displays the product matching the mock embedding", async ({page,account,key,db}) => {
  expect(account).toBeTruthy();
  const vector = Array(512).fill(0);
  vector[0] = 1;
  const product = await db.product.create({
    data: {
      name: key, sku: key, indexStatus: "INDEXED",
      images: {create: {
        objectKey: "qa/"+key, contentType: "image/png", embedding: vector,
        embeddingModel: "openclip-ViT-B-32-openai",
      }},
    },
  });
  await page.goto("/search?mode=image");
  await page.getByLabel("Product photo").setInputFiles(png);
  await page.getByRole("button",{name:"Find matching products"}).click();
  const match = page.getByRole("region",{name:"Image search results"}).getByRole("link",{name:new RegExp(key)});
  await expect(match).toHaveAttribute("href","/search/"+product.id);
});
