import {escapeHTML as e,amountMoney} from './catalog.js';
import {addLine,normalizeBag,getBagSummary,setLineQuantity,replaceLine} from './bag-state.js';
const key='bornhood-bag-v2',legacyKey='bornhood-demo-bag-v1';
export function readBag(){
 try{const saved=localStorage.getItem(key);return normalizeBag(JSON.parse(saved===null?(localStorage.getItem(legacyKey)||'[]'):saved));}catch{return [];}
}
function save(rows){
 try{localStorage.setItem(key,JSON.stringify(rows));}catch{throw new Error('Your browser could not save the bag. Please enable local storage and try again.');}
 window.dispatchEvent(new Event('bagchange'));
}
export function addToBag(selection){save(addLine(readBag(),selection));}
export function replaceBagLine(lineKey,selection){save(replaceLine(readBag(),lineKey,selection));}
export function changeBagQuantity(lineKey,quantity){save(setLineQuantity(readBag(),lineKey,quantity));}
export function getSavedBagSummary(){return getBagSummary(readBag());}
export function lineMarkup(line,{compact=false}={}){
 const query=new URLSearchParams({id:line.productId,color:line.colorId,edit:line.key});if(line.size)query.set('size',line.size);if(line.fit)query.set('fit',line.fit);
 const label=line.name+', '+line.color+', '+(line.size||'size not selected');
 return '<article class="bag-item '+(compact?'is-compact':'')+'" data-row-key="'+e(line.key)+'"><a class="bag-item-image" href="product.html?'+e(query)+'"><img src="'+e(line.image)+'" alt="'+e(label)+'" width="800" height="800"></a><div class="bag-item-copy"><h3><a href="product.html?'+e(query)+'">'+e(line.name)+'</a></h3><p>'+e(line.color)+' / '+e(line.size||'Choose a size')+(line.fit?' / '+e(line.fit):'')+'</p><p class="line-unit">'+amountMoney(line.unitAmount)+' each'+(!line.available&&!line.needsOptions?' · Currently unavailable':'')+'</p><div class="bag-line-controls"><div class="bag-quantity"><button type="button" data-bag-action="decrease" data-line-key="'+e(line.key)+'" aria-label="Decrease quantity of '+e(label)+'">−</button><span aria-label="Quantity">'+line.quantity+'</span><button type="button" data-bag-action="increase" data-line-key="'+e(line.key)+'" aria-label="Increase quantity of '+e(label)+'" '+(line.quantity>=10||!line.available?'disabled':'')+'>+</button></div><a class="bag-edit" href="product.html?'+e(query)+'">'+(line.needsOptions?'Choose options':'Edit')+'</a><button class="bag-remove" type="button" data-bag-action="remove" data-line-key="'+e(line.key)+'" aria-label="Remove '+e(label)+'">Remove</button></div></div><strong class="bag-line-price">'+amountMoney(line.lineAmount)+'</strong></article>';
}
export function handleBagAction(event,root){
 const button=event.target.closest('[data-bag-action]');if(!button||!root.contains(button))return;
 const line=getSavedBagSummary().lines.find(line=>line.key===button.dataset.lineKey);if(!line)return;
 const quantity=button.dataset.bagAction==='remove'?0:line.quantity+(button.dataset.bagAction==='increase'?1:-1);
 try{changeBagQuantity(line.key,quantity);}catch(error){const status=root.querySelector('[role="status"]');if(status)status.textContent=error.message;}
}
export function mountBag(){
 let dialog=document.querySelector('#bag-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='bag-dialog';document.body.append(dialog);}
 dialog.setAttribute('aria-labelledby','bag-title');
 dialog.innerHTML='<div class="bag-heading"><div><span class="eyebrow">Your selection</span><h2 id="bag-title">Your cart</h2></div><button id="close-bag" aria-label="Close bag">×</button></div><div id="bag-items"></div><div class="bag-total"><span>Subtotal</span><strong id="bag-total"></strong></div><p class="bag-feedback" role="status"></p><p class="demo-note">Preview store. Demo checkout only.</p><div class="bag-actions"><a class="bag-review" href="bag.html">View cart</a><button class="bag-continue" id="continue-shopping">Keep exploring</button></div>';
 function render(){
  const focus=document.activeElement,focusAction=focus?.dataset?.bagAction,focusKey=focus?.dataset?.lineKey;
  const summary=getSavedBagSummary();document.querySelector('#bag-count').textContent=summary.count;
  const items=dialog.querySelector('#bag-items');items.innerHTML=summary.lines.map(line=>lineMarkup(line,{compact:true})).join('');
  if(!summary.lines.length)items.innerHTML='<div class="bag-empty"><p>Your next expression is waiting.</p><a href="shop.html">Shop the collection →</a></div>';
  dialog.querySelector('#bag-total').textContent=amountMoney(summary.subtotalAmount);
  dialog.querySelector('.bag-review').hidden=!summary.lines.length;
  dialog.querySelector('.bag-feedback').textContent=summary.lines.some(line=>line.needsOptions)?'Choose options for your previously saved pieces before reviewing the order.':summary.lines.some(line=>!line.available)?'An item is currently unavailable. Edit or remove it to continue.':'';
  if(dialog.open&&focusAction){
   const next=[...dialog.querySelectorAll('[data-bag-action]')].find(button=>button.dataset.bagAction===focusAction&&button.dataset.lineKey===focusKey);
   (next||dialog.querySelector('#close-bag')).focus({preventScroll:true});
  }
 }
 dialog.querySelector('#close-bag').addEventListener('click',()=>dialog.close());
 dialog.querySelector('#continue-shopping').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>handleBagAction(event,dialog));
 window.addEventListener('bagchange',render);window.addEventListener('storage',render);render();
 return {open:()=>dialog.showModal()};
}
