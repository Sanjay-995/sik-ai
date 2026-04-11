import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(12_000),
});

const coachBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  context: z
    .object({
      displayName: z.string().optional(),
      heightCm: z.number().optional(),
      weightKg: z.number().optional(),
      goal: z.string().optional(),
      latestScanSummary: z.string().optional(),
    })
    .optional(),
});

function buildSystemPrompt(context: z.infer<typeof coachBodySchema>["context"]): string {
  const parts = [
    "You are Sik AI Coach, a concise fitness assistant.",
    "Never claim you analyzed real LiDAR, medical imaging, or clinical measurements unless the user context explicitly states those exist.",
    "If scan data is described as demo, estimated, or simulated, acknowledge limitations briefly.",
    "Give practical, safe general guidance; you are not a doctor.",
  ];
  if (context?.displayName) parts.push(`User first name or display label: ${context.displayName}.`);
  if (context?.heightCm != null) parts.push(`Height (cm, self-reported): ${context.heightCm}.`);
  if (context?.weightKg != null) parts.push(`Weight (kg, self-reported): ${context.weightKg}.`);
  if (context?.goal) parts.push(`Stated goal: ${context.goal}.`);
  if (context?.latestScanSummary) parts.push(`Latest scan summary (may be demo): ${context.latestScanSummary}`);
  return parts.join("\n");
}

router.post("/coach", async (req, res) => {
  const parsed = coachBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    res.status(503).json({
      error: "coach_unavailable",
      message:
        "OPENAI_API_KEY is not set on the server. Configure it to enable live coaching, or use the app’s offline guidance.",
    });
    return;
  }

  const system = buildSystemPrompt(parsed.data.context);
  const openaiMessages = [
    { role: "system" as const, content: system },
    ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.6,
        max_tokens: 700,
      }),
    });

    const raw = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!r.ok) {
      res.status(502).json({
        error: "openai_error",
        message: raw.error?.message ?? `OpenAI HTTP ${r.status}`,
      });
      return;
    }

    const text = raw.choices?.[0]?.message?.content?.trim();
    if (!text) {
      res.status(502).json({ error: "empty_completion", message: "Model returned no text." });
      return;
    }

    res.json({ reply: text, source: "openai", model });
  } catch (e) {
    res.status(502).json({
      error: "openai_fetch_failed",
      message: e instanceof Error ? e.message : "Unknown error",
    });
  }
});

export default router;
