"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { actionError, type ActionResult } from "@/lib/action-result";

async function staffOnly() {
  const user = (await auth())?.user;
  if (!user || !["ADMIN", "STAFF"].includes(user.role)) throw new Error("Staff access required");
}

export async function correctMatch(
  searchId: string,
  matchId: string,
  data: FormData,
): Promise<ActionResult> {
  try {
    await staffOnly();
    const input = String(data.get("productId") ?? "");
    const productId = input ? z.uuid().parse(input) : null;
    await api(
      `/repository/searches/${z.uuid().parse(searchId)}/matches/${z.uuid().parse(matchId)}`,
      { method: "PATCH", data: { productId } },
    );
    revalidatePath("/history");
    return { message: "Product choice saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function analyzeSelectedShelf(data: FormData): Promise<ActionResult> {
  let searchId: string;
  try {
    await staffOnly();
    const imageId = z.uuid().parse(data.get("imageId"));
    const result = await api<{ searchId: string }>(`/repository/${imageId}/analyze`, {
      method: "POST",
      timeout: 120000,
    });
    searchId = result.searchId;
  } catch {
    return {
      error: "We could not search this photo. Please try again when photo search is available.",
    };
  }
  revalidatePath("/history");
  redirect(`/history?searchId=${searchId}`);
}
