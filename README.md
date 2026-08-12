# Circle of Legends - feature/admin-local-editor

This branch adds a local-first Admin panel prototype that lets you:

- Change profile avatar by GitHub username or upload (stored in localStorage)
- Add / delete playlists (stored in localStorage)
- Toggle Data Saver (reduces iframe loads and animations)
- Edit background mode (static / gradient / video / particles placeholder)
- Optionally gate the site with a local admin password (prototype only)

How to test
1. Open the site (index.html) in a browser
2. Click the "Admin" button (top-right)
3. Make changes, save, and observe immediate updates on the site

Next steps
- Replace localStorage persistence with Firebase / Supabase for real backend
- Add authentication (Google / GitHub) and secure Firestore rules
- Implement real image uploads to Storage instead of data URLs
