import { db, ref, onValue } from "./firebase/client.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export function bindPrasads(root=document){
 const grid=root.querySelector("#prasad-grid"), status=root.querySelector("#prasad-status"); if(!grid||!status)return;
 return onValue(ref(db,"prasads"),snap=>{const items=Object.entries(snap.val()||{}).map(([id,v])=>({id,...v})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));status.textContent=items.length?`${items.length} prasad item(s)`:"No prasad items are available yet.";grid.innerHTML=items.map(p=>`<article class="ty-card">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:""}<div class="ty-card-body"><h3>${esc(p.name||"Prasad")}</h3><p>${esc(p.description||"Sacred prasad from TirthYatra.")}</p><strong>${p.price!=null?"₹"+esc(p.price):"Price on request"}</strong><span class="ty-pill ${p.available===false?"off":""}">${p.available===false?"Unavailable":"Available"}</span></div></article>`).join("")},err=>{status.textContent="Unable to load prasads.";console.error(err)});
}
