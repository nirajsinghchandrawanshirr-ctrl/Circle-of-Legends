# Pull request template

This PR adds a local-first Admin panel prototype with:

- Profile avatar editing (GitHub username or upload)
- Playlist add/edit/delete
- Data Saver toggle (reduces iframe loads and animations)
- Background editor (static/gradient/placeholder for particles/video)
- Local gate for private mode (admin password, localStorage)

Notes:
- Persistence is localStorage for now. We recommend migrating to Firebase or Supabase for production.
