import { makeTitleCanvas } from './title-texture.js';
import * as THREE from './vendor/three.module.js';
const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `uniform sampler2D uMap;uniform float uOpacity;varying vec2 vUv;void main(){vec4 c=texture2D(uMap,vUv);gl_FragColor=vec4(c.rgb,c.a*uOpacity);` + '\n#include <colorspace_fragment>\n}';
function randomSource(seed=7123){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export class AstrologyScene {
 constructor(canvas,{mode='film',onTitleReady=()=>{},drawTitle=true}={}){
  this.canvas=canvas;this.mode=mode;this.progress=0;this.paused=false;this.reduced=false;this.visible=true;this.sign=0;this.rotation=0;this.lastFrame=0;
  try{this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{canvas.dataset.webgl='fallback';return;}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0x000000,0);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(35,1,.1,100);this.camera.position.z=14;
  this.root=new THREE.Group();this.scene.add(this.root);this.makeStars();
  if(mode==='film'){if(drawTitle)this.makeTitle(onTitleReady);}else this.makeOrbit();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);
  this.visibilityObserver=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.wake();});this.visibilityObserver.observe(canvas);
  this.onVisibility=()=>this.wake();document.addEventListener('visibilitychange',this.onVisibility);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;canvas.dataset.webgl='fallback';if(mode==='film')document.body.classList.remove('has-chrome-title');});
  this.resize();canvas.dataset.webgl='ready';this.wake();
 }
 makeStars(){
  const rand=randomSource(this.mode==='film'?31:79),count=this.mode==='film'?95:460;
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3);
  for(let i=0;i<count;i++){
   positions[i*3]=(rand()-.5)*34;positions[i*3+1]=(rand()-.5)*21;positions[i*3+2]=-rand()*28;
   const red=rand()>.7;colors[i*3]=red?.65:.53;colors[i*3+1]=red?.055:.48;colors[i*3+2]=red?.10:.49;
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:this.mode==='film'?.6:.8,depthWrite:false,sizeAttenuation:true});
  this.stars=new THREE.Points(geometry,material);this.scene.add(this.stars);
 }
 makeTitle(onReady){
  new THREE.TextureLoader().load('assets/astrology/chrome-title.jpg',texture=>{
   if(this.disposed){texture.dispose();return;}
   const cleanTexture=new THREE.CanvasTexture(makeTitleCanvas(texture.image));texture.dispose();texture=cleanTexture;texture.colorSpace=THREE.SRGBColorSpace;
   const material=new THREE.ShaderMaterial({uniforms:{uMap:{value:texture},uOpacity:{value:1}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false});
   this.title=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);this.title.renderOrder=5;this.scene.add(this.title);this.titleTexture=texture;this.resize();onReady();this.wake();
  });
 }
 makeOrbit(){
  this.orbit=new THREE.Group();this.root.add(this.orbit);this.orbit.rotation.x=.34;
  [2.45,2.66,3.18,3.26].forEach((radius,i)=>{
   const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,i===1?.008:.003,4,220),new THREE.MeshBasicMaterial({color:i===1?0x7e3b42:0x684b4f,transparent:true,opacity:i===1?.75:.48,depthWrite:false}));
   this.orbit.add(mesh);
  });
  const tickPositions=[];
  for(let i=0;i<120;i++){const a=i/120*Math.PI*2;const radius=i%10===0?3.05:3.20;tickPositions.push(Math.cos(a)*radius,Math.sin(a)*radius,0,Math.cos(a)*3.28,Math.sin(a)*3.28,0);}
  const ticks=new THREE.BufferGeometry();ticks.setAttribute('position',new THREE.Float32BufferAttribute(tickPositions,3));this.orbit.add(new THREE.LineSegments(ticks,new THREE.LineBasicMaterial({color:0xa07273,transparent:true,opacity:.35})));
  this.markers=[];
  for(let i=0;i<12;i++){
   const a=i/12*Math.PI*2+Math.PI/2;
   const marker=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),new THREE.MeshBasicMaterial({color:i===0?0xe5c8ad:0x6b2632}));marker.position.set(Math.cos(a)*2.67,Math.sin(a)*2.67,0);this.orbit.add(marker);this.markers.push(marker);
  }
  const path=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.3,-.7,.12),new THREE.Vector3(-.75,.6,.12),new THREE.Vector3(.15,1.04,.12),new THREE.Vector3(.98,.45,.12),new THREE.Vector3(1.38,-.43,.12)]);
  this.constellation=new THREE.Group();this.constellation.add(new THREE.Line(path,new THREE.LineBasicMaterial({color:0xaa6c74,transparent:true,opacity:.55})));

  for(let i=0;i<path.attributes.position.count;i++){const p=new THREE.Vector3().fromBufferAttribute(path.attributes.position,i);const star=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),new THREE.MeshBasicMaterial({color:0xd9bdc5}));star.position.copy(p);this.constellation.add(star);}
  this.constellation.position.z=-1.5;this.scene.add(this.constellation);
 }
 resize(){
  if(!this.renderer||this.disposed)return;
  const box=this.canvas.parentElement.getBoundingClientRect();const width=Math.max(1,box.width),height=Math.max(1,box.height);
  this.width=width;this.height=height;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();
  const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(17.5))*14;this.worldHeight=worldHeight;this.worldWidth=worldHeight*this.camera.aspect;
  if(this.title){
   const mobile=width<560,scale=this.worldWidth*(mobile?.76:.38);
   this.title.scale.set(scale,scale*426/1280,1);
   this.titleBase={x:mobile?0:-this.worldWidth*.195,y:mobile?this.worldHeight*.045:this.worldHeight*.17};
  }
  if(this.orbit){const scale=width<560?Math.min(1,this.worldWidth/7.2):1;this.orbit.scale.setScalar(scale);this.orbit.position.y=width<560?.1:-.08;}
  this.render();
 }
 setProgress(progress){this.progress=progress;this.wake();}
 selectSign(index){this.sign=index;this.markers?.forEach((m,i)=>m.material.color.setHex(i===index?0xf2d4b5:0x6b2632));this.wake();}
 setPaused(value){this.paused=value;this.wake();}
 setReduced(value){this.reduced=value;this.wake();}
 render(time=0){
  if(!this.renderer||this.disposed||this.lost)return;
  const progress=this.progress;
  this.camera.position.z=14-(this.mode==='film'?progress*.8:progress*.6);
  if(this.title&&this.titleBase){
   const fade=1-THREE.MathUtils.smoothstep(progress,.12,.29);this.title.material.uniforms.uOpacity.value=fade;
   this.title.position.set(this.titleBase.x-progress*.6,this.titleBase.y+progress*1.4,0);this.title.rotation.y=-progress*.17;this.title.rotation.z=progress*.025;
  }
  if(this.orbit){
   const target=-this.sign*Math.PI/6+progress*.35;
   this.rotation=this.paused||this.reduced?target:THREE.MathUtils.lerp(this.rotation,target,.07);
   this.orbit.rotation.z=this.rotation;this.orbit.rotation.y=Math.sin(progress*Math.PI)*.25;
   this.constellation.rotation.z=-this.rotation*.12;
  }
  this.stars.rotation.z=progress*.05;
  if(!this.paused&&!this.reduced)this.stars.rotation.y=Math.sin(time*.00004)*.025;
  this.renderer.render(this.scene,this.camera);
 }
 wake(){
  if(this.frame||!this.renderer||this.disposed||this.lost)return;
  const loop=time=>{
   this.frame=null;
   if(!this.visible||document.hidden||this.disposed)return;
   if(time-this.lastFrame>=32){this.render(time);this.lastFrame=time;}
   if(!this.paused&&!this.reduced)this.frame=requestAnimationFrame(loop);
   else this.render(time);
  };
  this.frame=requestAnimationFrame(loop);
 }
 dispose(){
  this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();this.visibilityObserver?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);
  this.scene?.traverse(object=>{object.geometry?.dispose();if(object.material){const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(m=>m.dispose());}});this.titleTexture?.dispose();this.renderer?.dispose();
 }
}



