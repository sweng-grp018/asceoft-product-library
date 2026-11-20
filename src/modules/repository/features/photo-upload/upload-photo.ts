"use client";
import axios from "axios";
import { validateImageFile } from "@/lib/image";
import { preparePhoto, finishPhoto } from "./actions";

export async function uploadPhoto(
  file: File,
  productId?: string,
  store?: string,
  collection?: string,
) {
  const problem = validateImageFile(file);
  if (problem || !file.size) throw new Error(problem ?? "Choose a photo first.");
  const destination = await preparePhoto(file.type, productId);
  if (file.size > destination.maxBytes) throw new Error("Choose a photo smaller than 10 MB.");
  await axios.put(destination.uploadUrl, file, {
    headers: { "Content-Type": file.type },
    timeout: 60000,
  });
  await finishPhoto(destination, file.type, productId, store, collection);
}
