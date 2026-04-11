import Constants from "expo-constants";

type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

export type CoachContext = {
  displayName?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  latestScanSummary?: string;
};

export async function fetchCoachReply(params: {
  messages: ChatTurn[];
  context: CoachContext;
}): Promise<{ ok: true; reply: string; model?: string } | { ok: false; message: string }> {
  const raw = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  const base = raw?.apiBaseUrl?.trim();
  if (!base) {
    return {
      ok: false,
      message:
        "Set EXPO_PUBLIC_API_BASE_URL to your api-server (e.g. http://192.168.0.5:3333) and restart Expo.",
    };
  }

  const url = `${base.replace(/\/$/, "")}/api/coach`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: params.messages,
        context: params.context,
      }),
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error calling coach API.",
    };
  }

  const data = (await res.json().catch(() => ({}))) as {
    reply?: string;
    model?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      message:
        typeof data.message === "string"
          ? data.message
          : `Coach request failed (${res.status}${data.error ? `: ${data.error}` : ""}).`,
    };
  }

  if (typeof data.reply === "string" && data.reply.trim()) {
    return { ok: true, reply: data.reply.trim(), model: data.model };
  }

  return { ok: false, message: "Coach returned an empty reply." };
}
