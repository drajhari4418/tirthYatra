import { auth, db, onAuthStateChanged, ensureUserProfile, ref, push, set, onValue } from "./firebase/client.js";

const status=host.querySelector("admin-status"), panel=host.querySelector("admin-panel");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

onAuthStateChanged(auth, async user=>{
  if(!user){status.textContent="Please sign in first.";return;}
  try{
    const p=await ensureUserProfile(user);
    if(p?.role!=="admin"){status.textContent="This account is not an administrator.";return;}
    status.textContent="Administrator access granted."; panel.hidden=false; bindRealtime();
  }catch(err){console.error(err);status.textContent="Unable to verify administrator access."}
});

function bindRealtime(){
  onValue(ref(db,"prasads"),snap=>{
    const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v}));
    host.querySelector("prasad-list").innerHTML=items.length?items.map(x=>`<div class="ty-item"><strong>${esc(x.name)}</strong> — ₹${esc(x.price??"")} <small>(${x.available===false?"unavailable":"available"})</small></div>`).join(""):"<p>No prasads.</p>";
  });
  onValue(ref(db,"temples"),snap=>{
    const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v}));
    host.querySelector("temple-list").innerHTML=items.length?items.map(x=>`<div class="ty-item"><strong>${esc(x.name)}</strong> <small>${esc(x.city||"")}</small></div>`).join(""):"<p>No temples.</p>";
  });
  onValue(ref(db,"content"),snap=>{
    const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v}));
    host.querySelector("admin-list").innerHTML=items.length?items.map(x=>`<div class="ty-item"><strong>${esc(x.title||x.id)}</strong></div>`).join(""):"<p>No content yet.</p>";
  });
  onValue(ref(db,"templeVisits"),snap=>{
    const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    host.querySelector("visit-list").innerHTML=items.length?items.map(x=>`<div class="ty-item"><strong>${esc(x.templeName||x.templeId)}</strong> — ${esc(x.visitDate||"")}<br><small>User: ${esc(x.userId)}</small></div>`).join(""):"<p>No visits yet.</p>";
  });
  onValue(ref(db,"users"),snap=>{
    const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v})).sort((a,b)=>(b.lastLoginAt||0)-(a.lastLoginAt||0));
    host.querySelector("user-list").innerHTML=items.length?items.map(x=>`<div class="ty-item"><strong>${esc(x.name||"Unnamed")}</strong> — ${esc(x.email||"")} <small>[${esc(x.role||"user")}, ${esc(x.provider||"unknown")}]<br>UID: ${esc(x.uid||x.id)}</small></div>`).join(""):"<p>No user records.</p>";
  });
}

host.querySelector("prasad-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=host.querySelector("prasad-id").value.trim();
  const r=id?ref(db,"prasads/"+id):push(ref(db,"prasads"));
  await set(r,{name:host.querySelector("prasad-name").value.trim(),description:host.querySelector("prasad-description").value.trim(),price:Number(host.querySelector("prasad-price").value||0),image:host.querySelector("prasad-image").value.trim(),available:host.querySelector("prasad-available").checked,updatedAt:Date.now(),createdAt:Date.now()});
  e.target.reset(); host.querySelector("prasad-available").checked=true;
});
host.querySelector("temple-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=host.querySelector("temple-id").value.trim();
  const r=id?ref(db,"temples/"+id):push(ref(db,"temples"));
  await set(r,{name:host.querySelector("temple-name").value.trim(),city:host.querySelector("temple-city").value.trim(),state:host.querySelector("temple-state").value.trim(),description:host.querySelector("temple-description").value.trim(),image:host.querySelector("temple-image").value.trim(),updatedAt:Date.now(),createdAt:Date.now()});
  e.target.reset();
});
host.querySelector("content-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=host.querySelector("content-id").value.trim();
  const r=id?ref(db,"content/"+id):push(ref(db,"content"));
  await set(r,{title:host.querySelector("content-title").value.trim(),body:host.querySelector("content-body").value,image:host.querySelector("content-image").value.trim(),updatedAt:Date.now(),createdAt:Date.now()});
  e.target.reset();
});

}
