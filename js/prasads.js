import { db, ref, onValue } from "./firebase-app.js";

const grid=document.getElementById("prasad-grid");
const status=document.getElementById("prasad-status");

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

onValue(ref(db,"prasads"), snap=>{
  const data=snap.val()||{};
  const items=Object.entries(data).map(([id,v])=>({id,...v})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  status.textContent=items.length ? `${items.length} prasad item(s)` : "No prasad items are available yet.";
  grid.innerHTML=items.map(p=>`
    <article class="ty-card">
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : ""}
      <div class="ty-card-body">
        <h3>${esc(p.name||"Prasad")}</h3>
        <p>${esc(p.description||"Sacred prasad from TirthYatra.")}</p>
        <strong>${p.price!=null ? "₹"+esc(p.price) : "Price on request"}</strong>
        <span class="ty-pill ${p.available===false?"off":""}">${p.available===false?"Unavailable":"Available"}</span>
      </div>
    </article>`).join("");
}, err=>{status.textContent="Unable to load prasads."; console.error(err)});
