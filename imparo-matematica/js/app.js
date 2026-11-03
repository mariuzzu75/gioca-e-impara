const $=id=>document.getElementById(id);
let currentModule=null,currentLevel=0,questions=[],questionIndex=0,earned=0,answered=false,lastQuestion=null;
const screens=["home-screen","game-screen","result-screen"];
function showScreen(id){screens.forEach(s=>$(s).classList.toggle("active",s===id));window.scrollTo({top:0,behavior:"smooth"});}
function renderHome(){
  $("stars-total").textContent=progress.stars;$("completed-total").textContent=progress.completed;
  const percent=getOverallPercent();$("overall-progress").style.width=percent+"%";$("progress-percent").textContent=percent+"%";
  $("progress-label").textContent=progress.completed?`Hai completato ${progress.completed} avventure. Continua così!`:"Hai appena iniziato: buon divertimento!";
  currentLevel=Math.min(6,Math.floor(progress.completed/3));$("current-level").textContent=`Livello ${currentLevel+1} · ${LEVELS[currentLevel].name}`;
  $("module-grid").innerHTML="";
  MODULES.forEach(m=>{
    const stats=moduleStats(m.id),pct=Math.min(100,stats.plays*20);
    const btn=document.createElement("button");btn.className="module-card";btn.innerHTML=`<span class="module-icon" style="background:${m.color}">${m.icon}</span><strong>${m.title}</strong><small>${m.desc}</small><div class="module-progress"><span style="width:${pct}%"></span></div>`;
    btn.addEventListener("click",()=>startGame(m.id));$("module-grid").appendChild(btn);
  });
}
function startGame(id){
  currentModule=MODULES.find(m=>m.id===id);currentLevel=Math.min(6,Math.floor(progress.completed/3));
  questions=Array.from({length:5},()=>makeQuestion(id,currentLevel));questionIndex=0;earned=0;
  $("game-module-name").textContent=currentModule.title;$("game-level").textContent=`Livello ${currentLevel+1}`;
  showScreen("game-screen");renderQuestion();
}
function renderQuestion(){
  answered=false;lastQuestion=questions[questionIndex];
  $("round-label").textContent=`SFIDA ${questionIndex+1} DI 5`;$("round-progress-fill").style.width=(questionIndex/5*100)+"%";
  $("game-stars").textContent=earned;$("question-hint").textContent=lastQuestion.hint;$("question").textContent=lastQuestion.question;
  $("question-image").src=lastQuestion.image;$("visual-count").innerHTML="";
  lastQuestion.visual.forEach(v=>{
    if(v==="plus"){const x=document.createElement("b");x.textContent="+";x.style.cssText="font-size:25px;color:#6c63d9;margin:0 5px";$("visual-count").appendChild(x);}
    else{const x=document.createElement("span");x.className=v==="cross"?"visual-dot crossed":"visual-dot";if(v==="cross"){x.style.background="#ddd";x.style.position="relative";x.textContent="";x.style.borderColor="#bbb";} $("visual-count").appendChild(x);}
  });
  $("feedback").textContent="";$("feedback").className="feedback";$("next-btn").disabled=true;
  const area=$("answer-area");area.innerHTML="";
  lastQuestion.options.forEach(option=>{
    const btn=document.createElement("button");btn.className="answer-btn";btn.textContent=option;
    btn.addEventListener("click",()=>chooseAnswer(option,btn));area.appendChild(btn);
  });
}
function chooseAnswer(option,button){
  if(answered)return;answered=true;
  const correct=String(option)===String(lastQuestion.correct);
  document.querySelectorAll(".answer-btn").forEach(b=>{b.disabled=true;if(String(b.textContent)===String(lastQuestion.correct))b.classList.add("correct");});
  if(correct){earned++;$("feedback").textContent=pickPraise();$("feedback").classList.add("good");playTone(true);}
  else{$("feedback").textContent=`Quasi! La risposta giusta è ${lastQuestion.correct}.`;$("feedback").classList.add("bad");button.classList.add("wrong");playTone(false);}
  $("game-stars").textContent=earned;$("next-btn").disabled=false;
}
function pickPraise(){return ["Bravissima! 🌟","Esatto! Sei un fenomeno!","Fantastico! 🎉","Risposta giusta!","Continua così! 💜"][Math.floor(Math.random()*5)];}
function nextQuestion(){
  if(!answered)return;
  if(questionIndex<4){questionIndex++;renderQuestion();}
  else finishGame();
}
function finishGame(){
  const stars=earned;recordGame(currentModule.id,stars);
  $("result-title").textContent=stars===5?"Super campionessa!":stars>=3?"Bravissima!":"Ottimo allenamento!";
  $("result-message").textContent=stars===5?"Hai risposto a tutte le domande!": "Hai fatto un altro passo nel tuo viaggio matematico.";
  $("result-stars").textContent=stars;showScreen("result-screen");renderHome();
}
$("start-btn").addEventListener("click",()=>$("module-grid").scrollIntoView({behavior:"smooth",block:"center"}));
$("back-btn").addEventListener("click",()=>{showScreen("home-screen");renderHome();});
$("next-btn").addEventListener("click",nextQuestion);
$("read-question-btn").addEventListener("click",()=>speak(lastQuestion?`${lastQuestion.hint}. ${lastQuestion.question}`:""));
$("home-result-btn").addEventListener("click",()=>{showScreen("home-screen");renderHome();});
$("again-btn").addEventListener("click",()=>startGame(currentModule.id));
renderHome();