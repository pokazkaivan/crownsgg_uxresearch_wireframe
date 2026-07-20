/* ============================================================
   data.js — mock catalog (items, cases, deals, FAQ).
   Frontend-only. Physical (IRL) items theme.
   ============================================================ */
const DATA = (function () {
  // tier: 1 common · 2 uncommon · 3 rare · 4 legendary
  const ITEMS = [
    { id: "socks",    name: "Crew Socks",        value: 5,    tier: 1 },
    { id: "keychain", name: "Metal Keychain",    value: 8,    tier: 1 },
    { id: "stickers", name: "Sticker Pack",      value: 6,    tier: 1 },
    { id: "phonecase",name: "Phone Case",        value: 14,   tier: 1 },
    { id: "cap",      name: "Logo Cap",          value: 24,   tier: 1 },
    { id: "bottle",   name: "Insulated Bottle",  value: 32,   tier: 1 },
    { id: "earbuds",  name: "Wireless Earbuds",  value: 55,   tier: 2 },
    { id: "backpack", name: "Tech Backpack",     value: 78,   tier: 2 },
    { id: "hoodie",   name: "Heavy Hoodie",      value: 95,   tier: 2 },
    { id: "sneakers", name: "Hype Sneakers",     value: 120,  tier: 2 },
    { id: "watch",    name: "Smart Watch",       value: 165,  tier: 2 },
    { id: "keyboard", name: "Mech Keyboard",     value: 190,  tier: 3 },
    { id: "jacket",   name: "Designer Jacket",   value: 280,  tier: 3 },
    { id: "drone",    name: "Camera Drone",      value: 360,  tier: 3 },
    { id: "tablet",   name: "Pro Tablet",        value: 480,  tier: 3 },
    { id: "console",  name: "Game Console",      value: 600,  tier: 4 },
    { id: "phone",    name: "Flagship Phone",    value: 1150, tier: 4 },
    { id: "camera",   name: "Mirrorless Camera", value: 1900, tier: 4 },
    { id: "luxwatch", name: "Luxury Watch",      value: 3200, tier: 4 },
  ];
  const byId = {};
  ITEMS.forEach((i) => (byId[i.id] = i));

  const CASES = [
    { id: "daily",   name: "Daily Free Case", price: 0,    free: true, tag: "FREE", pool: [
      ["socks",46],["keychain",40],["stickers",38],["phonecase",24],["cap",12],["earbuds",4],["backpack",2],["sneakers",.6]] },
    { id: "starter", name: "Starter Crate",   price: 12,   tag: "NEW", pool: [
      ["socks",40],["keychain",38],["stickers",34],["phonecase",26],["cap",18],["bottle",12],["earbuds",6],["backpack",3.5],["sneakers",1.4],["watch",.5]] },
    { id: "street",  name: "Street Style",    price: 48,   pool: [
      ["cap",30],["bottle",26],["phonecase",24],["hoodie",16],["sneakers",10],["backpack",9],["earbuds",8],["jacket",2.2],["watch",2],["drone",.5]] },
    { id: "tech",    name: "Tech Drop",       price: 150,  tag: "HOT", pool: [
      ["earbuds",26],["backpack",20],["watch",16],["keyboard",12],["sneakers",8],["tablet",6],["drone",5],["console",2],["phone",.7],["camera",.25]] },
    { id: "hype",    name: "Hype Vault",      price: 500,  pool: [
      ["watch",22],["keyboard",18],["jacket",16],["drone",12],["tablet",12],["console",8],["sneakers",6],["phone",3],["camera",1.2],["luxwatch",.4]] },
    { id: "elite",   name: "Elite Reserve",   price: 1200, tag: "NEW", pool: [
      ["tablet",24],["drone",18],["console",18],["jacket",12],["phone",10],["keyboard",8],["watch",4],["camera",4],["luxwatch",1.6]] },
  ];

  // Deals: pay a discounted price for a chance at the item (value/price = multiplier)
  const DEALS = [
    { id: "d1", itemId: "console",  mult: 5.0 },
    { id: "d2", itemId: "drone",    mult: 3.8 },
    { id: "d3", itemId: "phone",    mult: 3.1 },
    { id: "d4", itemId: "camera",   mult: 2.4 },
    { id: "d5", itemId: "tablet",   mult: 2.0 },
    { id: "d6", itemId: "luxwatch", mult: 1.9 },
  ].map((d) => { const it = byId[d.itemId]; return { ...d, item: it, price: +(it.value / d.mult).toFixed(2) }; });

  const FAQ = [
    ["What is Crowns?", "Crowns is an IRL case-opening platform: open cases or battle to win real physical items, then ship them to your door or sell them back to balance."],
    ["Is Crowns provably fair?", "Yes. Every result is generated with a hashed server seed + your client seed + a nonce, verifiable on the Provably Fair page after each spin."],
    ["How do I open a case?", "Pick a case, choose single or multi-open (up to ×4), then spin. Demo spins let you try a case without spending balance."],
    ["How do I receive my items?", "Won items go to your inventory. Send them to the marketplace and submit a ticket with your name and address — the Crowns team orders and ships the physical item."],
    ["How do I deposit?", "Deposit with crypto or gift cards from the Wallet. Apple Pay / fiat is a Stage 2 integration."],
    ["What are battles?", "Battles pit 2–6 players opening the same case(s) over several rounds; the highest total value takes the whole pot of items."],
    ["What is the upgrader?", "Stake balance for a chance to trade up to a higher-value target item. Higher targets mean lower odds."],
    ["How do I get support?", "Use the Support page or the in-site chat. This wireframe is a frontend demo — no real funds are involved."],
  ];

  function item(id) { return byId[id]; }
  function caseById(id) { return CASES.find((c) => c.id === id); }
  function dealById(id) { return DEALS.find((d) => d.id === id); }
  function poolTotal(c) { return c.pool.reduce((s, e) => s + e[1], 0); }
  function caseValue(c) { const t = poolTotal(c); return c.pool.reduce((s, e) => s + byId[e[0]].value * e[1] / t, 0); }
  function odds(c) {
    const t = poolTotal(c);
    return c.pool.map((e) => ({ item: byId[e[0]], pct: (e[1] / t) * 100 })).sort((a, b) => b.item.value - a.item.value);
  }
  function pick(c) {
    const t = poolTotal(c); let r = Math.random() * t;
    for (const e of c.pool) { r -= e[1]; if (r <= 0) return e[0]; }
    return c.pool[c.pool.length - 1][0];
  }

  const NAMES = ["Nova","Kato","Riley","Vex","Juno","Pax","Echo","Wren","Sable","Dax","Mira","Orin","Zephy","Lumi","Bram","Cleo"];
  const randName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

  // ---- marketplace catalog (store stock — buy with balance, users cannot list) ----
  const ITEM_TYPE = { socks:"Apparel",cap:"Apparel",hoodie:"Apparel",jacket:"Apparel",sneakers:"Apparel",
    keychain:"Accessory",stickers:"Accessory",phonecase:"Accessory",bottle:"Accessory",backpack:"Accessory",
    earbuds:"Tech",watch:"Tech",keyboard:"Tech",drone:"Tech",tablet:"Tech",console:"Tech",phone:"Tech",camera:"Tech",luxwatch:"Tech" };
  const RARITY = { 1:"Common", 2:"Uncommon", 3:"Rare", 4:"Legendary" };
  const DROP = { 1:18, 2:7, 3:2.5, 4:0.6 };           // drop-chance proxy by tier (%)
  const MARKET = (function () { const out = []; let s = 1;
    ITEMS.forEach((it) => { const n = it.tier >= 4 ? 2 : 3;
      for (let k = 0; k < n; k++) { const owner = NAMES[(s * 7 + it.value + k) % NAMES.length]; const v = [0.92,1,1.08,0.97,1.05,1.12][s % 6];
        out.push({ lid: "L" + (s++), id: it.id, name: it.name, value: it.value, tier: it.tier, type: ITEM_TYPE[it.id] || "Other", rarity: RARITY[it.tier], drop: DROP[it.tier], price: Math.max(1, Math.round(it.value * v)), owner }); } });
    return out; })();
  function marketById(lid) { return MARKET.find((m) => m.lid === lid); }

  // ---- crypto withdrawal rails ----
  const COINS = [
    { id:"LTC",  name:"Litecoin",  networks:["Litecoin"],                   min:10, fee:0.15, eta:"2–8 min",   note:"Cheapest & fastest" },
    { id:"SOL",  name:"Solana",    networks:["Solana"],                     min:10, fee:0.20, eta:"1–3 min",   note:"" },
    { id:"USDT", name:"Tether",    networks:["TRC-20","ERC-20","Solana"],   min:20, fee:1.00, eta:"3–10 min",  note:"Stablecoin" },
    { id:"USDC", name:"USD Coin",  networks:["ERC-20","Solana"],            min:20, fee:1.00, eta:"3–10 min",  note:"Stablecoin" },
    { id:"ETH",  name:"Ethereum",  networks:["ERC-20"],                     min:25, fee:2.50, eta:"5–15 min",  note:"Higher gas" },
    { id:"BTC",  name:"Bitcoin",   networks:["Bitcoin","Lightning"],        min:30, fee:2.00, eta:"10–30 min", note:"" },
  ];
  // fee & speed depend on the network the payout is sent over
  function netFee(coin, network) {
    const c = coinById(coin); if (!c) return 0;
    if (network === "Lightning") return 0.05;
    if (network === "Solana") return 0.10;
    if (network === "TRC-20") return 0.50;
    if (network === "ERC-20") return coin === "ETH" ? 2.50 : 3.00;
    return c.fee;
  }
  function netEta(coin, network) {
    const c = coinById(coin);
    if (network === "Lightning") return "instant";
    if (network === "Solana") return "1–3 min";
    if (network === "TRC-20") return "3–10 min";
    if (network === "ERC-20") return "5–15 min";
    return c ? c.eta : "—";
  }
  function coinById(id) { return COINS.find((c) => c.id === id); }
  // network fee is charged per-network; TRC-20 is notably cheaper than ERC-20


  return { ITEMS, CASES, DEALS, FAQ, item, caseById, dealById, odds, pick, poolTotal, caseValue, randName, NAMES, MARKET, ITEM_TYPE, RARITY, DROP, marketById, COINS, coinById, netFee, netEta };
})();
