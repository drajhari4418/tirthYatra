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
