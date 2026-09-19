import { auth, db, onAuthStateChanged, ensureUserProfile, ref, get, push, set } from "./firebase-app.js";

const status = document.getElementById("admin-status");
const panel = document.getElementById("admin-panel");

onAuthStateChanged(auth, async user => {
  if (!user) { status.textContent = "Please sign in first."; return; }
  try {
    const p = await ensureUserProfile(user);
    if (p?.role !== "admin") { status.textContent = "This account is not an administrator."; return; }
    status.textContent = "Administrator access granted.";
    panel.hidden = false;
    await load();
  } catch (err) { console.error(err); status.textContent = "Unable to verify administrator access."; }
});

async function load() {
  const snap = await get(ref(db, "content"));
  const value = snap.val() || {};
  const list = Object.entries(value).map(([id, data]) =>
    '<article style="padding:12px;border-bottom:1px solid #ddd"><strong>' + id + '</strong><div>' + (data?.title || "") + '</div></article>'
  ).join("");
  document.getElementById("admin-list").innerHTML = list || "<p>No content yet.</p>";
}

document.getElementById("content-form").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("content-id").value.trim();
  const contentRef = id ? ref(db, "content/" + id) : push(ref(db, "content"));
  await set(contentRef, {
    title: document.getElementById("content-title").value.trim(),
    body: document.getElementById("content-body").value,
    image: document.getElementById("content-image").value.trim(),
    updatedAt: Date.now(),
    createdAt: Date.now()
  });
  e.target.reset();
  await load();
});
