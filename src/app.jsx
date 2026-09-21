import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { AuthUI } from "./components/AuthUI.jsx";
import { auth, onAuthStateChanged } from "./services/firebase/client.js";
import { bindServices } from "./services/cms.js";
import { bindContactForms } from "./services/contact.js";
import { bindPrasads } from "./services/prasads.js";
import { bindTempleVisits } from "./services/templeVisits.js";
import { bindRatings } from "./services/ratings.js";
import { bindAdmin } from "./services/admin.js";

export function Header(){
  const [open,setOpen]=useState(false);
  return <header className="ty-react-header">
    <div className="ty-react-header-inner">
      <a className="ty-react-brand" href="index.html" aria-label="TirthYatra home"><span className="ty-react-om">ॐ</span><span>TirthYatra</span></a>
      <nav className={`ty-react-nav${open?" is-open":""}`} aria-label="Primary navigation">
        <a href="index.html#packages" onClick={()=>setOpen(false)}>Packages</a>
        <a href="index.html#services" onClick={()=>setOpen(false)}>Services</a>
        <a href="about-us.html" onClick={()=>setOpen(false)}>About us</a>
        <a href="index.html#contact" onClick={()=>setOpen(false)}>Contact</a>
      </nav>
      <div className="ty-auth-slot" aria-live="polite"><AuthUI inHeader /></div>
      <button className="ty-react-menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button>
    </div>
  </header>;
}

function bindPageBehavior(page, host){
  const cleanups=[];
  if(page.title==="Home"){
    const authCleanup=onAuthStateChanged(auth,user=>{if(!user) location.replace("auth.html")});
    cleanups.push(authCleanup);
    cleanups.push(bindServices(host));
    cleanups.push(bindContactForms(host));
    cleanups.push(bindRatings(host));
  }
  if(page.title==="About us" || page.title==="Contacts" || page.title==="Typography") cleanups.push(bindContactForms(host));
  if(page.title==="Prasads") cleanups.push(bindPrasads(host));
  if(page.title==="Temple Visits") cleanups.push(bindTempleVisits(host));
  if(page.title==="TirthYatra — Admin") cleanups.push(bindAdmin(host));
  return ()=>cleanups.forEach(fn=>typeof fn==="function"&&fn());
}

function loadScript(src,isModule){
  return new Promise(resolve=>{const s=document.createElement("script");s.src=src;if(isModule)s.type="module";s.dataset.tyLegacy="1";s.onload=resolve;s.onerror=resolve;document.body.appendChild(s)});
}
const idle=fn=>{"requestIdleCallback"in window?window.requestIdleCallback(fn,{timeout:1200}):window.setTimeout(fn,150)};

export function LegacyPage({page}){
  const isAuthPage=page.title==="TirthYatra — Welcome";
  useEffect(()=>{
    document.title=page.title;
    const host=document.getElementById("legacy-content");
    if(host) host.innerHTML=page.html;
    if(!host)return;
    const cleanupBehavior=bindPageBehavior(page,host);
    let cancelled=false;
    const scripts=page.scripts||[];
    const heavy=scripts.filter(s=>["core.min.js","script.js","header-scroll.js"].some(name=>s.src.endsWith(name)));
    const immediate=scripts.filter(s=>!heavy.includes(s));
    const start=async()=>{if(cancelled)return;for(const s of immediate){if(cancelled)return;await loadScript(s.src,s.module)}if(cancelled)return;window.dispatchEvent(new Event("load"));idle(async()=>{if(cancelled)return;for(const s of heavy){if(cancelled)return;await loadScript(s.src,s.module)}if(!cancelled)window.dispatchEvent(new Event("load"))})};
    requestAnimationFrame(start);
    return()=>{cancelled=true;cleanupBehavior();document.querySelectorAll("script[data-ty-legacy]").forEach(s=>s.remove())};
  },[page]);
  return <>{!isAuthPage&&<Header/>}{isAuthPage&&<AuthUI inHeader={false}/>}<style dangerouslySetInnerHTML={{__html:page.styles}}/><main id="legacy-content" className={`ty-react-legacy${isAuthPage?" ty-react-auth-page":""}`} /></>;
}
export function mount(page){createRoot(document.getElementById("root")).render(<LegacyPage page={page}/>);}
