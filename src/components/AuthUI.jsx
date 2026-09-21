import React, { useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, ensureUserProfile } from "../services/firebase/client.js";

export function AuthUI({ inHeader = true }) {
  const [user, setUser] = useState(auth.currentUser);
  const [modal, setModal] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, async nextUser => {
    setUser(nextUser);
    if (nextUser) {
      try { await ensureUserProfile(nextUser); } catch (e) { console.error("Profile sync failed", e); }
      if (location.pathname.endsWith("/auth.html") || location.pathname.endsWith("/auth")) location.replace("index.html");
    }
  }), []);

  const submit = async type => {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
        await ensureUserProfile(credential.user);
      }
      localStorage.setItem("tyFirstVisitCompleted", "1");
      setModal(false); setError("");
      location.replace("index.html");
    } catch (e) {
      if (e?.code === "auth/email-already-in-use") {
        setMode("login"); setError("This account already exists. Please sign in with your password.");
      } else if (e?.code === "auth/user-not-found" || e?.code === "auth/invalid-credential" || e?.code === "auth/invalid-login-credentials") {
        setError("Account not found. Please create an account first.");
      } else if (e?.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else setError(e?.message?.replace("Firebase: ","") || String(e));
    }
  };

  const google = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
      localStorage.setItem("tyFirstVisitCompleted", "1");
      location.replace("index.html");
    } catch (e) { setError(e?.message?.replace("Firebase: ","") || String(e)); }
  };

  const serviceLinks = (
    <div className="ty-auth-service-links">
      <a href="prasads.html" title="Explore Prasads">🪔 Prasads</a>
      <a href="temple-visits.html" title="Explore Temple Visits">🛕 Temple Visits</a>
    </div>
  );

  return <>
    <div className={inHeader ? "ty-auth-bar ty-auth-react" : "ty-auth-bar ty-auth-react ty-auth-standalone"}>
      {user && <button id="ty-logout-btn" type="button" onClick={() => signOut(auth)}>Logout</button>}
      <span className="ty-auth-right"><span id="ty-user-label">{user?.displayName || user?.email || "Guest"}</span>
        {!user && <button id="ty-login-btn" type="button" onClick={() => {setMode("login");setError("");setModal(true)}}>Login</button>}
      </span>
    </div>
    {serviceLinks}
    {modal && <div className="ty-auth-modal" role="dialog" aria-modal="true">
      <div className="ty-auth-card">
        <button className="ty-auth-close" onClick={() => setModal(false)} aria-label="Close">×</button>
        <h3>Sign in to TirthYatra</h3>
        {error && <p className="ty-auth-error">{error}</p>}
        {mode === "signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (for sign up)" />}
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
        <div className="ty-auth-actions">
          {mode === "login" ? <button onClick={()=>submit("login")}>Sign in</button> : <button onClick={()=>submit("signup")}>Create account</button>}
          <button onClick={google}>Continue with Google</button>
        </div>
        <button className="ty-auth-switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>
          {mode==="login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>}
  </>;
}
