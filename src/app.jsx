import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

export function Header(){
  return <header className="ty-react-header">
    <div className="ty-react-header-inner">
      <a className="ty-react-brand" href="index.html" aria-label="TirthYatra home"><span className="ty-react-om">ॐ</span><span>TirthYatra</span></a>
      <nav className="ty-react-nav" aria-label="Primary navigation">
        <a href="index.html#packages">Packages</a>
        <a href="index.html#services">Services</a>
        <a href="about-us.html">About us</a>
        <a href="index.html#contact">Contact</a>
      </nav>
      <button className="ty-react-menu" type="button" aria-label="Toggle navigation">☰</button>
    </div>
  </header>;
}

function loadScript(src, isModule){
  return new Promise((resolve)=>{
    const old=[...document.querySelectorAll('script[data-ty-legacy]')];
    old.forEach(s=>s.remove());
    const s=document.createElement("script");
    s.src=src + (src.includes("?")?"&":"?") + "tyReact="+Date.now();
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
    document.body.className="";
    const root=document.documentElement;
    root.classList.add("ty-react-app");
    const host=document.getElementById("legacy-content");
    if(host){
      host.innerHTML=page.html;
      page.scripts.reduce((p,s)=>p.then(()=>loadScript(s.src,s.module)),Promise.resolve());
    }
    return ()=>{ document.querySelectorAll('script[data-ty-legacy]').forEach(s=>s.remove()); };
  },[page]);
  return <><Header/><style dangerouslySetInnerHTML={{__html:page.styles}}/><main id="legacy-content" className="ty-react-legacy" /></>;
}

export function mount(page){
  const root=createRoot(document.getElementById("root"));
  root.render(<LegacyPage page={page}/>);
}
