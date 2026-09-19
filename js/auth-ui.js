import { auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, ensureUserProfile, doc, getDoc } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function mountAuthUI() {
  if (document.getElementById("ty-auth-ui")) return;
  const wrap = document.createElement("div");
  wrap.id = "ty-auth-ui";
  wrap.innerHTML = `
    <div class="ty-auth-bar">
      <span id="ty-user-label">Guest</span>
      <button id="ty-login-btn" type="button">Login</button>
      <button id="ty-logout-btn" type="button" hidden>Logout</button>
    </div>
    <div id="ty-auth-modal" class="ty-auth-modal" hidden>
      <div class="ty-auth-card">
        <button id="ty-auth-close" class="ty-auth-close" type="button">×</button>
        <h3>Sign in to TirthYatra</h3>
        <p class="ty-auth-error" id="ty-auth-error"></p>
        <input id="ty-auth-name" placeholder="Name (for sign up)">
        <input id="ty-auth-email" type="email" placeholder="Email">
        <input id="ty-auth-password" type="password" placeholder="Password">
        <div class="ty-auth-actions">
          <button id="ty-signin" type="button">Sign in</button>
          <button id="ty-signup" type="button">Create account</button>
          <button id="ty-google" type="button">Continue with Google</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById("ty-login-btn").onclick=()=>document.getElementById("ty-auth-modal").hidden=false;
  document.getElementById("ty-auth-close").onclick=()=>document.getElementById("ty-auth-modal").hidden=true;
  const email=()=>document.getElementById("ty-auth-email").value.trim();
  const password=()=>document.getElementById("ty-auth-password").value;
  const error=e=>document.getElementById("ty-auth-error").textContent=e?.message?.replace("Firebase: ","") || String(e);
  document.getElementById("ty-signin").onclick=async()=>{try{await signInWithEmailAndPassword(auth,email(),password());document.getElementById("ty-auth-modal").hidden=true}catch(e){error(e)}};
  document.getElementById("ty-signup").onclick=async()=>{try{const c=await createUserWithEmailAndPassword(auth,email(),password());const n=document.getElementById("ty-auth-name").value.trim();if(n)await updateProfile(c.user,{displayName:n});await ensureUserProfile(c.user);document.getElementById("ty-auth-modal").hidden=true}catch(e){error(e)}};
  document.getElementById("ty-google").onclick=async()=>{try{const r=await signInWithPopup(auth,googleProvider);await ensureUserProfile(r.user);document.getElementById("ty-auth-modal").hidden=true}catch(e){error(e)}};
  document.getElementById("ty-logout-btn").onclick=()=>signOut(auth);
}
mountAuthUI();
onAuthStateChanged(auth, async user => {
  const label=document.getElementById("ty-user-label"), login=document.getElementById("ty-login-btn"), logout=document.getElementById("ty-logout-btn");
  if(!label) return;
  if(user){label.textContent=user.displayName || user.email || "Signed in";login.hidden=true;logout.hidden=false;
    const profile=await ensureUserProfile(user);
    if(profile?.role==="admin" && !document.querySelector('a[href="admin.html"]')) {
      const a=document.createElement("a");a.href="admin.html";a.textContent="Admin";a.className="ty-admin-link";document.querySelector(".ty-auth-bar")?.appendChild(a);
    }
  } else {label.textContent="Guest";login.hidden=false;logout.hidden=true;}
});
