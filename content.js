(function () {
  if (window.__doanlolaiInjected) return; window.__doanlolaiInjected = true;
  const root = document.createElement("div");
  root.id = "doanlolai-root";
  root.innerHTML = `<div id="doanlolai-header"><span>doanlolai</span><button id="doanlolai-close">✕</button></div><div id="doanlolai-tabs"><button data-tab="translate">Dịch</button><button data-tab="summary">Tóm tắt</button><button data-tab="chat">Chatbot</button></div><div id="doanlolai-body"></div>`;
  document.documentElement.appendChild(root);
  const body = root.querySelector("#doanlolai-body"), closeBtn = root.querySelector("#doanlolai-close"), tabButtons = [...root.querySelectorAll("#doanlolai-tabs button")];
  let currentTab = "translate";
  const chatHistory = [{ role: "system", content: "Bạn là trợ lý AI hữu ích, trả lời rõ ràng, ngắn gọn." }];
  const setActive = () => tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === currentTab));

  function renderTranslate() {
    body.innerHTML = `<input id="doanlolai-input" placeholder="Nhập văn bản hoặc bôi đen văn bản trên trang..." /><button id="doanlolai-action">Dịch</button><div id="doanlolai-output"></div>`;
    const btn = body.querySelector("#doanlolai-action"), out = body.querySelector("#doanlolai-output"), inp = body.querySelector("#doanlolai-input");
    btn.onclick = async () => {
      out.textContent = "Đang dịch...";
      try {
        const text = (inp.value || "").trim() || (window.getSelection()?.toString() || "").trim();
        if (!text) throw new Error("Hãy nhập hoặc bôi đen văn bản để dịch.");
        const cfg = (await chrome.storage.local.get("doanlolai")).doanlolai || {};
        const lang = cfg.targetLang || "vi";
        out.textContent = await doanlolaiCallAI([{ role: "system", content: `Bạn là công cụ dịch. Chỉ trả về bản dịch sang ngôn ngữ: ${lang}.` }, { role: "user", content: text }]);
      } catch (e) { out.textContent = "Lỗi: " + e.message; }
    };
  }

  function renderSummary() {
    body.innerHTML = `<button id="doanlolai-action">Tóm tắt trang này</button><div id="doanlolai-output"></div>`;
    const btn = body.querySelector("#doanlolai-action"), out = body.querySelector("#doanlolai-output");
    btn.onclick = async () => {
      out.textContent = "Đang tóm tắt...";
      try {
        const pageText = [...document.querySelectorAll("h1,h2,h3,p,article,li")].map(e => (e.innerText || "").trim()).filter(Boolean).slice(0, 250).join("\n").slice(0, 14000);
        if (!pageText) throw new Error("Không lấy được nội dung trang để tóm tắt.");
        out.textContent = await doanlolaiCallAI([{ role: "system", content: "Hãy tóm tắt nội dung trang web bằng tiếng Việt, ngắn gọn, dạng gạch đầu dòng." }, { role: "user", content: `Tiêu đề trang: ${document.title}\n\nNội dung:\n${pageText}` }]);
      } catch (e) { out.textContent = "Lỗi: " + e.message; }
    };
  }

  function renderChat() {
    body.innerHTML = `<div id="doanlolai-chat-log"></div><input id="doanlolai-chat-input" placeholder="Nhập câu hỏi..." /><button id="doanlolai-action">Gửi</button>`;
    const log = body.querySelector("#doanlolai-chat-log"), input = body.querySelector("#doanlolai-chat-input"), btn = body.querySelector("#doanlolai-action");
    btn.onclick = async () => {
      const msg = (input.value || "").trim(); if (!msg) return; input.value = "";
      log.textContent += `Bạn: ${msg}\nAI: ...\n\n`; log.scrollTop = log.scrollHeight;
      try {
        chatHistory.push({ role: "user", content: msg });
        const ans = await doanlolaiCallAI(chatHistory);
        chatHistory.push({ role: "assistant", content: ans });
        log.textContent = log.textContent.replace(/AI: \.\.\.\n\n$/, `AI: ${ans}\n\n`);
      } catch (e) { log.textContent += `[Lỗi] ${e.message}\n\n`; }
    };
  }

  function render(){ setActive(); if(currentTab==="translate")renderTranslate(); else if(currentTab==="summary")renderSummary(); else renderChat(); }
  tabButtons.forEach(b => b.onclick = () => { currentTab = b.dataset.tab; render(); });
  closeBtn.onclick = () => root.style.display = "none";
  chrome.runtime.onMessage.addListener((m) => { if (m?.type === "DOANLOLAI_TOGGLE_POPUP") root.style.display = root.style.display === "none" ? "block" : "none"; });
  render();
})();
