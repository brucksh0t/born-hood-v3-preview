import './shell.js';
import {staticPreview as configuredStatic} from './preview-config.js';
const staticPreview=configuredStatic||!['127.0.0.1','localhost'].includes(location.hostname);
import {buildQuote} from './bag-state.js';
import {readBag,getSavedBagSummary} from './bag.js';
import {escapeHTML as e,amountMoney} from './catalog.js';
let controller,version=0;const placeBtn=document.querySelector('#place-demo-order');
placeBtn.addEventListener('click',()=>{const method=document.querySelector('input[name=pay]:checked')?.closest('label').querySelector('b').textContent||'Card';document.querySelector('#demo-confirmation').textContent='Demo order placed with '+method+'. No payment was taken. In the live store this step hands off to the payment provider.';placeBtn.disabled=true;});
async function render(){
 const current=++version;controller?.abort();controller=new AbortController();const requestController=controller;
 const status=document.querySelector('#quote-status'),error=document.querySelector('#quote-error'),items=document.querySelector('#review-items');
 error.textContent='';items.replaceChildren();document.querySelector('#review-subtotal').textContent='—';
 const summary=getSavedBagSummary();
 if(!summary.lines.length){status.textContent='Your cart is empty.';placeBtn.disabled=true;items.innerHTML='<a class="commerce-primary" href="shop.html">Shop the collection →</a>';return;}
 if(!summary.canReview){status.textContent='Your selection needs a quick update.';items.innerHTML='<p class="commerce-note">Choose any missing options and remove unavailable pieces before continuing.</p><a class="commerce-primary" href="bag.html">Back to your cart →</a>';return;}
 status.textContent='Checking your selection…';
 const timeout=setTimeout(()=>requestController.abort(),8000);
 try{
  let quote;
  if(staticPreview){
   quote=buildQuote(readBag());

  }else{
   const response=await fetch('/api/checkout/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:readBag()}),signal:requestController.signal});
   quote=await response.json();if(!response.ok)throw new Error(quote.error||'Your order could not be reviewed.');
  }
  if(current!==version)return;
  status.textContent=quote.items.reduce((sum,item)=>sum+item.quantity,0)+' pieces / USD'+(staticPreview?' / demo catalog totals':'');
  items.innerHTML=quote.items.map(line=>'<article class="review-item"><img src="'+e(line.image)+'" alt="'+e(line.name+', '+line.color)+'" width="800" height="800"><div><h3>'+e(line.name)+'</h3><p>'+e(line.color)+' / '+e(line.size)+(line.fit?' / '+e(line.fit):'')+'</p><p>Quantity '+line.quantity+' × '+amountMoney(line.unitAmount)+'</p></div><strong>'+amountMoney(line.lineAmount)+'</strong></article>').join('');
  document.querySelector('#review-subtotal').textContent=amountMoney(quote.subtotalAmount);
  document.querySelectorAll('[data-split]').forEach(el=>el.textContent=amountMoney(Math.ceil(quote.subtotalAmount/Number(el.dataset.split))));placeBtn.disabled=false;
 }catch(failure){
  if(current!==version)return;
  status.textContent='Your cart is still saved.';
  error.textContent=failure.name==='AbortError'?'The preview server didn’t respond. Please try again.':failure.message;
  items.innerHTML='<a class="commerce-secondary" href="bag.html">Return to your cart →</a><button class="commerce-secondary" id="retry-quote" type="button">Try again</button>';
  document.querySelector('#retry-quote').addEventListener('click',render);
 }finally{clearTimeout(timeout);}
}
window.addEventListener('bagchange',render);window.addEventListener('storage',render);render();
window.addEventListener('pagehide',()=>controller?.abort());




