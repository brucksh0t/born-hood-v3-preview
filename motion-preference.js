const key='bornhood-motion-paused';
export function readMotionPaused(){try{return sessionStorage.getItem(key)==='true';}catch{return false;}}
export function saveMotionPaused(paused){try{sessionStorage.setItem(key,String(paused));}catch{}}
