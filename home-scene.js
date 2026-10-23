import * as THREE from './vendor/three.module.js';
// Real scene geometry supplements the user's original photographs.
// No depth map, fake product model, or regenerated artwork is used.
export class HomeScene{
 constructor(canvas,{mode='city'}={}){
  this.canvas=canvas;this.mode=mode;this.progress=0;this.pointer={x:0,y:0};this.visible=false;this.paused=false;this.reduced=false;this.disposed=false;this.frame=0;this.time=0;this.active=true;
  try{this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{canvas.dataset.webgl='fallback';return;}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0x030304,0);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,60);this.camera.position.z=8;
  this.group=new THREE.Group();this.scene.add(this.group);
  if(mode==='city')this.createCity();else this.createPortal();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);
  this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.wake();});this.intersection.observe(canvas);
  this.onVisibility=()=>this.wake();document.addEventListener('visibilitychange',this.onVisibility);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;cancelAnimationFrame(this.frame);canvas.dataset.webgl='fallback';canvas.style.opacity='0';});
  canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;canvas.style.opacity='1';this.wake();});
  canvas.dataset.webgl='ready';this.resize();
 }
 createCity(){
  new THREE.TextureLoader().load('assets/home/city.jpg',texture=>{
   if(this.disposed){texture.dispose();return;}
   texture.colorSpace=THREE.SRGBColorSpace;this.texture=texture;
   this.image=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture}));this.image.position.z=-.2;this.scene.add(this.image);this.resize();this.wake();
  });
  const positions=[],colors=[];
  for(let i=0;i<100;i++){const x=(Math.random()-.5)*14,y=(Math.random()-.5)*10,z=Math.random()*4;positions.push(x,y,z,x-.016,y-.1-Math.random()*.16,z);const c=new THREE.Color(i%7===0?0xb12d39:0x626064);colors.push(c.r,c.g,c.b,c.r,c.g,c.b);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  this.rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.26,depthWrite:false}));this.group.add(this.rain);
 }
 createPortal(){
  const ring=new THREE.Group();this.group.add(ring);this.ring=ring;
  for(const [radius,tube,color] of [[2.35,.012,0xb62836],[2.48,.003,0xa96767],[2.72,.004,0x581822]]){
   const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,6,200),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));ring.add(mesh);
  }
  const marks=[];
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2,r=2.48,r2=r+(i%8===0?.16:.05);marks.push(Math.cos(a)*r,Math.sin(a)*r,0,Math.cos(a)*r2,Math.sin(a)*r2,0);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(marks,3));ring.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xb7978b,transparent:true,opacity:.6})));
  const starPositions=[];for(let i=0;i<220;i++)starPositions.push((Math.random()-.5)*18,(Math.random()-.5)*12,(Math.random()-.5)*5);
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));this.group.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xdccac0,size:.018,transparent:true,opacity:.5,depthWrite:false})));
 }
 resize(){
  if(!this.renderer||this.disposed)return;
  const box=this.canvas.parentElement.getBoundingClientRect();this.width=Math.max(1,box.width);this.height=Math.max(1,box.height);
  this.renderer.setSize(this.width,this.height,false);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();
  const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(19))*8.2,worldWidth=worldHeight*this.camera.aspect;
  if(this.image){const scale=Math.max(worldWidth/1280,worldHeight/720)*1.045;this.image.scale.set(1280*scale,720*scale,1);}
  if(this.ring){const mobile=this.width<700;this.ring.scale.setScalar(mobile?.72:1);this.ring.position.set(mobile?0:worldWidth*.23,mobile?-.5:0,0);}
  this.render();this.wake();
 }
 setActive(value){this.active=value;this.canvas.dataset.active=String(value);this.wake();}
 setProgress(value){this.progress=value;this.wake();}
 setPointer(x,y){this.pointer={x,y};this.wake();}
 setPaused(value){this.paused=value;this.wake();}
 setReduced(value){this.reduced=value;this.wake();}
 render(){
  if(!this.renderer||this.disposed||this.lost)return;
  const motion=!this.reduced&&!this.paused;
  if(this.image){this.image.position.x=motion?this.pointer.x*.045:0;this.image.position.y=motion?this.pointer.y*.025:0;this.image.rotation.y=motion?this.pointer.x*.004:0;}
  if(this.rain&&motion){this.rain.position.y=-(this.time*.14)%2;}
  if(this.ring){this.ring.rotation.x=this.reduced?0:.13+this.progress*.28;this.ring.rotation.y=this.reduced?0:-.32+this.progress*.38;this.ring.rotation.z=this.reduced?0:this.progress*.6+(motion?this.time*.009:0);}
  this.renderer.render(this.scene,this.camera);
 }
 wake(){
  if(!this.renderer||this.disposed||this.frame||this.lost||!this.active||!this.visible||document.hidden)return;
  this.render();if(!this.active||!this.visible||this.paused||this.reduced||document.hidden)return;
  let last=performance.now();
  const loop=now=>{this.frame=0;if(!this.active||!this.visible||this.paused||this.reduced||this.disposed||this.lost||document.hidden)return;this.time+=Math.min((now-last)/1000,.05);last=now;this.render();this.frame=requestAnimationFrame(loop);};
  this.frame=requestAnimationFrame(loop);
 }
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();this.intersection?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);this.scene?.traverse(object=>{object.geometry?.dispose();if(object.material){for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});this.texture?.dispose();this.renderer?.dispose();}
}



