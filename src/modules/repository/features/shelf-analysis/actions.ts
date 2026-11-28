"use server";

import { z } from "zod";
import { api, type Match } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { can, type Permission } from "@/modules/auth/permissions";
import { actionError, type ActionResult } from "@/lib/action-result";

async function requireShelfPermission(permission: Permission, message: string) {
  const user = (await auth())?.user;
  if (!can(user?.role, permission)) throw new Error(message);
}

export async function correctMatch(
  searchId: string,
  matchId: string,
  data: FormData,
): Promise<ActionResult> {
  try {
    await requireShelfPermission("matches:correct", "Only store managers can correct matches");
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
    await requireShelfPermission("repository:analyze", "Staff access required");
    const imageId = z.uuid().parse(data.get("imageId"));
    return await api<{ searchId: string; matches: Match[] }>(`/repository/${imageId}/analyze`, {
      method: "POST",
      timeout: 125000,
    });
  } catch (error) {
    return actionError(error);
  }
}
