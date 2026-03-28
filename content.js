const api = typeof browser !== "undefined" ? browser : chrome;

(function () {
  if (window.__doanlolaiInjected) return;
  window.__doanlolaiInjected = true;

  const root = document.createElement("div");
  root.id = "doanlolai-root";
  root.innerHTML = `
    <div id="doanlolai-header">
      <span>doanlolai</span>
      <button id="doanlolai-close">✕</button>
    </div>
    <div id="doanlolai-tabs">
      <button data-tab="translate">Dịch</button>
      <button data-tab="summary">Tóm tắt</button>
      <button data-tab="chat">Chatbot</button>
    </div>
    <div id="doanlolai-body"></div>
  `;

  document.documentElement.appendChild(root);

  const body = root.querySelector("#doanlolai-body");
  const closeBtn = root.querySelector("#doanlolai-close");
  const tabButtons = Array.from(root.querySelectorAll("#doanlolai-tabs button"));

  let currentTab = "translate";
  const chatHistory = [
    { role: "system", content: "Bạn là trợ lý AI hữu ích, trả lời rõ ràng, ngắn gọn." }
  ];

  function setActiveTabBtn() {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === currentTab);
    });
  }

  function renderTranslate() {
    body.innerHTML = `
      <input id="doanlolai-input" placeholder="Nhập văn bản hoặc bôi đen văn bản trên trang..." />
      <button id="doanlolai-action">Dịch</button>
      <div id="doanlolai-output"></div>
    `;
    const actionBtn = body.querySelector("#doanlolai-action");
    const output = body.querySelector("#doanlolai-output");
    const input = body.querySelector("#doanlolai-input");

    actionBtn.onclick = async () => {
      output.textContent = "Đang dịch...";
      try {
        const manual = (input.value || "").trim();
        const selected = (window.getSelection()?.toString() || "").trim();
        const text = manual || selected;
        if (!text) throw new Error("Hãy nhập hoặc bôi đen văn bản để dịch.");

        const storage = await api.storage.local.get("doanlolai");
        const cfg = storage.doanlolai || {};
        const lang = cfg.targetLang || "vi";

        const result = await doanlolaiCallAI([
          {
            role: "system",
            content: `Bạn là công cụ dịch. Chỉ trả về bản dịch sang ngôn ngữ: ${lang}.`
          },
          { role: "user", content: text }
        ]);

        output.textContent = result;
      } catch (err) {
        output.textContent = "Lỗi: " + err.message;
      }
    };
  }

  function renderSummary() {
    body.innerHTML = `
      <button id="doanlolai-action">Tóm tắt trang này</button>
      <div id="doanlolai-output"></div>
    `;
    const actionBtn = body.querySelector("#doanlolai-action");
    const output = body.querySelector("#doanlolai-output");

    actionBtn.onclick = async () => {
      output.textContent = "Đang tóm tắt...";
      try {
        const chunks = [...document.querySelectorAll("h1,h2,h3,p,article,li")]
          .map((el) => (el.innerText || "").trim())
          .filter(Boolean)
          .slice(0, 250);

        const pageText = chunks.join("\n").slice(0, 14000);
        if (!pageText) throw new Error("Không lấy được nội dung trang để tóm tắt.");

        const result = await doanlolaiCallAI([
          {
            role: "system",
            content: "Hãy tóm tắt nội dung trang web bằng tiếng Việt, ngắn gọn, dạng gạch đầu dòng."
          },
          {
            role: "user",
            content: `Tiêu đề trang: ${document.title}\n\nNội dung:\n${pageText}`
          }
        ]);

        output.textContent = result;
      } catch (err) {
        output.textContent = "Lỗi: " + err.message;
      }
    };
  }

  function renderChat() {
    body.innerHTML = `
      <div id="doanlolai-chat-log"></div>
      <input id="doanlolai-chat-input" placeholder="Nhập câu hỏi..." />
      <button id="doanlolai-action">Gửi</button>
    `;
    const log = body.querySelector("#doanlolai-chat-log");
    const input = body.querySelector("#doanlolai-chat-input");
    const actionBtn = body.querySelector("#doanlolai-action");

    actionBtn.onclick = async () => {
      const msg = (input.value || "").trim();
      if (!msg) return;
      input.value = "";

      log.textContent += `Bạn: ${msg}\nAI: ...\n\n`;
      log.scrollTop = log.scrollHeight;

      try {
        chatHistory.push({ role: "user", content: msg });
        const ans = await doanlolaiCallAI(chatHistory);
        chatHistory.push({ role: "assistant", content: ans });

        log.textContent = log.textContent.replace(/AI: \.\.\.\n\n$/, `AI: ${ans}\n\n`);
        log.scrollTop = log.scrollHeight;
      } catch (err) {
        log.textContent += `[Lỗi] ${err.message}\n\n`;
      }
    };
  }

  function render() {
    setActiveTabBtn();
    if (currentTab === "translate") renderTranslate();
    else if (currentTab === "summary") renderSummary();
    else renderChat();
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });

  closeBtn.onclick = () => {
    root.style.display = "none";
  };

  api.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "DOANLOLAI_TOGGLE_POPUP") {
      root.style.display = root.style.display === "none" ? "block" : "none";
    }
  });

  render();
})();
