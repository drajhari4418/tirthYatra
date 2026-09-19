import { db, ref, push } from "./firebase-app.js";

const form = document.querySelector('form[data-form-type="contact"]');
if (form) form.addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(form);
  try {
    await push(ref(db, "contactMessages"), { name: fd.get("name") || "", email: fd.get("email") || "", phone: fd.get("phone") || "", message: fd.get("message") || "", createdAt: Date.now() });
    form.reset(); alert("Thank you. Your message has been received.");
  } catch (err) { console.error(err); alert("Unable to send your message right now."); }
});

const newsletter = document.querySelector('form[data-form-type="subscribe"]');
if (newsletter) newsletter.addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(newsletter);
  try {
    await push(ref(db, "newsletter"), { email: fd.get("email") || "", createdAt: Date.now() });
    newsletter.reset(); alert("You are subscribed.");
  } catch (err) { console.error(err); alert("Unable to subscribe right now."); }
});
