/* ============================================================
   ui.js — shell chrome, helpers, modals, toasts, auth, deposit,
   sized placeholders, shared mechanics helpers.
   ============================================================ */
const IMG_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M5 17l4-4 3 3 3-4 4 5"/></svg>`;
const ICN = {
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>`,
  chat: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4a8 8 0 1 1 18-7Z"/></svg>`,
  back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`,
  bolt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`,
  sound: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z"/></svg>`,
  crown: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2 8l5 4 5-7 5 7 5-4-2 11H4z"/></svg>`,
  pie: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v9h9"/><circle cx="12" cy="12" r="9"/></svg>`,
  link: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1"/></svg>`,
  swords: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 3l7 7M14 14l7 7M21 3l-7 7M10 14l-7 7"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor" stroke="none"/></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4h6l-1 6 3 3v2H7v-2l3-3-1-6Z"/><path d="M12 18v3"/></svg>`,
  smile: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M8 14.5s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r=".7" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".7" fill="currentColor" stroke="none"/></svg>`,
  xmark: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  cart: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>`,
  box: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>`,
  ticket: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4Z"/><path d="M15 6v12" stroke-dasharray="2 2"/></svg>`,
  user: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7v0.5H4z"/></svg>`,
  dice: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>`,
  wallet: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6H16a2 2 0 0 0 0 4h5"/></svg>`,
  download: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>`,
  gear: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>`,
  exit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9"/></svg>`,
  discord: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.9A19 19 0 0 0 15.7 3.5l-.2.4a17 17 0 0 1 4.1 1.3 15.6 15.6 0 0 0-13.2 0 17 17 0 0 1 4.1-1.3l-.2-.4A19 19 0 0 0 3.7 4.9C1.2 8.6.5 12.2.8 15.7a19 19 0 0 0 5.8 2.9l.6-1a12.5 12.5 0 0 1-2-.9l.5-.4a13.6 13.6 0 0 0 12.6 0l.5.4a12.5 12.5 0 0 1-2 .9l.6 1a19 19 0 0 0 5.8-2.9c.4-4-.7-7.6-3-10.8ZM8.4 13.6c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Zm7.2 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Z"/></svg>`,
  steam: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 9.7l5.3 2.2a2.9 2.9 0 0 1 1.7-.5l2.4-3.5v-.1a3.8 3.8 0 1 1 3.8 3.8h-.1l-3.4 2.4a2.9 2.9 0 0 1-5.7.5L2.3 14.9A10 10 0 1 0 12 2ZM7.7 15.3l1.2.5a2.2 2.2 0 1 0 1.2-2.9l1.3.5a1.6 1.6 0 1 1-1.2 3l-2.5-1.1Zm7.5-3.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Zm0-.7a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z"/></svg>`,
  trophy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 4h10v6a5 5 0 0 1-10 0V4Z"/><path d="M17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3"/><path d="M10 19h4M9 21h6M12 15v4"/></svg>`,
};
const CHAT_USERS = [["Stalk3r","VII"],["GrootJr","VI"],["Teaby","I"],["Nova","IX"],["m","VI"],["Sable","IV"],["Dax","II"],["Pax","V"],["Wren","VIII"],["Juno","III"]];
const CHAT_LINES = ["gl on the hype vault pulls","cmon yellow clutch","gg :D","anyone running a battle?","money back its time","last battle for today ig","that pull was insane","need one more for a 4-way","lets gooo","rip my balance","crowbot diff lol","first pull this case is cursed","who's up for street style","/rain when","just claimed my free case"];
const EMOJIS = ["😀","😂","😍","😎","🔥","💀","👑","🎉","😭","🤝","💎","🍀","👀","🤑","🙏","😤","⚔️","🪙"];
const LOGO_SVG = `<svg viewBox="0 0 207 36" class="brand-logo" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Crowns">
<path d="M141.621 5.11h.681c7.795 0 15.593 0 23.393 0 .198-.016.398.019.58.1.182.082.34.208.46.366 3.27 3.97 5.245 8.572 6.389 13.552 1.076 4.977 1.554 10.063 1.424 15.153v1.674h-12.393v-.658c.056-4.449-.257-8.895-.935-13.292-.957-5.644-2.802-10.924-6.42-15.474-.229-.285-.468-.565-.806-.974v30.414h-12.372V5.11Z" fill="#262626"/>
<path d="M92.445 36H70.16c-3.676 0-5.895-1.612-7.05-5.11-1.039-3.078-1.102-6.249-.956-9.447.244-5.379 1.284-10.665 2.464-15.914.078-.342.218-.425.52-.425 7.464 0 14.924 0 22.389 0 3.29 0 5.479 1.783 6.544 5.13.723 2.505 1.044 5.107.951 7.712-.026 4.897-.821 9.7-1.814 14.473-.219 1.192-.494 2.363-.764 3.581ZM77.136 5.565c-.047.156-.078.249-.099.342-.69 3.737-1.47 7.457-2.042 11.214-.627 3.625-.688 7.323-.182 10.966.216 1.843.845 3.614 1.84 5.182.367.597.856 1.11 1.436 1.505.58.395 1.237.662 1.928.786.054-.14.099-.284.135-.43.671-3.602 1.43-7.146 2.001-10.774.612-3.547.704-7.164.276-10.738-.194-2.036-.857-3.999-1.939-5.737-.365-.598-.852-1.114-1.43-1.513-.577-.399-1.232-.673-1.923-.803Z" fill="#262626"/>
<path d="M177.042 5.11H199.8c1.546-.08 3.081.306 4.403 1.109a6.5 6.5 0 0 1 1.851 2.022c.447.811.695 1.717.722 2.642.193 2.513.161 5.037.224 7.602H194.524v-.726c-.042-2.446-.063-4.892-.13-7.338a5.7 5.7 0 0 0-.307-1.653c-.65-2.254-2.277-3.353-4.678-3.166-.024.127-.04.255-.047.384 0 2.814 0 5.633 0 8.447.009.659.084 1.315.223 1.959.494 2.358 1.929 3.69 4.331 3.861 1.861.13 3.737.062 5.603.13.933.006 1.863.105 2.776.295 2.599.622 4.159 2.466 4.481 5.182.084.811.124 1.626.12 2.441 0 2.544 0 5.083 0 7.664-.229 0-.416 0-.603 0H183.42c-1.809 0-3.483-.368-4.793-1.736-.986-1.021-1.569-2.362-1.642-3.778-.151-2.591-.151-5.182-.214-7.835H189.247c0 .249 0 .477 0 .705.032 2.544.052 5.089.115 7.628.024.529.12 1.052.286 1.555.618 2.119 2.417 3.223 4.819 2.974.016-.108.026-.217.031-.326 0-2.835.041-5.669-.026-8.504-.027-1.008-.202-2.007-.52-2.964-.712-2.073-2.443-2.845-4.471-2.954-2.178-.114-4.361-.041-6.544-.124a7.7 7.7 0 0 1-2.282-.425c-1.057-.331-1.98-.99-2.635-1.882-.655-.891-1.006-1.967-1.004-3.072-.089-3.306.026-6.69.026-10.115Z" fill="#262626"/>
<path d="M33.043 5.11v9.758H20.676V5.7l-.13-.057c-.426.461-.863.912-1.273 1.389-3.145 3.627-5.474 7.726-6.477 12.473-.863 4.057-.572 7.996 1.414 11.711 1.04 1.959 2.505 3.508 4.756 4.104.52.135 1.04.171 1.684.27v-9.453H33.012v9.847H32.367c-7.771 0-15.543-.047-23.32 0-3.405 0-5.687-1.555-7.205-4.436C.413 28.74-.205 25.589.06 22.449c.358-6.011 2.91-11.069 6.784-15.546.52-.602.982-1.379 1.653-1.695.67-.316 1.486-.088 2.245-.088H33.043Z" fill="#262626"/>
<path d="M36.277 5.141H48.655v12.385l.213.057c.088-.164.156-.338.203-.518.527-3.866 1.046-7.732 1.559-11.598.018-.103.042-.205.073-.305H61.323c-.603 4.276-1.206 8.53-1.814 12.831H48.644V35.969H36.277V5.141Z" fill="#262626"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M117.926 0 111.699 5.146H124.097L117.926 0Zm-9.263 5.141H96.473c1.237 10.285 2.474 20.559 3.711 30.823H112.286c-.133-1.195-.263-2.379-.393-3.563-.129-1.184-.259-2.368-.392-3.563H124.398c-.251 2.069-.495 4.107-.741 6.164-.039.323-.078.647-.117.972H135.621C136.851 25.714 138.089 15.436 139.333 5.141H127.231c-.121 1.029-.241 2.044-.362 3.059-.03.253-.06.507-.09.76-.489 4.125-.981 8.25-1.476 12.375-.264 2.194-.531 4.389-.801 6.587a1.3 1.3 0 0 1-.188.456l-.208-.057V5.182H111.704V28.051a1 1 0 0 1 0 .171.3.3 0 0 1-.068.088.2.2 0 0 1-.052 0 1 1 0 0 1-.156 0c-.922-7.708-1.843-15.431-2.765-23.169Z" fill="#262626"/>
<path d="M122.688 23.394V18.005L118 15.31l-4.688 2.694v5.389L118 26.088l4.688-2.694Z" fill="#404040"/><path d="M118 17.552v-2.241l4.688 2.694-1.95 1.121L118 17.552Z" fill="#262626"/><path d="M118 23.847v2.241l4.688-2.694-1.95-1.121L118 23.847Z" fill="#171717"/><path d="M115.262 22.273l-1.95 1.121L118 26.088v-2.241l-2.738-1.574Z" fill="#404040"/><path d="M118 17.552l-2.738 1.574-1.95-1.121L118 15.31v2.242Z" fill="#525252"/><path d="M118 15c-.054 0-.108.014-.156.041l-4.688 2.695a.36.36 0 0 0-.156.269v5.389c0 .111.059.213.156.269l4.688 2.695a.32.32 0 0 0 .312 0l4.688-2.695a.36.36 0 0 0 .156-.269v-5.389a.36.36 0 0 0-.156-.269l-4.688-2.695A.32.32 0 0 0 118 15Zm0 .311 4.688 2.694v5.389L118 26.088l-4.688-2.694v-5.389L118 15.311Z" fill="#737373"/></svg>`;

const PH_DIMS = {
  case:   { ar: "4 / 3", dim: "640×480" },
  item:   { ar: "1 / 1", dim: "240×240" },
  itemSm: { ar: "1 / 1", dim: "120×120" },
  deal:   { ar: "4 / 3", dim: "640×480" },
  hero:   { h: "300px",  dim: "1200×300" },
  avatar: { ar: "1 / 1", dim: "96×96", round: true },
  mini:   { mini: true },
};

const UI = {
  money(n) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  money0(n) { return "$" + Math.round(Number(n) || 0).toLocaleString("en-US"); },
  el(id) { return document.getElementById(id); },
  view() { return UI.el("view"); },
  esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); },

  ph(label, kind) {
    const o = PH_DIMS[kind] || PH_DIMS.item;
    if (o.mini) return `<div class="ph mini"></div>`;
    const style = o.h ? `height:${o.h}` : `aspect-ratio:${o.ar}`;
    const cls = "ph" + (o.round ? " round" : "");
    return `<div class="${cls}" style="${style}">${IMG_ICON}${o.dim ? `<span class="dim">${o.dim}</span>` : ""}${label ? `<span class="lbl">${UI.esc(label)}</span>` : ""}</div>`;
  },
  tierTag(t) { return `<span class="tier-tag">T${t}</span>`; },

  itemCardHTML(it, actions) {
    return `<div class="item-card tier-${it.tier} t${it.tier}">
      ${UI.ph(it.name, "item")}
      <div class="nm">${UI.esc(it.name)}</div>
      <div class="item-meta"><span class="vl">${UI.money(it.value)}</span>${UI.tierTag(it.tier)}</div>
      ${actions || ""}</div>`;
  },

  /* ---------- shell ---------- */
  renderShell() {
    UI.el("app").innerHTML = `
      <header class="nav"><div class="nav-inner">
        <a href="#/" aria-label="Home">${LOGO_SVG}</a>
        <nav class="nav-links" id="navlinks"></nav>
        <div class="nav-right" id="navright"></div>
      </div></header>
      <!-- Live drops bar — HIDDEN (kept for easy restore). To bring it back, delete these two comment lines.
      <div class="drops"><div class="drops-inner">
        <span class="drops-label"><span class="dot-live"></span> Live drops</span>
        <div class="drops-track" id="drops"></div>
      </div></div>
      -->
      <div class="layout"><main class="view" id="view"></main>
        <footer class="foot">
          <div class="foot-inner">
            <div><a href="#/" aria-label="Home">${LOGO_SVG}</a><p style="margin-top:10px;max-width:280px">IRL case-opening wireframe. Open cases &amp; battles to win real items, shipped to your door. Frontend demo — no real funds.</p></div>
            <div><h5>Games</h5><a href="#/cases">Cases</a><a href="#/battles">Battles</a><a href="#/upgrade">Upgrade</a><a href="#/rewards">Rewards</a><a href="#/affiliates">Affiliates</a></div>
            <div><h5>Legal</h5><a href="#/provably-fair">Provably Fair</a><a href="#/legal/terms">Terms</a><a href="#/legal/privacy">Privacy</a><a href="#/legal/aml">AML</a><a href="#/legal/responsible">Responsible Play</a></div>
            <div><h5>Support</h5><a href="#/faq">FAQ</a><a href="#/support">Contact support</a><a href="#" data-action="reset">Reset demo</a></div>
          </div>
          <div class="foot-bottom"><span>© Crowns 2026 — wireframe prototype · Crowns.gg × Tresor.tech</span><span class="muted">18+ · Play responsibly</span></div>
        </footer>
      </div>
      <aside class="chat" id="chat">
        <div class="chat-head">
          <div class="row" style="gap:8px"><b style="font-size:13.5px">Chat</b>
            <button class="cbtn info-ic" type="button" aria-label="About chat">${ICN.info}<span class="info-pop">Chat shows live <b>big wins</b>, <b>battle invites</b> you can join, and the <b>Crow Pool</b> — a community reward that periodically rains coins to active chatters. Be respectful — spam gets you muted.</span></button>
          </div>
          <div class="row" style="gap:5px">
            <button class="cbtn" id="chat-pin" data-action="chatPin" title="Pin / dock chat">${ICN.pin}</button>
            <button class="cbtn" data-action="toggleChat" title="Close">${ICN.xmark}</button>
          </div>
        </div>
        <div class="crow-pool">
          <div class="row between">
            <div class="row" style="gap:8px"><span class="cp-title">CROW POOL</span><span class="cp-timer">${ICN.bolt}<span id="cp-time">5:00</span></span></div>
            <div class="cp-amt">⬢ <b id="cp-amt">$0.00</b></div>
          </div>
          <div class="cp-bar"><i id="cp-fill"></i></div>
        </div>
        <div class="chat-msgs" id="chatmsgs"></div>
        <div class="chat-input">
          <button class="cbtn" data-action="chatEmoji" title="Emoji">${ICN.smile}</button>
          <div class="emoji-pop hidden" id="emoji-pop"></div>
          <input class="input" id="chatinput" placeholder="Send a message…" maxlength="200">
          <button class="btn sm primary" data-action="chatSend">Send</button>
        </div>
        <div class="chat-foot"><span class="online"><i class="dot-on"></i> <span id="chat-online">0</span> online</span><span class="mono" id="chat-count">0/200</span></div>
      </aside>`;
    UI.startChat();
  },

  navItems: [
    ["#/cases","Cases"],["#/battles","Battles"],
    ["#/upgrade","Upgrade"],["#/rewards","Rewards"],["#/marketplace","Marketplace"],["#/affiliates","Affiliates"],
  ],
  updateChrome() {
    const path = (location.hash.slice(1) || "/").split("?")[0];
    UI.el("navlinks").innerHTML = UI.navItems.map(([h, t]) =>
      `<a class="nav-link ${path.startsWith(h.slice(1)) && h !== "#/" ? "active" : ""}" href="${h}">${t}</a>`).join("");
    const u = State.d.user;
    const right = UI.el("navright");
    if (u.loggedIn) {
      const xp = Math.min(100, u.xp / u.xpMax * 100);
      const cartN = State.d.cart.length;
      right.innerHTML = `
        <button class="icon-btn" data-action="toggleChat" title="Chat">${ICN.chat}</button>
        <button class="icon-btn" data-action="openSearch" title="Search">${ICN.search}</button>
        <button class="icon-btn cart-btn" data-action="openCart" title="Cart — items to ship or sell">${ICN.cart}${cartN ? `<span class="cart-count">${cartN}</span>` : ""}</button>
        <a href="#/profile" class="lvl-chip" title="Level ${u.level} · ${u.xp}/${u.xpMax} XP — open profile">Lv ${u.level}<span class="mini-xp"><i style="width:${xp}%"></i></span></a>
        <a href="#/wallet" class="bal" title="Balance">⬢ <b>${UI.money(u.balance)}</b></a>
        <button class="btn sm" data-action="deposit">Deposit</button>
        <div class="menu"><div class="avatar" data-action="avatarMenu" title="${UI.esc(u.username)}">${UI.esc((u.username[0] || "U").toUpperCase())}</div>
          <div class="menu-pop hidden" id="avmenu">
            <a href="#/profile">Profile</a><a href="#/inventory">Inventory</a><a href="#/wallet">Wallet</a>
            <a href="#/withdraw">Withdraw</a><a href="#/tickets">Delivery tickets</a>
            <a href="#/affiliates">Affiliates</a><a href="#/settings">Settings</a>
            <div class="menu-sep"></div><button data-action="logout">Sign out</button>
          </div></div>`;
    } else {
      right.innerHTML = `
        <button class="icon-btn" data-action="toggleChat" title="Chat">${ICN.chat}</button>
        <button class="icon-btn" data-action="openSearch" title="Search">${ICN.search}</button>
        <button class="btn sm ghost" data-action="auth" data-mode="signin">Sign in</button>
        <button class="btn sm primary" data-action="auth" data-mode="signup">Sign up</button>`;
    }
  },
  toggleAvatarMenu() { const m = UI.el("avmenu"); if (m) m.classList.toggle("hidden"); },
  closeAvatarMenu() { const m = UI.el("avmenu"); if (m) m.classList.add("hidden"); },

  /* ---------- toast / modal ---------- */
  toast(title, body, kind) {
    const root = UI.el("toast-root");
    const t = document.createElement("div");
    t.className = "toast " + (kind || "");
    t.innerHTML = `<div><div class="tt">${UI.esc(title)}</div>${body ? `<div class="muted" style="font-size:12px">${UI.esc(body)}</div>` : ""}</div>`;
    root.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s,transform .3s"; t.style.opacity = "0"; t.style.transform = "translateX(16px)"; setTimeout(() => t.remove(), 320); }, 3200);
  },
  openModal(html, cls) {
    UI.el("modal-root").innerHTML = `<div class="modal-scrim" data-scrim><div class="modal ${cls || ""}">${html}</div></div>`;
    const scrim = document.querySelector("[data-scrim]");
    scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) UI.closeModal(); });
  },
  closeModal() { UI.el("modal-root").innerHTML = ""; },

  requireAuth(msg) {
    if (State.d.user.loggedIn) return true;
    UI.toast("Sign in required", msg || "Create a demo account to continue.");
    UI.openAuth("signup");
    return false;
  },

  /* ---------- age gate ---------- */
  ageGate() {
    if (State.d.ageOk) return;
    UI.openModal(`
      <div class="modal-body center" style="padding:28px">
        <div style="margin:0 auto 14px;width:48px;height:48px;border-radius:12px;border:1px solid var(--border-strong);display:grid;place-items:center;font-weight:600;font-family:var(--font-mono)">18+</div>
        <h3 style="font-size:18px">Are you 18 or older?</h3>
        <p class="muted" style="margin:8px auto 0;max-width:320px;font-size:13px">Crowns is strictly for adults. By entering you confirm you are at least 18 and accept the Terms and Privacy Policy.</p>
      </div>
      <div class="modal-foot" style="justify-content:center">
        <button class="btn" onclick="window.location.href='https://www.google.com'">Leave</button>
        <button class="btn primary" data-action="ageOk">I am 18 or older — Enter</button>
      </div>`);
  },
  ageOk() { State.d.ageOk = true; State.save(); UI.closeModal(); },

  /* ---------- auth ---------- */
  openAuth(mode) {
    mode = mode || "signin"; const signup = mode === "signup";
    UI.openModal(`
      <div class="modal-head"><h3>${signup ? "Create account" : "Sign in"}</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body">
        <div class="tabs" style="margin-bottom:14px">
          <div class="tab ${!signup ? "active" : ""}" data-action="authTab" data-mode="signin">Sign in</div>
          <div class="tab ${signup ? "active" : ""}" data-action="authTab" data-mode="signup">Sign up</div>
        </div>
        <div class="auth-oauth">
          <button class="btn" data-action="authOAuth" data-provider="discord">${ICN.discord} Discord</button>
          <button class="btn" data-action="authOAuth" data-provider="steam">${ICN.steam} Steam</button>
        </div>
        <div class="row" style="margin:12px 0"><div style="flex:1;height:1px;background:var(--border)"></div><span class="muted" style="font-size:11px">or continue with email</span><div style="flex:1;height:1px;background:var(--border)"></div></div>
        <div class="field"><label>Username</label><input class="input" id="auth-user" placeholder="player_one" value="${UI.esc(State.d.user.username || "")}"></div>
        ${signup ? `<div class="field"><label>Email</label><input class="input" id="auth-email" placeholder="you@email.com"></div>
        <div class="field"><label>Password</label><input class="input" type="password" placeholder="••••••••"></div>
        <div class="field"><label>Referral code <span class="hint">(optional)</span></label><input class="input" placeholder="streamer code"></div>
        <label class="check" style="margin-top:4px"><input type="checkbox" id="auth-age"> I confirm I am 18+ and accept the Terms.</label>`
        : `<div class="field"><label>Password</label><input class="input" type="password" placeholder="••••••••"></div>
        <div class="row between"><label class="check"><input type="checkbox"> Remember me</label><a class="sub" href="#" data-action="forgot">Forgot password?</a></div>`}
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="closeModal">Cancel</button>
        <button class="btn primary" data-action="doAuth" data-mode="${mode}">${signup ? "Create account" : "Sign in"}</button>
      </div>`);
  },
  doAuth(mode) {
    const user = (UI.el("auth-user") && UI.el("auth-user").value || "").trim() || "player_one";
    if (mode === "signup") { const age = UI.el("auth-age"); if (age && !age.checked) { UI.toast("Age gate", "Please confirm you are 18+."); return; } }
    const u = State.d.user;
    const fresh = !u.loggedIn && u.balance === 0 && State.d.stats.opened === 0;
    u.loggedIn = true; u.username = user;
    const em = UI.el("auth-email"); if (em) u.email = em.value;
    if (fresh) State.credit(500, "Welcome bonus");
    State.save(); UI.closeModal(); UI.updateChrome();
    UI.toast("Welcome, " + user + (fresh ? " — $500 demo bonus" : ""), null, "win");
    if (window.Router) Router.resolve();
  },
  forgot() { UI.toast("Reset link sent", "Check your email (demo)."); },

  /* ---------- deposit ---------- */
  openDeposit() {
    if (!UI.requireAuth("Sign in to add demo balance.")) return;
    UI.openModal(`
      <div class="modal-head"><h3>Deposit (demo)</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body">
        <div class="tabs" style="margin-bottom:14px">
          <div class="tab active" data-tab="crypto" data-action="depTab">Crypto</div>
          <div class="tab" data-tab="gift" data-action="depTab">Gift card</div>
          <div class="tab" data-tab="fiat" data-action="depTab">Apple Pay / Fiat</div>
        </div><div id="dep-body"></div>
      </div>`);
    UI.depTab("crypto");
  },
  depTab(tab) {
    document.querySelectorAll("[data-action='depTab']").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    const b = UI.el("dep-body");
    if (tab === "fiat") { b.innerHTML = `<div class="note">Apple Pay / fiat is a <b>Stage 2</b> integration (third-party). Disabled in this wireframe.</div>`; return; }
    const presets = [25, 50, 100, 250, 500];
    b.innerHTML = `
      ${tab === "crypto"
        ? `<div class="field"><label>Network</label><select class="input" id="dep-net"><option>LTC</option><option>ETH</option><option>USDT</option><option>USDC</option></select></div>
           <div style="margin-bottom:12px">${UI.ph("Wallet address QR", "case").replace('aspect-ratio:4 / 3', 'height:130px')}</div>`
        : `<div class="field"><label>Gift card code</label><input class="input mono" id="dep-code" placeholder="XXXX-XXXX-XXXX"></div>`}
      <div class="field"><label>Amount (demo)</label><input class="input mono" id="dep-amt" value="100"></div>
      <div class="btn-group" style="margin-bottom:14px">${presets.map(p => `<button class="btn sm" data-action="depPreset" data-amt="${p}">$${p}</button>`).join("")}</div>
      <button class="btn primary block" data-action="doDeposit">Credit balance</button>`;
  },
  doDeposit() {
    const amt = Math.max(1, Math.round(parseFloat(UI.el("dep-amt").value) || 0));
    State.credit(amt, "Deposit"); State.save(); UI.closeModal(); UI.updateChrome();
    UI.toast("Deposited " + UI.money(amt), "Balance updated.", "win");
  },

  /* ---------- search ---------- */
  openSearch() {
    UI.openModal(`
      <div class="modal-head"><h3>Search</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body">
        <input class="input" id="srch" placeholder="Search cases &amp; items…" autofocus>
        <div id="srch-out" style="margin-top:12px"></div>
      </div>`);
    const run = () => {
      const q = (UI.el("srch").value || "").toLowerCase();
      const cases = DATA.CASES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5);
      const items = DATA.ITEMS.filter(i => i.name.toLowerCase().includes(q)).slice(0, 5);
      UI.el("srch-out").innerHTML = !q ? `<div class="muted" style="font-size:13px">Type to search…</div>` :
        `${cases.length ? `<div class="sub" style="margin-bottom:6px">Cases</div>` + cases.map(c => `<a class="row between" style="padding:6px 0" href="#/cases/${c.id}" data-action="closeModal"><span>${UI.esc(c.name)}</span><span class="badge">${c.free?"FREE":UI.money(c.price)}</span></a>`).join("") : ""}
         ${items.length ? `<div class="sub" style="margin:8px 0 6px">Items</div>` + items.map(i => `<div class="row between" style="padding:6px 0"><span>${UI.tierTag(i.tier)} ${UI.esc(i.name)}</span><span class="mono muted">${UI.money(i.value)}</span></div>`).join("") : ""}
         ${!cases.length && !items.length ? `<div class="muted" style="font-size:13px">No matches.</div>` : ""}`;
    };
    UI.el("srch").addEventListener("input", run); run();
  },

  /* ---------- rewards intro (guest) ---------- */
  openRewardsIntro() {
    UI.openModal(`
      <div class="modal-head"><h3>Unlock Rewards</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body">
        <p class="muted" style="font-size:13px;margin:0 0 14px">Sign in or create a free account to start earning. Rewards members get:</p>
        <div class="stack" style="gap:11px">
          ${[["Monthly Race","Compete for a shared $15,900 prize pool"],["Free cases by level","A free case every level you reach"],["Weekly raffle & challenges","Tickets and prizes every single week"],["Promo codes","Redeem partner & stream drops"],["VIP ranks","Rakeback, priority shipping & perks"]].map(([t,d])=>`<div class="row" style="gap:10px"><span class="rk-check on">✓</span><div><b style="font-size:13px">${t}</b><div class="muted" style="font-size:12px">${d}</div></div></div>`).join("")}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="closeModal">Browse as guest</button>
        <button class="btn" data-action="auth" data-mode="signin">Sign in</button>
        <button class="btn primary" data-action="auth" data-mode="signup">Sign up free</button>
      </div>`, "lg");
  },

  /* ---------- auth gate (feature-locked) ---------- */
  openAuthGate(feature) {
    UI.openModal(`
      <div class="modal-head"><h3>Sign in required</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body"><p class="muted" style="font-size:13px;margin:0">Sign in or create a free account to ${UI.esc(feature || "continue")}. It only takes a moment.</p></div>
      <div class="modal-foot"><button class="btn ghost" data-action="closeModal">Cancel</button><button class="btn" data-action="auth" data-mode="signin">Sign in</button><button class="btn primary" data-action="auth" data-mode="signup">Sign up free</button></div>`);
  },

  /* ---------- confirm dialog (reusable) ---------- */
  confirm(title, body, onYes) {
    UI._confirmFn = onYes;
    UI.openModal(`
      <div class="modal-head"><h3>${UI.esc(title)}</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body"><p style="font-size:13.5px;margin:0;line-height:1.5">${body}</p></div>
      <div class="modal-foot"><button class="btn ghost" data-action="closeModal">No</button><button class="btn primary" data-action="confirmYes">Yes</button></div>`);
  },

  /* ---------- item detail ---------- */
  itemDetail(entry) {
    const listings = DATA.MARKET.filter((m) => m.id === entry.id);
    const mkt = listings.length ? Math.round(listings.reduce((s, m) => s + m.price, 0) / listings.length) : entry.value;
    const rarity = DATA.RARITY[entry.tier], drop = DATA.DROP[entry.tier], type = DATA.ITEM_TYPE[entry.id] || "Item";
    UI.openModal(`
      <div class="modal-head"><h3>${UI.esc(entry.name)}</h3><button class="x" data-action="closeModal">✕</button></div>
      <div class="modal-body">
        <div class="grid g2" style="align-items:start;gap:18px">
          ${UI.ph(entry.name, "item")}
          <div>
            <div class="row" style="gap:6px;margin-bottom:12px">${UI.tierTag(entry.tier)}<span class="badge">${rarity}</span><span class="badge out">${type}</span></div>
            <div class="kv"><span class="k">Market price</span><b class="mono">${UI.money(mkt)}</b></div>
            <div class="kv"><span class="k">Item value</span><b class="mono">${UI.money(entry.value)}</b></div>
            <div class="kv"><span class="k">Rarity</span><b>${rarity}</b></div>
            <div class="kv"><span class="k">Drop chance</span><b class="mono">${drop}%</b></div>
            <div class="kv"><span class="k">In store</span><b class="mono">${listings.length}</b></div>
          </div>
        </div>
        <p class="muted" style="font-size:12.5px;margin-top:12px">${rarity} ${type.toLowerCase()} — a real physical item shipped to your door. Move it to your cart to sell it straight to your balance, or order delivery. Market price reflects current store stock.</p>
      </div>
      <div class="modal-foot">
        ${entry.uid ? `<button class="btn primary" data-action="toCart" data-uid="${entry.uid}" data-close="1">Add to cart</button>` : ""}
        <button class="btn" data-action="closeModal">Close</button>
      </div>`, "lg");
  },

  /* ---------- live drops + chat ---------- */
  startDrops() {
    const push = () => {
      const c = DATA.CASES[1 + Math.floor(Math.random() * (DATA.CASES.length - 1))];
      const it = DATA.item(DATA.pick(c));
      const track = UI.el("drops"); if (!track) return;
      const d = document.createElement("div"); d.className = "drop";
      d.innerHTML = `${UI.ph("", "mini").replace('class="ph mini"', 'class="ph mini" ')}<span class="muted">${DATA.randName()}</span> <b>${UI.esc(it.name)}</b> <span class="mono muted">${UI.money(it.value)}</span>`;
      const phEl = d.querySelector(".ph"); if (phEl) phEl.style.cssText = "width:20px;height:20px;flex:0 0 20px";
      track.prepend(d); while (track.children.length > 7) track.lastChild.remove();
    };
    for (let i = 0; i < 6; i++) push();
    setInterval(push, 2600);
  },
  /* ---------- chat engine ---------- */
  chatUser(u, r, t) { return `<div class="cmsg"><span class="rank">${UI.esc(r)}</span><span class="who" data-action="showcase" data-name="${UI.esc(u)}">${UI.esc(u)}</span><span class="ct">${UI.esc(t)}</span></div>`; },
  chatSys(tag, html) { return `<div class="cmsg sys"><span class="sys-tag">${tag}</span>${html}</div>`; },
  trimChat(box) { while (box.children.length > 60) box.firstChild.remove(); box.scrollTop = box.scrollHeight; },
  setOnline() { const e = UI.el("chat-online"); if (e) e.textContent = (UI._online || 0).toLocaleString(); },
  cpRender() {
    const t = UI.el("cp-time"); if (!t) return;
    const m = Math.floor(UI._cpTime / 60), s = UI._cpTime % 60;
    t.textContent = m + ":" + String(s).padStart(2, "0");
    const a = UI.el("cp-amt"); if (a) a.textContent = UI.money(UI._pool);
    const f = UI.el("cp-fill"); if (f) f.style.width = Math.min(100, (1 - UI._cpTime / UI._cpMax) * 100) + "%";
  },
  cpTick() {
    if (!UI.el("cp-time")) return;
    UI._cpTime--; UI._pool += Math.random() * 1.1 + 0.2;
    if (UI._cpTime <= 0) {
      const n = 8 + Math.floor(Math.random() * 32);
      UI.chatSysPush("CROW POOL", `rained <b>${UI.money(UI._pool)}</b> to ${n} active chatters`);
      UI._pool = 4 + Math.random() * 9; UI._cpMax = 240 + Math.floor(Math.random() * 120); UI._cpTime = UI._cpMax;
    }
    UI.cpRender();
  },
  chatSysPush(tag, html) { const box = UI.el("chatmsgs"); if (!box) return; box.insertAdjacentHTML("beforeend", UI.chatSys(tag, html)); UI.trimChat(box); },
  chatEvent() {
    const box = UI.el("chatmsgs"); if (!box) return;
    const u = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
    const r = Math.random();
    if (r < 0.62) box.insertAdjacentHTML("beforeend", UI.chatUser(u[0], u[1], CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)]));
    else if (r < 0.81) { const pool = DATA.ITEMS.filter(i => i.tier >= 3); const it = pool[Math.floor(Math.random() * pool.length)]; box.insertAdjacentHTML("beforeend", UI.chatSys("BIG WIN", `<b>${UI.esc(u[0])}</b> unboxed <b>${UI.esc(it.name)}</b> · <span class="mono">${UI.money(it.value)}</span>`)); }
    else { const c = DATA.CASES[2 + Math.floor(Math.random() * 4)]; const fmts = ["1v1","2v2","1v1v1","3v3"]; const fmt = fmts[Math.floor(Math.random() * fmts.length)]; box.insertAdjacentHTML("beforeend", UI.chatSys("BATTLE", `<b>${UI.esc(u[0])}</b> opened a ${fmt} <b>${UI.esc(c.name)}</b> battle · <a class="join" href="#/battles">Join ↗</a>`)); }
    UI.trimChat(box);
  },
  startChat() {
    const box = UI.el("chatmsgs"); if (!box) return;
    const seed = [["Stalk3r","VII","gl on the hype vault pulls"],["GrootJr","VI","gg :D"],["Nova","IX","that pull was insane"],["Teaby","I","anyone running a battle?"]];
    box.innerHTML = seed.map(s => UI.chatUser(s[0], s[1], s[2])).join("");
    UI.chatSysPush("BATTLE", `<b>Stalk3r</b> opened a 2v2 <b>Hype Vault</b> battle · <a class="join" href="#/battles">Join ↗</a>`);
    const inp = UI.el("chatinput");
    if (inp) inp.addEventListener("input", () => { const c = UI.el("chat-count"); if (c) c.textContent = inp.value.length + "/200"; });
    UI._online = 1180 + Math.floor(Math.random() * 160); UI.setOnline();
    UI._pool = 14 + Math.random() * 22; UI._cpMax = 240 + Math.floor(Math.random() * 120); UI._cpTime = UI._cpMax; UI.cpRender();
    if (UI._chatTimers) return; UI._chatTimers = true;
    setInterval(() => { UI._online += Math.floor(Math.random() * 9) - 4; if (UI._online < 900) UI._online = 900; UI.setOnline(); }, 4000);
    setInterval(() => UI.cpTick(), 1000);
    setInterval(() => UI.chatEvent(), 4200);
  },
  chatSend() {
    const i = UI.el("chatinput"); const v = (i.value || "").trim(); if (!v) return;
    const who = State.d.user.loggedIn ? State.d.user.username : "guest";
    const rank = State.d.user.loggedIn ? "V" : "–"; const box = UI.el("chatmsgs");
    if (v === "/rain") box.insertAdjacentHTML("beforeend", UI.chatSys("CROW POOL", `<b>${UI.esc(who)}</b> triggered a coin rain in chat <span class="chip-s2">Stage 2</span>`));
    else box.insertAdjacentHTML("beforeend", UI.chatUser(who, rank, v));
    i.value = ""; const c = UI.el("chat-count"); if (c) c.textContent = "0/200"; UI.trimChat(box);
  },
  chatEmoji() {
    const pop = UI.el("emoji-pop"); if (!pop) return;
    if (!pop.dataset.built) { pop.innerHTML = EMOJIS.map(e => `<button type="button" data-action="emojiPick" data-e="${e}">${e}</button>`).join(""); pop.dataset.built = "1"; }
    pop.classList.toggle("hidden");
  },
  emojiPick(el) { const i = UI.el("chatinput"); if (i) { i.value += el.dataset.e; const c = UI.el("chat-count"); if (c) c.textContent = i.value.length + "/200"; i.focus(); } const pop = UI.el("emoji-pop"); if (pop) pop.classList.add("hidden"); },
  chatPin(el) { if (!document.body.classList.contains("chat-open")) document.body.classList.add("chat-open"); const pinned = document.body.classList.toggle("chat-pinned"); if (el) el.classList.toggle("on", pinned); },
  toggleChat() { const open = document.body.classList.toggle("chat-open"); if (!open) { document.body.classList.remove("chat-pinned"); const p = UI.el("chat-pin"); if (p) p.classList.remove("on"); } },

  /* ---------- spin engine ---------- */
  buildReel(caseObj, tiles) {
    tiles = tiles || 60; const WIN = tiles - 10;
    const winner = DATA.pick(caseObj); const ids = [];
    for (let i = 0; i < tiles; i++) ids.push(i === WIN ? winner : DATA.pick(caseObj));
    return { ids, WIN, winner };
  },
  tileHTML(it) {
    return `<div class="tile tier-${it.tier} t${it.tier}">${UI.ph(it.name, "itemSm")}<div class="nm">${UI.esc(it.name)}</div><div class="vl">${UI.money(it.value)}</div></div>`;
  },
  reelHTML(ids, extra) {
    return `<div class="reel-window ${extra || ""}"><div class="reel-marker"></div><div class="reel-strip">${ids.map(id => UI.tileHTML(DATA.item(id))).join("")}</div></div>`;
  },
  runSpin(windowEl, WIN, mode) {
    const strip = windowEl.querySelector(".reel-strip");
    const first = strip.children[0];
    const tileFull = first.getBoundingClientRect().width + 8;
    const center = windowEl.clientWidth / 2;
    const target = -(WIN * tileFull + first.getBoundingClientRect().width / 2 - center) + (Math.random() * 26 - 13);
    if (mode === "turbo") { strip.style.transition = "none"; strip.style.transform = `translateX(${target}px)`; return Promise.resolve(); }
    return new Promise((res) => {
      strip.style.transition = "none"; strip.style.transform = "translateX(0)"; void strip.offsetWidth;
      const dur = mode === "fast" ? 1900 + Math.random() * 300 : 4200 + Math.random() * 700;
      strip.style.transition = `transform ${dur}ms cubic-bezier(.1,.72,.18,1)`;
      strip.style.transform = `translateX(${target}px)`;
      let done = false; const fin = () => { if (done) return; done = true; res(); };
      strip.addEventListener("transitionend", fin, { once: true }); setTimeout(fin, dur + 180);
    });
  },
  markWin(windowEl, WIN) { const t = windowEl.querySelector(".reel-strip").children[WIN]; if (t) t.classList.add("win"); },

  /* ---- vertical reel engine (rain.gg style: scroll top -> down) ---- */
  vtileHTML(it) {
    return `<div class="vtile tier-${it.tier} t${it.tier}">${UI.ph(it.name, "itemSm")}<div class="nm">${UI.esc(it.name)}</div><div class="vl">${UI.money(it.value)}</div></div>`;
  },
  reelColHTML(ids) {
    return `<div class="reel-col"><div class="reel-vstrip">${ids.map(id => UI.vtileHTML(DATA.item(id))).join("")}</div></div>`;
  },
  runSpinV(colEl, WIN, mode) {
    const strip = colEl.querySelector(".reel-vstrip");
    const first = strip.children[0];
    const tileH = first.getBoundingClientRect().height || 118;
    const tileFull = tileH + 10;
    const center = (colEl.clientHeight || 460) / 2;
    const target = -(WIN * tileFull + tileH / 2 - center);   // land centred (markWinV snaps to the exact centre line after)
    if (mode === "turbo") { strip.style.transition = "none"; strip.style.transform = `translateY(${target}px)`; return Promise.resolve(); }
    return new Promise((res) => {
      strip.style.transition = "none"; strip.style.transform = "translateY(0)"; void strip.offsetWidth;
      const dur = 4200 + Math.random() * 700;
      strip.style.transition = `transform ${dur}ms cubic-bezier(.1,.72,.18,1)`;
      strip.style.transform = `translateY(${target}px)`;
      let done = false; const fin = () => { if (done) return; done = true; res(); };
      strip.addEventListener("transitionend", fin, { once: true }); setTimeout(fin, dur + 180);
    });
  },
  markWinV(colEl, WIN) {
    const strip = colEl.querySelector(".reel-vstrip"); const t = strip && strip.children[WIN]; if (!t) return;
    t.classList.add("win");
    // Snap the winner exactly onto the centre line (opposite the arrows), regardless of
    // spin jitter or variable tile heights (long names wrapping). Measure actual position.
    try {
      const fr = colEl.getBoundingClientRect(), tr = t.getBoundingClientRect();
      const delta = (fr.top + fr.height / 2) - (tr.top + tr.height / 2);
      if (isFinite(delta) && Math.abs(delta) > 0.5) {
        let curY = 0; const tf = getComputedStyle(strip).transform;
        if (tf && tf !== "none") { const m = tf.match(/matrix\(([^)]+)\)/); if (m) { const p = m[1].split(","); curY = parseFloat(p[5]) || 0; } }
        strip.style.transition = "transform .2s ease"; strip.style.transform = `translateY(${curY + delta}px)`;
      }
    } catch (e) {}
  },
};
