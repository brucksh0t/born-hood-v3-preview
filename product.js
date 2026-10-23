import './shell.js';
import {addToBag,replaceBagLine,getSavedBagSummary} from './bag.js';
import {catalog,money,getProduct,getVariant,isAvailable,escapeHTML as e,productCard} from './catalog.js';
const $=selector=>document.querySelector(selector);
const query=new URLSearchParams(location.search),product=getProduct(query.get('id'));
if(!product){
 document.title='Piece not found — Born Hood';
 $('#product-main').innerHTML='<section class="closing missing-piece"><span class="eyebrow">Born Hood</span><h1>This piece is out of orbit.</h1><p>Explore the collection to find your next expression.</p><a class="button button-red" href="astrology.html#pieces">Back to Astrology</a></section>';
}else{
 document.title=product.name+' — Born Hood';$('#crumb-name').textContent=product.name;$('#product-title').textContent=product.name;$('#product-type').textContent=product.type;
 const astrology=product.collection==='Astrology',brand=astrology?'Born Hood Astrology':'Born Hood';
 $('#product-collection-label').textContent=astrology?'Born Hood / Astrology':'Born Hood / The collection';
 $('#product-collection-heading').textContent=product.collection+(product.sign?' / '+product.sign:'');
 $('#breadcrumb-collection').textContent=product.collection;$('#breadcrumb-collection').href=product.collectionUrl;
 $('#product-collection-link').href=product.collectionUrl;
 $('#product-collection-link').textContent=astrology?'Enter the collection →':'Explore Born Hood →';
 $('#product-story').textContent=astrology?'Your sign. Your expression. Celestial symbolism meets your everyday rotation in Born Hood’s Astrology collection.':'The Born Hood name. An expression of where you come from, and the world you carry with you.';
 $('#collection-description').textContent=astrology?'Astrology is a story of identity, fate, and personal expression. Explore the cinematic collection and find your orbit.':'Rooted in the streets. Worn your own way. Explore the Born Hood collection of everyday pieces.';
 $('#product-details').innerHTML=product.details.map(detail=>'<li>'+e(detail)+'</li>').join('');
 const editing=getSavedBagSummary().lines.find(line=>line.key===query.get('edit')&&line.productId===product.id);
 let editKey=editing?.key||null,selectedColor=product.colors.find(color=>color.id===(query.get('color')||editing?.colorId))||product.colors.find(color=>color.id===product.defaultColor);
 let selectedFit=product.fits.includes(query.get('fit')||editing?.fit)?(query.get('fit')||editing?.fit):(product.fits.includes('Unisex')?'Unisex':product.fits[0]);
 let selectedSize=selectedColor.sizes.find(size=>size.name===(query.get('size')||editing?.size)&&size.available!==false)?.name||null,view='front',imageVersion=0;
 if(!selectedSize&&selectedColor.sizes.length===1&&selectedColor.sizes[0].name==='ONE SIZE')selectedSize='ONE SIZE';
 const quantity=$('#quantity');quantity.value=editing?.quantity||1;
 function normalizeQuantity(){quantity.value=Math.max(1,Math.min(10,Math.floor(Number(quantity.value)||1)));$('#less').disabled=Number(quantity.value)<=1;$('#more').disabled=Number(quantity.value)>=10;return Number(quantity.value);}
 async function showArtwork(){
  const version=++imageVersion,img=$('#product-art');img.classList.add('is-changing');img.src=selectedColor.images[view];img.alt=brand+' '+product.name+', '+selectedColor.name+', '+view+' view';
  $('#art-caption').textContent=selectedColor.name+' / '+view+' view';
  try{await img.decode();}catch{}
  if(version===imageVersion)img.classList.remove('is-changing');
 }
 function updateSelection(){
  const variant=getVariant(product.id,selectedColor.id,selectedSize,selectedFit),availableSizes=selectedColor.sizes.filter(size=>size.available!==false);
  const price=variant?.size.price??(selectedColor.sizes.length?Math.min(...selectedColor.sizes.map(size=>size.price)):product.price);
  $('#product-price').textContent=(!selectedSize&&availableSizes.some(size=>size.price!==price)?'From ':'')+money(price);
  $('#selected-color').textContent=selectedColor.name+(selectedColor.mockupPending?' (color mockup pending)':'');$('#selected-fit').textContent=selectedFit||'Choose a fit';
  $('#product-fits').innerHTML=product.fits.map(fit=>'<button type="button" data-fit="'+e(fit)+'" aria-pressed="'+(selectedFit===fit)+'">'+e(fit)+'</button>').join('');$('#selected-size').textContent=selectedSize||'Choose your fit';
  document.querySelectorAll('[data-color]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.color===selectedColor.id)));
  $('#product-sizes').innerHTML=selectedColor.sizes.map(size=>'<button type="button" data-size="'+e(size.name)+'" aria-label="Size '+e(size.name)+'" aria-pressed="'+(selectedSize===size.name)+'" '+(size.available===false?'disabled':'')+'>'+e(size.name)+'</button>').join('');
  $('#availability-note').textContent=!availableSizes.length?'Currently unavailable in this color. Explore the other pieces below.':'';
  $('#add-bag').disabled=!variant?.available||!selectedFit;
  $('#add-label').textContent=!availableSizes.length?'Currently unavailable':!selectedFit?'Select a fit':!selectedSize?'Select a size':editKey?'Update cart':'Add to cart';
  normalizeQuantity();
 }
 $('#product-colors').innerHTML=product.colors.map(color=>'<button type="button" class="color-choice" data-color="'+e(color.id)+'" aria-label="Color '+e(color.name)+'" aria-pressed="'+(selectedColor.id===color.id)+'"><span style="background:'+e(color.hex)+'" aria-hidden="true"></span><b>'+e(color.name)+'</b></button>').join('');
 $('#product-colors').addEventListener('click',event=>{
  const button=event.target.closest('[data-color]');if(!button)return;
  selectedColor=product.colors.find(color=>color.id===button.dataset.color);
  if(!selectedColor.sizes.some(size=>size.name===selectedSize&&size.available!==false))selectedSize=null;
  updateSelection();showArtwork();$('#bag-status').textContent='';
 });
 $('#product-fits').addEventListener('click',event=>{const button=event.target.closest('[data-fit]');if(!button)return;selectedFit=button.dataset.fit;updateSelection();[...document.querySelectorAll('[data-fit]')].find(b=>b.dataset.fit===selectedFit)?.focus({preventScroll:true});});
 $('#product-sizes').addEventListener('click',event=>{
  const button=event.target.closest('[data-size]');if(!button||button.disabled)return;
  selectedSize=button.dataset.size;updateSelection();$('#bag-status').textContent='';
  [...document.querySelectorAll('[data-size]')].find(button=>button.dataset.size===selectedSize)?.focus({preventScroll:true});
 });
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));showArtwork();
 }));
 quantity.addEventListener('change',normalizeQuantity);
 $('#less').addEventListener('click',()=>{quantity.value=normalizeQuantity()-1;normalizeQuantity();});
 $('#more').addEventListener('click',()=>{quantity.value=normalizeQuantity()+1;normalizeQuantity();});
 $('#add-bag').addEventListener('click',()=>{
  const selection={productId:product.id,colorId:selectedColor.id,size:selectedSize,fit:selectedFit,quantity:normalizeQuantity()};
  try{
   if(editKey){replaceBagLine(editKey,selection);}
   else addToBag(selection);
   $('#bag-status').textContent=product.name+', '+selectedColor.name+', '+selectedSize+' added. Opening your cart…';location.href='bag.html';
  }catch(error){$('#bag-status').textContent=error.message;}
 });
 const related=catalog.filter(other=>other.id!==product.id&&other.collection===product.collection).sort((a,b)=>Number(isAvailable(b))-Number(isAvailable(a))).slice(0,3);
 $('#related-products').innerHTML=related.map(productCard).join('');$('#related-products').dataset.count=related.length;
 updateSelection();showArtwork();
 if(product.previewOnly){
  document.querySelectorAll('.product-options,.quantity-row,.art-views').forEach(element=>element.hidden=true);
  $('#availability-note').textContent='Collection preview. Size and color options are being prepared.';
  $('#add-label').textContent='Options coming soon';$('#add-bag').disabled=true;
 }
 document.querySelector('.related .text-link').href=product.collectionUrl;

}


