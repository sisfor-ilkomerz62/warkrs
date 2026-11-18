import { fromJakartaInput } from "./time";
export function validWarTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
export function warDatePayload(value: string) {
  if (!validWarTime(value.split("T")[1] ?? "")) return "";
  try { return fromJakartaInput(value); } catch { return ""; }
}
export function quotaDigits(value: string): string | null {
  return /^\d*$/.test(value) ? value.replace(/^0+(?=\d)/, "") : null;
}
