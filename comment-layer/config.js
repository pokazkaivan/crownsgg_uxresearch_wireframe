/* ============================================================
   CommentLayer — the only file you need to edit.
   Fill in the two Supabase values, redeploy, done.
   Leave them as-is and comments are stored locally in the
   reviewer's own browser (fine for a solo look, not shared).
   ============================================================ */
window.COMMENT_LAYER_CONFIG = {
  // Supabase → Settings → API → Project URL
  supabaseUrl: "https://khsfxxfqqdjugbpzumts.supabase.co",

  // Supabase → Settings → API → anon / publishable key (safe in client code)
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoc2Z4eGZxcWRqdWdicHp1bXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjE4MDksImV4cCI6MjEwMDEzNzgwOX0.RCHLBlB3v9KEf3LKhHfyhH6c3kMGwKc4HdRaGn-YxK0",

  // Namespace for this delivery. Change it only if you want a fresh, empty board.
  projectId: "crowns-gg-wireframe",

  // Elements that only exist once a page has actually rendered.
  readySelector: "#view > *, .wrap, main, article",
};
