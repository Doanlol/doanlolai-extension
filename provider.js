const api = typeof browser !== "undefined" ? browser : chrome;

async function doanlolaiCallAI(messages) {
  const storage = await api.storage.local.get("doanlolai");
  const cfg = storage.doanlolai || {};

  if (!cfg.apiKey) throw new Error("Chưa cấu hình API key trong Options.");

  const model = cfg.model || "meta-llama/llama-3.1-8b-instruct:free";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiKey}`,
      " },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API lỗi ${res.status}: ${txt}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "Không có phản hồi.";
    }
