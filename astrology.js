import {catalog,productCard,isAvailable} from './catalog.js';
import {makeTitleCanvas} from './title-texture.js';
import {readMotionPaused,saveMotionPaused} from './motion-preference.js';
import { AstrologyScene } from './astrology-scene.js';
import { attachScrollVideo } from './scroll-video.js';
const {gsap,ScrollTrigger}=window;
gsap.registerPlugin(ScrollTrigger);
const $=selector=>document.querySelector(selector);
const video=$('#celestial-film');
$('#astrology-products').innerHTML=catalog.filter(product=>product.collection==='Astrology').sort((a,b)=>Number(isAvailable(b))-Number(isAvailable(a))).map(productCard).join('');
const videoScrub=attachScrollVideo(video);
const filmScene=new AstrologyScene($('#celestial-canvas'),{mode:'film',drawTitle:false});
const chromeImage=new Image();
chromeImage.onload=()=>{
 const heading=document.querySelector('.hero-copy h1');
 try{
  const canvas=makeTitleCanvas(chromeImage);canvas.className='chrome-title-art';canvas.setAttribute('aria-hidden','true');
  heading.innerHTML='<span class="chrome-title-label">Astrology</span>';heading.append(canvas);heading.classList.add('chrome-ready');
 }catch{/* Keep the readable text heading if the image cannot be processed. */}
};
chromeImage.src='assets/astrology/chrome-title.jpg';
const orbitScene=new AstrologyScene($('#orbit-canvas'),{mode:'orbit'});
const signs=[
 ['Aries','♈','Fire / The spark'],['Taurus','♉','Earth / The foundation'],['Gemini','♊','Air / The connection'],['Cancer','♋','Water / The feeling'],['Leo','♌','Fire / The presence'],['Virgo','♍','Earth / The detail'],['Libra','♎','Air / The balance'],['Scorpio','♏','Water / The depth'],['Sagittarius','♐','Fire / The journey'],['Capricorn','♑','Earth / The ambition'],['Aquarius','♒','Air / The vision'],['Pisces','♓','Water / The imagination'],
];
$('.sign-selector').innerHTML=signs.map(([name,glyph],i)=>`<button type="button" data-sign="${i}" aria-label="Explore ${name}" aria-pressed="${i===0}"><span aria-hidden="true">${glyph}</span><b>${name}</b></button>`).join('');
const signButtons=[...document.querySelectorAll('[data-sign]')];
function selectSign(index){
 const [name,glyph,element]=signs[index];$('#sign-name').textContent=name;$('#sign-glyph').textContent=glyph;$('#sign-element').textContent=element;
 signButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));orbitScene.selectSign(index);$('#orbit-canvas').dataset.sign=name;
}
signButtons.forEach((button,index)=>{
 button.addEventListener('click',()=>selectSign(index));
 button.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?11:(index+(event.key==='ArrowRight'?1:11))%12;selectSign(next);signButtons[next].focus({preventScroll:true});
 });
});
selectSign(0);
const hero=$('.hero-copy'),chapterOne=$('.chapter-one'),chapterTwo=$('.chapter-two');
const narrative=gsap.timeline({paused:true});
narrative.to(hero,{autoAlpha:0,y:-35,duration:.14,ease:'none'},.12)
 .fromTo(chapterOne,{autoAlpha:0,y:35},{autoAlpha:1,y:0,duration:.13,ease:'none'},.28)
 .to(chapterOne,{autoAlpha:0,y:-25,duration:.1,ease:'none'},.57)
 .fromTo(chapterTwo,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.12,ease:'none'},.68)
 .to(chapterTwo,{autoAlpha:0,y:-20,duration:.07,ease:'none'},.93);
let paused=readMotionPaused(),filmProgress=0; filmScene.setPaused(paused);orbitScene.setPaused(paused);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function updateFilm(progress){
 filmProgress=progress;
 if(paused||reduced.matches)return;
 videoScrub.update(progress);filmScene.setProgress(progress);narrative.progress(progress);
 hero.inert=progress>.25;chapterOne.inert=progress<.28||progress>.67;chapterTwo.inert=progress<.68;
 chapterOne.classList.toggle('is-current',progress>=.28&&progress<=.67);chapterTwo.classList.toggle('is-current',progress>=.68);
 $('.progress-track i').style.width=`${progress*100}%`;$('#chapter-current').textContent=progress<.28?'01':progress<.68?'02':'03';
 $('.film-stage').dataset.progress=progress.toFixed(3);
}
let triggers=[],motionContext;
function setupMotion(){
 motionContext?.revert();triggers=[];
 document.body.classList.toggle('is-still',reduced.matches);
 filmScene.setReduced(reduced.matches);orbitScene.setReduced(reduced.matches);
 const button=$('.motion-control');button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(paused||reduced.matches));button.setAttribute('aria-label',reduced.matches?'Reduced motion enabled':paused?'Play motion':'Pause motion');
 if(reduced.matches){narrative.progress(0);hero.inert=false;video.pause();filmScene.setProgress(0);return;}
 motionContext=gsap.context(()=>{
 triggers.push(ScrollTrigger.create({trigger:$('.film-runway'),start:'top top',end:'bottom bottom',onUpdate:self=>updateFilm(self.progress)}));
 triggers.push(ScrollTrigger.create({trigger:$('.orbit-runway'),start:'top top',end:'bottom bottom',onUpdate:self=>{if(!paused)orbitScene.setProgress(self.progress);}}));
 gsap.fromTo('.meaning-strip>div',{y:22,opacity:0},{y:0,opacity:1,duration:.7,stagger:.1,scrollTrigger:{trigger:'.meaning-strip',start:'top 90%',toggleActions:'play none none reverse'}});
 gsap.fromTo('.orbit-head',{y:35,opacity:0},{y:0,opacity:1,duration:.8,scrollTrigger:{trigger:'.orbit-runway',start:'top 85%',toggleActions:'play none none reverse'}});
 gsap.fromTo('.closing h2',{y:35,opacity:0},{y:0,opacity:1,duration:1,scrollTrigger:{trigger:'.closing',start:'top 80%',toggleActions:'play none none reverse'}});
 gsap.fromTo('.product-card',{y:100,rotationX:12,opacity:0},{y:0,rotationX:0,opacity:1,stagger:.13,ease:'power2.out',scrollTrigger:{trigger:'.product-grid',start:'top 90%',end:'top 38%',scrub:.7}}); updateFilm(triggers[0].progress);ScrollTrigger.refresh();
 });
}
$('.motion-control').addEventListener('click',()=>{
 paused=!paused;saveMotionPaused(paused);filmScene.setPaused(paused);orbitScene.setPaused(paused);
 $('.motion-control').setAttribute('aria-pressed',String(paused));$('.motion-control').setAttribute('aria-label',paused?'Play motion':'Pause motion');
 $('.motion-control').innerHTML=paused?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 10 7-10 7Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v12M14 4v12"/></svg>';
 if(!paused)updateFilm(filmProgress);
});
reduced.addEventListener('change',setupMotion);
setupMotion();
// Story navigation lands at the relevant chapter inside the scroll runway.
document.querySelectorAll('a[href="#story"]').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 const target=reduced.matches?0:$('.film-runway').offsetTop+($('.film-runway').offsetHeight-innerHeight)*.42;
 scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
}));
$('.orbit-foot>span').textContent='A different perspective. Every sign.';
window.addEventListener('pagehide',event=>{if(!event.persisted){motionContext?.revert();filmScene.dispose();orbitScene.dispose();videoScrub.destroy();}});



if(paused){const toggle=document.querySelector('.motion-control');toggle.setAttribute('aria-pressed','true');toggle.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 10 7-10 7Z"/></svg>';}




document.fonts.ready.then(()=>ScrollTrigger.refresh());

