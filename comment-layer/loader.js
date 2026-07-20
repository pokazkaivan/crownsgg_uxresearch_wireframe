/* ============================================================
   CommentLayer loader — pulls in the widget, waits until the
   page has rendered, then connects it to Supabase.
   Falls back to browser-local storage when Supabase isn't
   configured or unreachable, so the prototype never breaks.
   Nothing to edit here — see config.js.
   ============================================================ */
(function () {
  var cfg = window.COMMENT_LAYER_CONFIG || {};
  var base = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  var project = cfg.projectId || "crowns-gg-wireframe";
  var configured = !!(cfg.supabaseUrl && cfg.anonKey &&
    cfg.supabaseUrl.indexOf("YOUR-PROJECT") === -1 && cfg.anonKey.indexOf("YOUR-ANON") === -1);

  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("could not load " + src)); };
      document.head.appendChild(s);
    });
  }

  // SPA pages paint after the script runs — anchor only once real content exists
  function whenReady(fn) {
    var sel = cfg.readySelector || "#view > *, .wrap, main, article", tries = 0;
    (function poll() {
      if (document.querySelector(sel) || tries > 50) fn();
      else { tries++; setTimeout(poll, 200); }
    })();
  }

  function start() {
    whenReady(function () {
      if (!configured) {
        window.CommentLayer.init({ projectId: project });
        console.info("[CommentLayer] Local mode — comments live in this browser only. " +
                     "Add your Supabase URL + anon key in comment-layer/config.js to share them.");
        return;
      }
      var store = window.CommentLayerSupabase({
        url: cfg.supabaseUrl, anonKey: cfg.anonKey, projectId: project,
      });
      store.ready
        .then(function () { window.CommentLayer.init({ projectId: project, storage: store }); })
        .catch(function (e) {
          console.warn("[CommentLayer] Supabase unavailable — using local storage instead.", e);
          window.CommentLayer.init({ projectId: project });
        });
    });
  }

  var chain = load(base + "comment-layer.min.js");
  if (configured) {
    chain = chain
      .then(function () { return load("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"); })
      .then(function () { return load(base + "supabase-adapter.min.js"); });
  }
  chain.then(start).catch(function (e) { console.warn("[CommentLayer] not loaded:", e.message); });
})();
