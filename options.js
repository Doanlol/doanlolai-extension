const api = typeof browser !== "undefined" ? browser : chrome;

const apiKeyEl = document.getElementById("apiKey");
const modelEl = document.getElementById("model");
const targetLangEl = document.getElementById("targetLang");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");

(async function init() {
  const data = await api.storage.local.get("doanlolai");
  const cfg = data.doanlolai || {};
  apiKeyEl.value = cfg.apiKey || "";
  modelEl.value = cfg.model || "meta-llama/llama-3.1-8b-instruct:free";
  targetLangEl.value = cfg.targetLang || "vi";
})();

saveBtn.addEventListener("click", async () => {
  const cfg = {
    apiKey: (apiKeyEl.value || "").trim(),
    model: (modelEl.value || "").trim() || "meta-llama/llama-3.1-8b-instruct:free",
    targetLang: targetLangEl.value || "vi"
  };

  await api.storage.local.set({ doanlolai: cfg });
  statusEl.textContent = "Đã lưu cài đặt ✅";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});
