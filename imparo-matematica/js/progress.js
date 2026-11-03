const STORAGE_KEY="imparoMatematicaProgress_v1";
function loadProgress(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{stars:0,completed:0,modules:{}};}
  catch(e){return {stars:0,completed:0,modules:{}};}
}
let progress=loadProgress();
function saveProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}
function moduleStats(id){return progress.modules[id]||{stars:0,plays:0};}
function recordGame(id,stars){
  const s=moduleStats(id);s.stars+=stars;s.plays+=1;progress.modules[id]=s;
  progress.stars+=stars;progress.completed+=1;saveProgress();
}
function getOverallPercent(){
  const total=MODULES.length*5;
  const done=Object.values(progress.modules).reduce((n,m)=>n+m.plays,0);
  return Math.min(100,Math.round(done/total*100));
}