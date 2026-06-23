export function vibratePop(enabled: boolean): void {
  if (!enabled || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(15);
  } catch {
    // iOS webviews may reject vibration — fail silently
  }
}
