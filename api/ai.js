const PROVIDERS = {
  gemini: "Gemini",
  groq: "Groq",
  openrouter: "OpenRouter"
};

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function systemPrompt(prompt) {
  return [
    "Kamu adalah tutor algoritma untuk Algorithm Visualizer AI.",
    "Jawab dalam Bahasa Indonesia yang jelas, singkat, ramah, dan praktis.",
    "Fokus pada Binary Search, Bubble Sort, Selection Sort, compare proses, atau pertanyaan user.",
    "",
    "Pertanyaan user:",
    prompt
  ].join("\n");
}

async function askGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY belum diisi di Vercel.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt(prompt) }] }],
      generationConfig: { temperature: 0.45, maxOutputTokens: 900 }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Gemini gagal (${response.status})`);
  return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n").trim() || "Respons Gemini kosong.";
}

async function askGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY belum diisi di Vercel.");
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: systemPrompt(prompt) }],
      temperature: 0.45,
      max_tokens: 900
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Groq gagal (${response.status})`);
  return data?.choices?.[0]?.message?.content?.trim() || "Respons Groq kosong.";
}

async function askOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY belum diisi di Vercel.");
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": "https://richieal1.github.io/algorithm-visualizer-ai/",
      "X-Title": "Algorithm Visualizer AI"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: systemPrompt(prompt) }],
      temperature: 0.45,
      max_tokens: 900
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `OpenRouter gagal (${response.status})`);
  return data?.choices?.[0]?.message?.content?.trim() || "Respons OpenRouter kosong.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, 200, { ok: true, message: "Algorithm Visualizer AI API aktif" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const provider = String(body.provider || "gemini").toLowerCase();
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      send(res, 400, { error: "Prompt kosong." });
      return;
    }
    if (!PROVIDERS[provider]) {
      send(res, 400, { error: "Provider tidak dikenal." });
      return;
    }

    const text = provider === "gemini"
      ? await askGemini(prompt)
      : provider === "groq"
        ? await askGroq(prompt)
        : await askOpenRouter(prompt);

    send(res, 200, { text, provider: PROVIDERS[provider] });
  } catch (error) {
    send(res, 500, { error: error.message || "API error." });
  }
}
