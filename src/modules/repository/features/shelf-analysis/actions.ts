"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";

async function staffOnly() {
  const user = (await auth())?.user;
  if (!user || !["ADMIN", "STAFF"].includes(user.role)) throw new Error("Staff access required");
}

export async function uploadShelf(data: FormData) {
  await staffOnly();
  const file = data.get("image");
  if (
    !(file instanceof File) ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size < 1 ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Select an image up to 10 MiB");
  const { uploadUrl, imageId } = await api<{ uploadUrl: string; imageId: string }>("/repository", {
    method: "POST",
    body: JSON.stringify({
      contentType: file.type,
      store: String(data.get("store") ?? ""),
      campaign: String(data.get("campaign") ?? ""),
    }),
  });
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!upload.ok) throw new Error("Object storage upload failed");
  revalidatePath("/repository");
  redirect(`/repository?uploaded=${imageId}`);
}

export async function analyzeShelf(imageId: string) {
  await staffOnly();
  const { searchId } = await api<{ searchId: string }>(
    `/repository/${z.uuid().parse(imageId)}/analyze`,
    { method: "POST" },
  );
  revalidatePath("/history");
  redirect(`/history?searchId=${searchId}`);
}

export async function correctMatch(searchId: string, matchId: string, data: FormData) {
  await staffOnly();
  const input = String(data.get("productId") ?? "");
  const productId = input ? z.uuid().parse(input) : null;
  await api(`/repository/searches/${z.uuid().parse(searchId)}/matches/${z.uuid().parse(matchId)}`, {
    method: "PATCH",
    body: JSON.stringify({ productId }),
  });
  revalidatePath("/history");
}
