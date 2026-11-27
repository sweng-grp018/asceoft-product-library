import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
const storage = new S3Client({
  endpoint: "http://127.0.0.1:9000",
  region: "us-east-1",
  forcePathStyle: true,
  credentials: { accessKeyId: "S3RVER", secretAccessKey: "S3RVER" },
});
export async function deleteUploadedFixture(key: string) {
  await storage.send(new DeleteObjectCommand({ Bucket: "lensistry-qa", Key: key }));
}
