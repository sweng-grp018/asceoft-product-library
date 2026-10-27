import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/modules/auth/server/auth";

export const { GET, POST } = toNextJsHandler(auth);
