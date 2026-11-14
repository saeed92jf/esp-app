// src/modules/customers/utils/download-logo.ts

/**
 * Cleanly downloads a company/plant logo file with proper naming.
 * Uses fetch + blob when possible to trigger direct browser download,
 * falling back to link download.
 */
export async function downloadLogo(
  logoUrl: string | undefined | null,
  companyName: string
): Promise<boolean> {
  if (!logoUrl) return false;

  const sanitized = companyName
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .trim();

  // Determine extension
  const cleanUrl = logoUrl.split("?")[0];
  const parts = cleanUrl.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "png";
  const filename = `${sanitized}-logo.${ext}`;

  try {
    const response = await fetch(logoUrl, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return true;
  } catch {
    // Fallback: direct anchor download
    const a = document.createElement("a");
    a.href = logoUrl;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
