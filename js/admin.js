import { auth, db, onAuthStateChanged, ensureUserProfile, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "./firebase-app.js";
const status=document.getElementById("admin-status"), panel=document.getElementById("admin-panel");
onAuthStateChanged(auth,async user=>{
 if(!user){status.textContent="Please sign in first.";return;}
 const p=await ensureUserProfile(user);
 if(p?.role!=="admin"){status.textContent="This account is not an administrator.";return;}
 status.textContent="Administrator access granted.";panel.hidden=false;load();
});
async function load(){const s=await getDocs(collection(db,"content"));document.getElementById("admin-list").innerHTML=s.docs.map(d=>`<article style="padding:12px;border-bottom:1px solid #ddd"><strong>${d.id}</strong><div>${d.data().title||""}</div></article>`).join("")||"<p>No content yet.</p>";}
document.getElementById("content-form").addEventListener("submit",async e=>{
 e.preventDefault(); const id=document.getElementById("content-id").value.trim()||crypto.randomUUID();
 await setDoc(doc(db,"content",id),{title:document.getElementById("content-title").value.trim(),body:document.getElementById("content-body").value,image:document.getElementById("content-image").value.trim(),updatedAt:serverTimestamp(),createdAt:serverTimestamp()},{merge:true});
 e.target.reset(); await load();
});
