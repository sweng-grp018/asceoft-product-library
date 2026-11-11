/** Client-side file download. Keeps DOM plumbing out of feature components. */
export function downloadFile(filename: string, contents: string, mimeType = "application/json") {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
