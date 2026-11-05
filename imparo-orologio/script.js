const $ = id => document.getElementById(id);
const levels = [
  {name:"Le ore esatte", minutes:[0], description:"La lancetta lunga è sul 12: leggi l'ora indicata dalla lancetta corta."},
  {name:"Le mezze ore", minutes:[30], description:"Quando la lancetta lunga è sul 6, sono e trenta."},
  {name:"I quarti d'ora", minutes:[15,45], description:"Impariamo un quarto e tre quarti."},
  {name:"I minuti", minutes:[0,5,10,15,20,25,30,35,40,45,50,55], description:"Ogni numero vale cinque minuti per la lancetta lunga."}
];
let level=0, score=0, asked=0, current={h:3,m:0};
const pad=n=>String(n).padStart(2,"0");
function point(angle,r){const a=(angle-90)*Math.PI/180;return [160+Math.cos(a)*r,160+Math.sin(a)*r]}
function drawClock(h,m){
  const hr= h%12*30 + m*.5, min=m*6;
  const [hx,hy]=point(hr,72),[mx,my]=point(min,112);
  $("hourHand").setAttribute("x2",hx);$("hourHand").setAttribute("y2",hy);
  $("minuteHand").setAttribute("x2",mx);$("minuteHand").setAttribute("y2",my);
}
function buildFace(){
  let ticks="",nums="";
  for(let i=0;i<60;i++){const [x1,y1]=point(i*6, i%5===0?119:124),[x2,y2]=point(i*6,130);
    if(i%5===0)ticks+=`<line class="tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  for(let n=1;n<=12;n++){const [x,y]=point(n*30,103);nums+=`<text class="number" x="${x}" y="${y}">${n}</text>`}
  $("ticks").innerHTML=ticks;$("numbers").innerHTML=nums;
}
function randomTime(){
  const mins=levels[level].minutes;
  let h=Math.floor(Math.random()*12)+1,m=mins[Math.floor(Math.random()*mins.length)];
  return {h,m};
}
function format(t){return `${pad(t.h)}:${pad(t.m)}`}
function optionsFor(t){
  const correct=format(t), set=new Set([correct]);
  while(set.size<4){let h=Math.floor(Math.random()*12)+1,m=levels[level].minutes[Math.floor(Math.random()*levels[level].minutes.length)];set.add(format({h,m}));}
  return [...set].sort(()=>Math.random()-.5);
}
function newQuestion(){
  current=randomTime();asked++;
  drawClock(current.h,current.m);
  $("digitalTime").textContent="??:??";
  $("askLabel").textContent="CHE ORA SEGNA?";
  $("question").textContent="Che ore sono?";
  $("instruction").textContent=levels[level].description;
  $("feedback").textContent="Guarda le lancette e scegli la risposta giusta!";
  $("answers").innerHTML="";
  optionsFor(current).forEach(v=>{
    const b=document.createElement("button");b.className="answer";b.textContent=v;
    b.addEventListener("click",()=>answer(b,v));$("answers").appendChild(b);
  });
  updateProgress();
}
function answer(button,value){
  const correct=format(current);
  document.querySelectorAll(".answer").forEach(b=>b.disabled=true);
  if(value===correct){button.classList.add("correct");score++;$("feedback").textContent="🎉 Bravissima! Hai indovinato!";$("digitalTime").textContent=correct;}
  else{button.classList.add("wrong");$("feedback").textContent=`Quasi! La risposta giusta è ${correct}. Riproviamo!`;$("digitalTime").textContent=correct;document.querySelectorAll(".answer").forEach(b=>{if(b.textContent===correct)b.classList.add("correct")});}
  $("score").textContent=`⭐ ${score}`;
  updateProgress();
}
function updateProgress(){
  $("levelName").textContent=`Livello ${level+1} · ${levels[level].name}`;
  $("progressFill").style.width=`${Math.min(100,(score%5)*20)}%`;
  document.querySelectorAll(".level").forEach((b,i)=>b.classList.toggle("active",i===level));
}
function setLevel(n){level=n;newQuestion();$("setFeedback").textContent="";$("setTitle").textContent="Prova anche tu!";$("setInstruction").textContent="Scegli ore e minuti e poi controlla la tua risposta.";}
for(let h=1;h<=12;h++)$("setHour").add(new Option(h,h));
for(let m=0;m<60;m+=5)$("setMinute").add(new Option(pad(m),m));
$("newQuestion").addEventListener("click",newQuestion);
document.querySelectorAll(".level").forEach(b=>b.addEventListener("click",()=>setLevel(Number(b.dataset.level))));
$("checkClock").addEventListener("click",()=>{
  const h=Number($("setHour").value),m=Number($("setMinute").value);
  if(m===0||levels[level].minutes.includes(m)){$("setFeedback").textContent=`👏 Hai impostato le ${h}:${pad(m)}!`;drawClock(h,m);}
  else $("setFeedback").textContent="Per questo livello scegli un minuto tra quelli che stiamo imparando.";
});
buildFace();newQuestion();
