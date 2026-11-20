"use server";

import { z } from "zod";
import { api, type Match } from "@/lib/api";
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
    return { message: "Product choice saved." };
  } catch (error) {
    return actionError(error);
  }
}

type ShelfSearchState = ActionResult & { searchId?: string; matches?: Match[] };

export async function analyzeSelectedShelf(
  _previous: ShelfSearchState,
  data: FormData,
): Promise<ShelfSearchState> {
  try {
    await staffOnly();
    const imageId = z.uuid().parse(data.get("imageId"));
    return await api<{ searchId: string; matches: Match[] }>(`/repository/${imageId}/analyze`, {
      method: "POST",
      timeout: 125000,
    });
  } catch (error) {
    return actionError(error);
  }
}
