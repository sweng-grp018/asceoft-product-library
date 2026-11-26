import {test,expect,png} from "../../support/qa.mjs";
for(const role of ["ADMIN","STAFF","PUBLIC"] as const){
  test.describe(role,()=>{
    test.use({role});
    test("shelf photo upload follows role",async({page,account,db})=>{
      expect(account).toBeTruthy();
      await page.goto("/repository");
      if(role==="PUBLIC"){
        await expect(page).toHaveURL(/\/search$/);
        await expect(page.locator("#upload-photo")).toHaveCount(0);
        return;
      }
      const form=page.locator("form").filter({has:page.locator("#upload-photo")});
      await form.getByLabel("Photo",{exact:true}).setInputFiles(png);
      const uploaded=page.waitForResponse(r=>r.request().method()==="PUT" && r.url().includes("/shelf/"));
      await form.getByRole("button",{name:"Save photo"}).click();
      const put=await uploaded;
      const id=new URL(put.url()).pathname.split("/").pop()!;
      try {
        await expect(form.getByRole("status")).toHaveText("Photo saved.");
        await page.reload();
        await expect(page.locator('img[src*="'+id+'"]')).toBeVisible();
      }finally{await db.repositoryImage.deleteMany({where:{id}});}
    });
  });
}
test("invalid shelf file shows the upload error",async({page,account})=>{
  expect(account).toBeTruthy();
  await page.goto("/repository");
  await page.locator("#upload-photo").setInputFiles({name:"notes.txt",mimeType:"text/plain",buffer:Buffer.from("notes")});
  await page.getByRole("button",{name:"Save photo"}).click();
  await expect(page.getByText(/We could not save that photo/)).toBeVisible();
});
