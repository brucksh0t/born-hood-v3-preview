import {catalogData} from './catalog-data.js';
import {previewCatalog} from './catalog-preview.js';
import {enhanceCatalog} from './catalog-enhance.js';
export const catalog=enhanceCatalog(structuredClone([...catalogData,...previewCatalog]));
export const currency='USD';
export const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency}).format(value);
export const amountMoney=amount=>money(amount/100);
export const getProduct=id=>catalog.find(product=>product.id===id)||null;
export const variantKey=(productId,colorId,size,fit)=>[productId,colorId,size||'choose-size',...(fit?[fit]:[])].map(encodeURIComponent).join('|');
export const defaultFit=product=>product?.fits?.includes('Unisex')?'Unisex':product?.fits?.[0]||null;
export const validFit=(product,fit)=>product?.fits?.includes(fit)?fit:defaultFit(product);
export function getVariant(productId,colorId,sizeName,fit){
 const product=getProduct(productId),color=product?.colors.find(color=>color.id===colorId),size=color?.sizes.find(size=>size.name===sizeName);
 if(!product||!color||!size)return null;
 return {product,color,size,available:size.available!==false,unitAmount:Math.round(size.price*100),fit:validFit(product,fit),key:variantKey(product.id,color.id,size.name,validFit(product,fit))};
}
export const isAvailable=product=>product.colors.some(color=>color.sizes.some(size=>size.available!==false));
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function productCard(product){
 const e=escapeHTML,available=isAvailable(product),brand=product.collection==='Astrology'?'Born Hood Astrology':'Born Hood';
 return '<a class="product-card" href="product.html?id='+encodeURIComponent(product.id)+'"><div class="product-image"><img src="'+e(product.image)+'" alt="'+e(brand)+' '+e(product.name)+'" width="560" height="560" loading="lazy">'+(!available?'<span class="availability-tag">Currently unavailable</span>':'<span class="availability-tag is-in-stock">Available / '+product.colors.length+' colors</span>')+'<b>Explore piece →</b></div><div class="product-caption"><h3>'+e(product.name)+'</h3><span>'+money(product.price)+'</span></div><p>'+e(product.type)+'</p></a>';
}

