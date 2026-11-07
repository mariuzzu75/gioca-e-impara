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
  const nextLabel=angleIndex===angleLessons.length-1?"Scopri le parallele →":"Prossimo angolo →";
  gameContent.innerHTML=heading("MONDO 4 · IL REGNO DEGLI ANGOLI","Costruiamo un angolo!","Muovi il cursore e osserva come cambia l'apertura.")+
  `<p class="angle-progress">ATTIVITÀ ${angleIndex+1} DI 5</p><div class="angle-stage"><svg class="diagram" viewBox="0 0 300 230" role="img" aria-label="Angolo regolabile"><line x1="55" y1="175" x2="265" y2="175" stroke="#c8c5df" stroke-width="2" stroke-dasharray="5 6"/><line id="armOne" x1="70" y1="175" x2="250" y2="175" stroke="#665cf5" stroke-width="9" stroke-linecap="round"/><line id="armTwo" x1="70" y1="175" x2="200" y2="45" stroke="#ff8d69" stroke-width="9" stroke-linecap="round"/><circle cx="70" cy="175" r="9" fill="#28264b"/><path id="angleArc" d="" fill="#ffe7a8" stroke="#e7a62e" stroke-width="2"/></svg>
  <div class="angle-controls"><h3 id="angleName">${a.name}</h3><p>${a.desc}</p><div class="angle-value"><span id="angleNumber">${angleValue}</span>°</div><input id="angleSlider" type="range" min="0" max="180" value="${angleValue}" aria-label="Ampiezza dell'angolo"><p class="tool-hint">Prova a trovare un angolo ${a.name.toLowerCase()}.</p></div></div>
  <div class="action-row"><button id="checkAngle" class="primary-btn">Controlla il mio angolo</button><button id="nextAngle" class="secondary-btn">${nextLabel}</button></div><div id="feedback" class="feedback" style="text-align:center" aria-live="polite"></div>`;
  const slider=$("#angleSlider");
  slider.oninput=()=>{angleValue=Number(slider.value);drawAngle();};
  function drawAngle(){
    $("#angleNumber").textContent=angleValue;
    const rad=angleValue*Math.PI/180, x=70+180*Math.cos(rad), y=175-180*Math.sin(rad);
    $("#armTwo").setAttribute("x2",x);$("#armTwo").setAttribute("y2",y);
    const r=38,ex=70+r*Math.cos(rad),ey=175-r*Math.sin(rad);
    $("#angleArc").setAttribute("d",`M 108 175 A ${r} ${r} 0 0 0 ${ex} ${ey} L 70 175 Z`);
  }
  drawAngle();
  $("#checkAngle").onclick=()=>{
    const ok=angleValue>=a.min&&angleValue<=a.max;
    $("#feedback").textContent=ok?"Perfetto! Hai costruito l'angolo giusto!":"Non ancora! Prova a regolare il cursore e osserva l'apertura.";
    $("#feedback").className="feedback "+(ok?"good":"bad");if(ok&&!$("#checkAngle").dataset.won){awardStar();$("#checkAngle").dataset.won="1";}
  };
  $("#nextAngle").onclick=()=>{angleIndex++;if(angleIndex>=angleLessons.length)renderParallelTransversal();else showAngle();};
}

const parallelRelations={
  corresponding:{
    label:"Corrispondenti",
    short:"stessa posizione",
    explanation:"Gli angoli corrispondenti occupano la stessa posizione nei due incroci: sono uguali.",
    question:(angle)=>`Se l'angolo viola misura ${angle}°, quanto misura l'angolo corrispondente rosa?`,
    answer:(angle)=>angle,
    success:"Esatto! Gli angoli corrispondenti hanno la stessa ampiezza."
  },
  alternate:{
    label:"Alterni interni",
    short:"dentro le parallele",
    explanation:"Gli angoli alterni interni sono tra le parallele e su lati opposti della trasversale: sono uguali.",
    question:(angle)=>`L'angolo viola misura ${angle}°. Quanto misura il suo alterno interno rosa?`,
    answer:(angle)=>angle,
    success:"Bravissima! Anche gli angoli alterni interni sono uguali."
  },
  vertical:{
    label:"Opposti al vertice",
    short:"uno di fronte all'altro",
    explanation:"Gli angoli opposti al vertice si guardano attraverso lo stesso incrocio: sono uguali.",
    question:(angle)=>`Un angolo misura ${angle}°. Quanto misura quello opposto al vertice?`,
    answer:(angle)=>angle,
    success:"Giusto! Gli angoli opposti al vertice sono sempre uguali."
  },
  supplementary:{
    label:"Supplementari",
    short:"insieme fanno 180°",
    explanation:"Due angoli adiacenti su una retta formano un angolo piatto: la loro somma è 180°.",
    question:(angle)=>`Un angolo misura ${angle}°. Quanto misura quello vicino per arrivare a 180°?`,
    answer:(angle)=>180-angle,
    success:"Perfetto! I due angoli sono supplementari e insieme formano 180°."
  }
};

function renderParallelTransversal(){
  let parallelAngle=60;
  let currentRelation="corresponding";
  const solved=new Set();

  gameContent.innerHTML=heading("MONDO 4 · ATTIVITÀ 5 DI 5","Parallele e trasversale 🛤️","Inclina la retta arancione e scopri quali angoli restano uguali.")+
  `<section class="parallel-lesson" aria-labelledby="parallelLessonTitle">
    <div class="parallel-lesson-head">
      <div><span class="parallel-badge">NUOVA SCOPERTA</span><h3 id="parallelLessonTitle">Una retta attraversa due parallele</h3></div>
      <p>Le rette <b>r</b> e <b>s</b> non si incontrano mai. La retta <b>t</b> le attraversa e crea otto angoli.</p>
    </div>
    <div class="parallel-relations" role="group" aria-label="Scegli la relazione tra gli angoli">
      ${Object.entries(parallelRelations).map(([key,relation],index)=>`<button class="relation-btn${index===0?" active":""}" data-relation="${key}" aria-pressed="${index===0?"true":"false"}"><span>${relation.label}</span><small>${relation.short}</small></button>`).join("")}
    </div>
    <div class="parallel-workspace">
      <div class="parallel-diagram-wrap">
        <svg id="parallelDiagram" class="parallel-diagram" viewBox="0 0 560 360" role="img" aria-labelledby="parallelSvgTitle parallelSvgDesc">
          <title id="parallelSvgTitle">Due rette parallele attraversate da una trasversale</title>
          <desc id="parallelSvgDesc">Gli angoli evidenziati mostrano la relazione selezionata.</desc>
          <defs><pattern id="geometryGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ecebf7" stroke-width="1"/></pattern></defs>
          <rect width="560" height="360" rx="20" fill="url(#geometryGrid)"/>
          <path id="highlightA" class="angle-highlight angle-highlight-a" d=""/>
          <path id="highlightB" class="angle-highlight angle-highlight-b" d=""/>
          <line class="parallel-line" x1="34" y1="105" x2="526" y2="105"/>
          <line class="parallel-line" x1="34" y1="255" x2="526" y2="255"/>
          <line id="transversalLine" class="transversal-line" x1="0" y1="0" x2="0" y2="360"/>
          <circle id="intersectionTop" class="intersection-dot" cx="280" cy="105" r="6"/>
          <circle id="intersectionBottom" class="intersection-dot" cx="280" cy="255" r="6"/>
          <text class="line-name" x="505" y="91">r</text><text class="line-name" x="505" y="241">s</text><text id="transversalName" class="line-name line-name-t" x="470" y="33">t</text>
          <text id="angleLabelA" class="svg-angle-label svg-angle-label-a" x="0" y="0">60°</text>
          <text id="angleLabelB" class="svg-angle-label svg-angle-label-b" x="0" y="0">60°</text>
        </svg>
        <p class="parallel-legend"><span><i class="legend-swatch legend-a"></i> Angolo viola</span><span><i class="legend-swatch legend-b"></i> Angolo rosa</span></p>
      </div>
      <aside class="parallel-controls">
        <label for="parallelSlider">Inclina la trasversale</label>
        <output id="parallelAngleOutput" for="parallelSlider">60°</output>
        <input id="parallelSlider" type="range" min="30" max="150" step="5" value="60" aria-label="Inclinazione della retta trasversale">
        <div class="slider-scale" aria-hidden="true"><span>30°</span><span>90°</span><span>150°</span></div>
        <div id="relationEquation" class="relation-equation">60° = 60°</div>
        <p id="relationExplanation" class="relation-explanation">${parallelRelations.corresponding.explanation}</p>
      </aside>
    </div>
    <div class="parallel-challenge">
      <div><span class="parallel-badge challenge-badge">PICCOLA SFIDA</span><h3 id="parallelQuestion">${parallelRelations.corresponding.question(parallelAngle)}</h3></div>
      <div class="parallel-answer-row">
        <label class="sr-only" for="parallelAnswer">Risposta in gradi</label>
        <input id="parallelAnswer" type="number" min="0" max="180" inputmode="numeric" placeholder="?" aria-describedby="parallelFeedback"><span aria-hidden="true">°</span>
        <button id="checkParallel" class="primary-btn">Controlla</button>
      </div>
      <div id="parallelFeedback" class="feedback parallel-feedback" aria-live="polite"></div>
    </div>
  </section>
  <div class="action-row"><button id="restartParallel" class="secondary-btn">↻ Ricomincia l'attività</button><button id="finishAngles" class="primary-btn">Ho capito! ✓</button></div>`;

  const slider=$("#parallelSlider");
  const answerInput=$("#parallelAnswer");

  function polarPoint(cx,cy,r,degrees){
    const radians=degrees*Math.PI/180;
    return{x:cx+r*Math.cos(radians),y:cy-r*Math.sin(radians)};
  }

  function sectorPath(cx,cy,startDegrees,endDegrees,radius){
    const start=polarPoint(cx,cy,radius,startDegrees);
    const end=polarPoint(cx,cy,radius,endDegrees);
    const largeArc=endDegrees-startDegrees>180?1:0;
    return`M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
  }

  function labelPosition(cx,cy,startDegrees,endDegrees){
    return polarPoint(cx,cy,49,(startDegrees+endDegrees)/2);
  }

  function relationSectors(topX,bottomX){
    if(currentRelation==="alternate")return[{cx:topX,cy:105,start:180,end:180+parallelAngle,value:parallelAngle},{cx:bottomX,cy:255,start:0,end:parallelAngle,value:parallelAngle}];
    if(currentRelation==="vertical")return[{cx:topX,cy:105,start:0,end:parallelAngle,value:parallelAngle},{cx:topX,cy:105,start:180,end:180+parallelAngle,value:parallelAngle}];
    if(currentRelation==="supplementary")return[{cx:topX,cy:105,start:0,end:parallelAngle,value:parallelAngle},{cx:topX,cy:105,start:parallelAngle,end:180,value:180-parallelAngle}];
    return[{cx:topX,cy:105,start:0,end:parallelAngle,value:parallelAngle},{cx:bottomX,cy:255,start:0,end:parallelAngle,value:parallelAngle}];
  }

  function updateParallelDiagram(clearAnswer=true){
    const radians=parallelAngle*Math.PI/180;
    const cotangent=Math.cos(radians)/Math.sin(radians);
    const topX=280+75*cotangent;
    const bottomX=280-75*cotangent;
    const lineTopX=280+200*cotangent;
    const lineBottomX=280-200*cotangent;
    const line=$("#transversalLine");
    line.setAttribute("x1",lineTopX.toFixed(2));line.setAttribute("y1","-20");
    line.setAttribute("x2",lineBottomX.toFixed(2));line.setAttribute("y2","380");
    $("#intersectionTop").setAttribute("cx",topX.toFixed(2));
    $("#intersectionBottom").setAttribute("cx",bottomX.toFixed(2));
    $("#transversalName").setAttribute("x",Math.max(22,Math.min(520,lineTopX+10)).toFixed(2));

    const sectors=relationSectors(topX,bottomX);
    ["A","B"].forEach((letter,index)=>{
      const sector=sectors[index];
      $("#highlight"+letter).setAttribute("d",sectorPath(sector.cx,sector.cy,sector.start,sector.end,57));
      const position=labelPosition(sector.cx,sector.cy,sector.start,sector.end);
      const label=$("#angleLabel"+letter);
      label.setAttribute("x",position.x.toFixed(2));label.setAttribute("y",position.y.toFixed(2));
      label.textContent=sector.value+"°";
    });

    const relation=parallelRelations[currentRelation];
    $("#parallelAngleOutput").textContent=parallelAngle+"°";
    $("#relationEquation").textContent=currentRelation==="supplementary"?`${parallelAngle}° + ${180-parallelAngle}° = 180°`:`${parallelAngle}° = ${parallelAngle}°`;
    $("#relationExplanation").textContent=relation.explanation;
    $("#parallelQuestion").textContent=relation.question(parallelAngle);
    if(clearAnswer){answerInput.value="";$("#parallelFeedback").textContent="";$("#parallelFeedback").className="feedback parallel-feedback";}
  }

  document.querySelectorAll("[data-relation]").forEach(button=>button.onclick=()=>{
    currentRelation=button.dataset.relation;
    document.querySelectorAll("[data-relation]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
    updateParallelDiagram();
  });

  slider.oninput=()=>{parallelAngle=Number(slider.value);updateParallelDiagram();};
  $("#checkParallel").onclick=()=>{
    const relation=parallelRelations[currentRelation];
    const expected=relation.answer(parallelAngle);
    const received=Number(answerInput.value);
    const feedback=$("#parallelFeedback");
    const ok=answerInput.value!==""&&received===expected;
    feedback.textContent=ok?relation.success:`Quasi! Osserva i colori e riprova. Un indizio: ${currentRelation==="supplementary"?"calcola 180° − "+parallelAngle+"°.":"i due angoli evidenziati sono uguali."}`;
    feedback.className="feedback parallel-feedback "+(ok?"good":"bad");
    if(ok&&!solved.has(currentRelation)){
      solved.add(currentRelation);awardStar();
      const button=document.querySelector(`[data-relation="${currentRelation}"]`);
      button.classList.add("mastered");
    }
  };
  answerInput.addEventListener("keydown",event=>{if(event.key==="Enter")$("#checkParallel").click();});
  $("#restartParallel").onclick=renderParallelTransversal;
  $("#finishAngles").onclick=()=>{
    gameContent.innerHTML=heading("MONDO 4 · MISSIONE COMPLETATA","Maestra degli angoli! 📐","Hai scoperto che una trasversale crea famiglie di angoli uguali e coppie che sommano 180°.")+
    `<div class="success-banner">⭐ Stelle raccolte: ${sessionStars}</div><div class="angle-summary"><span>✓ Corrispondenti uguali</span><span>✓ Alterni interni uguali</span><span>✓ Opposti al vertice uguali</span><span>✓ Adiacenti supplementari</span></div><div class="action-row"><button class="primary-btn" id="again">Rigioca il Regno degli angoli</button><button class="secondary-btn" id="home">Torna ai mondi</button></div>`;
    $("#again").onclick=renderAngles;$("#home").onclick=()=>$("#backHome").click();
  };

  updateParallelDiagram(false);
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
