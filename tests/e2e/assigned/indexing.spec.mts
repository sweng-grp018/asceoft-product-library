import {test,expect,png} from "../../support/qa.mjs";
for(const role of ["ADMIN","STAFF","PUBLIC"] as const){
  test.describe(role,()=>{
    test.use({role});
    test("reference upload and preparation follow role",async({page,account,key,db})=>{
      expect(account).toBeTruthy();
      const product=await db.product.create({data:{name:key,sku:key}});
      if(role==="STAFF"){
        // Existing reference makes the prepare button eligible if permissions are wrong.
        await db.referenceImage.create({data:{productId:product.id,objectKey:"qa/"+key,contentType:"image/png"}});
      }
      await page.goto("/products/"+product.id);
      const prepare=page.getByRole("button",{name:"Prepare photos for search"});
      if(role!=="ADMIN"){
        if(role==="PUBLIC") await expect(page).toHaveURL(/\/search$/);
        else await expect(page.getByRole("heading",{name:key,exact:true})).toBeVisible();
        await expect(page.locator("#upload-photo")).toHaveCount(0);
        await expect(prepare).toHaveCount(0);
        return;
      }
      await expect(page.getByText("Not ready",{exact:true})).toBeVisible();
      await page.locator("#upload-photo").setInputFiles(png);
      await page.getByRole("button",{name:"Save photo"}).click();
      await prepare.click();
      await expect(page.getByText("Ready",{exact:true})).toBeVisible();
      await page.reload();
      await expect(page.getByText("Ready",{exact:true})).toBeVisible();
      expect((await db.product.findUniqueOrThrow({where:{id:product.id}})).indexStatus).toBe("INDEXED");
    });
  });
}
