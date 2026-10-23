import {catalog,productCard} from './catalog.js';
const draftPreview=new URLSearchParams(location.search).get('studio')==='draft'&&['127.0.0.1','localhost'].includes(location.hostname);
const publishedURL=new URL('./storefront-content.json',import.meta.url);publishedURL.search=new URL(import.meta.url).search;
const contentURL=draftPreview?'/api/studio/content':publishedURL;
export const contentReady=fetch(contentURL,{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('Content unavailable');return response.json();}).then(async result=>{
 if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
 const content=draftPreview?result.draft:result;
 if(content.schemaVersion!==1)return;
 const set=(selector,text)=>{const element=document.querySelector(selector);if(element&&typeof text==='string')element.textContent=text;};
 set('.home-intro h1',content.home.headline);
 set('#collection-title',content.home.collectionTitle);
 set('.home-page .section-heading>p',content.home.collectionDescription);
 set('#portal-title',content.home.collectionIntroTitle);
 set('.portal-copy>p',content.home.collectionIntroDescription);
 set('.hero-copy .hero-line',content.astrology.tagline);
 set('.hero-copy .hero-description',content.astrology.description);
 set('.shop-main .shop-heading h1',content.shop.title);
 set('.shop-main .shop-heading p',content.shop.intro);
 set('.journey-footer>.footer-note',content.footer.note);
 const grid=document.querySelector('.home-page .collection-pieces');
 if(grid&&Array.isArray(content.home.featuredProductIds)){
  const products=content.home.featuredProductIds.map(id=>catalog.find(product=>product.id===id)).filter(Boolean);
  if(products.length)grid.innerHTML=products.map(productCard).join('');
 }
 if(draftPreview){
  const notice=document.createElement('aside');notice.className='draft-preview-notice';
  const label=document.createElement('span');label.textContent='Saved draft preview / not published';
  const link=document.createElement('a');link.href='/studio/';link.textContent='Back to editor';notice.append(label,link);document.body.append(notice);
  document.addEventListener('click',event=>{
   const anchor=event.target.closest('a[href]');if(!anchor)return;
   const url=new URL(anchor.href,location.href);
   if(url.origin===location.origin&&url.pathname.endsWith('.html')){url.searchParams.set('studio','draft');anchor.href=url.href;}
  },{capture:true});
 }
 window.dispatchEvent(new Event('storefront-content'));
 return content;
}).catch(()=>null);

