import { Router, type IRouter } from "express";
import { AnalyzeScanBody, AnalyzeScanResponse } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert AI body measurement analyst. A user will provide a front-view photo of their body (and optionally a side-view photo) along with their known height, weight, age, and gender. Visually analyze posture, body proportions, and visible muscle/fat distribution to estimate precise body measurements.

Return ONLY a valid JSON object — no markdown, no code fences, no explanations:

{
  "measurements": {
    "chest": <circumference in cm>,
    "waist": <circumference in cm — narrowest point>,
    "hips": <circumference in cm — fullest point>,
    "leftArm": <upper arm circumference in cm>,
    "rightArm": <upper arm circumference in cm>,
    "leftThigh": <thigh circumference in cm>,
    "rightThigh": <thigh circumference in cm>,
    "neck": <neck circumference in cm>,
    "shoulders": <shoulder width / biacromial circumference in cm>,
    "bodyFat": <body fat percentage as a decimal number, e.g. 18.5>,
    "muscleMass": <estimated lean muscle mass in kg>
  },
  "weight": <use the exact provided weight in kg>,
  "bmi": <weight_kg / (height_m * height_m), 1 decimal place>,
  "score": <integer 40–100 — composite body composition score>,
  "insights": [<2–3 concise, actionable 1-sentence observations>]
}

Rules:
- Anchor ALL measurements to the provided height — it is the most critical calibration reference.
- Use the provided weight exactly for the "weight" field.
- Compute BMI = weight / (height_in_meters)^2, rounded to 1 decimal.
- Body fat: estimate from visible leanness, muscle definition, and gender norms.
- Muscle mass ≈ weight * (1 - bodyFat/100) * 0.85 (skeletal muscle fraction).
- Score: 85–100 excellent, 70–84 good, 55–69 average, 40–54 below average. Penalize high body fat, reward muscle symmetry.
- Insights must be specific and actionable (not generic). Reference actual measurements.
- All values must be physically plausible for the given profile.
- Output ONLY the raw JSON object — nothing else.`;

router.post("/analyze", async (req, res) => {
  const parsed = AnalyzeScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { frontImage, sideImage, profile } = parsed.data;

  const userContent: Parameters<typeof openai.chat.completions.create>[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: [
        "Please analyze this body photo and return the JSON measurement object.",
        "",
        `Known profile:`,
        `- Height: ${profile.height} cm`,
        `- Weight: ${profile.weight} kg`,
        `- Age: ${profile.age}`,
        `- Gender: ${profile.gender}`,
        `- Fitness goal: ${profile.goal ?? "general fitness"}`,
      ].join("\n"),
    },
    {
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${frontImage}`, detail: "high" },
    },
  ];

  if (sideImage) {
    (userContent as Array<unknown>).push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${sideImage}`, detail: "high" },
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed_result: unknown;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed_result = JSON.parse(cleaned);
    } catch {
      req.log.error({ raw }, "Failed to parse AI JSON response");
      res.status(500).json({ error: "parse_error", message: "AI returned an unparseable response" });
      return;
    }

    const validated = AnalyzeScanResponse.safeParse(parsed_result);
    if (!validated.success) {
      req.log.error({ parsed_result, error: validated.error.message }, "AI response failed schema validation");
      res.status(500).json({ error: "invalid_response", message: "AI response did not match expected schema" });
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "OpenAI API call failed");
    res.status(500).json({ error: "ai_error", message: "AI analysis failed — please try again" });
  }
});

export default router;
