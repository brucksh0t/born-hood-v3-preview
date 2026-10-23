import {getProduct,getVariant,variantKey,validFit,currency} from './catalog.js';
const rowKey=row=>variantKey(row.productId,row.colorId,row.size,row.fit);
const clampQuantity=value=>Math.max(1,Math.min(10,Math.floor(Number(value)||1)));
function error(message,code,status=400){const failure=new Error(message);failure.code=code;failure.status=status;return failure;}
export function normalizeBag(input){
 if(!Array.isArray(input))return [];
 const rows=[];
 for(const raw of input.slice(0,50)){
  if(!raw||typeof raw!=='object')continue;
  const product=getProduct(raw.productId||raw.id);if(!product)continue;
  const colorId=typeof raw.colorId==='string'?raw.colorId:product.defaultColor;
  const color=product.colors.find(color=>color.id===colorId);
  const size=typeof raw.size==='string'&&color?.sizes.some(size=>size.name===raw.size)?raw.size:null;
  const row={productId:product.id,colorId:color?.id||product.defaultColor,size,fit:validFit(product,raw.fit),quantity:clampQuantity(raw.quantity)};
  const key=rowKey(row),existing=rows.find(other=>rowKey(other)===key);
  if(existing)existing.quantity=Math.min(10,existing.quantity+row.quantity);else rows.push(row);
 }
 return rows;
}
export function addLine(input,selection){
 const variant=getVariant(selection.productId,selection.colorId,selection.size,selection.fit);
 if(!variant)throw error('Choose a valid product variant.','INVALID_VARIANT');
 if(!variant.available)throw error('This product variant is currently unavailable.','UNAVAILABLE_VARIANT',409);
 const rows=normalizeBag(input),existing=rows.find(row=>rowKey(row)===variant.key);
 const quantity=clampQuantity(selection.quantity);
 if(existing)existing.quantity=Math.min(10,existing.quantity+quantity);
 else rows.push({productId:variant.product.id,colorId:variant.color.id,size:variant.size.name,fit:variant.fit,quantity});
 return rows;
}
export function setLineQuantity(input,key,quantity){
 return normalizeBag(input).flatMap(row=>{
  if(rowKey(row)!==key)return [row];
  if(Number(quantity)<=0)return [];
  return [{...row,quantity:clampQuantity(quantity)}];
 });
}
export function getBagSummary(input){
 const rows=normalizeBag(input),lines=rows.map(row=>{
  const product=getProduct(row.productId),color=product.colors.find(color=>color.id===row.colorId),variant=getVariant(row.productId,row.colorId,row.size,row.fit);
  const unitAmount=variant?.unitAmount??Math.round(product.price*100),needsOptions=!variant||!variant.fit;
  return {...row,key:rowKey(row),name:product.name,collection:product.collection,color:color.name,image:color.images.front,unitAmount,lineAmount:unitAmount*row.quantity,needsOptions,available:variant?.available??false};
 });
 return {lines,count:lines.reduce((sum,row)=>sum+row.quantity,0),subtotalAmount:lines.reduce((sum,row)=>sum+row.lineAmount,0),canReview:lines.length>0&&lines.every(row=>!row.needsOptions&&row.available),currency};
}
export function buildQuote(input){
 if(!Array.isArray(input)||!input.length)throw error('Your bag is empty.','EMPTY_BAG');
 if(input.length>50)throw error('Too many bag lines.','TOO_MANY_LINES');
 const totals=new Map();
 for(const row of input){
  if(!row||!Number.isInteger(row.quantity)||row.quantity<1||row.quantity>10)throw error('Choose a quantity between 1 and 10.','INVALID_QUANTITY');
  const variant=getVariant(row.productId,row.colorId,row.size,row.fit);
  if(!variant||!variant.fit)throw error('Choose a valid product variant.','INVALID_VARIANT');
  if(!variant.available)throw error('This product variant is currently unavailable.','UNAVAILABLE_VARIANT',409);
  const quantity=(totals.get(variant.key)||0)+row.quantity;
  if(quantity>10)throw error('The quantity limit is 10 per variant.','INVALID_QUANTITY');
  totals.set(variant.key,quantity);
 }
 const summary=getBagSummary(input);
 return {currency:summary.currency,items:summary.lines,subtotalAmount:summary.subtotalAmount,pricing:'catalog-snapshot',verifiedAt:summary.lines.map(line=>getProduct(line.productId).verifiedAt).sort()[0],paymentsEnabled:false};
}
export function replaceLine(input,key,selection){
 // Validate the new choice before touching the existing line.
 addLine([],selection);
 const remaining=normalizeBag(input).filter(row=>rowKey(row)!==key);
 return addLine(remaining,selection);
}

