export type ActionResult = { error?: string; message?: string };

export function actionError(error: unknown): ActionResult {
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}
