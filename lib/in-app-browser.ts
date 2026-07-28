/**
 * Detect social / embedded webviews that hijack HTML5 <video>
 * into a native “tap to play” player (especially TikTok).
 */
export function isHostileVideoWebview(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /TikTok|Bytedance|ByteLocale|musical_ly|Aweme|ultralite|Webcast|Instagram|FBAN|FBAV|FB_IAB|Line\//i.test(
    ua,
  );
}
