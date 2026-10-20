// Minimal client for the club's Supabase functions. Every call carries the club passcode,
// and the database rejects anything without it. The key below is a public, publishable key.
const URL = "https://zvbjogfxkkhmshiyrjha.supabase.co";
const KEY = "sb_publishable_YvcOwz6asla8JaGEBxurhw_mV4-XAcK";

export class PasscodeError extends Error {}

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    if (text.includes("bad passcode")) throw new PasscodeError("Wrong club passcode");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (text ? JSON.parse(text) : null) as T;
}
