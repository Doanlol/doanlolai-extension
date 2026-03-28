chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "DOANLOLAI_TOGGLE_POPUP" });
});
