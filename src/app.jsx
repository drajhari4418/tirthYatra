import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

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
      <button className="ty-react-menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button>
    </div>
  </header>;
}

function loadScript(src,isModule){
  return new Promise(resolve=>{
    const s=document.createElement("script");
    s.src=src+(src.includes("?")?"&":"?")+"tyReact="+Date.now();
    if(isModule) s.type="module";
    s.dataset.tyLegacy="1";
    s.onload=()=>resolve();
    s.onerror=()=>resolve();
    document.body.appendChild(s);
  });
}

export function LegacyPage({page}){
  useEffect(()=>{
    document.title=page.title;
    const host=document.getElementById("legacy-content");
    if(host) host.innerHTML=page.html;
    let cancelled=false;
    (async()=>{
      for(const s of page.scripts){
        if(cancelled) return;
        await loadScript(s.src,s.module);
      }
      if(!cancelled) window.dispatchEvent(new Event("load"));
    })();
    return ()=>{cancelled=true;document.querySelectorAll("script[data-ty-legacy]").forEach(s=>s.remove());};
  },[page]);
  return <><Header/><style dangerouslySetInnerHTML={{__html:page.styles}}/><main id="legacy-content" className="ty-react-legacy" /></>;
}

export function mount(page){
  createRoot(document.getElementById("root")).render(<LegacyPage page={page}/>);
}
