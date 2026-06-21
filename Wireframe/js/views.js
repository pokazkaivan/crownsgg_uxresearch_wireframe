/* ============================================================
   views.js — page renderers + interactive mechanics.
   ============================================================ */
const LOBBY = [];        // waiting battles
const BATTLES = {};      // id -> config
const HISTORY = [];      // finished battles (my history)

const Views = {
  set(html) { const path = (location.hash.slice(1) || "/").split("?")[0]; const same = path === this._lastPath; const y = (typeof window.scrollY === "number") ? window.scrollY : 0;
    UI.view().innerHTML = html; this._lastPath = path;
    try { window.scrollTo(0, same ? y : 0); } catch (e) {} },
  q(s) { return UI.view().querySelector(s); },
  qa(s) { return [...UI.view().querySelectorAll(s)]; },

  caseVol(c) { return ({ 1: 0, 2: 1, 3: 2, 4: 3 })[DATA.odds(c)[0].item.tier]; },
  caseCardHTML(c) {
    const odds = DATA.odds(c);
    const v = ["L", "M", "H", "I"][Views.caseVol(c)];
    return `<a class="item-card case-card tier-${c.free?1:3}" href="#/cases/${c.id}">
      ${UI.ph(c.name, "case")}
      <div class="row between"><div class="nm">${UI.esc(c.name)}</div>${c.tag ? `<span class="badge">${c.tag}</span>` : ""}</div>
      <div class="item-meta"><span class="vl">${c.free ? "FREE" : UI.money(c.price)}</span><span class="sub">${odds.length} items · Vol ${v}</span></div>
    </a>`;
  },

  /* ===================== HOME ===================== */
  home() {
    const featured = DATA.CASES.slice(1, 5);
    this.set(`
      <section style="margin-top:4px">
        <div class="hero-banner">${UI.ph("Hero banner — featured case / promo", "hero")}</div>
        <div class="hero-callouts">
          <div class="callout"><div class="k">Open your first</div><b style="font-size:15px">Daily Free Case</b><div class="sub">No deposit needed</div><a class="btn sm primary" style="margin-top:10px" href="#/cases/daily">Open free</a></div>
          <div class="callout"><div class="k">Upgrade your items</div><b style="font-size:15px">Up to 20× multiplier</b><div class="sub">Stake balance or items to level up</div><a class="btn sm" style="margin-top:10px" href="#/upgrade">Open Upgrader</a></div>
          <div class="callout"><div class="k">Your first battle</div><b style="font-size:15px">2–6 player battles</b><div class="sub">Winner takes the pot</div><a class="btn sm" style="margin-top:10px" href="#/battles">Open lobby</a></div>
        </div>
      </section>

      <section class="sec"><div class="sec-head"><h2 class="h2">New cases</h2><a class="btn sm ghost" href="#/cases">View all →</a></div>
        <div class="grid g4">${featured.map(c => Views.caseCardHTML(c)).join("")}</div></section>

      <section class="sec"><div class="sec-head"><h2 class="h2">Battle highlights</h2><a class="btn sm ghost" href="#/battles">View all →</a></div>
        <div class="grid g3">${[0,1,2].map(() => {
          const seats = 2 + Math.floor(Math.random()*4);
          const cs = Array.from({length: 2+Math.floor(Math.random()*4)}, () => DATA.CASES[2+Math.floor(Math.random()*4)]);
          const total = cs.reduce((s,c)=>s+DATA.caseValue(c),0) * seats;
          return `<div class="hl"><div class="row between"><span class="badge solid">JACKPOT</span><span class="count">${seats}-way</span></div>
            <div class="hl-thumbs">${cs.map(c => UI.ph("", "mini")).join("")}</div>
            <div class="row between"><span class="sub">unboxed</span><b class="mono">${UI.money(total)}</b></div>
            <a class="btn sm block" style="margin-top:9px" href="#/battles">View results</a></div>`;
        }).join("")}</div></section>

      <section class="sec"><h2 class="h2">How it works</h2>
        <div class="grid g3">${[["01","Open cases","Pick a case and spin — single or multi, up to ×4. Demo spins are free."],
           ["02","Win items","Reveal real physical items by rarity tier and value."],
           ["03","Cash or claim","Sell back to balance, or submit a marketplace ticket to ship it to you."]]
          .map(([n,t,d]) => `<div class="panel card-b">${UI.ph(t, "case").replace('aspect-ratio:4 / 3','height:120px')}<div class="row" style="margin-top:12px;gap:8px"><span class="badge mono">${n}</span><b>${t}</b></div><p class="muted" style="font-size:12.5px;margin:8px 0 0">${d}</p></div>`).join("")}</div></section>

      <section class="sec"><h2 class="h2">FAQ</h2>${Views.faqHTML(DATA.FAQ.slice(0,4))}</section>`);
    Views.bindAccordion();
  },

  faqHTML(list) {
    return `<div class="acc">${list.map(([q,a]) => `<div class="acc-item"><div class="acc-q" data-acc><span>${UI.esc(q)}</span><span class="pm">+</span></div><div class="acc-a hidden">${UI.esc(a)}</div></div>`).join("")}</div>`;
  },
  bindAccordion() {
    this.qa("[data-acc]").forEach(q => q.addEventListener("click", () => {
      const a = q.nextElementSibling; const open = !a.classList.contains("hidden");
      a.classList.toggle("hidden"); q.querySelector(".pm").textContent = open ? "+" : "−";
    }));
  },

  /* ===================== CASES ===================== */
  cases() {
    this.set(`
      <div class="page-head"><h1>Cases</h1><p>Browse the catalog, then open single or multi. Demo spins cost nothing.</p></div>
      <div class="row between" style="margin-bottom:14px">
        <input class="input" id="case-search" placeholder="Search cases…" style="max-width:280px">
        <select class="input" id="case-sort" style="max-width:200px"><option value="feat">Sort: Featured</option><option value="low">Price: Low → High</option><option value="high">Price: High → Low</option></select>
      </div>
      <div class="row" style="gap:22px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
        <div class="chips" id="case-filters">
          ${[["all","All"],["new","New"],["budget","Under $50"],["mid","$50–$500"],["premium","$500+"]].map(([v,t],i)=>`<div class="chip ${i===0?"active":""}" data-filter="${v}">${t}</div>`).join("")}
        </div>
        <div class="chips" id="vol-filters" title="Volatility: Low / Medium / High / Insane">
          <span class="sub" style="align-self:center">Volatility</span>
          ${[["all","All"],["0","L"],["1","M"],["2","H"],["3","I"]].map(([v,t],i)=>`<div class="chip ${i===0?"active":""}" data-vol="${v}">${t}</div>`).join("")}
        </div>
      </div>
      <div class="grid g4" id="case-grid"></div>`);
    let filter = "all", vol = "all";
    const render = () => {
      const term = (this.q("#case-search").value || "").toLowerCase();
      const sort = this.q("#case-sort").value;
      let list = DATA.CASES.filter(c => c.name.toLowerCase().includes(term));
      if (filter === "new") list = list.filter(c => c.tag === "NEW");
      if (filter === "budget") list = list.filter(c => c.price > 0 && c.price < 50);
      if (filter === "mid") list = list.filter(c => c.price >= 50 && c.price <= 500);
      if (filter === "premium") list = list.filter(c => c.price > 500);
      if (vol !== "all") list = list.filter(c => String(Views.caseVol(c)) === vol);
      if (sort === "low") list = list.slice().sort((a,b)=>a.price-b.price);
      if (sort === "high") list = list.slice().sort((a,b)=>b.price-a.price);
      const grid = this.q("#case-grid");
      grid.innerHTML = list.length ? list.map(c => Views.caseCardHTML(c)).join("") : `<div class="empty" style="grid-column:1/-1">No cases match.</div>`;
    };
    this.q("#case-search").addEventListener("input", render);
    this.q("#case-sort").addEventListener("change", render);
    this.qa("[data-filter]").forEach(ch => ch.addEventListener("click", () => { this.qa("[data-filter]").forEach(x=>x.classList.remove("active")); ch.classList.add("active"); filter = ch.dataset.filter; render(); }));
    this.qa("[data-vol]").forEach(ch => ch.addEventListener("click", () => { this.qa("[data-vol]").forEach(x=>x.classList.remove("active")); ch.classList.add("active"); vol = ch.dataset.vol; render(); }));
    render();
  },

  /* ===================== CASE DETAIL + OPENING ===================== */
  caseDetail(id) {
    const c = DATA.caseById(id);
    if (!c) return this.cases();
    const odds = DATA.odds(c);
    const cval = DATA.caseValue(c);
    const best = odds[0];
    // Provably-fair ticket ranges that tile [1..TOTAL] exactly; odds % derived from range width so card data is internally consistent.
    const TOTAL = 100000; let _cum = 0, _prevEnd = 0;
    const ranges = odds.map((o, i) => {
      _cum += o.pct;
      const endN = (i === odds.length - 1) ? TOTAL : Math.floor(_cum / 100 * TOTAL);
      const startN = _prevEnd + 1; _prevEnd = endN;
      const pct = (endN - startN + 1) / TOTAL * 100;
      return { text: startN.toLocaleString() + " – " + endN.toLocaleString(), pct };
    });
    const volIdx = { 1: 0, 2: 1, 3: 2, 4: 3 }[best.item.tier];
    const volLabel = ["Low", "Medium", "High", "Insane"][volIdx];
    this.set(`
      <div class="open-bar">
        <div class="row" style="gap:10px"><a class="icon-btn" href="#/cases" title="Back to cases">${ICN.back}</a><b style="font-size:15px">Case Opening</b><span class="sub">${UI.esc(c.name)}</span></div>
        <div class="tools">
          <button class="tool" id="t-turbo" title="Turbo — skip the animation">${ICN.bolt}<span>Turbo</span></button>
          <button class="tool on" id="t-sound" title="Toggle sound">${ICN.sound}<span>Sound</span></button>
          <a class="tool" href="#/provably-fair" title="Provably fair / fairness">${ICN.shield}<span>Fairness</span></a>
        </div>
      </div>
      <div class="case-2col">
        <aside class="case-side">
          ${UI.ph(c.name, "case")}
          <div class="row between" style="gap:8px"><h1 style="font-size:18px;line-height:1.2">${UI.esc(c.name)}</h1>${c.tag ? `<span class="badge">${c.tag}</span>` : ""}</div>
          <div class="sub" style="margin-top:-6px">${odds.length} items · avg ${UI.money(cval)} · top prize ${UI.esc(best.item.name)}</div>
          <div class="vol" title="Case volatility: Low → Insane">
            <div class="vol-bar"><span class="vol-fill" style="width:${volIdx / 3 * 100}%"></span><i style="left:${volIdx / 3 * 100}%"></i></div>
            <div class="vol-marks"><span class="${volIdx===0?'on':''}">L</span><span class="${volIdx===1?'on':''}">M</span><span class="${volIdx===2?'on':''}">H</span><span class="${volIdx===3?'on':''}">I</span></div>
            <div class="sub" style="text-align:center">Volatility · ${volLabel}</div>
          </div>
          <div class="case-price">${c.free ? "FREE" : UI.money(c.price)}</div>
          <div class="qty" id="qty">${[1,2,3,4].map(n => `<div class="q ${n===1?"active":""}" data-q="${n}">${n}</div>`).join("")}</div>
          <div id="controls" style="display:flex;flex-direction:column;gap:8px">
            <button class="btn primary lg block" id="btn-open">Open · FREE</button>
            <button class="btn block" id="btn-demo">Demo spin</button>
          </div>
        </aside>
        <section class="game-field" id="field">
          <div class="field-band"></div>
          <div class="field-arrow2 left"></div><div class="field-arrow2 right"></div>
          <div class="field-cols" id="reels"></div>
        </section>
      </div>
      <div id="result"></div>

      <section class="sec">
        <div class="sec-head"><h2 class="h2">Items in this case</h2><span class="sub">${odds.length} items · sorted by value · drop odds shown</span></div>
        <div class="grid g6">
          ${odds.map((o, i) => `<div class="flip" data-flip><div class="flip-inner">
            <div class="flip-face front item-card tier-${o.item.tier} t${o.item.tier}">
              <button class="info" data-flip-btn title="Details">i</button>
              ${UI.ph(o.item.name, "item").replace("aspect-ratio:1 / 1", "height:104px")}
              <div class="nm" style="font-size:11.5px">${UI.esc(o.item.name)}</div>
              <div class="item-meta"><span class="vl mono" style="font-size:11px">${UI.money(o.item.value)}</span>${UI.tierTag(o.item.tier)}</div>
              <div class="odd-pct"><span class="bar"><i style="width:${Math.max(3,Math.min(100,ranges[i].pct))}%"></i></span><span class="pct" style="min-width:auto">${ranges[i].pct.toFixed(ranges[i].pct<1?3:1)}%</span></div>
            </div>
            <div class="flip-face back item-card tier-${o.item.tier} t${o.item.tier}">
              <button class="info close" data-flip-btn title="Back">×</button>
              <div class="kv"><span class="k">Price</span><b class="mono">${UI.money(o.item.value)}</b></div>
              <div class="kv"><span class="k">Range</span><b class="mono">${ranges[i].text}</b></div>
              <div class="kv"><span class="k">Odds</span><b class="mono">${ranges[i].pct.toFixed(ranges[i].pct<1?3:1)}%</b></div>
            </div>
          </div></div>`).join("")}
        </div>
      </section>
      <div class="note" style="margin-top:18px">Provably fair — every result is verifiable on the <a href="#/provably-fair">Provably Fair</a> page after the spin.</div>`);

    const controls = this.q("#controls");
    const setEnabled = (on) => controls.querySelectorAll("button").forEach(b => b.disabled = !on);
    let qty = 1, turbo = false, sound = true;
    const renderIdle = (n) => { const r = this.q("#reels"); r.innerHTML = ""; for (let i = 0; i < n; i++) r.insertAdjacentHTML("beforeend", UI.reelColHTML(UI.buildReel(c, 40).ids)); };
    const updPrice = () => { this.q("#btn-open").textContent = c.free ? "Open · FREE" : "Open for " + UI.money(c.price * qty); };
    const open = (count, demo) => {
      const mode = turbo ? "turbo" : "normal";
      if (!demo) {
        if (!UI.requireAuth()) return;
        const cost = c.price * count;
        if (State.d.user.balance < cost) { UI.toast("Insufficient balance", UI.money(cost) + " needed"); UI.openDeposit(); return; }
      }
      const r = this.q("#reels"); r.innerHTML = ""; this.q("#result").innerHTML = "";
      const field = this.q("#field");
      const spins = [];
      for (let i = 0; i < count; i++) { const sp = UI.buildReel(c, 40); r.insertAdjacentHTML("beforeend", UI.reelColHTML(sp.ids)); spins.push(sp); }
      const cols = [...r.querySelectorAll(".reel-col")];
      setEnabled(false);
      if (!demo) { State.debit(c.price*count, "Open "+c.name); State.d.stats.wagered += c.price*count; State.d.stats.opened += count; State.addXP(c.price*count); UI.updateChrome(); }
      const hype = spins.some(s => DATA.item(s.winner).tier >= 3);
      if (hype && mode !== "turbo") field.classList.add("anticip");
      setTimeout(async () => {
        field.classList.remove("anticip");
        await Promise.all(cols.map((col, i) => UI.runSpinV(col, spins[i].WIN, mode)));
        cols.forEach((col, i) => UI.markWinV(col, spins[i].WIN));
        const wonItems = spins.map(s => DATA.item(s.winner));
        const total = wonItems.reduce((s, it) => s + it.value, 0);
        let added = [];
        if (!demo) { added = wonItems.map(it => State.win(it.id)); State.d.stats.won += wonItems.length; State.d.stats.best = Math.max(State.d.stats.best, ...wonItems.map(i=>i.value)); State.save(); UI.updateChrome();
          UI.toast("You won " + (wonItems.length>1?wonItems.length+" items":wonItems[0].name) + "!", UI.money(total)+" added to your cart", "win"); }
        Views.showResult(wonItems, total, demo, added); setEnabled(true);
      }, hype && mode !== "turbo" ? 650 : 120);
    };
    this.qa("#qty .q").forEach(q => q.addEventListener("click", () => { this.qa("#qty .q").forEach(x => x.classList.remove("active")); q.classList.add("active"); qty = parseInt(q.dataset.q, 10); renderIdle(qty); updPrice(); }));
    this.q("#t-turbo").addEventListener("click", (e) => { turbo = !turbo; e.currentTarget.classList.toggle("on", turbo); });
    this.q("#t-sound").addEventListener("click", (e) => { sound = !sound; e.currentTarget.classList.toggle("on", sound); UI.toast("Sound " + (sound ? "on" : "off")); });
    this.q("#btn-open").addEventListener("click", () => open(qty, false));
    this.q("#btn-demo").addEventListener("click", () => open(qty, true));
    renderIdle(1); updPrice();
    this.qa("[data-flip]").forEach(f => f.addEventListener("click", () => f.classList.toggle("flipped")));
  },
  showResult(items, total, demo, added) {
    this.q("#result").innerHTML = `
      <div class="result"><div class="row between"><h3>${demo ? "Demo result" : "You won"} · ${UI.money(total)}</h3>${demo ? `<span class="badge">not added</span>` : `<a class="sub" href="#/provably-fair">verify ↗</a>`}</div>
        <div class="won-row">${items.map(it => `<div class="won tier-${it.tier} t${it.tier}">${UI.ph(it.name,"item")}<div class="nm" style="font-size:12px;font-weight:600">${UI.esc(it.name)}</div><div class="vl mono" style="font-size:11px">${UI.money(it.value)}</div></div>`).join("")}</div>
        ${!demo ? `<div class="row" style="margin-top:14px"><a class="btn primary" href="#/cart">Go to cart →</a><span class="muted" style="font-size:12.5px;align-self:center">Sell, order delivery or set aside from your cart.</span></div>`
          : `<div class="row" style="margin-top:14px"><span class="muted" style="font-size:12.5px">Demo spins don't spend balance or add items.</span></div>`}
      </div>`;
  },

  /* ===================== BATTLES ===================== */
  parseTeams(fmt) { return (fmt || "1v1").split("v").map(n => parseInt(n, 10) || 1); },
  makeBattle(id, waiting) {
    const formats = ["1v1", "1v1v1", "2v2", "1v1v1v1", "3v3"];
    const fmt = formats[Math.floor(Math.random() * formats.length)];
    const modes = ["Standard", "Crazy", "Group", "Shared"];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const n = 2 + Math.floor(Math.random() * 6);
    const cases = Array.from({ length: n }, () => DATA.CASES[2 + Math.floor(Math.random() * 4)].id);
    const seats = Views.parseTeams(fmt).reduce((a, b) => a + b, 0);
    const cost = cases.reduce((s, cid) => s + DATA.caseById(cid).price, 0);
    const filled = 1 + Math.floor(Math.random() * Math.max(1, seats - 1));
    return { id, fmt, mode, cases, seats, cost, filled, rounds: n, progress: waiting ? 0 : Math.floor(Math.random() * n), unboxed: +(Math.random() * cost * 0.3).toFixed(2) };
  },
  battleRowHTML(b) {
    const teams = Views.parseTeams(b.fmt); let idx = 0;
    const slots = teams.map(sz => Array.from({ length: sz }, () => { const f = idx < b.filled; idx++; return `<div class="slot ${f ? "filled" : ""}">${f ? "" : "+"}</div>`; }).join("")).join(`<span class="bt-vs">VS</span>`);
    const isTeam = teams.some(t => t > 1) || b.mode === "Group";
    const modeIcon = b.mode === "Crazy" ? ICN.pie : (isTeam ? ICN.crown : "");
    const open = b.filled < b.seats;
    return `<div class="bt-row">
      <div class="bt-left">
        <div class="bt-mode">${modeIcon}<span>${b.mode} Mode</span></div>
        <div class="bt-slots">${slots}</div>
        <div class="bt-cost">COST <b>${UI.money(b.cost)}</b></div>
      </div>
      <div class="bt-cases">${b.cases.map(() => `<div class="ph mini bt-case"></div>`).join("")}<span class="bt-counter">${ICN.swords} ${b.progress}/${b.rounds}</span></div>
      <div class="bt-right">
        <div class="btn-group" style="justify-content:flex-end">${open ? `<button class="btn primary sm" data-action="joinBattle" data-id="${b.id}">Join</button>` : ""}<button class="btn sm" data-action="joinBattle" data-id="${b.id}" data-watch="1">Watch battle</button></div>
        <div class="bt-unboxed">Unboxed <b>${UI.money(b.unboxed)}</b></div>
      </div>
    </div>`;
  },
  battles() {
    if (!LOBBY.length || !LOBBY[0].cases) { LOBBY.length = 0; for (let i = 0; i < 7; i++) LOBBY.push(Views.makeBattle("lb" + i, Math.random() < 0.5)); }
    this.set(`
      <div class="open-bar">
        <div class="row" style="gap:10px"><a class="icon-btn" href="#/" title="Home">${ICN.back}</a>${ICN.swords}<b style="font-size:15px">${LOBBY.length} Active Battles</b></div>
        <a class="btn primary" href="#/battles/create">${ICN.swords} Create new battle</a>
      </div>
      <div class="row between" style="margin-bottom:14px">
        <div class="tabs"><div class="tab active" data-bt="open">Battles</div><div class="tab" data-bt="mine">My history (${HISTORY.length})</div></div>
        <select class="input" id="b-sort" style="max-width:210px"><option value="cost">Sort: Cost high → low</option><option value="players">Players</option><option value="rounds">Rounds</option></select>
      </div>
      <div class="stack" id="b-list"></div>`);
    const renderOpen = () => {
      let list = LOBBY.slice(); const s = this.q("#b-sort").value;
      if (s === "players") list.sort((a, b) => b.seats - a.seats);
      else if (s === "rounds") list.sort((a, b) => b.rounds - a.rounds);
      else list.sort((a, b) => b.cost - a.cost);
      this.q("#b-list").innerHTML = list.map(b => Views.battleRowHTML(b)).join("");
    };
    const renderMine = () => {
      this.q("#b-list").innerHTML = HISTORY.length ? `<div class="table-card"><table><thead><tr><th>Cases</th><th>Mode</th><th>Result</th><th>Pot</th></tr></thead><tbody>${HISTORY.map(h => `<tr><td>${UI.esc(h.case)}</td><td>${h.mode}</td><td><span class="badge ${h.won ? "solid" : ""}">${h.won ? "Won" : "Lost"}</span></td><td class="mono">${UI.money(h.pot)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No battles played yet.</div>`;
    };
    this.qa("[data-bt]").forEach(t => t.addEventListener("click", () => { this.qa("[data-bt]").forEach(x => x.classList.remove("active")); t.classList.add("active"); t.dataset.bt === "open" ? renderOpen() : renderMine(); }));
    this.q("#b-sort").addEventListener("change", renderOpen);
    renderOpen();
  },
  joinBattle(id, watch) {
    const b = LOBBY.find(x => x.id === id); if (!b) return;
    if (!watch && !UI.requireAuth()) return;
    const bid = "b" + Date.now(); BATTLES[bid] = { cases: b.cases.slice(), fmt: b.fmt, mode: b.mode, seats: b.seats, youPlay: !watch, host: true };
    location.hash = "#/battles/" + bid;
  },
  battleCreate() {
    const picked = [];
    this.set(`
      <a class="btn sm ghost" href="#/battles" style="margin-bottom:12px">← Lobby</a>
      <div class="page-head"><h1>Create battle</h1><p>Add cases (each is one round), choose players &amp; mode, then create.</p></div>
      <div class="grid g2" style="gap:24px;align-items:start">
        <div class="panel card-b">
          <div class="field"><label>Add case · one per round</label><div class="row"><select class="input" id="bc-case">${DATA.CASES.filter(c => !c.free).map(c => `<option value="${c.id}">${UI.esc(c.name)} — ${UI.money(c.price)}</option>`).join("")}</select><button class="btn" id="bc-add">Add</button></div></div>
          <div class="bt-cases" id="bc-list" style="flex-wrap:wrap;min-height:60px"></div>
          <div class="field" style="margin-top:14px"><label>Players</label><div class="chips" id="bc-seats">${[2,3,4,5,6].map(n => `<div class="chip ${n===2?"active":""}" data-seat="${n}">${n===2?"1v1":n+"-way"}</div>`).join("")}<span class="chip" style="opacity:.5;cursor:not-allowed">8-way · TBD</span></div></div>
          <div class="field"><label>Mode</label><div class="chips" id="bc-mode"><div class="chip active" data-mode="Standard">Standard</div><div class="chip" data-mode="Crazy">Crazy · lowest wins</div></div></div>
          <label class="check" style="margin-bottom:8px"><input type="checkbox" id="bc-borrow"> Borrow Mode (up to 95%)</label>
          <label class="check" style="margin-bottom:8px"><input type="checkbox" disabled> Private / password <span class="badge" style="margin-left:6px">Stage 2</span></label>
          <label class="check"><input type="checkbox" disabled> Broadcast (voice/cam) <span class="badge" style="margin-left:6px">Stage 2</span></label>
        </div>
        <div class="panel card-b">
          <h3 class="h2">Summary</h3>
          <table><tbody><tr><td>Rounds (cases)</td><td class="mono" id="bc-rounds" style="text-align:right">0</td></tr><tr><td>Players</td><td class="mono" id="bc-pl" style="text-align:right">2</td></tr><tr><td>Mode</td><td id="bc-md" style="text-align:right">Standard</td></tr><tr><td>Borrow</td><td id="bc-bw" style="text-align:right">Off</td></tr><tr><td>Your entry</td><td class="mono" id="bc-entry" style="text-align:right">$0.00</td></tr></tbody></table>
          <button class="btn primary block" style="margin-top:14px" id="bc-go" disabled>Add a case to create</button>
        </div>
      </div>`);
    let seats = 2, mode = "Standard";
    const renderList = () => { const l = this.q("#bc-list");
      if (!picked.length) { l.innerHTML = `<span class="sub">No cases yet — add at least one.</span>`; return; }
      l.innerHTML = picked.map((cid, i) => `<div class="ph mini bt-case" title="${UI.esc(DATA.caseById(cid).name)} — remove" data-rm="${i}" style="cursor:pointer"></div>`).join("");
      this.qa("[data-rm]").forEach(el => el.addEventListener("click", () => { picked.splice(+el.dataset.rm, 1); renderList(); upd(); }));
    };
    const upd = () => { const cost = picked.reduce((s, cid) => s + DATA.caseById(cid).price, 0);
      this.q("#bc-rounds").textContent = picked.length; this.q("#bc-pl").textContent = seats; this.q("#bc-md").textContent = mode; this.q("#bc-bw").textContent = this.q("#bc-borrow").checked ? "95%" : "Off"; this.q("#bc-entry").textContent = UI.money(cost);
      const go = this.q("#bc-go"); go.disabled = !picked.length; go.textContent = picked.length ? "Create & join" : "Add a case to create"; };
    this.q("#bc-add").addEventListener("click", () => { picked.push(this.q("#bc-case").value); renderList(); upd(); });
    this.qa("#bc-seats [data-seat]").forEach(ch => ch.addEventListener("click", () => { this.qa("#bc-seats [data-seat]").forEach(x => x.classList.remove("active")); ch.classList.add("active"); seats = parseInt(ch.dataset.seat, 10); upd(); }));
    this.qa("#bc-mode [data-mode]").forEach(ch => ch.addEventListener("click", () => { this.qa("#bc-mode [data-mode]").forEach(x => x.classList.remove("active")); ch.classList.add("active"); mode = ch.dataset.mode; upd(); }));
    this.q("#bc-borrow").addEventListener("change", upd);
    renderList(); upd();
    this.q("#bc-go").addEventListener("click", () => { if (!UI.requireAuth()) return; if (!picked.length) return;
      const fmt = Array(seats).fill(1).join("v"); const bid = "b" + Date.now();
      BATTLES[bid] = { cases: picked.slice(), fmt, mode, seats, borrow: this.q("#bc-borrow").checked, youPlay: true, host: true };
      location.hash = "#/battles/" + bid; });
  },
  battleRoom(id) {
    let cfg = BATTLES[id];
    if (!cfg) { const b = Views.makeBattle(id, false); cfg = { cases: b.cases, fmt: b.fmt, mode: b.mode, seats: b.seats, youPlay: true, host: true }; BATTLES[id] = cfg; }
    if (!cfg.cases) cfg.cases = [cfg.caseId || "tech"];
    const cases = cfg.cases.map(cid => DATA.caseById(cid));
    const fmt = cfg.fmt || Array(cfg.seats || 2).fill(1).join("v");
    const teams = Views.parseTeams(fmt);
    const seatCount = cfg.seats || teams.reduce((a, b) => a + b, 0);
    const teamOf = []; let pi = 0; teams.forEach((sz, ti) => { for (let k = 0; k < sz; k++) { teamOf[pi] = ti; pi++; } });
    const players = [];
    if (cfg.youPlay) players.push({ name: State.d.user.username || "You", you: true, status: "ready", total: 0, pulls: [] });
    while (players.length < seatCount) players.push({ name: "Open slot", you: false, status: "waiting", total: 0, pulls: [] });
    const totalCost = cases.reduce((s, c) => s + c.price, 0);
    const battleValue = totalCost * seatCount;
    const reelCols = seatCount <= 4 ? seatCount : 4;   // game fields: 2–4 one row · >4 bento grid
    const resCols = seatCount;                         // round results: always one line (2–6 cols)
    const pctOf = (c, itemId) => { const o = DATA.odds(c).find(x => x.item.id === itemId); return o ? o.pct : 0; };
    const initial = (n) => UI.esc((n[0] || "C").toUpperCase());
    const botName = (k) => "Crowbot #" + k;

    this.set(`
      <div class="open-bar">
        <div class="row" style="gap:10px"><a class="icon-btn" href="#/battles" title="Lobby">${ICN.back}</a><div><b style="font-size:15px">${fmt} · ${cfg.mode} Mode</b><div class="sub">${cases.length} rounds</div></div></div>
        <div class="row" style="gap:8px">${cfg.borrow ? `<span class="badge out">Borrow 95%</span>` : ""}<button class="icon-btn" title="Copy link" data-action="copyLink">${ICN.link}</button><button class="icon-btn" id="r-sound" title="Sound">${ICN.sound}</button><a class="icon-btn" href="#/provably-fair" title="Fairness">${ICN.shield}</a></div>
      </div>
      <div class="round-bar">
        <div><div class="sub">ROUND <b id="round-n">0</b> OF ${cases.length}</div></div>
        <div class="round-cases">${cases.map((c, i) => `<div class="ph mini round-case" data-rc="${i}" title="${UI.esc(c.name)}"></div>`).join("")}</div>
        <div style="text-align:right"><div class="sub">BATTLE VALUE</div><b class="mono" style="font-size:16px">${UI.money(battleValue)}</b></div>
      </div>
      <div class="jackpot-bar"><span class="sub">JACKPOT</span> <span data-jackpot>${UI.money(0)}</span></div>
      <div class="row between" style="margin-bottom:12px"><span class="sub">Total cost ${UI.money(totalCost)} · ${seatCount} players · ${cfg.mode}${cfg.mode==="Crazy"?" (lowest wins)":cfg.mode==="Shared"?" (split)":""}</span>
        <span class="cd-status" id="b-status">Waiting for players…</span></div>
      <div class="players ${seatCount>4?"bento":""}" id="players" style="grid-template-columns:repeat(${reelCols},1fr)"></div>
      <div class="b-actions" id="b-actions"></div>
      <div class="results-wrap hidden" id="results-wrap"><h3 class="h2" style="margin:18px 0 10px">Round results</h3><div class="results" id="results" style="grid-template-columns:repeat(${resCols},1fr)"></div></div>
      <div class="s2-banner"><span class="warn">!</span><span>Spectator mode — bet behind a player <span class="chip-s2">Stage 2</span></span></div>`);

    const statusEl = this.q("#b-status");
    const setStatus = (t, cls) => { if (statusEl && statusEl.isConnected) { statusEl.textContent = t; statusEl.className = "cd-status" + (cls ? " " + cls : ""); } };
    const updJackpot = () => { this.q("[data-jackpot]").textContent = UI.money(players.reduce((s, p) => s + p.total, 0)); };

    // ---------- LOBBY (waiting / ready) ----------
    const lobbyCol = (p, i) => p.status === "waiting"
      ? `<div class="pcol waiting" data-pcol="${i}"><div class="pcol-head"><span class="sub">Open slot</span></div>
          <div class="pcol-state"><div class="seat-add">+</div><div class="big">Waiting for opponent…</div><button class="join-btn" data-joinseat="${i}">${ICN.crown} JOIN FOR ${UI.money(totalCost)}</button></div></div>`
      : `<div class="pcol ${p.you?"you":""}" data-pcol="${i}"><div class="pcol-head"><div class="row" style="gap:8px"><span class="avatar" style="width:24px;height:24px;font-size:9px">${initial(p.name)}</span><b style="font-size:12.5px">${UI.esc(p.name)}</b>${p.you?` <span class="badge">you</span>`:""}</div><span class="mono">$0.00</span></div>
          <div class="pcol-state"><div style="font-size:28px;line-height:1">✓</div><div class="ready">READY</div></div></div>`;
    const renderLobby = () => {
      this.q("#players").innerHTML = players.map((p, i) => lobbyCol(p, i)).join("");
      this.qa("[data-joinseat]").forEach(b => b.addEventListener("click", () => joinSeat(+b.dataset.joinseat)));
    };

    // ---------- RUNNING ----------
    const runningCol = (p, i) => `<div class="pcol ${p.you?"you":""}" data-pcol="${i}"><div class="pcol-head"><div class="row" style="gap:8px"><span class="avatar" style="width:24px;height:24px;font-size:9px">${initial(p.name)}</span><b style="font-size:12.5px">${UI.esc(p.name)}</b>${p.you?` <span class="badge">you</span>`:""}</div><span class="mono" data-ptotal="${i}">$0.00</span></div>
      <div class="pcol-reel" data-preel="${i}"><div class="reel-vstrip"></div></div>
      <div class="pcol-foot" data-pfoot="${i}"><span class="sub">no pulls yet</span></div></div>`;
    const resCol = (p, i) => `<div class="res-col"><div class="res-head"><div class="row" style="gap:8px"><span class="avatar" style="width:22px;height:22px;font-size:9px">${initial(p.name)}</span><b style="font-size:12px">${UI.esc(p.name)}</b></div><span class="mono" data-rtotal="${i}">${UI.money0(0)}</span></div><div class="res-body" data-rbody="${i}"></div></div>`;

    const run = async () => {
      if (cfg.youPlay) {
        if (!UI.requireAuth()) return;
        if (State.d.user.balance < totalCost) { UI.toast("Insufficient balance", UI.money(totalCost) + " entry"); UI.openDeposit(); return; }
        State.debit(totalCost, "Battle entry"); State.d.stats.wagered += totalCost; State.addXP(totalCost); UI.updateChrome();
      }
      setStatus("Running…");
      this.q("#players").innerHTML = players.map((p, i) => runningCol(p, i)).join("");
      this.q("#results-wrap").classList.remove("hidden");
      this.q("#results").innerHTML = players.map((p, i) => resCol(p, i)).join("");
      const host = this.q("#players");
      for (let round = 0; round < cases.length; round++) {
        if (!host.isConnected) return;   // room navigated/re-rendered — abort cleanly
        this.q("#round-n").textContent = round + 1;
        this.qa("[data-rc]").forEach((el, i) => { el.classList.toggle("active", i === round); el.classList.toggle("done", i < round); });
        const c = cases[round];
        const reels = players.map(() => UI.buildReel(c, 40));
        players.forEach((p, i) => { this.q(`[data-preel="${i}"] .reel-vstrip`).innerHTML = reels[i].ids.map(rid => UI.vtileHTML(DATA.item(rid))).join(""); });
        const reelEls = this.qa(".pcol-reel");
        await Promise.all(reelEls.map((col, i) => UI.runSpinV(col, reels[i].WIN, "normal")));
        reelEls.forEach((col, i) => UI.markWinV(col, reels[i].WIN));
        players.forEach((p, i) => {
          const it = DATA.item(reels[i].winner); const pct = pctOf(c, it.id);
          p.total += it.value; p.pulls.push(it);
          this.q(`[data-ptotal="${i}"]`).textContent = UI.money(p.total);
          this.q(`[data-rtotal="${i}"]`).textContent = UI.money0(p.total);
          const best = p.pulls.reduce((a, b) => b.value > a.value ? b : a);
          this.q(`[data-pfoot="${i}"]`).innerHTML = `${UI.tierTag(best.tier)}<span class="nm">${UI.esc(best.name)}</span><span class="mono">${UI.money(best.value)}</span>`;
          const rb = this.q(`[data-rbody="${i}"]`);
          rb.insertAdjacentHTML("beforeend", `<div class="pull-card tier-${it.tier} t${it.tier}"><span class="pull-pct">${pct.toFixed(pct<1?3:1)}%</span>${UI.ph(it.name, "item")}<div class="pull-type">Tier ${it.tier}</div><div class="pull-name">${UI.esc(it.name)}</div><div class="pull-val">${UI.money(it.value)}</div></div>`);
          rb.scrollTop = rb.scrollHeight;
        });
        updJackpot();
        await new Promise(r => setTimeout(r, 350));
      }
      // ---------- RESOLVE ----------
      if (!host.isConnected) return;
      const teamTotals = teams.map(() => 0); players.forEach((p, i) => teamTotals[teamOf[i]] += p.total);
      let winTeam = 0; teamTotals.forEach((t, ti) => { if (cfg.mode === "Crazy" ? t < teamTotals[winTeam] : t > teamTotals[winTeam]) winTeam = ti; });
      const pot = players.reduce((s, p) => s + p.total, 0);
      this.qa("[data-rc]").forEach(el => el.classList.add("done"));
      this.q("#players").innerHTML = players.map((p, i) => {
        const won = cfg.mode === "Shared" || teamOf[i] === winTeam;
        const display = cfg.mode === "Shared" ? p.total : (won ? pot / teams[winTeam] : 0);
        const xp = won ? Math.round(totalCost * 10) : Math.round(pot * 3);
        return `<div class="pcol ${won?"winner":"loss"} ${p.you?"you":""}"><div class="pcol-head"><div class="row" style="gap:8px"><span class="avatar" style="width:24px;height:24px;font-size:9px">${initial(p.name)}</span><b style="font-size:12.5px">${UI.esc(p.name)}</b></div><span class="mono">${UI.money(p.total)}</span></div>
          <div class="pcol-state"><div class="big">${cfg.mode==="Shared"?"PAYOUT":(won?"WINNER":"LOSS")}</div><div class="row" style="gap:8px;justify-content:center"><b class="mono" style="font-size:16px">${UI.money(display)}</b><span class="xpbadge">+${xp.toLocaleString()} XP</span></div></div></div>`;
      }).join("");
      setStatus(cfg.mode === "Shared" ? "Payout complete" : "Team " + (winTeam + 1) + " wins");
      this.q("#b-actions").innerHTML = `<a class="btn primary" href="#/battles/create">Create same · ${UI.money(totalCost)}</a><a class="btn" href="#/battles">Back to list</a>`;
      const youWin = cfg.youPlay && teamOf[0] === winTeam;
      State.d.stats.battles++;
      if (cfg.youPlay) HISTORY.unshift({ case: cases.map(c => c.name).join(", "), mode: cfg.mode, won: youWin || cfg.mode === "Shared", pot });
      if (cfg.youPlay) {
        if (cfg.mode === "Shared") { players[0].pulls.forEach(it => State.win(it.id, true)); State.d.stats.won += players[0].pulls.length; State.save(); UI.updateChrome(); UI.toast("Shared battle", "Your pulls added to cart", "win"); }
        else if (youWin) { players.forEach(p => p.pulls.forEach(it => State.win(it.id, true))); State.d.stats.won += players.reduce((s, p) => s + p.pulls.length, 0); State.save(); UI.updateChrome(); UI.toast("Battle won!", "Pot added to your cart — " + UI.money(pot), "win"); }
        else UI.toast("Battle lost", "Team " + (winTeam + 1) + " took the pot");
      }
    };

    // ---------- AUTO-START (Join or auto-fill → 3·2·1 countdown → run) ----------
    let started = false, fillT = null, cdT = null;
    const allReady = () => players.every(p => p.status === "ready");
    const beginCountdown = () => {
      if (started) return; started = true; if (fillT) clearInterval(fillT);
      let n = 3; setStatus("Starting in " + n + "…", "counting");
      cdT = setInterval(() => {
        if (!statusEl.isConnected) { clearInterval(cdT); return; }
        n--;
        if (n <= 0) { clearInterval(cdT); run(); }
        else setStatus("Starting in " + n + "…", "counting");
      }, 850);
    };
    const joinSeat = (k) => {
      if (started || players[k].status !== "waiting") return;
      players[k].status = "ready"; players[k].name = botName(k);
      renderLobby();
      setStatus(allReady() ? "All players ready" : "Waiting for players…");
      if (allReady()) beginCountdown();
    };
    renderLobby();
    if (allReady()) beginCountdown();
    else {
      setStatus("Waiting for players…");
      fillT = setInterval(() => {
        if (!statusEl.isConnected) { clearInterval(fillT); return; }
        if (started) { clearInterval(fillT); return; }
        const k = players.findIndex(p => p.status === "waiting");
        if (k >= 0) joinSeat(k);
      }, 1500);
    }
  },

  /* ===================== UPGRADE ===================== */
  upgrade() {
    let stakeMode = "balance", amount = 0, stakeItems = [], mult = null;
    let pending = [], targets = [];                         // pending = working catalog selection · targets = committed reward items (max 4)
    let fSearch = "", fPrice = "all", fTier = "all", fSort = "phigh";
    const C = 2 * Math.PI * 120;
    const stakeVal = () => stakeMode === "balance" ? amount : stakeItems.reduce((s, i) => s + i.value, 0);
    this.set(`
      <div class="page-head"><h1>Upgrade</h1><p>Stake balance or items, pick a multiplier, then add up to 4 reward items. Spin to land the upgrade.</p></div>
      <div class="up-2col">
        <div class="panel card-b">
          <h3 class="h2" style="margin:0">Your stake</h3>
          <div id="stake-body" style="margin-top:12px"></div>
          <div class="sub" style="margin:16px 0 7px">Multiplier</div>
          <div class="btn-group mult-row" id="mult-row">${[2,5,20].map(m=>`<button class="btn" data-mult="${m}">x${m}</button>`).join("")}</div>
          <div class="up-stats" style="margin-top:16px">
            <div class="row between"><span class="sub">Win chance</span><b class="mono" id="sum-chance">—</b></div>
            <div class="row between"><span class="sub">Target goal</span><b class="mono" id="sum-goal">—</b></div>
            <div class="row between"><span class="sub">Reward total</span><b class="mono" id="sum-reward">$0.00</b></div>
            <div class="row between"><span class="sub">Your stake</span><b class="mono" id="sum-stake">$0.00</b></div>
          </div>
        </div>
        <div class="up-field">
          <div class="up-dial" id="up-dial">
            <svg viewBox="0 0 284 284" width="284" height="284"><circle cx="142" cy="142" r="120" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="16"/><circle id="up-arc" cx="142" cy="142" r="120" fill="none" stroke="#262626" stroke-width="16" stroke-dasharray="0 9999" transform="rotate(-90 142 142)"/></svg>
            <div class="up-ticker" id="up-ticker"></div>
            <div class="up-center"><div class="up-mult" id="up-mult">—</div><div class="up-chance" id="up-chance">set stake &amp; multiplier</div><div class="up-clabel">Reward items below</div></div>
          </div>
          <div class="up-targets-row" id="up-targets-row"></div>
          <button class="btn primary lg" id="up-go" style="min-width:240px">Set your stake</button>
        </div>
      </div>
      <section class="sec" style="margin-top:0;padding-bottom:80px">
        <div class="sec-head"><h2 class="h2">Item catalog</h2><span class="sub">Add up to 4 reward items</span></div>
        <div class="up-filters">
          <input class="input" id="cat-search" placeholder="Search…" style="max-width:220px">
          <select class="input" id="cat-price" style="max-width:170px"><option value="all">All prices</option><option value="lt100">Under $100</option><option value="mid">$100 – $500</option><option value="gt500">$500+</option></select>
          <div class="chips" id="cat-tier">${[["all","All"],["1","T1"],["2","T2"],["3","T3"],["4","T4"]].map(([v,t],i)=>`<div class="chip ${i===0?"active":""}" data-ctier="${v}">${t}</div>`).join("")}</div>
          <select class="input" id="cat-sort" style="max-width:170px"><option value="phigh">Sort: Price ↓</option><option value="plow">Sort: Price ↑</option><option value="name">Sort: Name</option></select>
        </div>
        <div class="grid g6" id="cat-grid"></div>
      </section>
      <div class="select-bar" id="select-bar">
        <div class="sel-items" id="sel-items"></div>
        <div class="sel-total" id="sel-total">Total <b>$0.00</b></div>
        <div class="row" style="gap:8px"><button class="btn" id="sel-cancel">Cancel</button><button class="btn primary" id="sel-add">Add 0 items</button></div>
      </div>`);
    document.body.classList.remove("selbar");

    const arc = this.q("#up-arc");
    const renderState = () => { const go = this.q("#up-go"); const u = State.d.user; const stake = stakeVal();
      if (!u.loggedIn) { go.disabled = false; go.textContent = "Sign in to play"; return; }
      if (stakeMode === "balance" && u.balance <= 0) { go.disabled = false; go.textContent = "Deposit to play"; return; }
      if (stake <= 0) { go.disabled = true; go.textContent = "Set your stake"; return; }
      if (!mult) { go.disabled = true; go.textContent = "Pick a multiplier"; return; }
      if (!targets.length) { go.disabled = true; go.textContent = "Add reward items"; return; }
      if (stakeMode === "balance" && u.balance < amount) { go.disabled = false; go.textContent = "Insufficient — Deposit"; return; }
      go.disabled = false; go.textContent = "Upgrade · risk " + UI.money(stake); };
    const recompute = () => { const stake = stakeVal();
      const chance = mult ? Math.min(.95, (1 / mult) * 0.93) : 0; this._upChance = chance;
      const reward = targets.reduce((s, t) => s + t.value, 0);
      arc.setAttribute("stroke-dasharray", `${chance * C} ${C}`);
      this.q("#up-mult").textContent = mult ? "x" + mult : "—";
      this.q("#up-chance").textContent = mult ? (chance * 100).toFixed(1) + "% win" : "set stake & multiplier";
      this.q("#sum-chance").textContent = mult ? (chance * 100).toFixed(1) + "%" : "—";
      this.q("#sum-goal").textContent = (mult && stake > 0) ? UI.money(stake * mult) : "—";
      this.q("#sum-reward").textContent = UI.money(reward);
      this.q("#sum-stake").textContent = UI.money(stake);
      renderState(); };
    const renderMult = () => { this.qa("#mult-row [data-mult]").forEach(b => b.classList.toggle("on", +b.dataset.mult === mult)); };
    const renderTargetsRow = () => { const row = this.q("#up-targets-row");
      if (!targets.length) { row.innerHTML = `<div class="sub" style="align-self:center">No reward items — pick up to 4 from the catalog below.</div>`; return; }
      row.innerHTML = targets.map((t, i) => `<div class="up-tchip tier-${t.tier} t${t.tier}"><button class="x" data-tremove="${i}">✕</button>${UI.ph(t.name, "item")}<div class="nm" style="font-size:10.5px">${UI.esc(t.name)}</div><div class="vl mono" style="font-size:10px">${UI.money(t.value)}</div></div>`).join("");
      this.qa("[data-tremove]").forEach(b => b.addEventListener("click", () => { targets.splice(+b.dataset.tremove, 1); renderTargetsRow(); renderCatalog(); recompute(); })); };
    const renderStakeBody = () => { const u = State.d.user; const body = this.q("#stake-body");
      if (!u.loggedIn) { body.innerHTML = `<div class="note">Sign in to stake balance or items.</div><button class="btn primary block" style="margin-top:10px" data-action="auth" data-mode="signin">Sign in</button>`; return; }
      if (stakeMode === "balance") {
        body.innerHTML = `<div class="field"><label>Upgrade amount <span class="hint">of ${UI.money(u.balance)} balance</span></label><input class="input mono" id="up-amount" placeholder="0.00" value="${amount || ""}"></div>
          <div class="btn-group">${[10,25,50,100].map(p=>`<button class="btn sm" data-amt="${p}">${p}%</button>`).join("")}<button class="btn sm" data-amt="max">Max</button></div>`;
        this.q("#up-amount").addEventListener("input", (e) => { amount = Math.min(u.balance, Math.max(0, parseFloat(e.target.value) || 0)); recompute(); });
        this.qa("[data-amt]").forEach(b => b.addEventListener("click", () => { amount = b.dataset.amt === "max" ? u.balance : +(u.balance * (+b.dataset.amt) / 100).toFixed(2); this.q("#up-amount").value = amount; recompute(); }));
      } else {
        const inv = State.d.inv;
        body.innerHTML = inv.length ? `<div class="sub" style="margin-bottom:8px">Select inventory items to stake (you risk these)</div><div class="inv-strip">${inv.map(it=>`<div class="inv-pick ${stakeItems.find(s=>s.uid===it.uid)?"sel":""}" data-invpick="${it.uid}">${UI.ph(it.name,"item")}<div class="nm" style="font-size:10.5px">${UI.esc(it.name)}</div><div class="vl mono" style="font-size:10px">${UI.money(it.value)}</div></div>`).join("")}</div><div class="sub" style="margin-top:8px">Staking ${stakeItems.length} item(s) · <b class="mono">${UI.money(stakeVal())}</b></div>` : `<div class="empty" style="padding:20px">No items to stake.<br><a href="#/cases">Open a case →</a></div>`;
        this.qa("[data-invpick]").forEach(el => el.addEventListener("click", () => { const it = inv.find(x => x.uid === el.dataset.invpick); const idx = stakeItems.findIndex(s => s.uid === it.uid); if (idx >= 0) stakeItems.splice(idx, 1); else stakeItems.push(it); renderStakeBody(); recompute(); }));
      } };
    const catFiltered = () => { let list = DATA.ITEMS.filter(i => i.name.toLowerCase().includes(fSearch));
      if (fPrice === "lt100") list = list.filter(i => i.value < 100); else if (fPrice === "mid") list = list.filter(i => i.value >= 100 && i.value <= 500); else if (fPrice === "gt500") list = list.filter(i => i.value > 500);
      if (fTier !== "all") list = list.filter(i => String(i.tier) === fTier);
      if (fSort === "phigh") list.sort((a,b)=>b.value-a.value); else if (fSort === "plow") list.sort((a,b)=>a.value-b.value); else list.sort((a,b)=>a.name.localeCompare(b.name));
      return list; };
    const renderCatalog = () => { const sel = pending.length ? pending : targets;
      const grid = this.q("#cat-grid"); const list = catFiltered();
      grid.innerHTML = list.length ? list.map(t => `<div class="item-card cat-pick tier-${t.tier} t${t.tier} ${sel.find(s=>s.id===t.id)?"sel":""}" data-cat="${t.id}">${UI.ph(t.name,"item")}<div class="nm" style="font-size:11px">${UI.esc(t.name)}</div><div class="item-meta"><span class="vl mono" style="font-size:11px">${UI.money(t.value)}</span>${UI.tierTag(t.tier)}</div></div>`).join("") : `<div class="empty" style="grid-column:1/-1">No items match.</div>`;
      this.qa("[data-cat]").forEach(el => el.addEventListener("click", () => toggleCat(DATA.item(el.dataset.cat)))); };
    const renderSelectBar = () => { const bar = this.q("#select-bar");
      if (!pending.length) { bar.classList.remove("show"); document.body.classList.remove("selbar"); return; }
      bar.classList.add("show"); document.body.classList.add("selbar");
      this.q("#sel-items").innerHTML = pending.map((t, i) => `<div class="sel-thumb">${UI.ph(t.name,"item")}<span>${UI.esc(t.name)}</span><span class="mono">${UI.money(t.value)}</span><span class="x" data-premove="${i}">✕</span></div>`).join("");
      this.q("#sel-total").innerHTML = `Total <b>${UI.money(pending.reduce((s,t)=>s+t.value,0))}</b>`;
      this.q("#sel-add").textContent = "Add " + pending.length + " item" + (pending.length > 1 ? "s" : "");
      this.qa("[data-premove]").forEach(b => b.addEventListener("click", () => { pending.splice(+b.dataset.premove, 1); renderSelectBar(); renderCatalog(); })); };
    const toggleCat = (item) => { if (!pending.length && targets.length) pending = targets.slice();
      const idx = pending.findIndex(p => p.id === item.id);
      if (idx >= 0) pending.splice(idx, 1); else { if (pending.length >= 4) { UI.toast("Max 4 items"); return; } pending.push(item); }
      renderSelectBar(); renderCatalog(); };
    const spin = () => { const u = State.d.user; const stake = stakeVal();
      if (!u.loggedIn) { UI.openAuth("signin"); return; }
      if (stakeMode === "balance" && u.balance <= 0) { UI.openDeposit(); return; }
      if (stake <= 0) { UI.toast("Set your stake first"); return; }
      if (!mult) { UI.toast("Pick a multiplier"); return; }
      if (!targets.length) { UI.toast("Add reward items from the catalog"); return; }
      if (stakeMode === "balance" && u.balance < amount) { UI.openDeposit(); return; }
      const chance = this._upChance, winDeg = chance * 360;
      const won = (State.d.upStreak || 0) >= 5; State.d.upStreak = won ? 0 : (State.d.upStreak || 0) + 1;  // 1 win per 5 losses
      const land = won ? Math.random() * Math.max(2, winDeg) : winDeg + Math.random() * (360 - winDeg);
      const go = this.q("#up-go"); go.disabled = true; go.textContent = "Upgrading…";
      const dial = this.q("#up-dial"); dial.classList.remove("won", "lost");
      if (stakeMode === "balance") State.debit(amount, "Upgrade stake");
      else stakeItems.forEach(it => { State.removeInv(it.uid); State.tx("spend", -it.value, "Upgrade item: " + it.name); });
      State.d.stats.wagered += stake; State.addXP(stake); UI.updateChrome();
      const ticker = this.q("#up-ticker");
      ticker.style.transition = "none"; ticker.style.transform = "rotate(0deg)"; void ticker.offsetWidth;
      ticker.style.transition = "transform 4s cubic-bezier(.12,.75,.16,1)"; ticker.style.transform = `rotate(${360*5 + land}deg)`;
      const finish = () => { ticker.removeEventListener("transitionend", finish);
        dial.classList.add(won ? "won" : "lost");
        if (won) { targets.forEach(t => State.win(t.id)); State.d.stats.won += targets.length; State.d.stats.best = Math.max(State.d.stats.best, ...targets.map(t => t.value)); UI.toast("Upgrade hit!", targets.length + " item(s) added to cart", "win"); }
        else UI.toast("Upgrade missed", "Stake lost");
        State.save(); UI.updateChrome();
        if (stakeMode === "item") { stakeItems = []; renderStakeBody(); }
        recompute();
        this.q("#up-go").textContent = "Upgrade again"; };
      ticker.addEventListener("transitionend", finish); setTimeout(finish, 4300); };

    this.qa("#mult-row [data-mult]").forEach(b => b.addEventListener("click", () => { mult = +b.dataset.mult; renderMult(); recompute(); }));
    this.q("#cat-search").addEventListener("input", (e) => { fSearch = e.target.value.toLowerCase(); renderCatalog(); });
    this.q("#cat-price").addEventListener("change", (e) => { fPrice = e.target.value; renderCatalog(); });
    this.q("#cat-sort").addEventListener("change", (e) => { fSort = e.target.value; renderCatalog(); });
    this.qa("#cat-tier [data-ctier]").forEach(c => c.addEventListener("click", () => { this.qa("#cat-tier [data-ctier]").forEach(x => x.classList.remove("active")); c.classList.add("active"); fTier = c.dataset.ctier; renderCatalog(); }));
    this.q("#sel-cancel").addEventListener("click", () => { pending = []; renderSelectBar(); renderCatalog(); });
    this.q("#sel-add").addEventListener("click", () => { if (!pending.length) return; targets = pending.slice(); pending = []; renderSelectBar(); renderCatalog(); renderTargetsRow(); recompute(); });
    this.q("#up-go").addEventListener("click", spin);
    renderStakeBody(); renderMult(); renderTargetsRow(); renderCatalog(); recompute();
  },
  /* ===================== REWARDS ===================== */
  // shared countdown utility — updates [data-cd] elements, self-clears on navigation
  startCountdown() {
    if (this._cdTimer) clearInterval(this._cdTimer);
    const fmt = (ms) => { if (ms < 0) ms = 0; const s = Math.floor(ms / 1000); const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (d ? d + "d " : "") + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0"); };
    const tick = () => { const els = this.qa("[data-cd]"); if (!els.length || !els[0].isConnected) { clearInterval(this._cdTimer); this._cdTimer = null; return; } els.forEach(el => el.textContent = fmt(+el.dataset.cd - Date.now())); };
    tick(); this._cdTimer = setInterval(tick, 1000);
  },
  challengeDone(i) { const s = State.d.stats, u = State.d.user; return i === 0 ? s.opened >= 5 : i === 1 ? s.battles >= 1 : u.level >= 3; },

  rewards() {
    const u = State.d.user, st = State.d.stats;
    const now = Date.now();
    const endMonthly = now + (12 * 86400 + 4 * 3600) * 1000;
    const endWeekly = now + (3 * 86400 + 6 * 3600) * 1000;
    const monthlyPool = 15900;
    // monthly race — 10 players, you at #1
    const others = ["Nova","Kato","Vex","Juno","Pax","Echo","Wren","Sable","Dax"];
    const prizes = [5000,2600,1800,1300,1000,800,650,500,400,300];
    const race = [[u.username || "You", st.wagered]].concat(others.map((n, i) => [n, Math.round(2200 - i * 210 + (i % 2 ? 40 : -30))]));
    // weekly challenge
    const challenges = [["Open 5 cases","Bonus copy of first pull"],["Win a battle","+2 raffle tickets"],["Reach level 3","Free Street Style case"]];
    const allDone = [0,1,2].every(i => State.d.claimedChallenges.includes(i));
    const weekPrizeCase = DATA.caseById("hype");
    // weekly raffle
    const raffleItem = DATA.item("camera");
    // free cases by level — continuous ladder windowed around the player's level
    const lvl = u.loggedIn ? u.level : 1;
    const xpIn = u.loggedIn ? Math.min(999, u.xp) : 0;
    const curXP = (lvl - 1) * 1000 + xpIn;            // flat 1000-XP-per-level model for display
    const reqXP = (L) => (L - 1) * 1000;
    const caseForLevel = (L) => L < 8 ? "starter" : L < 20 ? "street" : L < 45 ? "tech" : L < 75 ? "hype" : "elite";
    const startL = Math.max(2, lvl - 2);
    const levelWindow = []; for (let L = startL; L < startL + 7; L++) levelWindow.push(L);
    // VIP ranks
    const ranks = [
      ["Bronze","20,000","Level 20",["Daily Bronze case","Weekly Bronze case","Monthly Bronze case","Instant item deposit","Priority support"]],
      ["Silver","75,000","Level 40",["Daily Silver case","Weekly Silver case","Monthly Silver case","Instant item deposit","2% rakeback"]],
      ["Gold","200,000","Level 60",["Daily Gold case","Weekly Gold case","Monthly Gold case","Instant item deposit","4% rakeback","Dedicated manager"]],
      ["Platinum","500,000","Level 80",["Daily Platinum case","Weekly Platinum case","Monthly Platinum case","Exclusive Platinum cases","6% rakeback","Dedicated manager"]],
      ["Diamond","1,500,000","Level 100",["Daily Diamond case","Weekly Diamond case","Monthly Diamond case","Bespoke physical rewards","10% rakeback","Personal concierge"]],
    ];
    const rankCard = ([name,xp,lvl,perks]) => { const cur = u.loggedIn && u.vip === name;
      return `<div class="rank-card panel card-b ${cur?"current":""}">
        <div class="rank-top"><div class="rank-badge">${UI.esc(name[0])}</div><div class="rank-line"></div>${cur?`<span class="badge solid">Your tier</span>`:""}</div>
        <h3 class="rank-name">${name}</h3>
        <div class="rank-xp">${xp}</div><div class="sub">Experience Points · ${lvl}</div>
        <div class="rank-perks">${perks.map(p=>`<div class="rank-perk"><span class="rk-check">✓</span>${UI.esc(p)}</div>`).join("")}</div>
      </div>`; };
    // level reward card — states: claimed / claimable (reached) / in-progress (next level) / locked (future)
    const lvCard = (L) => { const c = DATA.caseById(caseForLevel(L)); const claimed = State.d.claimedMilestones.includes(L); const reached = lvl >= L; const isNext = L === lvl + 1;
      let foot, cls = "", tag = `Lv ${L}`;
      if (claimed) { foot = `<div class="lv-foot done"><span class="badge solid">Claimed ✓</span></div>`; }
      else if (reached) { cls = "ready"; tag = `Lv ${L}`; foot = `<div class="lv-foot"><button class="btn sm primary block" data-action="claimMilestone" data-lv="${L}" data-cid="${c.id}">Claim</button></div>`; }
      else if (isNext) { cls = "lv-next"; tag = `Lv ${L} · next`; const need = lvl * 1000; const rem = Math.max(0, need - curXP); const pct = Math.min(100, (curXP - (lvl - 1) * 1000) / 1000 * 100);
        foot = `<div class="lv-foot"><div class="lv-bar"><i style="width:${pct}%"></i></div><div class="sub">${curXP.toLocaleString()} / ${need.toLocaleString()} XP · ${rem.toLocaleString()} XP to Level ${L}</div></div>`; }
      else { foot = `<div class="lv-foot"><div class="sub">Unlocks at Level ${L} · needs ${reqXP(L).toLocaleString()} XP</div></div>`; }
      return `<div class="item-card case-card tier-3 ${cls}">${UI.ph(c.name,"case")}<div class="row between"><div class="nm">${UI.esc(c.name)}</div><span class="badge">${tag}</span></div>${foot}</div>`; };

    this.set(`
      <div class="page-head"><h1>Rewards</h1><p>Free cases, races, raffle and promos. Marketing runs on rewards &amp; true VIP.</p></div>

      ${!u.loggedIn ? `<div class="note auth-note"><div class="row between" style="gap:12px;flex-wrap:wrap"><span>You're browsing as a guest — sign in to claim rewards and track your rank, tickets &amp; level progress.</span><div class="row" style="gap:8px"><button class="btn sm" data-action="auth" data-mode="signin">Sign in</button><button class="btn sm primary" data-action="auth" data-mode="signup">Sign up free</button></div></div></div>` : ""}

      <!-- 1 · MONTHLY RACE  +  3 · WEEKLY RAFFLE (one row) -->
      <div class="grid g2" style="gap:18px;align-items:start;margin-top:0">
        <section class="panel card-b reward-panel">
          <div class="reward-banner flat">
            <div class="rb-bg"></div>
            <div class="rb-main"><span class="rb-eyebrow">${ICN.crown} Monthly Race</span><div class="rb-prize">${UI.money(monthlyPool)}</div><div class="rb-sub">Prize pool shared across the Top 10</div></div>
            <div class="rb-timer"><span class="rb-timer-label">Ends in</span><b class="rb-clock mono" data-cd="${endMonthly}">—</b></div>
          </div>
          <div class="table-card" style="margin-top:14px"><table><thead><tr><th>#</th><th>Player</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>
            ${race.map((r,i)=>{ const you=i===0; const guestYou=you&&!u.loggedIn;
              return `<tr${you?' class="me-row"':''}><td class="mono">${i+1}</td><td>${UI.esc(you?(u.loggedIn?(u.username||"You"):"You"):r[0])}${you?(guestYou?' <span class="badge out">sign in</span>':' <span class="badge">you</span>'):''}</td><td class="mono">${guestYou?"—":UI.money(you?st.wagered:r[1])}</td><td class="mono">${UI.money(prizes[i])}</td></tr>`;}).join("")}
          </tbody></table></div>
        </section>

        <section class="panel card-b reward-panel" style="height:608px">
          <div class="reward-banner flat">
            <div class="rb-bg"></div>
            <div class="rb-main"><span class="rb-eyebrow">${ICN.ticket} Raffle</span><div class="rb-prize">${UI.money(raffleItem.value)}</div><div class="rb-sub">This week's prize · ${UI.esc(raffleItem.name)}</div></div>
            <div class="rb-timer"><span class="rb-timer-label">Resets in</span><b class="rb-clock mono" data-cd="${endWeekly}">—</b></div>
          </div>
          <p class="muted" style="font-size:12.5px;margin:14px 0 10px">Earn 1 ticket per $25 wagered, or buy at <b class="mono">$5</b> / ticket. ${u.loggedIn?`You hold <b class="mono">${State.d.raffle.toLocaleString()}</b> tickets.`:`<b>Sign in</b> to collect &amp; buy tickets.`}</p>
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:14px">${[1,5,10,25].map(n=>`<button class="btn" data-action="buyRaffle" data-n="${n}">${n} · ${UI.money0(n*5)}</button>`).join("")}<input class="input mono" id="rf-custom" placeholder="Custom qty" style="max-width:118px"><button class="btn" id="rf-buy" disabled>Buy</button></div>
          <div class="sub" style="margin-bottom:6px">Previous winners</div>
          <div class="table-card"><table><thead><tr><th>Player</th><th>Tickets</th><th style="text-align:right">Prize</th></tr></thead><tbody>${[["Nova",4120,600],["Sable",3380,420],["Kato",2910,300],["Juno",1750,220],["Pax",1320,150],["Echo",980,120],["Wren",640,95]].map(([n,t,v])=>`<tr><td>${n}</td><td class="mono">${t.toLocaleString()}</td><td class="mono" style="text-align:right">${UI.money(v)}</td></tr>`).join("")}</tbody></table></div>
        </section>
      </div>

      <!-- 2 · WEEKLY CHALLENGE + 4 · PROMO CODE (one row) -->
      <div class="grid g2" style="gap:18px;align-items:start;margin-top:22px">
        <section class="panel card-b reward-panel">
          <div class="reward-banner flat">
            <div class="rb-bg"></div>
            <div class="rb-main"><span class="rb-eyebrow">${ICN.bolt} Weekly Challenge</span><div class="rb-prize" style="font-size:23px">Complete all 3</div><div class="rb-sub">${[0,1,2].filter(i=>State.d.claimedChallenges.includes(i)).length}/3 challenges claimed</div></div>
            <div class="rb-timer"><span class="rb-timer-label">Resets in</span><b class="rb-clock mono" data-cd="${endWeekly}">—</b></div>
          </div>
          <div class="prize-row ${allDone?"unlocked":""}" style="margin-top:14px">
            ${UI.ph(weekPrizeCase.name,"case").replace('aspect-ratio:4 / 3','width:104px;height:78px;flex:0 0 104px')}
            <div style="flex:1"><div class="sub">This week's prize</div><b style="font-size:15px">${UI.esc(weekPrizeCase.name)}</b><div class="mono sub">${UI.money(DATA.caseValue(weekPrizeCase))} avg</div>
              <div style="margin-top:6px">${State.d.weekPrizeClaimed?`<span class="badge solid">Prize claimed ✓</span>`:allDone?`<span class="badge solid">Unlocked — claim a challenge to receive</span>`:`<span class="badge out">Locked · complete all 3 challenges</span>`}</div></div>
          </div>
          <div class="stack" style="gap:10px;margin-top:12px">
            ${challenges.map(([t,d],i)=>{ const claimed=State.d.claimedChallenges.includes(i); const done=Views.challengeDone(i);
              return `<div class="row between ch-row"><div class="row" style="gap:10px"><span class="rk-check ${done||claimed?"on":""}">${done||claimed?"✓":""}</span><div><b style="font-size:13px">${t}</b><div class="muted" style="font-size:12px">${d}</div></div></div>${claimed?`<span class="badge solid">Claimed ✓</span>`:`<button class="btn sm ${done?"primary":""}" data-action="claimChallenge" data-i="${i}" ${done?"":"disabled"}>Claim</button>`}</div>`;}).join("")}
          </div>
        </section>

        <div class="panel card-b"><h3 class="h2" style="margin-top:0">Promo code</h3>
          <p class="muted" style="font-size:12.5px;margin:0 0 12px">Have a code from a stream, drop or partner? Redeem it here to reveal your reward — an item, a case or balance — then claim it.</p>
          <div class="row"><input class="input" id="promo" placeholder="Enter promo code" style="max-width:240px"><button class="btn primary" id="promo-go">Redeem</button></div>
          <div id="promo-reward" style="margin-top:14px"></div></div>
      </div>

      <!-- 5 · FREE CASES BY LEVEL -->
      <section class="sec">
        <div class="sec-head"><h2 class="h2">Free cases by level</h2><span class="sub">Level ${lvl} · ${curXP.toLocaleString()} XP · earned by opening cases &amp; battles</span></div>
        <div class="grid g4">${levelWindow.map(lvCard).join("")}</div>
      </section>

      <!-- 6 · RANKING SYSTEM -->
      <section class="sec rank-sys">
        <div class="sec-head"><div class="row" style="gap:10px;align-items:center">${ICN.crown}<h2 class="h2" style="margin:0">Ranking System</h2><span class="badge out">VIP</span></div>
          <div class="row" style="gap:8px"><button class="icon-btn" id="rank-prev" title="Previous">${ICN.back}</button><button class="icon-btn" id="rank-next" title="Next" style="transform:scaleX(-1)">${ICN.back}</button></div></div>
        <div class="rank-track" id="rank-track">${ranks.map(rankCard).join("")}</div>
        <p class="rank-note muted">VIP ranks are a separate track from your <b>Level</b>. Your Level rises automatically as you open cases and play battles, and unlocks a free case at each level. <b>VIP ranks</b> (Bronze → Diamond) are earned by reaching XP thresholds together with wagering volumes &amp; tasks — e.g. <b>VIP Bronze = Level 20 / ~20,000 XP</b>, Silver = Level 40, and so on up to Diamond. Your current VIP tier is shown on your <a href="#/profile">Profile</a> as <b>VIP · ${u.loggedIn?UI.esc(u.vip):"Bronze"}</b>, next to your level.</p>
      </section>

      <!-- 7 · FAQ -->
      <section class="sec"><h2 class="h2">Frequently Asked Questions</h2>${Views.faqHTML(DATA.FAQ.slice(0,6))}</section>`);

    Views.bindAccordion();
    Views.startCountdown();
    // ranking carousel
    const track = this.q("#rank-track");
    if (track) { this.q("#rank-prev").addEventListener("click", () => track.scrollBy({ left: -320, behavior: "smooth" }));
      this.q("#rank-next").addEventListener("click", () => track.scrollBy({ left: 320, behavior: "smooth" }));
      const cur = track.querySelector(".rank-card.current"); if (cur) track.scrollLeft = Math.max(0, cur.offsetLeft - 12); }   // horizontal only — never scroll the page
    // raffle custom qty
    const rfIn = this.q("#rf-custom"), rfBuy = this.q("#rf-buy");
    rfIn.addEventListener("input", () => { const n = parseInt(rfIn.value, 10); const ok = n > 0; rfBuy.disabled = !ok; rfBuy.textContent = ok ? "Buy · " + UI.money0(n * 5) : "Buy"; });
    rfBuy.addEventListener("click", () => { const n = parseInt(rfIn.value, 10); if (n > 0) Views.buyRaffle(n); });
    // promo flow
    let promoOpen = false;
    const out = this.q("#promo-reward");
    this.q("#promo-go").addEventListener("click", () => {
      if (!UI.requireAuth()) return;
      const code = (this.q("#promo").value || "").trim(); if (!code) { UI.toast("Enter a code first"); return; }
      if (promoOpen) return; promoOpen = true;
      // deterministic-ish reward by code
      const h = [...code].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); const kind = h % 3;
      let label, claimFn;
      if (kind === 0) { const amt = 25 + (h % 76); label = `<b style="font-size:16px">${UI.money(amt)}</b> balance`; claimFn = () => { State.credit(amt, "Promo " + code.toUpperCase()); UI.updateChrome(); }; }
      else if (kind === 1) { const it = DATA.ITEMS[h % DATA.ITEMS.length]; label = `${UI.tierTag(it.tier)} <b>${UI.esc(it.name)}</b> · ${UI.money(it.value)}`; claimFn = () => State.addToCart(it.id); }
      else { const c = DATA.CASES[1 + h % (DATA.CASES.length - 1)]; const it = DATA.item(DATA.pick(c)); label = `<b>${UI.esc(c.name)}</b> case · ${UI.esc(it.name)} inside`; claimFn = () => { State.addToCart(it.id); State.d.stats.opened++; }; }
      out.innerHTML = `<div class="promo-rw"><div class="row" style="gap:10px;align-items:center">${UI.ph("","mini").replace('class="ph mini"','class="ph mini" style="width:34px;height:34px"')}<div><div class="sub">Reward for ${UI.esc(code.toUpperCase())}</div><div>${label}</div></div></div><button class="btn primary" id="promo-claim">Claim</button></div>`;
      this.q("#promo-claim").addEventListener("click", () => { claimFn(); State.d.promosUsed.push(code.toUpperCase()); State.save(); UI.updateChrome();
        out.innerHTML = `<div class="note">Reward received — added to your account.</div>`; this.q("#promo").value = ""; promoOpen = false; UI.toast("Promo reward claimed", null, "win"); });
    });
    // guest intro popup — shown once per session, page is browsable behind it
    if (!u.loggedIn && !Views._rewardsIntroSeen) { Views._rewardsIntroSeen = true; UI.openRewardsIntro(); }
  },
  claimDaily() { if (!UI.requireAuth()) return; const it = DATA.item(DATA.pick(DATA.caseById("daily"))); State.addToCart(it.id); State.d.claimedDaily=true; State.d.stats.opened++; State.d.stats.won++; State.save(); UI.updateChrome(); UI.toast("Free case opened!", it.name+" added to your cart", "win"); Router.resolve(); },
  claimMilestone(lv,cid) { if (!UI.requireAuth()) return; if (State.d.claimedMilestones.includes(+lv)) return; const it=DATA.item(DATA.pick(DATA.caseById(cid))); State.addToCart(it.id); State.d.claimedMilestones.push(+lv); State.d.stats.opened++; State.d.stats.won++; State.save(); UI.updateChrome(); UI.toast("Level reward claimed!", it.name+" added to cart", "win"); Router.resolve(); },
  buyRaffle(n) { if (!UI.requireAuth()) return; const cost=n*5; if (State.d.user.balance<cost) { UI.toast("Insufficient balance"); UI.openDeposit(); return; } State.debit(cost,"Raffle tickets"); State.d.raffle+=n; State.save(); UI.updateChrome(); UI.toast("Bought "+n+" raffle ticket"+(n>1?"s":"")); Router.resolve(); },
  applyPromo() { if (!UI.requireAuth()) return; const code=(this.q("#promo").value||"").trim().toUpperCase(); const codes={CROWNS:50,WELCOME:25}; if (!codes[code]) { UI.toast("Invalid code", code||"—"); return; } if (State.d.promosUsed.includes(code)) { UI.toast("Already used", code); return; } State.credit(codes[code],"Promo "+code); State.d.promosUsed.push(code); State.save(); UI.updateChrome(); UI.toast("Promo applied","+"+UI.money(codes[code]),"win"); },
  claimChallenge(i) { if (!UI.requireAuth()) return; i=+i; if (State.d.claimedChallenges.includes(i)) return; if (!Views.challengeDone(i)) { UI.toast("Not completed yet", "Finish the challenge to claim"); return; }
    if (i===1) { State.d.raffle+=2; UI.toast("Challenge claimed","+2 raffle tickets","win"); } else { const it=DATA.item(DATA.pick(DATA.caseById(i===2?"street":"starter"))); State.addToCart(it.id); UI.toast("Challenge claimed",it.name+" added to cart","win"); }
    State.d.claimedChallenges.push(i);
    if ([0,1,2].every(k=>State.d.claimedChallenges.includes(k)) && !State.d.weekPrizeClaimed) { const c=DATA.caseById("hype"); const it=DATA.item(DATA.pick(c)); State.addToCart(it.id); State.d.weekPrizeClaimed=true; State.d.stats.opened++; State.d.stats.won++; UI.toast("Week's prize unlocked!", c.name+" → "+it.name+" added to cart", "win"); }
    State.save(); UI.updateChrome(); Router.resolve(); },

  /* ===================== AFFILIATES ===================== */
  affiliates() {
    const a = State.d.affiliate; const loggedIn = State.d.user.loggedIn;
    const dash = loggedIn && a.code
      ? `<div class="field"><label>Your code</label><input class="input mono" readonly value="${UI.esc(a.code)}"></div>
         <div class="field"><label>Referral link <span class="hint">share with your audience</span></label><input class="input mono" readonly value="crowns.gg/r/${UI.esc(a.code)}"></div>
         <div class="field"><label>Promo code <span class="hint">your viewers enter at signup for a bonus</span></label><input class="input mono" readonly value="${UI.esc(a.code.toUpperCase())}"></div>
         <div class="grid g3" style="margin:6px 0 14px"><div class="stat"><div class="k">Clicks</div><div class="v">${a.clicks}</div></div><div class="stat"><div class="k">Signups</div><div class="v">${a.signups}</div></div><div class="stat"><div class="k">Commission</div><div class="v">${UI.money(a.commission)}</div></div></div>
         <div class="sub" style="margin-bottom:6px">Code performance</div>
         <div class="table-card"><table><thead><tr><th>Period</th><th>Signups</th><th>Commission</th></tr></thead><tbody>${[["7d",3,Math.round(a.commission*.2)],["30d",a.signups,a.commission],["Lifetime",a.signups,a.commission]].map(r=>`<tr><td>${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${UI.money(r[2])}</td></tr>`).join("")}</tbody></table></div>
         <button class="btn block" style="margin-top:12px" data-action="affPayout">Request payout → Wallet</button>`
      : loggedIn
        ? `<p class="muted" style="font-size:13px">You don't have a referral code yet. Create one to start tracking referrals, commission &amp; payouts.</p><button class="btn primary" data-action="createAff">Create referral code</button>`
        : `<div class="field"><label>Referral link <span class="hint">example</span></label><input class="input mono" readonly value="crowns.gg/r/yourname" disabled></div>
           <div class="grid g3" style="margin:6px 0 14px"><div class="stat"><div class="k">Clicks</div><div class="v">—</div></div><div class="stat"><div class="k">Signups</div><div class="v">—</div></div><div class="stat"><div class="k">Commission</div><div class="v">—</div></div></div>
           <div class="note" style="margin-bottom:12px">Earn up to <b>15%</b> revenue share on every referred player's wager, paid to your balance on demand. Built for streamers &amp; content creators.</div>
           <button class="btn primary block" data-action="auth" data-mode="signup">Sign up to start earning</button>
           <button class="btn ghost block" style="margin-top:8px" data-action="auth" data-mode="signin">Sign in</button>`;
    this.set(`
      <div class="page-head"><h1>Affiliates</h1><p>Built for streamers. Create a code and track referrals, commission &amp; payouts.</p></div>
      <div class="grid g2" style="gap:24px;align-items:start">
        <div class="panel card-b"><h3 class="h2">How it works</h3><div class="steps stack">${[["Create your code","Pick a unique referral code"],["Share your link","Streamers post it to their audience"],["They sign up","Referrals link to your account"],["Earn commission","A share of their wager comes back to you"]].map(([t,d])=>`<div class="step"><span class="n">•</span><div><b>${t}</b><div class="muted" style="font-size:12.5px">${d}</div></div></div>`).join("")}</div>
          <div class="note" style="margin-top:14px">Revenue share up to <b>15%</b> · weekly payouts to balance · dedicated support for partners.</div></div>
        <div class="panel card-b"><h3 class="h2">${loggedIn && a.code ? "Your dashboard" : "Partner dashboard"}</h3>${dash}</div>
      </div>`);
  },
  createAff() { if (!UI.requireAuth()) return; const code=(State.d.user.username||"ref").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,8)+Math.floor(Math.random()*90+10); State.d.affiliate={code,clicks:128+Math.floor(Math.random()*400),signups:9+Math.floor(Math.random()*40),commission:+(Math.random()*420).toFixed(2)}; State.save(); UI.toast("Code created",code,"win"); Router.resolve(); },
  affPayout() { const a=State.d.affiliate; if (a.commission<=0) { UI.toast("Nothing to pay out"); return; } State.credit(a.commission,"Affiliate payout"); a.commission=0; State.save(); UI.updateChrome(); UI.toast("Payout added to balance","win"); Router.resolve(); },

  /* ===================== CART ===================== */
  cart() { if (!UI.requireAuth()) return this.home(); const cart = State.d.cart;
    const total = cart.reduce((s, i) => s + i.value, 0);
    this.set(`
      <div class="page-head row between"><div><h1>Cart</h1><p>${cart.length} item(s) · ${UI.money(total)} — your won items land here. List them for sale, order delivery, or set them aside in your inventory.</p></div><a class="btn" href="#/inventory">Inventory →</a></div>
      ${cart.length ? `
        <div class="grid g2" style="gap:24px;align-items:start">
          <div class="grid g3">${cart.map(it => UI.itemCardHTML(it, `<div class="btn-group"><button class="btn sm" data-action="cartToInvOne" data-uid="${it.uid}">To Inventory</button><button class="btn sm primary" data-action="cartSellOne" data-uid="${it.uid}">Sell to Market</button></div>`)).join("")}</div>
          <div class="panel card-b">
            <h3 class="h2">Summary</h3>
            <div class="row between" style="padding:6px 0"><span class="sub">Items</span><b class="mono">${cart.length}</b></div>
            <div class="row between" style="padding:6px 0;border-bottom:1px solid var(--border-soft)"><span class="sub">Total value</span><b class="mono">${UI.money(total)}</b></div>
            <button class="btn primary block" style="margin-top:14px" data-action="cartDeliverAll">To Delivery (${cart.length})</button>
            <button class="btn block" style="margin-top:8px" data-action="cartSellAll">Sell all to Market</button>
            <button class="btn block" style="margin-top:8px" data-action="cartToInv">Send all to Inventory</button>
            <div class="note" style="margin-top:12px">Delivery submits a fulfilment ticket — the Crowns team ships the items. Sell lists them on the marketplace. Set aside to hold in your inventory.</div>
          </div>
        </div>` : `<div class="empty">Your cart is empty.<br>Open a <a href="#/cases">case</a>, play a <a href="#/battles">battle</a> or <a href="#/upgrade">upgrade</a> — winnings land here. Or add items from your <a href="#/inventory">inventory</a>.</div>`}`);
  },
  cartSellOne(uid) { const it=State.d.cart.find(x=>x.uid===uid); if (!it) return;
    UI.confirm("List on marketplace", `Really list <b>${UI.esc(it.name)}</b> for sale on the marketplace?`, () => { Views._listFromCart([uid]); }); },
  cartSellAll() { if (!State.d.cart.length) return; const n=State.d.cart.length;
    UI.confirm("List on marketplace", `List ${n} item${n>1?"s":""} on the marketplace?`, () => { Views._listFromCart(State.d.cart.map(x=>x.uid)); }); },
  _listFromCart(uids) { uids.forEach(uid=>{ const it=State.d.cart.find(x=>x.uid===uid); if(!it) return; State.d.cart=State.d.cart.filter(x=>x.uid!==uid);
      State.d.listings.unshift({ lid:"my"+it.uid, id:it.id, name:it.name, value:it.value, tier:it.tier, type:DATA.ITEM_TYPE[it.id]||"Other", rarity:DATA.RARITY[it.tier], drop:DATA.DROP[it.tier], price:it.value, owner:State.d.user.username, yours:true }); });
    State.save(); UI.updateChrome(); Views._mkTab="onsale"; UI.toast("Listed for sale", uids.length+" item(s) now on the marketplace","win"); Router.resolve(); },
  cartToInvOne(uid) { const it=State.d.cart.find(x=>x.uid===uid); if (!it) return; State.d.cart=State.d.cart.filter(x=>x.uid!==uid); State.d.inv.unshift({ uid:it.uid, id:it.id, name:it.name, value:it.value, tier:it.tier }); State.save(); UI.updateChrome(); UI.toast("Moved to inventory",it.name); Router.resolve(); },
  cartDeliverAll() { if (!State.d.cart.length) return; Views.submitTicket(); },

  /* ===================== MARKETPLACE ===================== */
  marketplace() {
    const u = State.d.user;
    const tab = u.loggedIn ? (Views._mkTab || "browse") : "browse";
    Views._mkF = Views._mkF || { q:"", type:"all", price:"all", rarity:"all", sort:"phigh" };
    const F = Views._mkF;
    this.set(`
      <div class="page-head"><h1>Marketplace</h1><p>Buy items listed by other players. Add them to your buy-cart and confirm — purchases go to your inventory. To sell or ship your own items, use your <a href="#/cart">cart</a>.</p></div>
      <div class="tabs" id="mk-tabs" style="margin-bottom:16px">
        <div class="tab ${tab==="browse"?"active":""}" data-mktab="browse">Browse catalog</div>
        ${u.loggedIn?`<div class="tab ${tab==="onsale"?"active":""}" data-mktab="onsale">On sale (${State.d.listings.length})</div>`:""}
        ${u.loggedIn?`<div class="tab ${tab==="tickets"?"active":""}" data-mktab="tickets">Tickets (${State.d.tickets.length})</div>`:""}
      </div>
      <div class="mk-layout">
        <div id="mk-main"></div>
        <aside class="mk-cart" id="mk-cart"></aside>
      </div>`);

    const filtersHTML = `<div class="mk-filters">
        <input class="input" id="mk-q" placeholder="Search items…" style="max-width:190px" value="${UI.esc(F.q)}">
        <select class="input" id="mk-type" style="max-width:135px"><option value="all">All types</option>${["Apparel","Accessory","Tech"].map(t=>`<option ${F.type===t?"selected":""}>${t}</option>`).join("")}</select>
        <select class="input" id="mk-price" style="max-width:140px">${[["all","Any price"],["lt50","Under $50"],["50-300","$50–$300"],["300-1000","$300–$1000"],["gt1000","$1000+"]].map(([v,t])=>`<option value="${v}" ${F.price===v?"selected":""}>${t}</option>`).join("")}</select>
        <div class="chips" id="mk-rarity">${[["all","All"],["1","Common"],["2","Uncommon"],["3","Rare"],["4","Legendary"]].map(([v,t])=>`<div class="chip ${F.rarity===v?"active":""}" data-rar="${v}">${t}</div>`).join("")}</div>
        <select class="input" id="mk-sort" style="max-width:150px">${[["phigh","Price ↓"],["plow","Price ↑"],["vhigh","Value ↓"],["drop","Best odds"]].map(([v,t])=>`<option value="${v}" ${F.sort===v?"selected":""}>${t}</option>`).join("")}</select>
      </div>`;
    const cardHTML = (L) => { const inBuy = State.d.buyCart.some(b=>b.lid===L.lid);
      return `<div class="mk-card item-card tier-${L.tier} t${L.tier}">
        <div class="mk-thumb">${UI.ph(L.name,"item")}<div class="mk-overlay">${L.yours
          ? `<span class="badge solid">Your listing</span>`
          : inBuy ? `<button class="btn sm" data-action="buyCartRemove" data-uid="${L.lid}">In cart ✓</button>`
          : `<button class="btn primary sm" data-action="addBuyCart" data-lid="${L.lid}">Buy · ${UI.money0(L.price)}</button>`}</div></div>
        <div class="nm" style="font-size:12px">${UI.esc(L.name)}</div>
        <div class="item-meta"><span class="vl mono" style="font-size:11.5px">${UI.money0(L.price)}</span>${UI.tierTag(L.tier)}</div>
        <div class="mk-meta2"><span class="sub" title="Rarity · drop chance">${L.rarity} · ${L.drop}%</span><span class="mk-owner">${L.yours?`<b>you</b>`:`by <a data-action="showcase" data-name="${UI.esc(L.owner)}">${UI.esc(L.owner)}</a>`}</span></div>
      </div>`; };
    const applyF = (list) => { const q=F.q.toLowerCase(); let r = list.filter(L=>L.name.toLowerCase().includes(q));
      if (F.type!=="all") r=r.filter(L=>L.type===F.type);
      if (F.rarity!=="all") r=r.filter(L=>String(L.tier)===F.rarity);
      if (F.price==="lt50") r=r.filter(L=>L.price<50); else if (F.price==="50-300") r=r.filter(L=>L.price>=50&&L.price<=300); else if (F.price==="300-1000") r=r.filter(L=>L.price>300&&L.price<=1000); else if (F.price==="gt1000") r=r.filter(L=>L.price>1000);
      r=r.slice(); if (F.sort==="phigh") r.sort((a,b)=>b.price-a.price); else if (F.sort==="plow") r.sort((a,b)=>a.price-b.price); else if (F.sort==="vhigh") r.sort((a,b)=>b.value-a.value); else if (F.sort==="drop") r.sort((a,b)=>a.drop-b.drop);
      return r; };
    const drawGrid = () => { const list = applyF(DATA.MARKET.concat(State.d.listings));
      this.q("#mk-grid").innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty" style="grid-column:1/-1">No items match these filters.</div>`; };
    const bindFilters = () => {
      this.q("#mk-q").addEventListener("input", e=>{ F.q=e.target.value; drawGrid(); });
      this.q("#mk-type").addEventListener("change", e=>{ F.type=e.target.value; drawGrid(); });
      this.q("#mk-price").addEventListener("change", e=>{ F.price=e.target.value; drawGrid(); });
      this.q("#mk-sort").addEventListener("change", e=>{ F.sort=e.target.value; drawGrid(); });
      this.qa("#mk-rarity [data-rar]").forEach(c=>c.addEventListener("click",()=>{ this.qa("#mk-rarity [data-rar]").forEach(x=>x.classList.remove("active")); c.classList.add("active"); F.rarity=c.dataset.rar; drawGrid(); }));
    };
    const setLayout = (full) => { this.q(".mk-layout").classList.toggle("full", full); this.q("#mk-cart").style.display = full ? "none" : ""; };
    const renderBrowse = () => { setLayout(false); renderBuyCart(); this.q("#mk-main").innerHTML = `<div class="mk-headrow"><h3 class="h2" style="margin:0">Browse catalog</h3><span class="sub">${DATA.MARKET.length+State.d.listings.length} public listings from players</span></div>${filtersHTML}<div class="mk-grid" id="mk-grid"></div>`; bindFilters(); drawGrid(); };
    const renderOnSale = () => { setLayout(true); const list=State.d.listings;
      this.q("#mk-main").innerHTML = `<div class="mk-headrow"><h3 class="h2" style="margin:0">On sale</h3><span class="badge">your listings</span></div>
        ${list.length ? `<p class="sub" style="margin:0 0 12px">Your items currently listed on the marketplace — visible in Browse for other players to buy.</p><div class="mk-grid">${list.map(L=>`<div class="mk-card item-card tier-${L.tier} t${L.tier}"><div class="mk-thumb">${UI.ph(L.name,"item")}<span class="mk-badge">Listed</span></div><div class="nm" style="font-size:12px">${UI.esc(L.name)}</div><div class="item-meta"><span class="vl mono" style="font-size:11.5px">${UI.money0(L.price)}</span>${UI.tierTag(L.tier)}</div><div class="mk-meta2"><span class="sub">${L.rarity} · ${L.drop}%</span><button class="mk-unlist" data-action="unlist" data-lid="${L.lid}">Unlist</button></div></div>`).join("")}</div>`
        : `<div class="empty">You haven't listed any items for sale yet.<br><a class="btn primary" href="#/inventory" style="margin-top:14px;display:inline-flex">Go to inventory</a></div>`}`; };
    const renderTickets = () => { setLayout(true); const steps=["pending","processing","shipped"];
      const itemRow = (i)=>`<div class="row between" style="padding:4px 0;border-bottom:1px solid var(--border-soft)"><span>${UI.tierTag(i.tier)} ${UI.esc(i.name)}</span><span class="mono sub">${UI.money0(i.price??i.value)}</span></div>`;
      this.q("#mk-main").innerHTML = `<div class="mk-headrow"><h3 class="h2" style="margin:0">Delivery tickets</h3><span class="sub">${State.d.tickets.length} total</span></div>
        <div class="mk-filters"><input class="input" id="tk-q" placeholder="Search tickets…" style="max-width:200px"><select class="input" id="tk-status" style="max-width:170px"><option value="all">All statuses</option>${steps.map(s=>`<option value="${s}">${s}</option>`).join("")}</select></div>
        <div id="tk-list"></div>`;
      const draw=()=>{ const q=(this.q("#tk-q").value||"").toLowerCase(); const stf=this.q("#tk-status").value;
        const list=State.d.tickets.filter(t=>(t.id.toLowerCase().includes(q)||t.items.some(i=>i.name.toLowerCase().includes(q)))&&(stf==="all"||t.status===stf));
        this.q("#tk-list").innerHTML = list.length ? list.map(t=>`<div class="panel card-b" style="margin-bottom:12px">
          <div class="row between"><b class="mono">${t.id}</b><span class="badge ${t.status==="shipped"?"solid":""}">${t.status}</span></div>
          <div class="tk-steps" style="margin:10px 0">${steps.map(s=>{const ix=steps.indexOf(t.status);const si=steps.indexOf(s);return `<span class="tk-step ${si<=ix?"on":""}">${s}</span>`;}).join('<span class="tk-arr">→</span>')}</div>
          <div class="grid g2" style="gap:16px;align-items:start">
            <div class="tk-itemwrap"><div class="sub" style="margin-bottom:6px">Items (${t.items.length}) · ${UI.money0(t.items.reduce((s,i)=>s+(i.price??i.value),0))}</div>${t.items.slice(0,3).map(itemRow).join("")}${t.items.length>3?`<details class="tk-more"><summary><span class="more-off">Show more (${t.items.length-3})</span><span class="more-on">Show less</span></summary>${t.items.slice(3).map(itemRow).join("")}</details>`:""}</div>
            <div><div class="sub" style="margin-bottom:6px">Delivery</div><div class="note"><b>${UI.esc(t.name||u.username||"")}</b><br>${UI.esc(t.addr||"—")}</div><div class="sub" style="margin-top:8px">Est. arrival 7–14 days · tracked once shipped</div></div>
          </div></div>`).join("") : `<div class="empty">No tickets match.</div>`; };
      this.q("#tk-q").addEventListener("input",draw); this.q("#tk-status").addEventListener("change",draw); draw();
    };
    const renderBuyCart = () => { const bc=State.d.buyCart; const total=bc.reduce((s,i)=>s+i.price,0);
      this.q("#mk-cart").innerHTML = `
        <div class="row between"><h3 class="h2" style="margin:0">Buy cart (${bc.length})</h3></div>
        <div class="mk-cart-items">${bc.length ? bc.map(it=>`<div class="mk-citem"><span class="mk-cthumb">${UI.ph("","mini")}</span><div style="flex:1;min-width:0"><div class="nm" style="font-size:12px">${UI.esc(it.name)}</div><div class="mono sub">${UI.money0(it.price)}</div></div><button class="mk-x" data-action="buyCartRemove" data-uid="${it.uid}" title="Remove">✕</button></div>`).join("") : `<div class="muted" style="font-size:13px;padding:16px 0">No items selected.<br>Tap <b>Buy</b> on a listing to add it here.</div>`}</div>
        ${bc.length?`<div class="row between" style="font-weight:600;padding:9px 0;border-top:1px solid var(--border-soft)"><span>Total</span><span class="mono">${UI.money0(total)}</span></div>
          <button class="btn primary block" data-action="buyCartConfirm">Buy all (${bc.length}) · ${UI.money0(total)}</button>
          <div class="note" style="margin-top:10px">Confirm to pay from your balance — purchased items go to your inventory. From there, add them to your cart to sell or order delivery.</div>`:""}`;
    };

    this.qa("#mk-tabs .tab").forEach(t=>t.addEventListener("click",()=>{ const k=t.dataset.mktab;
      if ((k==="onsale"||k==="tickets") && !u.loggedIn) { UI.openAuthGate(k==="onsale"?"view your listings":"view your delivery tickets"); return; }
      Object.assign(F, { q:"", type:"all", price:"all", rarity:"all", sort:"phigh" });   // fresh filters per tab
      Views._mkTab=k; this.qa("#mk-tabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active");
      if (k==="browse") renderBrowse(); else if (k==="onsale") renderOnSale(); else renderTickets(); }));

    if (tab==="browse") renderBrowse(); else if (tab==="onsale") renderOnSale(); else renderTickets();
  },
  addBuyCart(lid) { if (!UI.requireAuth()) return; if (State.d.buyCart.some(b=>b.lid===lid)) return;
    const L=DATA.marketById(lid)||State.d.listings.find(x=>x.lid===lid); if (!L || L.yours) return;
    State.d.buyCart.unshift({ uid:State.id(), lid:L.lid, id:L.id, name:L.name, value:L.value, tier:L.tier, price:L.price, owner:L.owner });
    State.save(); UI.toast("Added to buy-cart", L.name); Router.resolve(); },
  buyCartRemove(key) { State.d.buyCart=State.d.buyCart.filter(b=>b.uid!==key && b.lid!==key); State.save(); Router.resolve(); },
  buyCartConfirm() { if (!UI.requireAuth()) return; const bc=State.d.buyCart; if (!bc.length) return;
    const total=bc.reduce((s,i)=>s+i.price,0);
    if (State.d.user.balance < total) { UI.toast("Insufficient balance", UI.money0(total)+" needed"); UI.openDeposit(); return; }
    UI.confirm("Confirm purchase", `Buy ${bc.length} item${bc.length>1?"s":""} for <b>${UI.money0(total)}</b> from your balance?`, () => {
      State.debit(total, "Marketplace purchase ("+bc.length+")"); bc.forEach(b=>State.addItem(b.id)); State.d.buyCart=[]; State.save(); UI.updateChrome();
      UI.toast("Purchased!", bc.length+" item(s) added to your inventory","win"); location.hash="#/inventory"; Router.resolve(); }); },
  unlist(lid) { const i=State.d.listings.findIndex(x=>x.lid===lid); if (i<0) return; const L=State.d.listings[i]; State.d.listings.splice(i,1);
    State.d.inv.unshift({ uid:State.id(), id:L.id, name:L.name, value:L.value, tier:L.tier }); State.save(); UI.updateChrome(); UI.toast("Unlisted", L.name+" returned to inventory"); Router.resolve(); },
  cartToInv() { if (!State.d.cart.length) return; State.d.cart.forEach(it=>State.d.inv.unshift({ uid:it.uid, id:it.id, name:it.name, value:it.value, tier:it.tier })); State.d.cart=[]; State.save(); UI.updateChrome(); UI.toast("Moved to inventory"); Router.resolve(); },
  toCart(uid) { if (!UI.requireAuth()) return; const it=State.d.inv.find(x=>x.uid===uid); if (!it) return; State.removeInv(uid); State.d.cart.push(it); State.save(); UI.updateChrome(); UI.toast("Added to cart",it.name); Router.resolve(); },
  fromCart(uid) { const it=State.d.cart.find(x=>x.uid===uid); if (!it) return; State.d.cart=State.d.cart.filter(x=>x.uid!==uid); State.d.inv.unshift({ uid:it.uid, id:it.id, name:it.name, value:it.value, tier:it.tier }); State.save(); UI.updateChrome(); Router.resolve(); },
  submitTicket() { if (!State.d.cart.length) return; UI.openModal(`
      <div class="modal-head"><h3>Shipping ticket</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body"><div class="field"><label>Full name</label><input class="input" id="tk-name" value="${UI.esc(State.d.user.username||"")}"></div>
        <div class="field"><label>Shipping address</label><textarea class="input" id="tk-addr" rows="3" placeholder="Street, city, ZIP, country"></textarea></div>
        <div class="note">${State.d.cart.length} item(s) · ${UI.money(State.d.cart.reduce((s,i)=>s+i.value,0))} will be requested for physical shipment.</div></div>
      <div class="modal-foot"><button class="btn ghost" data-action="closeModal">Cancel</button><button class="btn primary" data-action="confirmTicket">Submit ticket</button></div>`); },
  confirmTicket() { const name=(UI.el("tk-name").value||"").trim(); const addr=(UI.el("tk-addr").value||"").trim(); if (!name||!addr) { UI.toast("Missing details","Name and address required"); return; }
    const t={ id:"TKT-"+(1000+State.d.tickets.length+1), items:State.d.cart.slice(), status:"pending", addr, name }; State.d.tickets.unshift(t); State.d.cart=[]; State.save(); UI.closeModal(); UI.updateChrome(); Views._mkTab="tickets"; UI.toast("Ticket submitted",t.id+" · pending","win"); location.hash="#/marketplace"; Router.resolve();
    const adv=(s)=>{ const tk=State.d.tickets.find(x=>x.id===t.id); if (!tk) return; tk.status=s; State.save(); if ((location.hash||"").includes("marketplace")) Router.resolve(); };
    setTimeout(()=>adv("processing"),3000); setTimeout(()=>{ adv("shipped"); UI.toast("Ticket "+t.id,"Marked shipped"); },7000); },

  /* ===================== WALLET ===================== */
  wallet() { if (!UI.requireAuth()) return this.home(); const u=State.d.user;
    this.set(`
      <div class="page-head"><h1>Wallet</h1><p>Deposit, view history, and withdraw (routes to the marketplace).</p></div>
      <div class="grid g3" style="margin-bottom:22px"><div class="stat"><div class="k">Balance</div><div class="v">${UI.money(u.balance)}</div></div><div class="stat"><div class="k">Total wagered</div><div class="v">${UI.money(State.d.stats.wagered)}</div></div><div class="stat"><div class="k">Inventory value</div><div class="v">${UI.money(State.d.inv.reduce((s,i)=>s+i.value,0))}</div></div></div>
      <div class="row" style="margin-bottom:22px"><button class="btn primary" data-action="deposit">Deposit</button><a class="btn" href="#/marketplace">Withdraw → Marketplace</a></div>
      <h3 class="h2">Transaction history</h3>
      ${State.d.tx.length ? `<div class="table-card"><table><thead><tr><th>When</th><th>Type</th><th>Note</th><th style="text-align:right">Amount</th></tr></thead><tbody>${State.d.tx.slice(0,40).map(t=>`<tr><td class="muted mono">${new Date(t.ts).toLocaleTimeString()}</td><td>${t.type}</td><td>${UI.esc(t.note)}</td><td class="mono" style="text-align:right">${t.amount>=0?"+":""}${UI.money(t.amount)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No transactions yet.</div>`}`); },

  /* ===================== INVENTORY ===================== */
  inventory() { if (!UI.requireAuth()) return this.home(); const inv=State.d.inv;
    const total = inv.reduce((s,i)=>s+i.value,0);
    this.set(`
      <div class="page-head row between"><div><h1>Inventory</h1><p>${inv.length} item(s) · ${UI.money(total)} value · separate from your cart</p></div><div class="row" style="gap:8px"><a class="btn" href="#/cart">Cart (${State.d.cart.length}) →</a><a class="btn" href="#/marketplace">Marketplace →</a></div></div>
      <div class="row between" style="margin-bottom:14px"><div class="chips" id="inv-filters">${[["all","All"],["1","T1"],["2","T2"],["3","T3"],["4","T4"]].map(([v,t],i)=>`<div class="chip ${i===0?"active":""}" data-tf="${v}">${t}</div>`).join("")}</div>
        <div class="row" style="gap:8px">${inv.length?`<button class="btn sm" data-action="cartAll">Send all to cart</button>`:""}<select class="input" id="inv-sort" style="max-width:180px"><option value="new">Newest</option><option value="high">Value: High</option><option value="low">Value: Low</option></select></div></div>
      <div id="inv-grid"></div>`);
    if (!inv.length) { this.q("#inv-grid").innerHTML = `<div class="empty">Inventory is empty.<br><a href="#/cases">Open your first case →</a></div>`; return; }
    let tf="all"; const render=()=>{ let list=inv.slice(); if (tf!=="all") list=list.filter(i=>String(i.tier)===tf); const s=this.q("#inv-sort").value; if (s==="high") list.sort((a,b)=>b.value-a.value); if (s==="low") list.sort((a,b)=>a.value-b.value);
      this.q("#inv-grid").innerHTML = list.length ? `<div class="grid g4">${list.map(it=>UI.itemCardHTML(it,`<div class="btn-group"><button class="btn sm primary" data-action="toCart" data-uid="${it.uid}">To cart</button><button class="btn sm" data-action="itemDetail" data-uid="${it.uid}">Details</button></div><a class="sub inv-up" href="#/upgrade">Use in Upgrader →</a>`)).join("")}</div>` : `<div class="empty">No items in this tier.</div>`; };
    this.qa("[data-tf]").forEach(c=>c.addEventListener("click",()=>{ this.qa("[data-tf]").forEach(x=>x.classList.remove("active")); c.classList.add("active"); tf=c.dataset.tf; render(); }));
    this.q("#inv-sort").addEventListener("change",render); render();
  },
  cartAll() { if (!State.d.inv.length) return; State.d.cart.push(...State.d.inv); State.d.inv = []; State.save(); UI.toast("Sent to cart","All items moved"); Router.resolve(); },
  sellItem(uid) { const it=State.d.inv.find(x=>x.uid===uid); if (!it) return; State.removeInv(uid); State.credit(it.value,"Sold "+it.name); State.save(); UI.updateChrome(); UI.toast("Sold "+it.name,"+"+UI.money(it.value)); if (UI.el("modal-root").innerHTML) UI.closeModal(); Router.resolve(); },
  itemDetail(uid) { const it=State.d.inv.find(x=>x.uid===uid); if (it) UI.itemDetail(it); },

  /* ===================== PROFILE ===================== */
  profile() { if (!UI.requireAuth()) return this.home(); const u=State.d.user, st=State.d.stats;
    const tiers=["Bronze","Silver","Gold","Platinum","Diamond"]; const vipIdx=tiers.indexOf(u.vip); const vipPct=Math.min(100,((u.level-1)%3)/3*100+10);
    const scPanel = (title, key, wins) => { const cfg = State.d[key];
      const shown = cfg.mode==="selected" ? wins.filter(w=>cfg.selected.includes(w.uid)) : wins.slice(0,6);
      const cardHtml = (w,pick) => `<div class="item-card ${pick?"sc-pick":""} tier-${w.tier} t${w.tier} ${pick&&cfg.selected.includes(w.uid)?"sel":""}" ${pick?`data-action="scPick" data-sc="${key}" data-uid="${w.uid}"`:""}>${UI.ph(w.name,"item")}<div class="nm" style="font-size:12px">${UI.esc(w.name)}</div><div class="vl mono" style="font-size:11px">${UI.money(w.value)}</div></div>`;
      return `<div class="panel card-b">
        <div class="row between"><h3 class="h2" style="margin:0">${title}</h3><div class="row" style="gap:10px;align-items:center"><label class="sc-toggle"><input type="checkbox" data-action="scToggle" data-sc="${key}" ${cfg.enabled?"checked":""}><span>Public</span></label><a class="btn sm ghost" href="#/u/${encodeURIComponent(u.username)}">View →</a></div></div>
        ${cfg.enabled ? `
          <div class="tabs" style="margin:12px 0">${[["all","Show all"],["selected","Show selected"]].map(([m,t])=>`<div class="tab ${cfg.mode===m?"active":""}" data-action="scMode" data-sc="${key}" data-mode="${m}">${t}</div>`).join("")}</div>
          ${wins.length ? (cfg.mode==="selected"
            ? `<p class="sub" style="margin:0 0 10px">Tap items to choose what appears on your public profile (${cfg.selected.length} selected).</p><div class="grid g3">${wins.map(w=>cardHtml(w,true)).join("")}</div>`
            : `<div class="grid g3">${shown.map(w=>cardHtml(w,false)).join("")}</div>`)
          : `<div class="muted" style="font-size:13px">No wins to show yet.</div>`}`
        : `<div class="note" style="margin-top:12px">This showcase is hidden from your public profile.</div>`}</div>`; };
    this.set(`
      <div class="grid g2" style="gap:24px;align-items:start">
        <div class="stack">
          <div class="panel card-b">
            <div class="row" style="gap:14px"><div class="avatar" style="width:54px;height:54px;font-size:20px">${UI.esc((u.username[0]||"U").toUpperCase())}</div>
              <div><h1 style="font-size:20px">${UI.esc(u.username)}</h1><div class="row" style="gap:6px;margin-top:4px"><span class="badge">Level ${u.level}</span><span class="badge out">${u.vip} VIP</span></div></div></div>
            <div style="margin-top:14px"><div class="row between" style="font-size:12px;color:var(--muted-foreground)"><span>XP</span><span class="mono">${u.xp}/${u.xpMax}</span></div><div class="xpbar"><i style="width:${Math.min(100,u.xp/u.xpMax*100)}%"></i></div></div>
            <div style="margin-top:12px"><div class="row between" style="font-size:12px;color:var(--muted-foreground)"><span>VIP · ${u.vip}${vipIdx<tiers.length-1?" → "+tiers[vipIdx+1]:""}</span><span class="mono">${Math.round(vipPct)}%</span></div><div class="xpbar"><i style="width:${vipPct}%"></i></div></div>
          </div>
          <div class="panel card-b"><div class="row between"><h3 class="h2" style="margin:0">Stats</h3><div class="tabs" id="stat-tabs"><div class="tab active" data-st="7d">7d</div><div class="tab" data-st="30d">30d</div><div class="tab" data-st="life">Lifetime</div></div></div>
            <div id="stats-block" style="margin-top:14px"><div class="grid g2" style="gap:10px">
              <div class="stat"><div class="k">Cases opened</div><div class="v" data-s="opened">${st.opened}</div></div><div class="stat"><div class="k">Items won</div><div class="v" data-s="won">${st.won}</div></div>
              <div class="stat"><div class="k">Wagered</div><div class="v" data-s="wagered">${UI.money(st.wagered)}</div></div><div class="stat"><div class="k">Best win</div><div class="v">${UI.money(st.best)}</div></div></div></div>
          </div>
          <div class="panel card-b"><h3 class="h2">Settings</h3><div class="tabs" id="set-tabs"><div class="tab active" data-set="general">General</div><div class="tab" data-set="security">Security</div><div class="tab" data-set="self">Self-exclusion</div></div><div id="set-body" style="margin-top:14px"></div></div>
        </div>
        <div class="stack">
          ${scPanel("Win showcase","showcase",State.d.wins)}
          ${scPanel("Battle win showcase","battleShowcase",State.d.battleWins)}
        </div>
      </div>`);
    // stats period (mock scaling)
    const scale={"7d":.3,"30d":.7,"life":1};
    this.qa("#stat-tabs .tab").forEach(t=>t.addEventListener("click",()=>{ this.qa("#stat-tabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active"); const k=scale[t.dataset.st];
      this.q('[data-s="opened"]').textContent=Math.round(st.opened*k); this.q('[data-s="won"]').textContent=Math.round(st.won*k); this.q('[data-s="wagered"]').textContent=UI.money(st.wagered*k); }));
    const setTab=(k)=>{ this.qa("#set-tabs .tab").forEach(t=>t.classList.toggle("active",t.dataset.set===k)); const b=this.q("#set-body");
      if (k==="general") b.innerHTML=`<div class="field"><label>Email</label><input class="input" value="${UI.esc(u.email||"")}" placeholder="you@email.com"></div><div class="field"><label>Username</label><input class="input" value="${UI.esc(u.username)}"></div><div class="field"><label>Connect Discord</label><button class="btn block">Connect Discord</button></div><button class="btn primary">Save</button>`;
      else if (k==="security") b.innerHTML=`<div class="field"><label>New password</label><input class="input" type="password" placeholder="••••••••"></div><label class="check"><input type="checkbox"> Enable 2FA</label><div style="height:10px"></div><button class="btn primary">Update security</button>`;
      else b.innerHTML=`<div class="note">Self-exclusion locks your account for a set period.</div><div class="field" style="margin-top:12px"><label>Cool-off period</label><select class="input"><option>24 hours</option><option>7 days</option><option>30 days</option><option>Permanent</option></select></div><button class="btn">Set self-exclusion</button>`; };
    this.qa("#set-tabs .tab").forEach(t=>t.addEventListener("click",()=>setTab(t.dataset.set))); setTab("general");
  },
  reqStats() { const b=this.q("#stats-block"); if (b) b.classList.toggle("hidden"); },
  scToggle(key) { const c=State.d[key]; if (!c) return; c.enabled=!c.enabled; State.save(); Router.resolve(); },
  scMode(key, mode) { const c=State.d[key]; if (!c) return; c.mode=mode; State.save(); Router.resolve(); },
  scPick(key, uid) { const c=State.d[key]; if (!c) return; const i=c.selected.indexOf(uid); if (i>=0) c.selected.splice(i,1); else c.selected.push(uid); State.save(); Router.resolve(); },

  /* ===================== SHOWCASE (public) ===================== */
  showcase(name) { const self=State.d.user.loggedIn && name===State.d.user.username;
    const pick=(wins,cfg)=> cfg.mode==="selected" ? wins.filter(w=>cfg.selected.includes(w.uid)) : wins.slice(0,8);
    const winItems = self ? (State.d.showcase.enabled ? pick(State.d.wins, State.d.showcase) : null) : DATA.ITEMS.filter(i=>i.tier>=2).sort(()=>Math.random()-.5).slice(0,6);
    const battleItems = self ? (State.d.battleShowcase.enabled ? pick(State.d.battleWins, State.d.battleShowcase) : null) : DATA.ITEMS.filter(i=>i.tier>=3).sort(()=>Math.random()-.5).slice(0,4);
    const grid=(arr)=>`<div class="grid g4">${arr.map(it=>`<div class="item-card tier-${it.tier} t${it.tier}">${UI.ph(it.name,"item")}<div class="nm" style="font-size:12px">${UI.esc(it.name)}</div><div class="vl mono" style="font-size:11px">${UI.money(it.value)}</div></div>`).join("")}</div>`;
    const sec=(title,arr)=>`<h3 class="h2" style="margin-top:20px">${title}</h3>${arr===null?`<div class="note">This showcase is set to private.</div>`:arr.length?grid(arr):`<div class="empty">Nothing to show yet.</div>`}`;
    this.set(`
      <a class="btn sm ghost" href="#" onclick="history.back();return false" style="margin-bottom:12px">← Back</a>
      <div class="panel card-b"><div class="row" style="gap:14px"><div class="avatar" style="width:48px;height:48px;font-size:18px">${UI.esc((name[0]||"U").toUpperCase())}</div><div><h1 style="font-size:20px">${UI.esc(name)}</h1><div class="row" style="gap:6px;margin-top:4px"><span class="badge">Level ${self?State.d.user.level:7}</span><span class="badge out">${self?State.d.user.vip:"Gold"} VIP</span></div><div class="muted" style="font-size:12.5px;margin-top:4px">Public showcase${self?" · this is you":""}</div></div></div></div>
      ${sec("Largest wins", winItems)}
      ${sec("Battle wins", battleItems)}`); },

  /* ===================== PROVABLY FAIR ===================== */
  fair() {
    this.set(`
      <div class="page-head"><h1>Provably Fair</h1><p>Verify any result. Surfaced as a page — never a popup interrupt.</p></div>
      <div class="grid g2" style="gap:24px;align-items:start">
        <div class="panel card-b"><div class="field"><label>Server seed (hashed)</label><input class="input mono" id="pf-server" value="a1b2c3d4e5f6"></div><div class="field"><label>Client seed</label><input class="input mono" id="pf-client" value="player-seed-01"></div><div class="field"><label>Nonce</label><input class="input mono" id="pf-nonce" value="7"></div><button class="btn primary" id="pf-go">Verify result</button><div id="pf-out" style="margin-top:14px"></div></div>
        <div class="panel card-b"><h3 class="h2">How it works</h3><p class="muted" style="font-size:13px">Each roll combines a hashed server seed, your client seed and an incrementing nonce into an HMAC-SHA256 digest. The digest deterministically maps to an outcome — results can't be altered after the fact and you can re-check any spin.</p><div class="note" style="margin-top:12px">Wireframe note: this demo uses a lightweight hash stand-in for illustration only.</div></div>
      </div>`);
    this.q("#pf-go").addEventListener("click", () => { const s=this.q("#pf-server").value+this.q("#pf-client").value+this.q("#pf-nonce").value; let h=0; for (let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } const hex=("00000000"+h.toString(16)).slice(-8); const roll=(h%10000)/100;
      this.q("#pf-out").innerHTML=`<div class="note"><div class="row between"><span>Digest</span><span class="mono">${hex}…</span></div><div class="row between"><span>Roll</span><span class="mono">${roll.toFixed(2)}</span></div><div style="margin-top:6px"><span class="badge solid">Verified ✓</span> deterministic &amp; reproducible</div></div>`; });
  },

  /* ===================== FAQ / SUPPORT / LEGAL ===================== */
  faq() { this.set(`<div class="page-head"><h1>FAQ</h1><p>Answers to common questions about Crowns.</p></div><div style="max-width:760px">${Views.faqHTML(DATA.FAQ)}</div>`); Views.bindAccordion(); },
  support() { this.set(`
      <div class="page-head"><h1>Support</h1><p>Reach the team — or check the <a href="#/faq">FAQ</a> first.</p></div>
      <div class="grid g2" style="gap:24px;align-items:start">
        <div class="panel card-b"><div class="field"><label>Subject</label><input class="input" placeholder="What's it about?"></div><div class="field"><label>Message</label><textarea class="input" rows="5" placeholder="Describe your issue…"></textarea></div><button class="btn primary" data-action="supportSend">Send message</button></div>
        <div class="panel card-b"><h3 class="h2">Other ways to reach us</h3><div class="stack" style="gap:10px"><div class="row between"><span class="muted">Email</span><span class="mono">support@crowns.gg</span></div><div class="row between"><span class="muted">Discord</span><span class="mono">discord.gg/crowns</span></div><div class="row between"><span class="muted">Live chat</span><button class="btn sm" data-action="toggleChat">Open chat</button></div></div><div class="note" style="margin-top:14px">Average response time: under 2 hours (placeholder).</div></div>
      </div>`); },
  supportSend() { UI.toast("Message sent", "We'll reply by email (demo)."); },
  legal(doc) { const titles={terms:"Terms of Service",privacy:"Privacy Policy",aml:"AML Policy",responsible:"Responsible Play"};
    this.set(`<div class="page-head"><h1>${titles[doc]||"Legal"}</h1><p>Placeholder copy for the wireframe — replace with finalized text.</p></div>
      <div class="panel card-b" style="max-width:760px">${Array.from({length:5}).map((_,i)=>`<h3 class="h2" style="margin-top:${i?18:0}px">${i+1}. Section heading</h3><p class="muted" style="font-size:13px">Placeholder text for the ${UI.esc(titles[doc]||"document")}. Replace with the finalized legal copy provided by the client. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`).join("")}</div>`); },
};
