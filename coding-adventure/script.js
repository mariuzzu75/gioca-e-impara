(() => {
const $=id=>document.getElementById(id);
const DIRS={up:{dx:0,dy:-1,icon:"⬆️",name:"su"},down:{dx:0,dy:1,icon:"⬇️",name:"giù"},left:{dx:-1,dy:0,icon:"⬅️",name:"sinistra"},right:{dx:1,dy:0,icon:"➡️",name:"destra"}};
const MODES={beginner:{size:4,walls:0,gems:1,desc:"Griglia 4×4: impara a dare le prime istruzioni."},explorer:{size:5,walls:3,gems:2,desc:"Griglia 5×5: fai attenzione agli ostacoli e raccogli le gemme."},programmer:{size:6,walls:6,gems:3,desc:"Griglia 6×6: pianifica il percorso tra gli ostacoli."},challenge:{size:6,walls:7,gems:4,desc:"Griglia 6×6: usa anche il comando Ripeti ×3."}};
const S={size:4,start:0,goal:15,player:0,walls:new Set(),gems:new Set(),collected:new Set(),path:[],commands:[],expanded:[],step:0,running:false,stepMode:false,stars:0,level:1,character:"🦊",difficulty:"beginner",timer:null,currentCommandIndex:-1};
const rand=n=>Math.floor(Math.random()*n), xy=p=>({x:p%S.size,y:Math.floor(p/S.size)}), pos=(x,y)=>y*S.size+x;
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function randomPath(n){
 const start=rand(n*n);let goal=rand(n*n);while(goal===start)goal=rand(n*n);
 const seen=new Set([start]),parent=new Map(),stack=[start];
 while(stack.length){const p=stack[stack.length-1];if(p===goal)break;const {x,y}=(()=>({x:p%n,y:Math.floor(p/n)}))();
 const next=shuffle([[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>a>=0&&b>=0&&a<n&&b<n).map(([a,b])=>b*n+a).filter(v=>!seen.has(v)));
 if(next.length){const q=next[0];seen.add(q);parent.set(q,p);stack.push(q)}else stack.pop()}
 const path=[goal];let p=goal;while(p!==start){p=parent.get(p);path.push(p)}path.reverse();return {start,goal,path};
}
function newGame(increment=false){
 stopTimer();if(increment)S.level++;S.difficulty=$("difficultySelect").value;S.character=$("characterSelect").value;
 const cfg=MODES[S.difficulty];S.size=cfg.size;const g=randomPath(S.size);S.start=g.start;S.goal=g.goal;S.path=g.path;S.player=S.start;S.walls=new Set();S.gems=new Set();S.collected=new Set();
 const pathSet=new Set(S.path),free=[];for(let i=0;i<S.size*S.size;i++)if(!pathSet.has(i))free.push(i);
 shuffle(free).slice(0,cfg.walls).forEach(p=>S.walls.add(p));shuffle(S.path.slice(1,-1)).slice(0,Math.min(cfg.gems,S.path.length-2)).forEach(p=>S.gems.add(p));
 S.commands=[];S.expanded=[];S.step=0;S.running=false;S.stepMode=false;S.currentCommandIndex=-1;
 $("levelPill").textContent=`Livello ${S.level}`;$("levelDescription").textContent=cfg.desc;$("repeatArea").classList.toggle("visible",S.difficulty==="challenge");
 $("winOverlay").classList.add("hidden");say("Percorso pronto! Aggiungi le frecce e guida il personaggio fino alla stella.");render();
}
function say(t,k=""){const e=$("message");e.textContent=t;e.className="message"+(k?" "+k:"")}
function stopTimer(){if(S.timer){clearInterval(S.timer);S.timer=null}}
function add(dir){if(S.running)return;S.commands.push({type:"move",dir});renderProgram()}
function repeat(){if(S.running)return;const last=[...S.commands].reverse().find(c=>c.type==="move");if(!last){say("Prima inserisci una freccia: il comando Ripeti ripete l'ultima direzione ×3.","bad");return}S.commands.push({type:"repeat",dir:last.dir,count:3});renderProgram()}
function render(){
 const b=$("board");b.innerHTML="";b.style.setProperty("--cols",S.size);
 for(let i=0;i<S.size*S.size;i++){const c=document.createElement("div");c.className="cell";if(S.path.includes(i))c.classList.add("path");
 if(S.walls.has(i)){c.classList.add("wall");c.textContent="🪨"}else if(i===S.start){c.classList.add("start");c.textContent="🚩"}
 if(i===S.goal){c.classList.add("goal");c.textContent="⭐"}if(S.gems.has(i)&&!S.collected.has(i)&&i!==S.goal){c.classList.add("gem");c.textContent="💎"}if(i===S.player){c.classList.add("current");c.textContent=S.character}b.appendChild(c)}
 $("movesInfo").textContent=`Comandi: ${S.commands.length}`;$("gemsInfo").textContent=`Gemme: ${S.collected.size}/${S.gems.size}`;$("gemsCollected").textContent=S.collected.size;$("stars").textContent=S.stars;renderProgram();
}
function renderProgram(){
 const p=$("program");p.innerHTML="";if(!S.commands.length)p.innerHTML='<span class="empty-program">Le tue frecce appariranno qui…</span>';
 S.commands.forEach(c=>{const chip=document.createElement("span");chip.className="command-chip";chip.textContent=c.type==="move"?DIRS[c.dir].icon:`🔁 ×${c.count} ${DIRS[c.dir].icon}`;if(c.type==="repeat")chip.classList.add("repeat-chip");p.appendChild(chip)});
 const steps=S.commands.reduce((n,c)=>n+(c.type==="repeat"?c.count:1),0);$("programCount").textContent=`${S.commands.length} blocchi · ${steps} passi`;
 $("undoBtn").disabled=!S.commands.length||S.running;$("clearBtn").disabled=!S.commands.length||S.running;$("runBtn").disabled=!S.commands.length||S.running;$("stepBtn").disabled=!S.commands.length||S.running;
}
function expand(){return S.commands.flatMap(c=>Array(c.type==="repeat"?c.count:1).fill(c.dir))}
function prepare(stepMode){if(!S.commands.length||S.running)return;S.expanded=expand();S.step=0;S.player=S.start;S.collected=new Set();S.running=true;S.stepMode=stepMode;S.currentCommandIndex=-1;
 $("nextStepBtn").disabled=!stepMode;$("resetRunBtn").disabled=false;say(stepMode?"Modalità passo-passo: premi «Passo successivo» per eseguire un'istruzione.":"Il personaggio sta seguendo il tuo programma…");render();
 if(!stepMode)S.timer=setInterval(execute,550);
}
function commandIndex(step){let n=0;for(let i=0;i<S.commands.length;i++){let len=S.commands[i].type==="repeat"?3:1;if(step<n+len)return i;n+=len}return S.commands.length-1}
function execute(){
 if(!S.running)return;if(S.step>=S.expanded.length){finish(false);return}
 const dir=S.expanded[S.step],d=DIRS[dir],a=xy(S.player),nx=a.x+d.dx,ny=a.y+d.dy;S.currentCommandIndex=commandIndex(S.step);
 if(nx<0||ny<0||nx>=S.size||ny>=S.size){finish(true,`Ops! La freccia ${d.name} porterebbe il personaggio fuori dalla griglia. Modifica il programma e riprova.`);return}
 const next=pos(nx,ny);if(S.walls.has(next)){finish(true,`C'è una roccia davanti! La freccia ${d.name} porta contro un ostacolo. Correggi il percorso e riprova.`);return}
 S.player=next;S.step++;if(S.gems.has(next))S.collected.add(next);render();
 if(S.player===S.goal){finish(false,true);return}if(S.step>=S.expanded.length)finish(false);
}
function finish(error,success=false){
 stopTimer();S.running=false;$("nextStepBtn").disabled=true;$("resetRunBtn").disabled=true;
 if(error)say(typeof success==="string"?success:"Il programma si è fermato. Controlla le istruzioni e riprova.","bad");
 else if(success||S.player===S.goal){S.stars++;say(`Fantastico! Hai raggiunto la stella e raccolto ${S.collected.size} gemme su ${S.gems.size}!`,"good");$("winText").textContent=`Hai guidato ${S.character} fino alla stella! Gemme raccolte: ${S.collected.size}/${S.gems.size}.`;$("winOverlay").classList.remove("hidden")}
 else say("Sono finite le istruzioni, ma non sei ancora arrivato alla stella. Aggiungi altre frecce e riprova.","bad");
 render();
}
function reset(){stopTimer();S.running=false;S.player=S.start;S.collected=new Set();S.step=0;$("nextStepBtn").disabled=true;$("resetRunBtn").disabled=true;say("Personaggio riportato alla partenza. Puoi modificare il programma e riprovare.");render()}
document.querySelectorAll(".arrow-button").forEach(b=>b.addEventListener("click",()=>add(b.dataset.dir)));
$("repeatBtn").addEventListener("click",repeat);$("undoBtn").addEventListener("click",()=>{if(!S.running){S.commands.pop();renderProgram()}});
$("clearBtn").addEventListener("click",()=>{if(!S.running){S.commands=[];renderProgram()}});
$("newGameBtn").addEventListener("click",()=>newGame(true));$("difficultySelect").addEventListener("change",()=>newGame(false));
$("characterSelect").addEventListener("change",e=>{S.character=e.target.value;render()});
$("runBtn").addEventListener("click",()=>prepare(false));$("stepBtn").addEventListener("click",()=>prepare(true));$("nextStepBtn").addEventListener("click",execute);$("resetRunBtn").addEventListener("click",reset);
$("nextLevelBtn").addEventListener("click",()=>newGame(true));$("closeWinBtn").addEventListener("click",()=>$("winOverlay").classList.add("hidden"));
newGame(false);
})();