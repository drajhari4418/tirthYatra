import { db, ref, onValue } from "./firebase-app.js";

const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

export function bindCollection({collectionName, targetId, render, max=50}) {
  const target = document.getElementById(targetId);
  if (!target) return;
  onValue(ref(db, collectionName), snap => {
    const value = snap.val() || {};
    const items = Object.entries(value).map(([id,data]) => ({id,...(data||{})}))
      .sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0)).slice(0,max);
    target.innerHTML = render(items);
  }, err => console.warn("Realtime Database path unavailable:", collectionName, err));
}
export { esc };

const defaultServices = [
 {title:"Tours & Travels",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Pushkar%20India%2001.jpg",icon:"linearicons-map2",link:"#"},
 {title:"Astrology",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Jyotish%20chart.jpg",icon:"linearicons-star",link:"#"},
 {title:"Ayurveda",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Mentha%20spicata%20Jammu%20India.jpg",icon:"linearicons-heart",link:"#"},
 {title:"Panchang",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Hindu%20calendar.jpg",icon:"linearicons-calendar-full",link:"#"},
 {title:"Shop",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Abadha%20and%20Prasada%20in%20earthen%20pots%20in%20Ananta%20Basudeba%20Temple%2C%20Bhubaneswar.jpg",icon:"linearicons-cart",link:"prasads.html"},
 {title:"Live Pujas",image:"https://commons.wikimedia.org/wiki/Special:FilePath/Pooja%20%28worship%29in%20Hindu%20culture%20in%20India.%2001.jpg",icon:"linearicons-camera",link:"temple-visits.html"}
];

const serviceImageMap = Object.fromEntries(defaultServices.map(s => [s.title.toLowerCase(), s.image]));
const serviceLinkMap = {
  "shop":"prasads.html",
  "live pujas":"temple-visits.html"
};

const normalizeService = s => {
  const title = String(s.title || "").trim();
  const key = title.toLowerCase();
  if (key === "tirth yatra") return null;
  const fallback = defaultServices.find(x => x.title.toLowerCase() === key);
  return {
    ...s,
    title: fallback?.title || title,
    image: fallback?.image || s.image || "images/service1.jfif",
    link: serviceLinkMap[key] || s.link || fallback?.link || "#"
  };
};

const renderServices = items => (items.length ? items : defaultServices).map(normalizeService).filter(Boolean).map(s =>
  `<div class="col-sm-6 col-lg-4"><article class="services-terri"><a href="${esc(s.link||"#")}"><div class="services-terri-figure"><img src="${esc(s.image||"images/service1.jfif")}" alt="${esc(s.title||"Service")}" loading="lazy" width="370" height="278"></div><div class="services-terri-caption"><span class="services-terri-icon ${esc(s.icon||"linearicons-leaf")}"></span><h5 class="services-terri-title">${esc(s.title||"Service")}</h5></div></a></article></div>`
).join("");

export function bindServices() {
  const target = document.getElementById("dynamic-services");
  if (!target) return;
  onValue(ref(db, "services"), snap => {
    const value = snap.val() || {};
    const items = Object.entries(value).map(([id,data]) => ({id,...(data||{})}))
      .sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0)).slice(0,50);
    target.innerHTML = renderServices(items);
  }, () => { target.innerHTML = renderServices([]); });
}
