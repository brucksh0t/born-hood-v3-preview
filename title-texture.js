// Remove connected white background regions, preserving bright chrome reflections.
// The supplied JPEG remains unchanged; only the renderer's alpha channel is derived.
export function makeTitleCanvas(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,canvas.width,canvas.height);
 const {data}=pixels,w=canvas.width,h=canvas.height,total=w*h;
 const seen=new Uint8Array(total),queue=new Int32Array(total);
 const white=i=>Math.min(data[i*4],data[i*4+1],data[i*4+2])>=235;
 for(let seed=0;seed<total;seed++){
  if(seen[seed]||!white(seed))continue;
  let head=0,tail=1;queue[0]=seed;seen[seed]=1;let xSum=0,ySum=0;
  while(head<tail){
   const i=queue[head++],x=i%w,y=Math.floor(i/w);xSum+=x;ySum+=y;
   for(const next of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1]){
    if(next>=0&&!seen[next]&&white(next)){seen[next]=1;queue[tail++]=next;}
   }
  }
  // Large connected regions are the exterior and letter counters.
  // The narrow A counter is smaller than some genuine chrome highlights.
  const cx=xSum/tail/w,cy=ySum/tail/h;
  const aCounter=tail>600&&cx>.065&&cx<.085&&cy>.47&&cy<.56;
  if(tail>2000||aCounter)for(let n=0;n<tail;n++)data[queue[n]*4+3]=0;
 }
 context.putImageData(pixels,0,0);return canvas;
}
