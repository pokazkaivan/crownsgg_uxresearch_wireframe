/* ============================================================
   state.js — in-memory state with best-effort localStorage.
   ============================================================ */
const State = {
  KEY: "crowns_wf_v1",
  d: null,

  defaults() {
    return {
      ageOk: false,
      user: { loggedIn: false, username: "", email: "", balance: 0, level: 1, xp: 0, xpMax: 1000, vip: "Bronze" },
      inv: [],            // {uid,id,name,value,tier}
      cart: [],           // main cart — won items land here · sell or order delivery
      buyCart: [],         // marketplace buy-cart — items staged for purchase
      listings: [],       // your items listed for sale on the marketplace
      tickets: [],        // {id,items:[],status,addr}
      tx: [],             // {id,type,amount,note,ts}
      affiliate: { code: "", clicks: 0, signups: 0, commission: 0 },
      raffle: 0,
      wins: [],            // every won item (for the profile win showcase)
      battleWins: [],      // items won specifically in battles
      showcase: { enabled: true, mode: "all", selected: [] },        // {enabled, mode:'all'|'selected', selected:[uid]}
      battleShowcase: { enabled: true, mode: "all", selected: [] },
      upStreak: 0,          // upgrader losses since last win (1 win per 5 losses)
      claimedDaily: false,
      claimedChallenges: [],
      claimedMilestones: [],
      weekPrizeClaimed: false,
      promosUsed: [],
      stats: { opened: 0, won: 0, wagered: 0, battles: 0, best: 0 },
      seq: 1,
    };
  },

  init() { this.d = this.defaults(); this.load(); },
  load() {
    try {
      const s = localStorage.getItem(this.KEY);
      if (s) this.d = Object.assign(this.defaults(), JSON.parse(s));
    } catch (e) { /* file:// may block storage — in-memory only */ }
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch (e) {} },
  reset() { this.d = this.defaults(); this.save(); },
  id() { return "x" + this.d.seq++; },

  // ---- mutations ----
  credit(amount, note) {
    this.d.user.balance = +(this.d.user.balance + amount).toFixed(2);
    this.tx("deposit", amount, note || "Deposit");
  },
  debit(amount, note) {
    this.d.user.balance = +(this.d.user.balance - amount).toFixed(2);
    this.tx("spend", -amount, note || "Wager");
  },
  tx(type, amount, note) {
    this.d.tx.unshift({ id: this.id(), type, amount: +amount.toFixed(2), note, ts: Date.now() });
    this.save();
  },
  addItem(itemId) {
    const it = DATA.item(itemId);
    const e = { uid: this.id(), id: it.id, name: it.name, value: it.value, tier: it.tier };
    this.d.inv.unshift(e);
    return e;
  },
  // won/claimed items land in the main cart (sell / deliver / set aside)
  addToCart(itemId) {
    const it = DATA.item(itemId);
    const e = { uid: this.id(), id: it.id, name: it.name, value: it.value, tier: it.tier };
    this.d.cart.unshift(e);
    return e;
  },
  // a gameplay win: into the cart + recorded for the profile showcase
  win(itemId, battle) {
    const e = this.addToCart(itemId);
    const w = { uid: e.uid, id: e.id, name: e.name, value: e.value, tier: e.tier };
    this.d.wins.unshift(w); this.d.wins = this.d.wins.slice(0, 60);
    if (battle) { this.d.battleWins.unshift(w); this.d.battleWins = this.d.battleWins.slice(0, 60); }
    return e;
  },
  removeInv(uid) { this.d.inv = this.d.inv.filter((x) => x.uid !== uid); },

  // XP / level
  addXP(amount) {
    const u = this.d.user;
    u.xp += Math.round(amount);
    while (u.xp >= u.xpMax) {
      u.xp -= u.xpMax;
      u.level++;
      u.xpMax = Math.round(u.xpMax * 1.25);
      if (window.UI) UI.toast("Level up!", "You reached level " + u.level + ". A free case may be available in Rewards.", "win");
      const tiers = ["Bronze","Silver","Gold","Platinum","Diamond"];
      u.vip = tiers[Math.min(tiers.length - 1, Math.floor((u.level - 1) / 3))];
    }
  },
};
