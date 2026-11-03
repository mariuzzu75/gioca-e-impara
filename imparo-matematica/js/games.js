// Generatore delle sfide. Ogni partita crea 5 domande diverse.
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick = arr=>arr[rand(0,arr.length-1)];
function uniqueOptions(correct,min,max){
  const s=new Set([correct]);
  while(s.size<3){let n=rand(Math.max(0,min),Math.max(3,max));if(n!==correct)s.add(n);}
  return [...s].sort(()=>Math.random()-.5);
}
function makeQuestion(moduleId, levelIndex){
  const max=LEVELS[levelIndex].max;
  let q={hint:"Osserva e scegli la risposta giusta!",image:"images/objects/stars.svg",visual:[],type:"number"};
  if(moduleId==="numbers"){
    const n=rand(0,max); const mode=pick(["number","count","before","after"]);
    if(mode==="number"){q.hint="Quale numero vedi?";q.question="Trova il numero "+n;q.correct=n;q.options=uniqueOptions(n,0,Math.max(5,max));}
    if(mode==="count"){q.hint="Conta i pallini!";q.question="Quanti sono?";q.visual=Array.from({length:n},()=> "dot");q.correct=n;q.options=uniqueOptions(n,0,Math.max(5,max));}
    if(mode==="before"){q.hint="Quale numero viene prima?";q.question="Quale numero viene prima di "+n+"?";q.correct=Math.max(0,n-1);q.options=uniqueOptions(q.correct,0,max);}
    if(mode==="after"){q.hint="Quale numero viene dopo?";q.question="Quale numero viene dopo "+n+"?";q.correct=Math.min(max,n+1);q.options=uniqueOptions(q.correct,0,max);}
  } else if(moduleId==="compare"){
    let a=rand(0,max),b=rand(0,max);while(a===b)b=rand(0,max);
    const symbol=a>b?">":"<";q.hint="Quale simbolo completa la frase?";q.question=`${a}  ?  ${b}`;q.correct=symbol;q.options=["<",">","="];q.type="symbol";
  } else if(moduleId==="addition"){
    let cap=levelIndex<4?10:max;let a=rand(0,cap),b=rand(0,Math.max(0,cap-a));q.hint="Metti insieme le quantità.";q.question=`${a} + ${b} = ?`;q.correct=a+b;q.options=uniqueOptions(q.correct,0,Math.min(cap,Math.max(5,q.correct+4)));q.visual=Array.from({length:a},()=> "dot").concat(["plus"],Array.from({length:b},()=> "dot"));q.image="images/objects/apples.svg";
  } else if(moduleId==="subtraction"){
    let cap=levelIndex<4?10:max;let a=rand(1,cap),b=rand(0,a);q.hint="Togli e conta quello che resta.";q.question=`${a} − ${b} = ?`;q.correct=a-b;q.options=uniqueOptions(q.correct,0,cap);q.visual=Array.from({length:a},(_,i)=>i<b?"cross":"dot");q.image="images/objects/apples.svg";
  } else if(moduleId==="numberline"){
    let step=pick([1,2,5]);let start=rand(0,Math.max(1,max-step*3));let forward=Math.random()>.35;let result=forward?start+step:start-step;if(result<0){forward=true;result=start+step;}q.hint=forward?"Fai un salto in avanti!":"Fai un salto indietro!";q.question=`${start} ${forward?"+":"−"} ${step} = ?`;q.correct=result;q.options=uniqueOptions(result,0,max);q.image="images/objects/numberline.svg";
  } else if(moduleId==="shapes"){
    const shapes=[{name:"cerchio",answer:"⚪",opts:["⚪","🔺","🟦"]},{name:"triangolo",answer:"🔺",opts:["🟨","🔺","⚪"]},{name:"quadrato",answer:"🟦",opts:["🟦","🔵","🔺"]},{name:"stella",answer:"⭐",opts:["❤️","⭐","🟩"]}];
    const s=pick(shapes);q.hint="Riconosci la figura.";q.question=`Quale figura è un ${s.name}?`;q.correct=s.answer;q.options=s.opts;q.type="emoji";q.image="images/objects/shapes.svg";
  } else if(moduleId==="problems"){
    const a=rand(1,Math.min(8,max)),b=rand(1,Math.min(8,max));const add=Math.random()>.45;
    q.hint="Leggi il piccolo problema e fai il calcolo.";q.question=add?`Hai ${a} mele e ne trovi altre ${b}. Quante mele hai?`:`Hai ${a+b} caramelle e ne regali ${b}. Quante te ne restano?`;q.correct=add?a+b:a;q.options=uniqueOptions(q.correct,0,Math.max(10,q.correct+4));q.image="images/objects/treasure.svg";q.type="word";
  } else if(moduleId==="logic"){
    const step=pick([1,2,5]);let start=rand(0,Math.max(1,max-step*4));let seq=[0,1,2].map(i=>start+i*step);q.hint="Scopri la regola e completa la sequenza.";q.question=`${seq[0]}  ·  ${seq[1]}  ·  ${seq[2]}  ·  ?`;q.correct=seq[2]+step;q.options=uniqueOptions(q.correct,0,max);q.image="images/objects/pattern.svg";
  }
  return q;
}