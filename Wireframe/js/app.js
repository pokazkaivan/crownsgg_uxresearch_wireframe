/* ============================================================
   app.js — router, global action delegation, bootstrap.
   ============================================================ */
const Router = {
  resolve() {
    const path = (location.hash.slice(1) || "/").split("?")[0];
    const seg = path.split("/").filter(Boolean);
    document.body.classList.remove("selbar");   // clear upgrader select-bar padding on navigation
    UI.updateChrome();
    try {
      if (seg.length === 0) return Views.home();
      switch (seg[0]) {
        case "cases":         return seg[1] ? Views.caseDetail(seg[1]) : Views.cases();
        case "cart":          return Views.cart();
        case "battles":
          if (seg[1] === "create") return Views.battleCreate(seg[2]);
          return seg[1] ? Views.battleRoom(seg[1]) : Views.battles();
        case "upgrade":       return Views.upgrade();
        case "rewards":       return Views.rewards();
        case "affiliates":    return Views.affiliates();
        case "marketplace":   return Views.marketplace();
        case "provably-fair": return Views.fair();
        case "faq":           return Views.faq();
        case "support":       return Views.support();
        case "profile":       return Views.profile();
        case "inventory":     return Views.inventory();
        case "wallet":        return Views.wallet();
        case "u":             return Views.showcase(decodeURIComponent(seg[1] || "Player"));
        case "legal":         return Views.legal(seg[1] || "terms");
        default:              return Views.home();
      }
    } catch (e) {
      console.error(e);
      UI.view().innerHTML = `<div class="empty">Something went wrong rendering this view.<br><span class="muted">${UI.esc(e.message)}</span></div>`;
    }
  },
  start() { window.addEventListener("hashchange", () => this.resolve()); this.resolve(); },
};

const ACTIONS = {
  auth: (el) => UI.openAuth(el.dataset.mode || "signin"),
  authTab: (el) => UI.openAuth(el.dataset.mode),
  authDiscord: () => { const u = UI.el("auth-user"); if (u && !u.value) u.value = "discord_user"; UI.doAuth(document.querySelector("[data-action='doAuth']")?.dataset.mode || "signin"); },
  doAuth: (el) => UI.doAuth(el.dataset.mode),
  forgot: () => UI.forgot(),
  logout: () => { State.d.user.loggedIn = false; State.save(); UI.updateChrome(); UI.toast("Signed out"); location.hash = "#/"; },
  ageOk: () => UI.ageOk(),
  avatarMenu: () => UI.toggleAvatarMenu(),
  openSearch: () => UI.openSearch(),
  deposit: () => UI.openDeposit(),
  openCart: () => { location.hash = "#/cart"; },
  depTab: (el) => UI.depTab(el.dataset.tab),
  depPreset: (el) => { UI.el("dep-amt").value = el.dataset.amt; },
  doDeposit: () => UI.doDeposit(),
  closeModal: () => UI.closeModal(),
  confirmYes: () => { const f = UI._confirmFn; UI._confirmFn = null; UI.closeModal(); if (f) f(); },
  toggleChat: () => UI.toggleChat(),
  chatPin: (el) => UI.chatPin(el),
  chatEmoji: () => UI.chatEmoji(),
  emojiPick: (el) => UI.emojiPick(el),
  chatSend: () => UI.chatSend(),
  reset: () => { if (confirm("Reset all demo data?")) { const age = State.d.ageOk; State.reset(); State.d.ageOk = age; State.save(); UI.updateChrome(); Router.resolve(); UI.toast("Demo reset"); } },
  showcase: (el) => { location.hash = "#/u/" + encodeURIComponent(el.dataset.name); },

  joinBattle: (el) => Views.joinBattle(el.dataset.id, el.dataset.watch),
  copyLink: () => UI.toast("Link copied", "Battle link copied to clipboard"),
  toInv: (el) => Views.fromCart(el.dataset.uid),

  claimDaily: () => Views.claimDaily(),
  claimMilestone: (el) => Views.claimMilestone(el.dataset.lv, el.dataset.cid),
  buyRaffle: (el) => Views.buyRaffle(parseInt(el.dataset.n, 10)),
  applyPromo: () => Views.applyPromo(),
  claimChallenge: (el) => Views.claimChallenge(parseInt(el.dataset.i, 10)),

  toCart: (el) => Views.toCart(el.dataset.uid),
  fromCart: (el) => Views.fromCart(el.dataset.uid),
  cartAll: () => Views.cartAll(),
  buyMarket: (el) => Views.buyMarket(el.dataset.lid),
  sellOnMarket: (el) => Views.sellOnMarket(el.dataset.uid),
  cartToInv: () => Views.cartToInv(),
  cartToInvOne: (el) => Views.cartToInvOne(el.dataset.uid),
  cartSellOne: (el) => Views.cartSellOne(el.dataset.uid),
  cartSellAll: () => Views.cartSellAll(),
  cartDeliverAll: () => Views.cartDeliverAll(),
  buyCartConfirm: () => Views.buyCartConfirm(),
  buyCartRemove: (el) => Views.buyCartRemove(el.dataset.uid),
  addBuyCart: (el) => Views.addBuyCart(el.dataset.lid),
  unlist: (el) => Views.unlist(el.dataset.lid),
  submitTicket: () => Views.submitTicket(),
  confirmTicket: () => Views.confirmTicket(),
  sellItem: (el) => Views.sellItem(el.dataset.uid),
  itemDetail: (el) => Views.itemDetail(el.dataset.uid),

  reqStats: () => Views.reqStats(),
  scToggle: (el) => Views.scToggle(el.dataset.sc),
  scMode: (el) => Views.scMode(el.dataset.sc, el.dataset.mode),
  scPick: (el) => Views.scPick(el.dataset.sc, el.dataset.uid),
  createAff: () => Views.createAff(),
  affPayout: () => Views.affPayout(),
  supportSend: () => Views.supportSend(),
};

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (a) {
    const fn = ACTIONS[a.dataset.action];
    if (fn) { if (a.tagName === "A" && a.getAttribute("href") === "#") e.preventDefault(); else if (a.tagName !== "A") e.preventDefault(); if (a.dataset.close) UI.closeModal(); fn(a, e); return; }
  }
  // close avatar menu on outside click
  if (!e.target.closest(".menu")) UI.closeAvatarMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement && document.activeElement.id === "chatinput") UI.chatSend();
  if (e.key === "Escape") { UI.closeModal(); UI.closeAvatarMenu(); }
});

/* bootstrap */
State.init();
UI.renderShell();
UI.updateChrome();
UI.startDrops();
Router.start();
UI.ageGate();
