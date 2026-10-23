import {mountBag} from './bag.js';
import {catalog,escapeHTML as e} from './catalog.js';
const isHome=location.pathname==='/'||location.pathname.endsWith('/index.html');
const isAstro=location.pathname.endsWith('/astrology.html'),isMusic=location.pathname.endsWith('/music.html');
let shell=document.querySelector('#site-shell');
if(!shell){shell=document.createElement('div');shell.id='site-shell';document.body.prepend(shell);}
const collections=[...new Map(catalog.map(product=>[product.collectionId,product.collection])).entries()];
const categoryLinks=[['All products','shop.html'],['Hoodies','shop.html?category=hoodies'],['T-shirts','shop.html?category=tees'],['Headwear','shop.html?category=headwear'],['Sweatshirts','shop.html?category=sweatshirts'],['Kids','shop.html?category=kids'],['States','shop.html?collection=states']];
const featured=['crown-227','astro-ringspun-tee'].map(id=>catalog.find(product=>product.id===id)).filter(Boolean);
shell.innerHTML=`<header class="journey-header"><a class="journey-brand" href="index.html" aria-label="Born Hood home"><img src="assets/store-logo.jpg" alt="Born Hood" width="1300" height="1300"><span class="brand-name">BORN HOOD</span></a><nav aria-label="Main navigation"><a href="${isHome?'#drop':'index.html#drop'}">The drop</a><button class="mega-trigger" id="shop-menu-toggle" type="button" aria-expanded="false" aria-controls="shop-mega-menu">Shop <span aria-hidden="true">⌄</span></button><a href="astrology.html" ${isAstro?'aria-current="page"':''}>Astrology</a><a href="music.html" ${isMusic?'aria-current="page"':''}>Music</a><a class="nav-support" href="mailto:bornhoodclothing@yahoo.com">Support</a></nav><a id="open-bag" class="journey-bag" href="bag.html" ${location.pathname.endsWith('/bag.html')?'aria-current="page"':''}>Cart <span id="bag-count">0</span></a><section class="mega-panel" id="shop-mega-menu" aria-label="Shop Born Hood" hidden><div class="mega-top"><span>Explore Born Hood</span><button id="close-shop-menu" type="button" aria-label="Close shop menu">Close ×</button></div><div class="mega-grid"><div class="mega-link-column"><h2>Shop by category</h2>${categoryLinks.map(([name,url])=>`<a href="${url}">${name}</a>`).join('')}</div><div class="mega-link-column"><h2>Collections</h2>${collections.map(([id,name])=>`<a href="${id==='astrology'?'astrology.html':'shop.html?collection='+encodeURIComponent(id)}">${e(name)}</a>`).join('')}</div><div class="mega-link-column"><h2>Born Hood</h2><a href="music.html">Music</a><a href="shop.html?collection=states">All 50 states</a><a href="mailto:bornhoodclothing@yahoo.com">Support</a></div><div class="mega-featured">${featured.map(product=>`<a class="mega-product" href="product.html?id=${encodeURIComponent(product.id)}"><img src="${e(product.image)}" alt="${e(product.name)}" width="800" height="800"><span>${e(product.collection)}</span><strong>${e(product.name)} <b aria-hidden="true">↗</b></strong></a>`).join('')}</div></div><a class="mega-all" href="shop.html">View all products <span aria-hidden="true">→</span></a></section></header>`;
const trigger=document.querySelector('#shop-menu-toggle'),panel=document.querySelector('#shop-mega-menu');
function setMenu(open,{restoreFocus=false}={}){
 panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
 document.body.classList.toggle('shop-menu-open',open);
 if(restoreFocus)trigger.focus({preventScroll:true});
}
trigger.addEventListener('click',()=>setMenu(panel.hidden));
trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();setMenu(true);panel.querySelector('a')?.focus();}});
document.querySelector('#close-shop-menu').addEventListener('click',()=>setMenu(false,{restoreFocus:true}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){setMenu(false,{restoreFocus:true});event.preventDefault();}});
document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!event.target.closest('.journey-header'))setMenu(false);});
document.addEventListener('focusin',event=>{if(!panel.hidden&&!event.target.closest('.journey-header'))setMenu(false);});
panel.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
export const bagUI=mountBag();

const collectionMotion=document.querySelector('.astro-header .motion-control');
if(collectionMotion){document.body.append(collectionMotion);collectionMotion.classList.add('collection-motion');}
const footerHTML='<a href="index.html" aria-label="Born Hood home"><img src="assets/store-logo.jpg" alt="Born Hood" width="1300" height="1300" loading="lazy"></a><nav aria-label="Footer navigation"><a href="index.html#drop">The drop</a><a href="shop.html">Shop</a><a href="astrology.html">Astrology</a><a href="music.html">Music</a><a href="shop.html?collection=states">States</a></nav><div class="footer-support"><span>Orders, sizing &amp; support</span><a href="mailto:bornhoodclothing@yahoo.com">bornhoodclothing@yahoo.com</a></div><span class="footer-note">Born Hood / Independent expression</span><a href="#top" class="footer-top">Back to the top ↑</a>';
for(const footer of document.querySelectorAll('.astro-footer,.journey-footer')){footer.className='journey-footer';footer.innerHTML=footerHTML;}


import './site-content.js';
