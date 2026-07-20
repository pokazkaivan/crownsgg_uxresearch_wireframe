/* ============================================================
   CommentLayer — the only file you need to edit.
   Fill in the two Supabase values, redeploy, done.
   Leave them as-is and comments are stored locally in the
   reviewer's own browser (fine for a solo look, not shared).
   ============================================================ */
window.COMMENT_LAYER_CONFIG = {
  // Supabase → Settings → API → Project URL
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",

  // Supabase → Settings → API → anon / publishable key (safe in client code)
  anonKey: "YOUR-ANON-KEY",

  // Namespace for this delivery. Change it only if you want a fresh, empty board.
  projectId: "crowns-gg-wireframe",

  // Elements that only exist once a page has actually rendered.
  readySelector: "#view > *, .wrap, main, article",
};
