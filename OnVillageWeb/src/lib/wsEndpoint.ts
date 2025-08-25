export const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "wss://dev.on-village.com";
export const WS_PATH = import.meta.env.VITE_WS_PATH || "/ws/chat";

export function buildWsUrl() {
  const u = new URL(WS_PATH, WS_BASE);
  const token = localStorage.getItem("access_token"); // 토큰 없으면 이 줄 삭제
  if (token) u.searchParams.set("token", token);
  return u.toString();
}