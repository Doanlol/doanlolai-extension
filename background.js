const api = typeof browser !== "undefined" ? browser : chrome;

api.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  api.tabs.sendMessage(tab.id, { type: "DOANLOLAI_TOGGLE_POPUP" });
});
