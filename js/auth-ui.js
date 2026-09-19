import { auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, ensureUserProfile, ref, get, update } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function mountAuthUI() {
  if (document.getElementById("ty-auth-ui")) return;
  const wrap = document.createElement("div");
  wrap.id = "ty-auth-ui";
  wrap.innerHTML = `
    <div class="ty-auth-bar" style="position:fixed;top:12px;right:16px;z-index:10000;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;background:#fff8ee;border:1px solid #eadbc8;border-radius:10px;box-shadow:0 4px 14px rgba(74,40,12,.12);font:13px system-ui">
      <span id="ty-user-label">Guest</span>
      <button id="ty-login-btn" type="button">Login</button>
      <button id="ty-logout-btn" type="button" hidden>Logout</button>
      <span class="ty-auth-links" style="display:flex;align-items:center;gap:8px">
        <a href="prasads.html">Prasads</a>
        <a href="temple-visits.html">Temple Visits</a>
      </span>
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
        <button id="ty-switch-auth" type="button" style="margin-top:8px;background:transparent;color:#9f4318;padding:4px 0">Already have an account? Sign in</button>
      </div>
    </div>`;
  const target = document.getElementById("auth-form-slot") || document.body;
  target.appendChild(wrap);

  const modal=document.getElementById("ty-auth-modal");
  const nameInput=document.getElementById("ty-auth-name");
  const signinBtn=document.getElementById("ty-signin");
  const signupBtn=document.getElementById("ty-signup");
  const googleBtn=document.getElementById("ty-google");
  const switchBtn=document.getElementById("ty-switch-auth");
  const email=()=>document.getElementById("ty-auth-email").value.trim();
  const password=()=>document.getElementById("ty-auth-password").value;
  const error=e=>document.getElementById("ty-auth-error").textContent=e?.message?.replace("Firebase: ","") || String(e);

  let mode="signup";
  const showLogin=()=>{
    mode="login";
    nameInput.style.display="none";
    signinBtn.style.display="";
    signupBtn.style.display="none";
    googleBtn.textContent="Continue with Google";
    switchBtn.textContent="New here? Create an account";
    error("");
  };
  const showSignup=()=>{
    mode="signup";
    nameInput.style.display="";
    signinBtn.style.display="none";
    signupBtn.style.display="";
    googleBtn.textContent="Sign up / continue with Google";
    switchBtn.textContent="Already have an account? Sign in";
    error("");
  };

  document.getElementById("ty-login-btn").onclick=()=>{modal.hidden=false;showLogin();};
  switchBtn.onclick=()=>mode==="login"?showSignup():showLogin();

  signinBtn.onclick=async()=>{
    const e=email(), p=password();
    if(!e || !p){ error("Please enter your email and password."); return; }
    try{
      await signInWithEmailAndPassword(auth,e,p);
      modal.hidden=true;
      location.replace("index.html");
    }catch(e){
      const code=e?.code || "";
      if(code==="auth/user-not-found" || code==="auth/invalid-credential" || code==="auth/invalid-login-credentials"){
        error("Account not found. Please create an account first.");
      } else if(code==="auth/wrong-password"){
        error("Incorrect password. Please try again.");
      } else {
        error(e);
      }
    }
  };

  signupBtn.onclick=async()=>{
    const e=email(), p=password();
    if(!e || !p){ error("Please enter your email and password."); return; }
    try{
      const c=await createUserWithEmailAndPassword(auth,e,p);
      const n=nameInput.value.trim();
      if(n) await updateProfile(c.user,{displayName:n});
      try { await ensureUserProfile(c.user); } catch(e) { console.error("Profile creation failed after successful signup:", e); }
      modal.hidden=true;
      location.replace("index.html");
    }catch(e){
      if(e?.code==="auth/email-already-in-use"){
        showLogin();
        error("This account already exists. Please sign in with your password.");
      } else {
        error(e);
      }
    }
  };

  googleBtn.onclick=async()=>{
    try{
      const r=await signInWithPopup(auth,googleProvider);
      await ensureUserProfile(r.user);
      modal.hidden=true;
      location.replace("index.html");
    }catch(e){error(e)}
  };

  document.getElementById("ty-logout-btn").onclick=()=>signOut(auth);
  showSignup();
}

mountAuthUI();

onAuthStateChanged(auth, async user => {
  const label=document.getElementById("ty-user-label"), login=document.getElementById("ty-login-btn"), logout=document.getElementById("ty-logout-btn");
  if(!label) return;
  if(user){
    label.textContent=user.displayName || user.email || "Signed in";
    login.hidden=true; logout.hidden=false;
    document.querySelector(".ty-auth-links")?.style.setProperty("order","3");
    logout.style.order="4";
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