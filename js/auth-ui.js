import { auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, ensureUserProfile, ref, get, update } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function mountAuthUI() {
  if (document.getElementById("ty-auth-ui")) return;
  const wrap = document.createElement("div");
  wrap.id = "ty-auth-ui";
  wrap.innerHTML = `
    <style>
      .ty-auth-bar{position:fixed;top:14px;right:18px;z-index:10000;display:flex;align-items:center;gap:7px;padding:6px;background:rgba(255,250,242,.94);backdrop-filter:blur(10px);border:1px solid #eadbc8;border-radius:16px;box-shadow:0 8px 28px rgba(74,40,12,.18);font:13px system-ui;transition:.25s ease}
      .ty-auth-right{display:flex;align-items:center;gap:5px}
      .ty-auth-user{display:flex;align-items:center;gap:5px}
      .ty-auth-service-links{position:fixed;top:14px;left:18px;z-index:10001;display:flex;align-items:center;gap:6px;padding:6px;background:rgba(255,250,242,.94);backdrop-filter:blur(10px);border:1px solid #eadbc8;border-radius:16px;box-shadow:0 8px 28px rgba(74,40,12,.18)}
      .ty-auth-service-links[hidden]{display:none!important}.ty-auth-service-links a{display:inline-flex;align-items:center;gap:5px;border:1px solid #eadbc8;border-radius:11px;padding:7px 10px;background:#fff;color:#713b19;text-decoration:none;font:650 13px system-ui;transition:transform .2s ease,box-shadow .2s ease,background .2s ease,color .2s ease}
      .ty-auth-service-links a:hover{transform:translateY(-2px);box-shadow:0 5px 14px rgba(113,59,25,.16);background:#fff3df;color:#9b4b18}
      .ty-auth-service-links a:first-of-type:before{content:"🪔";font-size:14px}
      .ty-auth-service-links a:nth-of-type(2):before{content:"🛕";font-size:14px}
      #ty-user-label{padding:7px 10px;border-radius:11px;background:linear-gradient(135deg,#fff1d6,#ffe5bd);color:#713b19;font-weight:750;white-space:nowrap}
      #ty-login-btn{border:1px solid #c76a25;border-radius:11px;padding:7px 10px;background:linear-gradient(135deg,#c76a25,#9e4617);color:#fff;font-weight:650;cursor:pointer}
      #ty-login-btn:hover{background:linear-gradient(135deg,#d97a31,#a9501d);color:#fff;transform:translateY(-2px)}
      #ty-logout-btn{order:1;border:1px solid #eadbc8;border-radius:11px;padding:7px 10px;background:#fff;color:#713b19;font-weight:650;cursor:pointer;transition:.2s}
      #ty-logout-btn:hover{transform:translateY(-2px);background:#fff3df}
      @media(max-width:600px){.ty-auth-bar{top:8px;right:8px;left:auto;border-radius:14px}.ty-auth-service-links{top:8px;left:8px;right:auto;gap:3px;padding:5px;border-radius:14px}.ty-auth-service-links a{padding:6px 8px;font-size:11px}.ty-auth-right{flex-wrap:wrap;justify-content:flex-end}.ty-auth-right a,.ty-auth-right button,#ty-logout-btn,#ty-user-label{padding:6px 8px;font-size:11px}}
    </style>
    <div class="ty-auth-service-links">
      <a href="prasads.html" title="Explore Prasads">Prasads</a>
      <a href="temple-visits.html" title="Explore Temple Visits">Temple Visits</a>
    </div>
    <div class="ty-auth-bar">
      <button id="ty-logout-btn" type="button" hidden>Logout</button>
      <span class="ty-auth-right"><span class="ty-auth-user"><span id="ty-user-label">Guest</span>
      <button id="ty-login-btn" type="button">Login</button></span></span>
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
  const serviceLinks = wrap.querySelector(".ty-auth-service-links");
  if (serviceLinks && target.id === "auth-form-slot") document.body.appendChild(serviceLinks);

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
      localStorage.setItem("tyFirstVisitCompleted","1");
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
      localStorage.setItem("tyFirstVisitCompleted","1");
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
      localStorage.setItem("tyFirstVisitCompleted","1");
      location.replace("index.html");
    }catch(e){error(e)}
  };

  document.getElementById("ty-logout-btn").onclick=()=>signOut(auth);
  showLogin();
}

mountAuthUI();

onAuthStateChanged(auth, async user => {
  const label=document.getElementById("ty-user-label"), login=document.getElementById("ty-login-btn"), logout=document.getElementById("ty-logout-btn");
  if(!label) return;
  const serviceLinks=document.querySelector(".ty-auth-service-links");
  if(user){
    if(serviceLinks) serviceLinks.hidden=false;
    label.textContent=user.displayName || user.email || "Signed in";
    login.hidden=true; logout.hidden=false;
    document.querySelector(".ty-auth-right")?.style.setProperty("order","2");
    logout.style.order="1";
try { await ensureUserProfile(user); } catch(e) { console.error("Profile sync failed",e); }
    if (location.pathname.endsWith("/auth.html") || location.pathname.endsWith("/auth")) location.replace("index.html");
  } else {
    if(serviceLinks) serviceLinks.hidden=true;
    label.textContent="Guest"; login.hidden=false; logout.hidden=true;
  }
});