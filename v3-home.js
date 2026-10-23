// Gunfire key-art hero: poster first, video only when motion and data allow.
const video=document.querySelector('.intro-video');
if(video){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),conn=navigator.connection,saveData=conn&&(conn.saveData||/2g/.test(conn.effectiveType||''));
 const mobile=matchMedia('(max-width: 700px)').matches,base='assets/v3/hero'+(mobile?'-m':'');
 let loaded=false;
 const load=()=>{if(loaded)return;loaded=true;for(const [ext,type] of [['webm','video/webm'],['mp4','video/mp4']]){const s=document.createElement('source');s.src=base+'.'+ext;s.type=type;video.append(s);}video.load();video.addEventListener('canplay',()=>video.classList.add('is-ready'),{once:true});};
 const sync=visible=>{if(reduced.matches||saveData||document.hidden){video.pause();return;}if(visible){load();video.play().catch(()=>{});}else video.pause();};
 let visible=true;
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync(visible);},{threshold:.05}).observe(video.closest('.home-intro'));
 document.addEventListener('visibilitychange',()=>sync(visible));
 reduced.addEventListener('change',()=>sync(visible));
}
