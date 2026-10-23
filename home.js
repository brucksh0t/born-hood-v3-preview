import './shell.js';
const {gsap,ScrollTrigger}=window;
gsap.registerPlugin(ScrollTrigger);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const overlay=document.querySelector('.drop-overlay');
const hotspots=document.querySelector('.product-hotspots');
overlay.inert=false;hotspots.inert=false;overlay.classList.add('is-active');
document.body.dataset.dropActive='true';
window.dispatchEvent(new CustomEvent('dropvisibility',{detail:true}));
let context;
function setup(){
 context?.revert();
 if(reduced.matches)return;
 context=gsap.context(()=>{
  gsap.fromTo('.collection .product-card',{y:32,opacity:.35},{y:0,opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:'.collection-pieces',start:'top 95%',end:'top 55%',scrub:true}});
  gsap.fromTo('.portal-backdrop',{scale:1.06},{scale:1,ease:'none',scrollTrigger:{trigger:'.portal-runway',start:'top bottom',end:'bottom bottom',scrub:true}});
 });
}
window.addEventListener('showdrop',()=>document.querySelector('#drop-stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth'}));
reduced.addEventListener('change',setup);setup();
document.fonts.ready.then(()=>ScrollTrigger.refresh());
window.addEventListener('pagehide',event=>{if(!event.persisted)context?.revert();});

window.addEventListener('storefront-content',setup);
