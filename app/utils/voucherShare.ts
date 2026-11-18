import { API_URL } from "@/app/utils/constants";

/** The voucher's QR code as a PNG file (chat apps take PNGs more readily than SVG) */
export async function voucherQrPng(code: string): Promise<File> {
  const svg = await (await fetch(`${API_URL}/api/vouchers/qr/${encodeURIComponent(code)}`)).text();
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, 0, 0, size, size);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not draw the QR code"))), "image/png"),
  );
  return new File([blob], `voucher-${code}.png`, { type: "image/png" });
}

/**
 * Open the device's share sheet with the QR image and link. Falls back to the
 * link alone, then to copying it. Returns what happened, for a short notice.
 */
export async function shareVoucher(code: string, url: string): Promise<"shared" | "copied" | "cancelled"> {
  try {
    const file = await voucherQrPng(code).catch(() => null);
    const withFile = file ? { files: [file], title: "Your voucher", text: url } : null;
    if (withFile && navigator.canShare?.(withFile)) {
      await navigator.share(withFile);
      return "shared";
    }
    if (navigator.share) {
      await navigator.share({ title: "Your voucher", url });
      return "shared";
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return "cancelled";
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

export async function copyVoucherLink(url: string) {
  await navigator.clipboard.writeText(url);
}

export async function downloadVoucherQr(code: string) {
  const file = await voucherQrPng(code);
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(href);
}
