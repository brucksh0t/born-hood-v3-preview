/** Only one decoder seek at a time; rapid scrolling coalesces to the latest frame. */
export function createSeekQueue({getDuration,getTime,seek,tolerance=.035}) {
 let progress=0,busy=false;
 function flush(){
  const duration=getDuration();
  if(busy||!Number.isFinite(duration)||duration<=0)return;
  const target=Math.min(Math.max(0,duration-.04),progress*duration);
  if(Math.abs(target-getTime())<=tolerance)return;
  busy=true;
  try{seek(target);}catch{busy=false;}
 }
 return {
  update(value){if(!Number.isFinite(value))return;progress=Math.max(0,Math.min(1,value));flush();},
  complete(){busy=false;flush();},
  get busy(){return busy;},
 };
}
export function attachScrollVideo(video,onFrame=()=>{}) {
 let destroyed=false;
 const queue=createSeekQueue({getDuration:()=>video.duration,getTime:()=>video.currentTime,seek:time=>{video.currentTime=time;}});
 const ready=()=>{video.dataset.ready='true';queue.complete();onFrame();};
 const seeked=()=>{onFrame();if(!destroyed)queue.complete();};
 video.muted=true;video.playsInline=true;video.pause();
 video.addEventListener('loadeddata',ready);
 video.addEventListener('loadedmetadata',()=>queue.complete());
 video.addEventListener('seeked',seeked);
 video.addEventListener('error',()=>{video.dataset.ready='false';});
 if(video.readyState>=2)ready();
 return {update:progress=>queue.update(progress),destroy(){destroyed=true;video.removeEventListener('loadeddata',ready);video.removeEventListener('seeked',seeked);video.pause();}};
}
