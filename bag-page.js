import './shell.js';
import {getSavedBagSummary,lineMarkup,handleBagAction} from './bag.js';
import {amountMoney} from './catalog.js';
const root=document.querySelector('.commerce-main');
function render(){
 const focused=document.activeElement,action=focused?.dataset?.bagAction,key=focused?.dataset?.lineKey;
 const focusIndex=action?[...root.querySelectorAll('[data-bag-action]')].filter(button=>button.dataset.bagAction===action).indexOf(focused):-1;
 const summary=getSavedBagSummary();document.querySelector('#bag-page-count').textContent=summary.count+' '+(summary.count===1?'piece':'pieces')+' in your cart';
 document.querySelector('#bag-page-items').innerHTML=summary.lines.length?summary.lines.map(line=>lineMarkup(line)).join(''):'<div class="empty-order"><h2>Your next expression<br>is waiting.</h2><p>Explore the collection and find your piece.</p><a class="commerce-primary" href="shop.html">Shop the collection →</a></div>';
 document.querySelector('#page-subtotal').textContent=amountMoney(summary.subtotalAmount);
 document.querySelector('#review-order').hidden=!summary.canReview;
 const unavailable=document.querySelector('#review-unavailable');unavailable.hidden=summary.canReview||!summary.lines.length;
 unavailable.textContent=summary.lines.some(line=>line.needsOptions)?'Choose options to continue':'Remove unavailable pieces';
 document.querySelector('#bag-review-note').textContent=summary.lines.some(line=>line.needsOptions)?'Choose a size for each saved piece before reviewing your order.':summary.lines.some(line=>!line.available)?'A piece is currently unavailable. Edit or remove it to continue.':'Your selected sizes and colors are saved in this browser.';
 if(action){
  const candidates=[...root.querySelectorAll('[data-bag-action]')].filter(button=>button.dataset.bagAction===action);
  const next=candidates.find(button=>button.dataset.lineKey===key)||candidates[Math.min(Math.max(0,focusIndex),candidates.length-1)];
  (next||document.querySelector('.commerce-heading h1')).focus({preventScroll:true});
 }
}
root.addEventListener('click',event=>handleBagAction(event,root));
window.addEventListener('bagchange',render);window.addEventListener('storage',render);render();
