import { auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, ensureUserProfile, ref, get, update } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function mountAuthUI() {
  if (document.getElementById("ty-auth-ui")) return;
  const wrap = document.createElement("div");
  wrap.id = "ty-auth-ui";
  wrap.innerHTML = `
    <div class="ty-auth-bar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 16px;background:#fff8ee;border-bottom:1px solid #eadbc8;font:14px system-ui">
      <span id="ty-user-label">Guest</span>
      <a href="prasads.html">Prasads</a>
      <a href="temple-visits.html">Temple Visits</a>
      <button id="ty-login-btn" type="button">Login</button>
      <button id="ty-logout-btn" type="button" hidden>Logout</button>
    </div>
    <div id="ty-auth-modal" class="ty-auth-modal" hidden style="position:fixed;inset:0;background:#0008;z-index:9999;padding:30px">
      <div class="ty-auth-card" style="max-width:420px;margin:8vh auto;background:white;padding:24px;border-radius:14px">
        <h3>Sign in to TirthYatra</h3>
        <p id="ty-auth-error" style="color:#b42318"></p>
        <input id="ty-auth-name" placeholder="Name (for sign up)" style="width:100%;padding:10px;margin:6px 0">
        <input id="ty-auth-email" type="email" placeholder="Email" style="width:100%;padding:10px;margin:6px 0">
        <input id="ty-auth-password" type="password" placeholder="Password" style="width:100%;padding:10px;margin:6px 0">
        <div style="display:grid;gap:8px;margin-top:10px">
          <button id="ty-signin" type="button">Sign in</button>
          <button id="ty-signup" type="button">Create account</button>
          <button id="ty-google" type="button">Sign up / continue with Google</button>
        </div>
      </div>
    </div>`;
  const target = document.getElementById("auth-form-slot") || document.body;
  target.appendChild(wrap);

  const modal=document.getElementById("ty-auth-modal");
  document.getElementById("ty-login-btn").onclick=()=>modal.hidden=false;
  const email=()=>document.getElementById("ty-auth-email").value.trim();
  const password=()=>document.getElementById("ty-auth-password").value;
  const error=e=>document.getElementById("ty-auth-error").textContent=e?.message?.replace("Firebase: ","") || String(e);

  document.getElementById("ty-signin").onclick=async()=>{try{await signInWithEmailAndPassword(auth,email(),password());modal.hidden=true}catch(e){error(e)}};
  document.getElementById("ty-signup").onclick=async()=>{try{
    const c=await createUserWithEmailAndPassword(auth,email(),password());
    const n=document.getElementById("ty-auth-name").value.trim();
    if(n) await updateProfile(c.user,{displayName:n});
    await ensureUserProfile(c.user);
    modal.hidden=true;
  }catch(e){error(e)}};
  document.getElementById("ty-google").onclick=async()=>{try{
    const r=await signInWithPopup(auth,googleProvider);
    await ensureUserProfile(r.user);
    modal.hidden=true;
  }catch(e){error(e)}};
  document.getElementById("ty-logout-btn").onclick=()=>signOut(auth);
}

mountAuthUI();

onAuthStateChanged(auth, async user => {
  const label=document.getElementById("ty-user-label"), login=document.getElementById("ty-login-btn"), logout=document.getElementById("ty-logout-btn");
  if(!label) return;
  if(user){
    label.textContent=user.displayName || user.email || "Signed in";
    login.hidden=true; logout.hidden=false;
    try {
      const profile=await ensureUserProfile(user);
      if(profile?.role==="admin" && !document.querySelector('a[href="admin.html"]')) {
        const a=document.createElement("a"); a.href="admin.html"; a.textContent="Admin"; a.className="ty-admin-link";
        document.querySelector(".ty-auth-bar")?.appendChild(a);
      }
    } catch(e) { console.error("Profile sync failed",e); }
    if (location.pathname.endsWith("/auth.html") || location.pathname.endsWith("/auth")) location.replace("index.html");
  } else {
    label.textContent="Guest"; login.hidden=false; logout.hidden=true;
  }
});