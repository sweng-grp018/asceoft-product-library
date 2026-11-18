import { randomUUID } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config.js";

const s3 = new S3Client({
  endpoint: config.S3_ENDPOINT,
  region: config.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
  },
});
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function newImageKey(prefix: "reference" | "shelf") {
  return `${prefix}/${randomUUID()}`;
}

export async function uploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
}

export async function readImage(key: string) {
  const head = await s3.send(new HeadObjectCommand({ Bucket: config.S3_BUCKET, Key: key }));
  if (!head.ContentLength || head.ContentLength > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error("Image must be 1 byte to 10 MiB"), { status: 422 });
  }
  const response = await s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key }));
  return {
    bytes: Buffer.from(await response.Body!.transformToByteArray()),
    contentType: head.ContentType,
  };
}
