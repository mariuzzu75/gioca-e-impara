const $ = (s) => document.querySelector(s);
const gamePanel = $("#gamePanel");
const gameContent = $("#gameContent");
let totalStars = Number(localStorage.getItem("geoStars") || 0);
let sessionStars = 0;
let visited = JSON.parse(localStorage.getItem("geoVisited") || "[]");
let quizIndex = 0, quizScore = 0, currentWorld = "";
$("#totalStars").textContent = totalStars;
updateProgress();

const shapeData = [
  {name:"Cerchio", cls:"circle", sides:0, fact:"Il cerchio è rotondo e non ha lati."},
  {name:"Quadrato", cls:"square", sides:4, fact:"Il quadrato ha 4 lati tutti uguali."},
  {name:"Triangolo", cls:"triangle", sides:3, fact:"Il triangolo ha 3 lati e 3 angoli."},
  {name:"Rettangolo", cls:"rectangle", sides:4, fact:"Il rettangolo ha 4 lati: quelli opposti sono uguali."},
  {name:"Rombo", cls:"diamond", sides:4, fact:"Il rombo ha 4 lati tutti uguali."},
  {name:"Pentagono", cls:"pentagon", sides:5, fact:"Il pentagono ha 5 lati."},
  {name:"Esagono", cls:"hexagon", sides:6, fact:"L'esagono ha 6 lati."}
];
const triangleQuestions = [
  {type:"equilatero",desc:"I tre lati sono tutti uguali.",sides:[70,70,70],labels:["Equilatero","Isoscele","Scaleno"]},
  {type:"isoscele",desc:"Due lati sono uguali e uno è diverso.",sides:[78,78,110],labels:["Scaleno","Isoscele","Equilatero"]},
  {type:"scaleno",desc:"Tutti e tre i lati sono diversi.",sides:[62,88,112],labels:["Isoscele","Equilatero","Scaleno"]}
];
let triangleIndex = 0, angleIndex = 0, angleValue = 55;

function updateProgress(){
  $("#progressLabel").textContent = `${visited.length} di 5 mondi visitati`;
  document.querySelectorAll(".world-card").forEach(b=>{
    const done=visited.includes(b.dataset.world);
    b.classList.toggle("completed",done);
    b.querySelector(".world-go").textContent=done?"⭐ COMPLETATO":"ENTRA →";
  });
}
function awardStar(n=1){
  totalStars+=n; sessionStars+=n;
  localStorage.setItem("geoStars",totalStars);
  $("#totalStars").textContent=totalStars;
  $("#sessionStars").textContent=sessionStars;
}
function enterWorld(world){
  currentWorld=world; sessionStars=0; $("#sessionStars").textContent="0";
  gamePanel.classList.remove("hidden");
  gamePanel.scrollIntoView({behavior:"smooth",block:"start"});
  if(!visited.includes(world)){visited.push(world);localStorage.setItem("geoVisited",JSON.stringify(visited));updateProgress();}
  ({shapes:renderShapes,draw:renderDraw,triangles:renderTriangles,angles:renderAngles,tangram:renderTangram})[world]();
}
document.querySelectorAll(".world-card").forEach(b=>b.addEventListener("click",()=>enterWorld(b.dataset.world)));
$("#backHome").addEventListener("click",()=>{gamePanel.classList.add("hidden");document.querySelector(".worlds-section").scrollIntoView({behavior:"smooth"});});

function heading(kicker,title,subtitle){return `<span class="eyebrow">${kicker}</span><h2 class="game-title">${title}</h2><p class="game-subtitle">${subtitle}</p>`;}
function renderShapes(){
  quizIndex=0;quizScore=0;showShapeQuestion();
}
function showShapeQuestion(){
  const q=shapeData[quizIndex%shapeData.length];
  const choices=[q,...shapeData.filter(x=>x.name!==q.name).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
  gameContent.innerHTML=heading("MONDO 1 · IL PAESE DELLE FORME","Che figura è?","Guarda bene la figura e scegli il suo nome.")+
  `<div class="question-card"><h3>Come si chiama questa figura?</h3><span class="mini-shape ${q.cls}" style="width:75px;height:75px;${q.cls==="triangle"?"border-left-width:38px;border-right-width:38px;border-bottom-width:72px":""}"></span>
  <div class="shape-options">${choices.map(c=>`<button class="option" data-answer="${c.name}"><span class="mini-shape ${c.cls}"></span>${c.name}</button>`).join("")}</div>
  <div id="feedback" class="feedback"></div><div class="action-row"><button id="nextQuestion" class="primary-btn" disabled>Prossima figura →</button></div></div>
  <p class="tool-hint" style="text-align:center">Domanda ${quizIndex+1} di ${shapeData.length}</p>`;
  document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{
    if($("#nextQuestion").disabled===false)return;
    const ok=b.dataset.answer===q.name;
    document.querySelectorAll("[data-answer]").forEach(x=>{x.disabled=true;if(x.dataset.answer===q.name)x.classList.add("correct");});
    if(!ok)b.classList.add("wrong");
    $("#feedback").textContent=ok?`Bravissima! ${q.fact}`:`Quasi! Questa è ${q.name}. ${q.fact}`;
    $("#feedback").className="feedback "+(ok?"good":"bad");
    if(ok){quizScore++;awardStar();}
    $("#nextQuestion").disabled=false;
  }));
  $("#nextQuestion").addEventListener("click",()=>{
    quizIndex++;
    if(quizIndex>=shapeData.length){gameContent.innerHTML=heading("MONDO 1 · MISSIONE COMPLETATA","Esploratrice delle forme! 🏆",`Hai riconosciuto ${quizScore} figure su ${shapeData.length}.`)+`<div class="success-banner">⭐ Hai raccolto ${sessionStars} stelle in questo mondo!</div><div class="action-row"><button class="primary-btn" id="replay">Gioca ancora</button><button class="secondary-btn" id="home">Torna ai mondi</button></div>`;$("#replay").onclick=renderShapes;$("#home").onclick=()=>$("#backHome").click();}
    else showShapeQuestion();
  });
}

function renderDraw(){
  gameContent.innerHTML=heading("MONDO 2 · LA BOTTEGA DEL DISEGNO","La tua lavagna magica","Scegli uno strumento e disegna! Puoi usare il mouse o il dito sullo schermo.")+
  `<div class="drawing-layout"><div class="canvas-wrap"><canvas id="drawCanvas" width="900" height="600"></canvas></div><aside class="draw-tools"><h3>🖍️ Strumenti</h3>
  <button class="tool-btn active" data-tool="free">✏️ Disegno libero</button><button class="tool-btn" data-tool="line">📏 Linea</button><button class="tool-btn" data-tool="rect">🟦 Rettangolo</button><button class="tool-btn" data-tool="square">🟪 Quadrato</button><button class="tool-btn" data-tool="circle">🔵 Cerchio</button><button class="tool-btn" data-tool="triangle">🔺 Triangolo</button>
  <label class="tool-hint">Colore <input id="penColor" type="color" value="#6558e8"></label><label class="tool-hint">Spessore <input id="penSize" type="range" min="2" max="18" value="6"></label>
  <button id="undoDraw" class="tool-btn">↶ Annulla</button><button id="clearDraw" class="tool-btn">🧽 Cancella tutto</button><p class="tool-hint">Prova a disegnare una casa usando un quadrato, un triangolo e un rettangolo!</p></aside></div>`;
  setupCanvas();
}
function setupCanvas(){
  const canvas=$("#drawCanvas"),ctx=canvas.getContext("2d");
  let drawing=false,start=null,last=null,tool="free",snapshot=null,history=[];
  function save(){history.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.length>20)history.shift();}
  function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
  function drawShape(a,b){
    ctx.beginPath();const w=b.x-a.x,h=b.y-a.y;
    if(tool==="line"){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
    if(tool==="rect"||tool==="square"){const side=tool==="square"?Math.min(Math.abs(w),Math.abs(h)):null;ctx.rect(a.x,a.y,tool==="square"?Math.sign(w||1)*side:w,tool==="square"?Math.sign(h||1)*side:h);}
    if(tool==="circle"){ctx.ellipse(a.x+w/2,a.y+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);}
    if(tool==="triangle"){ctx.moveTo(a.x+w/2,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(a.x,b.y);ctx.closePath();}
    ctx.stroke();
  }
  canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);drawing=true;start=last=pos(e);save();snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);ctx.strokeStyle=$("#penColor").value;ctx.lineWidth=$("#penSize").value;ctx.lineCap="round";ctx.lineJoin="round";});
  canvas.addEventListener("pointermove",e=>{if(!drawing)return;const p=pos(e);if(tool==="free"){ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;}else{ctx.putImageData(snapshot,0,0);drawShape(start,p);}});
  function finish(e){if(!drawing)return;const p=pos(e);if(tool!=="free"){ctx.putImageData(snapshot,0,0);drawShape(start,p);}drawing=false;}
  canvas.addEventListener("pointerup",finish);canvas.addEventListener("pointercancel",finish);
  document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x===b));});
  $("#clearDraw").onclick=()=>{save();ctx.clearRect(0,0,canvas.width,canvas.height);};
  $("#undoDraw").onclick=()=>{const d=history.pop();if(d)ctx.putImageData(d,0,0);};
}

function renderTriangles(){
  triangleIndex=0;showTriangle();
}
function showTriangle(){
  const q=triangleQuestions[triangleIndex];
  const pts=trianglePoints(q.sides);
  gameContent.innerHTML=heading("MONDO 3 · L'ISOLA DEI TRIANGOLI","Che triangolo sarà?","Osserva i lati e scegli il tipo corretto.")+
  `<div class="triangle-stage"><svg class="diagram" viewBox="0 0 260 210" role="img" aria-label="Disegno di un triangolo"><polygon points="${pts}" fill="#ffcfdf" stroke="#d94f83" stroke-width="5" stroke-linejoin="round"/></svg><div style="max-width:300px"><h3>${q.desc}</h3><p class="tool-hint">Suggerimento: conta quanti lati hanno la stessa lunghezza.</p></div></div>
  <div class="choice-row">${q.labels.map(x=>`<button class="choice-btn" data-tri="${x}">${x}</button>`).join("")}</div><div id="feedback" class="feedback" style="text-align:center"></div><div class="action-row"><button id="nextTri" class="primary-btn" disabled>Prossimo triangolo →</button></div>`;
  document.querySelectorAll("[data-tri]").forEach(b=>b.onclick=()=>{
    if($("#nextTri").disabled===false)return;const ok=b.dataset.tri.toLowerCase()===q.type;
    document.querySelectorAll("[data-tri]").forEach(x=>{x.disabled=true;if(x.dataset.tri.toLowerCase()===q.type)x.classList.add("correct");});
    if(!ok)b.classList.add("wrong");
    $("#feedback").textContent=ok?"Esatto! Hai osservato benissimo!":"Riproveremo! La risposta corretta è: "+q.type+".";
    $("#feedback").className="feedback "+(ok?"good":"bad");if(ok)awardStar();$("#nextTri").disabled=false;
  });
  $("#nextTri").onclick=()=>{triangleIndex++;if(triangleIndex>=triangleQuestions.length){gameContent.innerHTML=heading("MONDO 3 · MISSIONE COMPLETATA","Maestra dei triangoli! 🔺","Hai scoperto tre modi per classificare i triangoli.")+`<div class="success-banner">⭐ Stelle raccolte: ${sessionStars}</div><div class="action-row"><button class="primary-btn" id="again">Rigioca</button></div>`;$("#again").onclick=renderTriangles;}else showTriangle();};
}
function trianglePoints(s){const [a,b,c]=s;const x=(c*c+a*a-b*b)/(2*c);const y=Math.sqrt(Math.max(100,a*a-x*x));const scale=1.3;return `${30},${180} ${30+x*scale},${180-y*scale} ${30+c*scale},${180}`;}

function renderAngles(){angleIndex=0;showAngle();}
const angleLessons=[{name:"Angolo acuto",desc:"È più piccolo di un angolo retto.",min:1,max:89,target:45},{name:"Angolo retto",desc:"È un angolo preciso come quello di un foglio!",min:90,max:90,target:90},{name:"Angolo ottuso",desc:"È più grande di un angolo retto ma più piccolo di quello piatto.",min:91,max:179,target:125},{name:"Angolo piatto",desc:"Forma una linea dritta: misura 180 gradi.",min:180,max:180,target:180}];
function showAngle(){
  const a=angleLessons[angleIndex];angleValue=a.target;
  gameContent.innerHTML=heading("MONDO 4 · IL REGNO DEGLI ANGOLI","Costruiamo un angolo!","Muovi il cursore e osserva come cambia l'apertura.")+
  `<div class="angle-stage"><svg class="diagram" viewBox="0 0 300 230"><line x1="55" y1="175" x2="265" y2="175" stroke="#c8c5df" stroke-width="2" stroke-dasharray="5 6"/><line id="armOne" x1="70" y1="175" x2="250" y2="175" stroke="#665cf5" stroke-width="9" stroke-linecap="round"/><line id="armTwo" x1="70" y1="175" x2="200" y2="45" stroke="#ff8d69" stroke-width="9" stroke-linecap="round"/><circle cx="70" cy="175" r="9" fill="#28264b"/><path id="angleArc" d="" fill="#ffe7a8" stroke="#e7a62e" stroke-width="2"/></svg>
  <div class="angle-controls"><h3 id="angleName">${a.name}</h3><p>${a.desc}</p><div class="angle-value"><span id="angleNumber">${angleValue}</span>°</div><input id="angleSlider" type="range" min="0" max="180" value="${angleValue}"><p class="tool-hint">Prova a trovare un angolo ${a.name.toLowerCase()}.</p></div></div>
  <div class="action-row"><button id="checkAngle" class="primary-btn">Controlla il mio angolo</button><button id="nextAngle" class="secondary-btn">Prossimo angolo →</button></div><div id="feedback" class="feedback" style="text-align:center"></div>`;
  const slider=$("#angleSlider");
  slider.oninput=()=>{angleValue=Number(slider.value);drawAngle();};
  function drawAngle(){
    $("#angleNumber").textContent=angleValue;
    const rad=angleValue*Math.PI/180, x=70+180*Math.cos(rad), y=175-180*Math.sin(rad);
    $("#armTwo").setAttribute("x2",x);$("#armTwo").setAttribute("y2",y);
    const r=38,ex=70+r*Math.cos(rad),ey=175-r*Math.sin(rad);
    $("#angleArc").setAttribute("d",`M 108 175 A ${r} ${r} 0 ${angleValue>180?1:0} 0 ${ex} ${ey} L 70 175 Z`);
  }
  drawAngle();
  $("#checkAngle").onclick=()=>{
    const ok=angleValue>=a.min&&angleValue<=a.max;
    $("#feedback").textContent=ok?"Perfetto! Hai costruito l'angolo giusto!":"Non ancora! Prova a regolare il cursore e osserva l'apertura.";
    $("#feedback").className="feedback "+(ok?"good":"bad");if(ok&&!$("#checkAngle").dataset.won){awardStar();$("#checkAngle").dataset.won="1";}
  };
  $("#nextAngle").onclick=()=>{angleIndex++;if(angleIndex>=angleLessons.length){gameContent.innerHTML=heading("MONDO 4 · MISSIONE COMPLETATA","Che occhio per gli angoli! 📐","Hai esplorato quattro tipi di angolo.")+`<div class="success-banner">⭐ Stelle raccolte: ${sessionStars}</div><div class="action-row"><button class="primary-btn" id="again">Rigioca</button></div>`;$("#again").onclick=renderAngles;}else showAngle();};
}

function renderTangram(){
  const colors=["#f47c91","#6c9cff","#f5c65b","#65cdb1","#9b83ed","#f29b58","#65b9d8"];
  gameContent.innerHTML=heading("MONDO 5 · IL LABORATORIO DELLE FORME","Il tangram colorato","Trascina i pezzi sul tavolo e prova a creare una figura. Comincia costruendo una casetta!")+
  `<div class="tangram-board" id="tangramBoard"><svg viewBox="0 0 500 500" width="100%" height="100%" style="position:absolute;inset:0;pointer-events:none;opacity:.12"><path d="M110 310 L250 160 L390 310 Z M150 310 V420 H350 V310" fill="none" stroke="#6558e8" stroke-width="8" stroke-dasharray="10 9"/></svg>
  <svg class="tangram-piece" data-piece="0" viewBox="0 0 100 100" style="left:4%;top:5%;width:27%"><polygon points="0,0 100,0 0,100" fill="${colors[0]}"/></svg>
  <svg class="tangram-piece" data-piece="1" viewBox="0 0 100 100" style="left:36%;top:5%;width:27%"><polygon points="0,0 100,0 100,100" fill="${colors[1]}"/></svg>
  <svg class="tangram-piece" data-piece="2" viewBox="0 0 100 100" style="left:68%;top:5%;width:23%"><polygon points="0,0 100,0 50,50" fill="${colors[2]}"/></svg>
  <svg class="tangram-piece" data-piece="3" viewBox="0 0 100 100" style="left:4%;top:40%;width:22%"><polygon points="50,0 100,50 50,100 0,50" fill="${colors[3]}"/></svg>
  <svg class="tangram-piece" data-piece="4" viewBox="0 0 100 100" style="left:34%;top:43%;width:22%"><polygon points="0,0 100,0 50,100" fill="${colors[4]}"/></svg>
  <svg class="tangram-piece" data-piece="5" viewBox="0 0 100 100" style="left:65%;top:42%;width:22%"><polygon points="0,0 100,0 100,100" fill="${colors[5]}"/></svg>
  <svg class="tangram-piece" data-piece="6" viewBox="0 0 100 100" style="left:38%;top:72%;width:20%"><polygon points="0,0 100,0 100,100 0,100" fill="${colors[6]}"/></svg></div>
  <p class="tangram-controls">Trascina i pezzi con il dito o con il mouse. Lo spazio tratteggiato è un'idea per la tua casetta: inventa anche altre figure!</p>
  <div class="action-row"><button id="resetTangram" class="secondary-btn">Rimetti a posto i pezzi</button><button id="tangramDone" class="primary-btn">Ho finito la mia figura!</button></div><div id="feedback" class="feedback" style="text-align:center"></div>`;
  const board=$("#tangramBoard");let active=null,offset={x:0,y:0};
  board.querySelectorAll(".tangram-piece").forEach(piece=>{
    piece.addEventListener("pointerdown",e=>{active=piece;const r=piece.getBoundingClientRect();offset.x=e.clientX-r.left;offset.y=e.clientY-r.top;piece.setPointerCapture(e.pointerId);piece.style.zIndex=10;});
    piece.addEventListener("pointermove",e=>{if(active!==piece)return;const b=board.getBoundingClientRect();let x=e.clientX-b.left-offset.x,y=e.clientY-b.top-offset.y;x=Math.max(0,Math.min(b.width-piece.offsetWidth,x));y=Math.max(0,Math.min(b.height-piece.offsetHeight,y));piece.style.left=(x/b.width*100)+"%";piece.style.top=(y/b.height*100)+"%";});
    piece.addEventListener("pointerup",()=>{active=null;piece.style.zIndex=1;});
  });
  $("#resetTangram").onclick=renderTangram;
  $("#tangramDone").onclick=()=>{$("#feedback").textContent="Che bella composizione! Nel tangram puoi creare tantissime figure diverse. Bravissima!";$("#feedback").className="feedback good";if(!$("#tangramDone").dataset.won){awardStar(2);$("#tangramDone").dataset.won="1";}};
}
