import { auth, db, onAuthStateChanged, ref, get, push, set, onValue } from "./firebase-app.js";

const templeSelect=document.getElementById("visit-temple");
const form=document.getElementById("visit-form");
const history=document.getElementById("visit-history");
const status=document.getElementById("visit-status");
let currentUser=null;
let temples={};

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

onValue(ref(db,"temples"),snap=>{
  temples=snap.val()||{};
  templeSelect.innerHTML='<option value="">Select a temple</option>'+Object.entries(temples).map(([id,t])=>`<option value="${esc(id)}">${esc(t.name||id)}${t.city?" — "+esc(t.city):""}</option>`).join("");
});

onAuthStateChanged(auth, user=>{
  currentUser=user;
  if(!user){status.innerHTML='Please <a href="auth.html">sign in</a> to record and view your temple visits.'; form.hidden=true; history.innerHTML=""; return;}
  form.hidden=false; status.textContent="Your visits are private to your account.";
  onValue(ref(db,`templeVisits`),snap=>{
    const all=snap.val()||{};
    const visits=Object.entries(all).map(([id,v])=>({id,...v})).filter(v=>v.userId===user.uid).sort((a,b)=>(b.visitDate||"").localeCompare(a.visitDate||""));
    history.innerHTML=visits.length?visits.map(v=>`<li><strong>${esc(v.templeName||v.templeId)}</strong> — ${esc(v.visitDate||"")}<br><small>Recorded ${new Date(v.createdAt||Date.now()).toLocaleString()}</small></li>`).join(""):"<li>No temple visits recorded yet.</li>";
  });
});

form.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!currentUser){status.textContent="Please sign in first.";return;}
  const templeId=templeSelect.value;
  const visitDate=document.getElementById("visit-date").value;
  if(!templeId||!visitDate)return;
  const id=push(ref(db,"templeVisits")).key;
  await set(ref(db,`templeVisits/${id}`),{
    userId:currentUser.uid,
    templeId,
    templeName:temples[templeId]?.name||templeId,
    visitDate,
    createdAt:Date.now()
  });
  form.reset();
  status.textContent="Temple visit recorded successfully.";
});
