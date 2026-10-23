// Preview enhancements requested by the client (2026-10). Applied on top of the verified
// snapshot so the source records stay untouched. WooCommerce mapping: colors -> pa_color,
// sizes -> pa_size, fits -> pa_gender (variation attributes); stock_status=instock.
const palette={black:['Black','#111111'],white:['White','#f2f1ee'],red:['Red','#e0192b'],heather:['Athletic Heather','#a9a9ad'],navy:['Navy','#1d2b4f'],royal:['True Royal','#2647a8'],pink:['Light Pink','#f4b9c8'],purple:['Purple','#6f45c4'],maroon:['Heather Red','#9e3a40'],charcoal:['Charcoal','#333336']};
// Colour of the garment in each source photo (checked by eye against the artwork).
const picturedColor={'signature-345':'royal','signature-371':'black','signature-369':'navy','signature-340':'pink','signature-2224':'red','samurai-2405':'heather','street-227':'royal','street-2408':'charcoal','street-371':'purple','street-369':'red','street-2214':'black','street-2215':'black','certified-1301':'heather','core-823':'navy','crown-1303':'royal','crown-2405':'maroon','crown-1912':'pink','crown-212':'pink','crown-2408':'charcoal'};
const sizeSets={adult:['S','M','L','XL','2XL','3XL'],kids:['XS','S','M','L','XL'],headwear:['ONE SIZE']};
export const STATES="Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia Hawaii Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi Missouri Montana Nebraska Nevada New_Hampshire New_Jersey New_Mexico New_York North_Carolina North_Dakota Ohio Oklahoma Oregon Pennsylvania Rhode_Island South_Carolina South_Dakota Tennessee Texas Utah Vermont Virginia Washington West_Virginia Wisconsin Wyoming".split(' ').map(s=>s.replace(/_/g,' '));
export const collectionHeaders={astrology:'assets/v3/headers/wm-astrology.webp',certified:'assets/v3/headers/wm-certified.webp',crown:'assets/v3/headers/wm-crown.webp',signature:'assets/v3/headers/wm-signature.webp','samurai-mastery':'assets/v3/headers/wm-samurai-mastery.webp',samurai:'assets/v3/headers/wm-samurai-mastery.webp','street-edition':'assets/v3/headers/wm-street-edition.webp',street:'assets/v3/headers/wm-street-edition.webp',core:'assets/v3/headers/wm-born-hood.webp',states:'assets/v3/headers/wm-alabama-state.webp'};
const blocked=/drinkware|mug|tumbler|accessor|homeware|home goods|blanket|pillow|poster|sticker/i;
export const fitsFor=product=>product.category==='kids'?['Boys','Girls']:product.category==='headwear'?['Unisex']:['Men','Women','Unisex'];
function sizesFor(product,base){const set=product.category==='kids'?sizeSets.kids:product.category==='headwear'?sizeSets.headwear:sizeSets.adult;return set.map(name=>({name,price:base+(name==='2XL'?2:name==='3XL'?4:0),available:true}));}
function stateProduct(name,index){
 const slug=name.toLowerCase().replace(/ /g,'-'),img='assets/v3/states/'+slug+'.jpg';
 return {id:'state-'+slug,name:name+' State Tee',type:'Unisex Tee',collection:'States',collectionId:'states',collectionUrl:'shop.html?collection=states',category:'tees',price:24.99,image:img,verifiedAt:'2026-10-23',statePreview:true,order:index,
  details:['Born Hood State Edition — rep where you come from.','Final '+name+' artwork pending from Born Hood; preview tile shown.'],defaultColor:'black',
  colors:['black','white','red','heather'].map(id=>({id,name:palette[id][0],hex:palette[id][1],images:{front:img,back:img},sizes:[]}))};
}
export function enhanceCatalog(list){
 const out=list.filter(p=>!blocked.test(p.category+' '+p.type+' '+p.name));
 for(const name of STATES)out.push(stateProduct(name,out.length));
 for(const product of out){
  product.collectionId??=product.collection==='Astrology'?'astrology':'core';
  product.collectionUrl??=product.collectionId==='astrology'?'astrology.html':'shop.html?collection='+product.collectionId;
  if(product.colors.length<3||product.previewOnly||product.statePreview){
   const pictured=product.colors[0],have=new Set(product.colors.map(c=>c.name.toLowerCase()));
   if(pictured&&pictured.id==='pictured'){const id=picturedColor[product.id]||'black';pictured.id=id;pictured.name=palette[id][0];pictured.hex=palette[id][1];have.add(palette[id][0].toLowerCase());}
   const extra=(product.category==='kids'?['black','white','pink','royal']:['black','white','red','heather','navy']).filter(id=>!have.has(palette[id][0].toLowerCase()));
   for(const id of extra){if(product.colors.length>=5)break;product.colors.push({id,name:palette[id][0],hex:palette[id][1],images:{...product.colors[0].images},mockupPending:true,sizes:[]});}
   if(!product.colors.some(c=>c.id===product.defaultColor))product.defaultColor=product.colors[0].id;
  }
  for(const color of product.colors){
   if(!color.sizes.length)color.sizes=sizesFor(product,product.price);
   for(const size of color.sizes)size.available=true;
  }
  if(product.previewOnly)product.details=product.details.map(d=>/being prepared/.test(d)?'Pictured color shown in photography; other color mockups are being prepared.':d);
  product.previewOnly=false;product.fits=fitsFor(product);
 }
 return out;
}
