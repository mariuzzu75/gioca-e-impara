const $ = (s) => document.querySelector(s);
const gamePanel = $("#gamePanel");
const gameContent = $("#gameContent");
let totalStars = Number(localStorage.getItem("geoStars") || 0);
let sessionStars = 0;
let visited = JSON.parse(localStorage.getItem("geoVisited") || "[]");
let quizIndex = 0, quizScore = 0, currentWorld = "";
let shapeBoardController = null;
$("#totalStars").textContent = totalStars;
updateProgress();

const shapeData = [
  {name:"Cerchio", cls:"circle", sides:0, fact:"Il cerchio Ã¨ rotondo e non ha lati."},
  {name:"Quadrato", cls:"square", sides:4, fact:"Il quadrato ha 4 lati tutti uguali."},
  {name:"Triangolo", cls:"triangle", sides:3, fact:"Il triangolo ha 3 lati e 3 angoli."},
  {name:"Rettangolo", cls:"rectangle", sides:4, fact:"Il rettangolo ha 4 lati: quelli opposti sono uguali."},
  {name:"Rombo", cls:"diamond", sides:4, fact:"Il rombo ha 4 lati tutti uguali."},
  {name:"Pentagono", cls:"pentagon", sides:5, fact:"Il pentagono ha 5 lati."},
  {name:"Esagono", cls:"hexagon", sides:6, fact:"L'esagono ha 6 lati."}
];
const triangleQuestions = [
  {type:"equilatero",desc:"I tre lati sono tutti uguali.",sides:[70,70,70],labels:["Equilatero","Isoscele","Scaleno"]},
  {type:"isoscele",desc:"Due lati sono uguali e uno Ã¨ diverso.",sides:[78,78,110],labels:["Scaleno","Isoscele","Equilatero"]},
  {type:"scaleno",desc:"Tutti e tre i lati sono diversi.",sides:[62,88,112],labels:["Isoscele","Equilatero","Scaleno"]}
];
let triangleIndex = 0, angleIndex = 0, angleValue = 55;

function updateProgress(){
  $("#progressLabel").textContent = `${visited.length} di 5 mondi visitati`;
  document.querySelectorAll(".world-card").forEach(b=>{
    const done=visited.includes(b.dataset.world);
    b.classList.toggle("completed",done);
    b.querySelector(".world-go").textContent=done?"â­ COMPLETATO":"ENTRA â†’";
  });
}
function awardStar(n=1){
  totalStars+=n; sessionStars+=n;
  localStorage.setItem("geoStars",totalStars);
  $("#totalStars").textContent=totalStars;
  $("#sessionStars").textContent=sessionStars;
}
function enterWorld(world){
  if(shapeBoardController){shapeBoardController.abort();shapeBoardController=null;}
  currentWorld=world; sessionStars=0; $("#sessionStars").textContent="0";
  gamePanel.classList.remove("hidden");
  gamePanel.scrollIntoView({behavior:"smooth",block:"start"});
  if(!visited.includes(world)){visited.push(world);localStorage.setItem("geoVisited",JSON.stringify(visited));updateProgress();}
  ({shapes:renderShapes,draw:renderDraw,triangles:renderTriangles,angles:renderAngles,tangram:renderTangram})[world]();
}
document.querySelectorAll(".world-card").forEach(b=>b.addEventListener("click",()=>enterWorld(b.dataset.world)));
$("#backHome").addEventListener("click",()=>{if(shapeBoardController){shapeBoardController.abort();shapeBoardController=null;}gamePanel.classList.add("hidden");document.querySelector(".worlds-section").scrollIntoView({behavior:"smooth"});});

function heading(kicker,title,subtitle){return `<span class="eyebrow">${kicker}</span><h2 class="game-title">${title}</h2><p class="game-subtitle">${subtitle}</p>`;}
function renderShapes(){
  quizIndex=0;quizScore=0;showShapeQuestion();
}
function showShapeQuestion(){
  const q=shapeData[quizIndex%shapeData.length];
  const choices=[q,...shapeData.filter(x=>x.name!==q.name).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
  gameContent.innerHTML=heading("MONDO 1 Â· IL PAESE DELLE FORME","Che figura Ã¨?","Guarda bene la figura e scegli il suo nome.")+
  `<div class="question-card"><h3>Come si chiama questa figura?</h3><span class="mini-shape ${q.cls}" style="width:75px;height:75px;${q.cls==="triangle"?"border-left-width:38px;border-right-width:38px;border-bottom-width:72px":""}"></span>
  <div class="shape-options">${choices.map(c=>`<button class="option" data-answer="${c.name}"><span class="mini-shape ${c.cls}"></span>${c.name}</button>`).join("")}</div>
  <div id="feedback" class="feedback"></div><div class="action-row"><button id="nextQuestion" class="primary-btn" disabled>Prossima figura â†’</button></div></div>
  <p class="tool-hint" style="text-align:center">Domanda ${quizIndex+1} di ${shapeData.length}</p>`;
  document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{
    if($("#nextQuestion").disabled===false)return;
    const ok=b.dataset.answer===q.name;
    document.querySelectorAll("[data-answer]").forEach(x=>{x.disabled=true;if(x.dataset.answer===q.name)x.classList.add("correct");});
    if(!ok)b.classList.add("wrong");
    $("#feedback").textContent=ok?`Bravissima! ${q.fact}`:`Quasi! Questa Ã¨ ${q.name}. ${q.fact}`;
    $("#feedback").className="feedback "+(ok?"good":"bad");
    if(ok){quizScore++;awardStar();}
    $("#nextQuestion").disabled=false;
  }));
  $("#nextQuestion").addEventListener("click",()=>{
    quizIndex++;
    if(quizIndex>=shapeData.length){gameContent.innerHTML=heading("MONDO 1 Â· MISSIONE COMPLETATA","Esploratrice delle forme! ðŸ†",`Hai riconosciuto ${quizScore} figure su ${shapeData.length}.`)+`<div class="success-banner">â­ Hai raccolto ${sessionStars} stelle in questo mondo!</div><div class="action-row"><button class="primary-btn" id="replay">Gioca ancora</button><button class="secondary-btn" id="home">Torna ai mondi</button></div>`;$("#replay").onclick=renderShapes;$("#home").onclick=()=>$("#backHome").click();}
    else showShapeQuestion();
  });
}

function renderDraw(){
  gameContent.innerHTML=heading("MONDO 2 Â· LA BOTTEGA DEL DISEGNO","La tua lavagna magica","Scegli uno strumento e disegna! Puoi usare il mouse o il dito sullo schermo.")+
  `<div class="drawing-layout"><div class="canvas-wrap"><canvas id="drawCanvas" width="900" height="600"></canvas></div><aside class="draw-tools"><h3>ðŸ–ï¸ Strumenti</h3>
  <button class="tool-btn active" data-tool="free">âœï¸ Disegno libero</button><button class="tool-btn" data-tool="line">ðŸ“ Linea</button><button class="tool-btn" data-tool="rect">ðŸŸ¦ Rettangolo</button><button class="tool-btn" data-tool="square">ðŸŸª Quadrato</button><button class="tool-btn" data-tool="circle">ðŸ”µ Cerchio</button><button class="tool-btn" data-tool="triangle">ðŸ”º Triangolo</button>
  <label class="tool-hint">Colore <input id="penColor" type="color" value="#6558e8"></label><label class="tool-hint">Spessore <input id="penSize" type="range" min="2" max="18" value="6"></label>
  <button id="undoDraw" class="tool-btn">â†¶ Annulla</button><button id="clearDraw" class="tool-btn">ðŸ§½ Cancella tutto</button><p class="tool-hint">Prova a disegnare una casa usando un quadrato, un triangolo e un rettangolo!</p></aside></div>`;
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
  gameContent.innerHTML=heading("MONDO 3 Â· L'ISOLA DEI TRIANGOLI","Che triangolo sarÃ ?","Osserva i lati e scegli il tipo corretto.")+
  `<div class="triangle-stage"><svg class="diagram" viewBox="0 0 260 210" role="img" aria-label="Disegno di un triangolo"><polygon points="${pts}" fill="#ffcfdf" stroke="#d94f83" stroke-width="5" stroke-linejoin="round"/></svg><div style="max-width:300px"><h3>${q.desc}</h3><p class="tool-hint">Suggerimento: conta quanti lati hanno la stessa lunghezza.</p></div></div>
  <div class="choice-row">${q.labels.map(x=>`<button class="choice-btn" data-tri="${x}">${x}</button>`).join("")}</div><div id="feedback" class="feedback" style="text-align:center"></div><div class="action-row"><button id="nextTri" class="primary-btn" disabled>Prossimo triangolo â†’</button></div>`;
  document.querySelectorAll("[data-tri]").forEach(b=>b.onclick=()=>{
    if($("#nextTri").disabled===false)return;const ok=b.dataset.tri.toLowerCase()===q.type;
    document.querySelectorAll("[data-tri]").forEach(x=>{x.disabled=true;if(x.dataset.tri.toLowerCase()===q.type)x.classList.add("correct");});
    if(!ok)b.classList.add("wrong");
    $("#feedback").textContent=ok?"Esatto! Hai osservato benissimo!":"Riproveremo! La risposta corretta Ã¨: "+q.type+".";
    $("#feedback").className="feedback "+(ok?"good":"bad");if(ok)awardStar();$("#nextTri").disabled=false;
  });
  $("#nextTri").onclick=()=>{triangleIndex++;if(triangleIndex>=triangleQuestions.length){gameContent.innerHTML=heading("MONDO 3 Â· MISSIONE COMPLETATA","Maestra dei triangoli! ðŸ”º","Hai scoperto tre modi per classificare i triangoli.")+`<div class="success-banner">â­ Stelle raccolte: ${sessionStars}</div><div class="action-row"><button class="primary-btn" id="again">Rigioca</button></div>`;$("#again").onclick=renderTriangles;}else showTriangle();};
}
function trianglePoints(s){const [a,b,c]=s;const x=(c*c+a*a-b*b)/(2*c);const y=Math.sqrt(Math.max(100,a*a-x*x));const scale=1.3;return `${30},${180} ${30+x*scale},${180-y*scale} ${30+c*scale},${180}`;}

function renderAngles(){angleIndex=0;showAngle();}
const angleLessons=[{name:"Angolo acuto",desc:"Ãˆ piÃ¹ piccolo di un angolo retto.",min:1,max:89,target:45},{name:"Angolo retto",desc:"Ãˆ un angolo preciso come quello di un foglio!",min:90,max:90,target:90},{name:"Angolo ottuso",desc:"Ãˆ piÃ¹ grande di un angolo retto ma piÃ¹ piccolo di quello piatto.",min:91,max:179,target:125},{name:"Angolo piatto",desc:"Forma una linea dritta: misura 180 gradi.",min:180,max:180,target:180}];
function showAngle(){
  const a=angleLessons[angleIndex];angleValue=a.target;
  gameContent.innerHTML=heading("MONDO 4 Â· IL REGNO DEGLI ANGOLI","Costruiamo un angolo!","Muovi il cursore e osserva come cambia l'apertura.")+
  `<div class="angle-stage"><svg class="diagram" viewBox="0 0 300 230"><line x1="55" y1="175" x2="265" y2="175" stroke="#c8c5df" stroke-width="2" stroke-dasharray="5 6"/><line id="armOne" x1="70" y1="175" x2="250" y2="175" stroke="#665cf5" stroke-width="9" stroke-linecap="round"/><line id="armTwo" x1="70" y1="175" x2="200" y2="45" stroke="#ff8d69" stroke-width="9" stroke-linecap="round"/><circle cx="70" cy="175" r="9" fill="#28264b"/><path id="angleArc" d="" fill="#ffe7a8" stroke="#e7a62e" stroke-width="2"/></svg>
  <div class="angle-controls"><h3 id="angleName">${a.name}</h3><p>${a.desc}</p><div class="angle-value"><span id="angleNumber">${angleValue}</span>Â°</div><input id="angleSlider" type="range" min="0" max="180" value="${angleValue}"><p class="tool-hint">Prova a trovare un angolo ${a.name.toLowerCase()}.</p></div></div>
  <div class="action-row"><button id="checkAngle" class="primary-btn">Controlla il mio angolo</button><button id="nextAngle" class="secondary-btn">Prossimo angolo â†’</button></div><div id="feedback" class="feedback" style="text-align:center"></div>`;
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
  $("#nextAngle").onclick=()=>{angleIndex++;if(angleIndex>=angleLessons.length){gameContent.innerHTML=heading("MONDO 4 Â· MISSIONE COMPLETATA","Che occhio per gli angoli! ðŸ“","Hai esplorato quattro tipi di angolo.")+`<div class="success-banner">â­ Stelle raccolte: ${sessionStars}</div><div class="action-row"><button class="primary-btn" id="again">Rigioca</button></div>`;$("#again").onclick=renderAngles;}else showAngle();};
}

function renderTangram(){
  if(shapeBoardController)shapeBoardController.abort();
  shapeBoardController=new AbortController();
  const signal=shapeBoardController.signal;
  const palette=["#f47c91","#6c9cff","#f5c65b","#65cdb1","#9b83ed","#f29b58","#65b9d8"];
  const shapeNames={triangle:"Triangolo",square:"Quadrato",rectangle:"Rettangolo",circle:"Cerchio"};
  const shapeIcons={triangle:"ðŸ”º",square:"ðŸŸ¦",rectangle:"â–­",circle:"ðŸ”µ"};

  gameContent.innerHTML=heading(
    "MONDO 5 Â· IL LABORATORIO DELLE FORME",
    "La lavagna delle forme",
    "Scegli forma, dimensione e colore. Poi trascina, ruota, ingrandisci o elimina ogni figura."
  )+`<div class="shape-lab">
    <div class="shape-board" id="shapeBoard" aria-label="Lavagna delle forme">
      <p class="shape-board-hint">Trascina qui le forme e crea quello che vuoi!</p>
    </div>
    <aside class="shape-tools" aria-label="Strumenti della lavagna">
      <section class="shape-tool-section">
        <h3>1. Dimensione</h3>
        <div class="size-presets" role="group" aria-label="Dimensioni rapide">
          <button type="button" data-size="64">Piccola</button>
          <button type="button" data-size="100" class="active">Media</button>
          <button type="button" data-size="140">Grande</button>
        </div>
        <label class="shape-range-label" for="shapeSize">Misura: <strong id="shapeSizeValue">100 px</strong></label>
        <input id="shapeSize" type="range" min="48" max="170" step="2" value="100">
      </section>
      <section class="shape-tool-section">
        <h3>2. Colore</h3>
        <div class="color-palette" id="shapePalette" role="group" aria-label="Colori">
          ${palette.map((color,i)=>`<button type="button" class="color-swatch${i===0?" active":""}" data-color="${color}" style="--swatch:${color}" aria-label="Colore ${i+1}"></button>`).join("")}
          <label class="custom-color" title="Scegli un altro colore"><span>ï¼‹</span><input id="shapeColor" type="color" value="${palette[0]}" aria-label="Scegli un altro colore"></label>
        </div>
      </section>
      <section class="shape-tool-section">
        <h3>3. Aggiungi una forma</h3>
        <div class="shape-picker">
          ${Object.keys(shapeNames).map(type=>`<button type="button" data-add-shape="${type}"><span>${shapeIcons[type]}</span>${shapeNames[type]}</button>`).join("")}
        </div>
      </section>
      <section class="shape-tool-section selected-tools">
        <h3>Figura selezionata</h3>
        <p id="selectedShapeLabel">Tocca una figura sulla lavagna.</p>
        <div class="shape-actions">
          <button type="button" id="rotateShape" disabled aria-label="Ruota la figura">â†» <span>Ruota</span></button>
          <button type="button" id="shrinkShape" disabled aria-label="Rimpicciolisci la figura">âˆ’ <span>Riduci</span></button>
          <button type="button" id="growShape" disabled aria-label="Ingrandisci la figura">ï¼‹ <span>Ingrandisci</span></button>
          <button type="button" id="deleteShape" class="delete-shape" disabled aria-label="Elimina la figura">ðŸ—‘ï¸ <span>Elimina</span></button>
        </div>
      </section>
    </aside>
  </div>
  <div class="shape-lab-footer">
    <p class="shape-status" id="shapeStatus" aria-live="polite">4 forme sulla lavagna. Toccane una per selezionarla.</p>
    <div class="action-row">
      <button id="clearShapes" class="secondary-btn">ðŸ§½ Svuota la lavagna</button>
      <button id="tangramDone" class="primary-btn">Ho finito la mia figura!</button>
    </div>
  </div>
  <div id="feedback" class="feedback" style="text-align:center" aria-live="polite"></div>`;

  const board=$("#shapeBoard");
  const sizeInput=$("#shapeSize");
  const colorInput=$("#shapeColor");
  const status=$("#shapeStatus");
  const selectedLabel=$("#selectedShapeLabel");
  const selectedButtons=[$("#rotateShape"),$("#shrinkShape"),$("#growShape"),$("#deleteShape")];
  let currentColor=palette[0];
  let selected=null;
  let active=null;
  let pointerId=null;
  let startX=0,startY=0,startLeft=0,startTop=0;
  let nextId=1;

  function updateCount(message=""){
    const count=board.querySelectorAll(".shape-piece").length;
    status.textContent=message||`${count} ${count===1?"forma":"forme"} sulla lavagna.`;
  }

  function keepInside(piece){
    const maxLeft=Math.max(0,board.clientWidth-piece.offsetWidth);
    const maxTop=Math.max(0,board.clientHeight-piece.offsetHeight);
    const left=Math.max(0,Math.min(maxLeft,parseFloat(piece.style.left)||0));
    const top=Math.max(0,Math.min(maxTop,parseFloat(piece.style.top)||0));
    piece.style.left=`${left}px`;
    piece.style.top=`${top}px`;
  }

  function setPieceSize(piece,size){
    const safeSize=Math.max(48,Math.min(170,Number(size)));
    piece.dataset.size=safeSize;
    if(piece.dataset.type==="rectangle"){
      piece.style.width=`${Math.round(safeSize*1.42)}px`;
      piece.style.height=`${Math.round(safeSize*.72)}px`;
    }else{
      piece.style.width=`${safeSize}px`;
      piece.style.height=`${safeSize}px`;
    }
    keepInside(piece);
  }

  function setColor(color,applyToSelection=true){
    currentColor=color;
    colorInput.value=color;
    document.querySelectorAll(".color-swatch").forEach(swatch=>swatch.classList.toggle("active",swatch.dataset.color.toLowerCase()===color.toLowerCase()));
    if(applyToSelection&&selected){
      selected.dataset.color=color;
      selected.querySelector(".lab-shape-fill").style.background=color;
      updateCount(`Colore del ${shapeNames[selected.dataset.type].toLowerCase()} cambiato.`);
    }
  }

  function selectPiece(piece,announce=true){
    board.querySelectorAll(".shape-piece").forEach(item=>item.classList.toggle("selected",item===piece));
    selected=piece;
    selectedButtons.forEach(button=>button.disabled=!piece);
    if(!piece){
      selectedLabel.textContent="Tocca una figura sulla lavagna.";
      return;
    }
    selectedLabel.textContent=shapeNames[piece.dataset.type];
    setColor(piece.dataset.color,false);
    if(announce)updateCount(`${shapeNames[piece.dataset.type]} selezionato. Usa i comandi per modificarlo.`);
  }

  function addShape(type,color=currentColor,size=Number(sizeInput.value),left=null,top=null,announce=true){
    const piece=document.createElement("div");
    piece.className="shape-piece";
    piece.dataset.type=type;
    piece.dataset.color=color;
    piece.dataset.rotation="0";
    piece.dataset.shapeId=String(nextId++);
    piece.tabIndex=0;
    piece.setAttribute("role","button");
    piece.setAttribute("aria-label",`${shapeNames[type]}. Trascina per spostare o premi Invio per selezionare.`);
    piece.style.setProperty("--rotation","0deg");
    piece.innerHTML=`<span class="lab-shape-fill lab-${type}" style="background:${color}"></span>`;
    board.appendChild(piece);
    setPieceSize(piece,size);
    const index=board.querySelectorAll(".shape-piece").length-1;
    piece.style.left=`${left===null?18+(index*37)%Math.max(40,board.clientWidth-piece.offsetWidth-20):left}px`;
    piece.style.top=`${top===null?22+(index*31)%Math.max(40,board.clientHeight-piece.offsetHeight-20):top}px`;
    keepInside(piece);
    selectPiece(piece,false);
    if(announce)updateCount(`${shapeNames[type]} aggiunto. Trascinalo dove vuoi.`);
    return piece;
  }

  function rotateSelected(){
    if(!selected)return;
    const rotation=(Number(selected.dataset.rotation)+45)%360;
    selected.dataset.rotation=rotation;
    selected.style.setProperty("--rotation",`${rotation}deg`);
    updateCount(`${shapeNames[selected.dataset.type]} ruotato di ${rotation} gradi.`);
  }

  function resizeSelected(delta){
    if(!selected)return;
    setPieceSize(selected,Number(selected.dataset.size)+delta);
    updateCount(`${shapeNames[selected.dataset.type]}: dimensione ${selected.dataset.size} pixel.`);
  }

  function deleteSelected(){
    if(!selected)return;
    const name=shapeNames[selected.dataset.type];
    selected.remove();
    selectPiece(null,false);
    updateCount(`${name} eliminato.`);
  }

  board.addEventListener("pointerdown",e=>{
    const piece=e.target.closest(".shape-piece");
    if(!piece){selectPiece(null,false);return;}
    e.preventDefault();
    selectPiece(piece);
    active=piece;
    pointerId=e.pointerId;
    startX=e.clientX;startY=e.clientY;
    startLeft=parseFloat(piece.style.left)||0;
    startTop=parseFloat(piece.style.top)||0;
    piece.classList.add("dragging");
    try{board.setPointerCapture(pointerId);}catch(error){}
  },{signal});

  board.addEventListener("pointermove",e=>{
    if(!active||e.pointerId!==pointerId)return;
    e.preventDefault();
    active.style.left=`${startLeft+e.clientX-startX}px`;
    active.style.top=`${startTop+e.clientY-startY}px`;
    keepInside(active);
  },{signal});

  function finishDrag(e){
    if(!active||e.pointerId!==pointerId)return;
    active.classList.remove("dragging");
    try{board.releasePointerCapture(pointerId);}catch(error){}
    active=null;pointerId=null;
  }
  board.addEventListener("pointerup",finishDrag,{signal});
  board.addEventListener("pointercancel",finishDrag,{signal});

  board.addEventListener("keydown",e=>{
    const piece=e.target.closest(".shape-piece");
    if(!piece)return;
    selectPiece(piece,false);
    if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();deleteSelected();return;}
    if(e.key.toLowerCase()==="r"){e.preventDefault();rotateSelected();return;}
    const step=e.shiftKey?10:3;
    const moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
    if(moves[e.key]){
      e.preventDefault();
      piece.style.left=`${(parseFloat(piece.style.left)||0)+moves[e.key][0]}px`;
      piece.style.top=`${(parseFloat(piece.style.top)||0)+moves[e.key][1]}px`;
      keepInside(piece);
    }
  },{signal});

  document.querySelectorAll("[data-add-shape]").forEach(button=>button.addEventListener("click",()=>addShape(button.dataset.addShape),{signal}));
  document.querySelectorAll("[data-size]").forEach(button=>button.addEventListener("click",()=>{
    sizeInput.value=button.dataset.size;
    $("#shapeSizeValue").textContent=`${button.dataset.size} px`;
    document.querySelectorAll("[data-size]").forEach(item=>item.classList.toggle("active",item===button));
  },{signal}));
  sizeInput.addEventListener("input",()=>{
    $("#shapeSizeValue").textContent=`${sizeInput.value} px`;
    document.querySelectorAll("[data-size]").forEach(item=>item.classList.toggle("active",item.dataset.size===sizeInput.value));
  },{signal});
  document.querySelectorAll(".color-swatch").forEach(swatch=>swatch.addEventListener("click",()=>setColor(swatch.dataset.color),{signal}));
  colorInput.addEventListener("input",()=>setColor(colorInput.value),{signal});
  $("#rotateShape").addEventListener("click",rotateSelected,{signal});
  $("#shrinkShape").addEventListener("click",()=>resizeSelected(-12),{signal});
  $("#growShape").addEventListener("click",()=>resizeSelected(12),{signal});
  $("#deleteShape").addEventListener("click",deleteSelected,{signal});
  $("#clearShapes").addEventListener("click",()=>{
    board.querySelectorAll(".shape-piece").forEach(piece=>piece.remove());
    selectPiece(null,false);
    updateCount("Lavagna svuotata. Scegli una forma per ricominciare!");
  },{signal});
  window.addEventListener("resize",()=>board.querySelectorAll(".shape-piece").forEach(keepInside),{signal});

  addShape("triangle",palette[0],82,24,24,false);
  addShape("square",palette[1],86,132,42,false);
  addShape("circle",palette[2],76,250,28,false);
  addShape("rectangle",palette[3],92,350,54,false);
  selectPiece(null,false);
  updateCount("4 forme sulla lavagna. Toccane una per selezionarla.");

  $("#tangramDone").addEventListener("click",()=>{
    const count=board.querySelectorAll(".shape-piece").length;
    if(!count){
      $("#feedback").textContent="Aggiungi almeno una forma prima di terminare!";
      $("#feedback").className="feedback bad";
      return;
    }
    $("#feedback").textContent=`Che bella composizione! Hai usato ${count} ${count===1?"forma":"forme"}. Bravissima!`;
    $("#feedback").className="feedback good";
    if(!$("#tangramDone").dataset.won){awardStar(2);$("#tangramDone").dataset.won="1";}
  },{signal});
}
