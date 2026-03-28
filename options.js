const apiKeyEl = document.getElementById("apiKey");
const modelEl = document.getElementById("model");
const targetLangEl = document.getElementById("targetLang");
const statusEl = document.getElementById("status");
document.getElementById("saveBtn").addEventListener("click", async () => {
  await chrome.storage.local.set({ doanlolai: { apiKey: (apiKeyEl.value||"").trim(), model: (modelEl.value||"").trim() || "meta-llama/llama-3.1-8b-instruct:free", targetLang: targetLangEl.value || "vi" } });
  statusEl.textContent = "Đã lưu cài đặt ✅"; setTimeout(()=>statusEl.textContent="",2000);
});
(async()=>{const cfg=((await chrome.storage.local.get("doanlolai")).doanlolai)||{};apiKeyEl.value=cfg.apiKey||"";modelEl.value=cfg.model||"meta-llama/llama-3.1-8b-instruct:free";targetLangEl.value=cfg.targetLang||"vi";})();
