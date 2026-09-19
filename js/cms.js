import { db, collection, query, orderBy, limit, onSnapshot, getDocs } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export function bindCollection({collectionName, targetId, render, max=50}) {
  const target=document.getElementById(targetId); if(!target) return;
  const q=query(collection(db,collectionName),orderBy("createdAt","desc"),limit(max));
  onSnapshot(q, snap=>{target.innerHTML=render(snap.docs.map(d=>({id:d.id,...d.data()})));}, err=>{
    console.warn("Firestore collection unavailable:",collectionName,err);
  });
}
export { esc };

const defaultServices = [
 {title:"Tours & Travels",image:"images/service1.jfif",icon:"linearicons-leaf"},
 {title:"Astrology",image:"images/service1.jfif",icon:"linearicons-leaf"},
 {title:"Ayurveda",image:"images/service2.jpg",icon:"linearicons-pizza"},
 {title:"Panchang",image:"images/service3.jpg",icon:"linearicons-hamburger"},
 {title:"Shop",image:"images/service4.jfif",icon:"linearicons-ice-cream"},
 {title:"Live Pujas",image:"images/service5.jfif",icon:"linearicons-coffee-cup"},
 {title:"Tirth Yatra",image:"images/service6.jpg",icon:"linearicons-steak"}
];
export function bindServices(){
 const target=document.getElementById("dynamic-services"); if(!target)return;
 const render=items=>items.length?items:defaultServices;
 onSnapshot(query(collection(db,"services"),orderBy("createdAt","desc"),limit(50)),snap=>{
   const items=snap.docs.map(d=>({id:d.id,...d.data()}));
   target.innerHTML=render(items).map(s=>`<div class="col-sm-6 col-lg-4"><article class="services-terri"><a href="${esc(s.link||"#")}"><div class="services-terri-figure"><img src="${esc(s.image||"images/service1.jfif")}" alt="${esc(s.title||"Service")}" loading="lazy" width="370" height="278"></div><div class="services-terri-caption"><span class="services-terri-icon ${esc(s.icon||"linearicons-leaf")}"></span><h5 class="services-terri-title">${esc(s.title||"Service")}</h5></div></a></article></div>`).join("");
 },()=>{target.innerHTML=render([]).map(s=>`<div class="col-sm-6 col-lg-4"><article class="services-terri"><a href="${esc(s.link||"#")}"><div class="services-terri-figure"><img src="${esc(s.image||"images/service1.jfif")}" alt="${esc(s.title||"Service")}" loading="lazy" width="370" height="278"></div><div class="services-terri-caption"><span class="services-terri-icon ${esc(s.icon||"linearicons-leaf")}"></span><h5 class="services-terri-title">${esc(s.title||"Service")}</h5></div></a></article></div>`).join("");});
}
