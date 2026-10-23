import './shell.js';
import {catalog,productCard,isAvailable,escapeHTML as e} from './catalog.js';
import {collectionHeaders} from './catalog-enhance.js';
const query=new URLSearchParams(location.search),categories=['all',...new Set(catalog.map(product=>product.category))],collectionNames=new Map(catalog.map(product=>[product.collectionId,product.collection])),collections=['all',...collectionNames.keys()],sorts=['featured','price-asc','price-desc'];
const categoryNames={all:'All pieces',hoodies:'Hoodies',tees:'Tees',headwear:'Headwear',sweatshirts:'Sweatshirts',kids:'Kids'};
const header=document.createElement('div');header.className='collection-chrome';header.hidden=true;document.querySelector('.shop-tools').before(header);
document.querySelector('.category-filter').innerHTML=categories.map(category=>'<button type="button" data-category="'+e(category)+'" aria-pressed="false">'+e(categoryNames[category]||category.replaceAll('-',' '))+'</button>').join('');
document.querySelector('#collection-filter').innerHTML='<option value="all">All collections</option>'+[...collectionNames].map(([id,name])=>'<option value="'+e(id)+'">'+e(name)+'</option>').join('');
let category=categories.includes(query.get('category'))?query.get('category'):'all';
const collection=document.querySelector('#collection-filter'),sort=document.querySelector('#shop-sort');
collection.value=collections.includes(query.get('collection'))?query.get('collection'):'all';
sort.value=sorts.includes(query.get('sort'))?query.get('sort'):'featured';
function render(){
 let products=catalog.filter(product=>(category==='all'||product.category===category)&&(collection.value==='all'||product.collectionId===collection.value));
 products=[...products].sort((a,b)=>{
  const availability=Number(isAvailable(b))-Number(isAvailable(a));
  if(sort.value==='price-asc')return a.price-b.price||availability;if(sort.value==='price-desc')return b.price-a.price||availability;
  return availability||Number(!!a.statePreview)-Number(!!b.statePreview)||Number(a.collection==='Astrology')-Number(b.collection==='Astrology');
 });
 document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
 const art=collectionHeaders[collection.value];header.hidden=!art;if(art)header.innerHTML='<img src="'+e(art)+'" alt="'+e(collection.options[collection.selectedIndex].text)+' collection" width="1400" height="400">'+(collection.value==='states'?'<p>Every state. One hood. All 50 State Edition tees — final state artwork is being prepared.</p>':'');
 document.querySelector('#shop-results').textContent=products.length+' '+(products.length===1?'piece':'pieces')+' / '+(collection.value==='all'?'All collections':collection.options[collection.selectedIndex].text);
 const grid=document.querySelector('#shop-products');grid.innerHTML=products.length?products.map(productCard).join(''):'<div class="shop-empty"><h2>A different orbit awaits.</h2><p>There are no pieces in this combination. Try another category or collection.</p><button type="button" id="reset-shop">Show all pieces →</button></div>';
 grid.querySelectorAll('.product-card').forEach((card,index)=>card.style.setProperty('--piece-delay',Math.min(index,6)*45+'ms'));
 document.querySelector('#reset-shop')?.addEventListener('click',()=>{category='all';collection.value='all';sort.value='featured';render();});
 const params=new URLSearchParams();if(query.get('studio')==='draft')params.set('studio','draft');if(category!=='all')params.set('category',category);if(collection.value!=='all')params.set('collection',collection.value);if(sort.value!=='featured')params.set('sort',sort.value);
 history.replaceState(null,'','shop.html'+(params.size?'?'+params:''));
}
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;render();}));
collection.addEventListener('change',render);sort.addEventListener('change',render);render();


