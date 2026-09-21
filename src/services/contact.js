import { db, ref, push } from "./firebase/client.js";

export function bindContactForms(root=document) {
  const bind = (selector, path, fields, success, failure) => {
    const form = root.querySelector(selector);
    if (!form || form.dataset.firebaseBound === "1") return;
    form.dataset.firebaseBound = "1";
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await push(ref(db, path), Object.fromEntries(fields.map(f => [f, fd.get(f) || ""])).concat ? {} : {});
      } catch {}
    });
  };
  const contact = root.querySelector('form[data-form-type="contact"]');
  if (contact && contact.dataset.firebaseBound !== "1") {
    contact.dataset.firebaseBound = "1";
    contact.addEventListener("submit", async e => {
      e.preventDefault(); const fd = new FormData(contact);
      try { await push(ref(db,"contactMessages"), {name:fd.get("name")||"",email:fd.get("email")||"",phone:fd.get("phone")||"",message:fd.get("message")||"",createdAt:Date.now()}); contact.reset(); alert("Thank you. Your message has been received."); }
      catch(err){ console.error(err); alert("Unable to send your message right now."); }
    });
  }
  const newsletter = root.querySelector('form[data-form-type="subscribe"]');
  if (newsletter && newsletter.dataset.firebaseBound !== "1") {
    newsletter.dataset.firebaseBound = "1";
    newsletter.addEventListener("submit", async e => {
      e.preventDefault(); const fd = new FormData(newsletter);
      try { await push(ref(db,"newsletter"), {email:fd.get("email")||"",createdAt:Date.now()}); newsletter.reset(); alert("You are subscribed."); }
      catch(err){ console.error(err); alert("Unable to subscribe right now."); }
    });
  }
}
