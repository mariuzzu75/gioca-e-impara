// Percorso didattico: il livello determina l'intervallo dei numeri.
const LEVELS = [
  {name:"Principiante", max:10},
  {name:"Esploratore", max:10},
  {name:"Apprendista", max:10},
  {name:"Avventuriero", max:10},
  {name:"Esperto", max:20},
  {name:"Maestro", max:50},
  {name:"Campione", max:100}
];
const MODULES = [
  {id:"numbers",title:"Imparo i numeri",desc:"Conta, riconosci e ordina",icon:"🔢",color:"#e9e7ff",image:"images/objects/numbers.svg"},
  {id:"compare",title:"Più, meno o uguale",desc:"Confronta i numeri",icon:"⚖️",color:"#fff0d2",image:"images/objects/compare.svg"},
  {id:"addition",title:"Le addizioni",desc:"Metti insieme le quantità",icon:"➕",color:"#e2f8ed",image:"images/objects/apples.svg"},
  {id:"subtraction",title:"Le sottrazioni",desc:"Togli e scopri quanto resta",icon:"➖",color:"#ffe6ef",image:"images/objects/apples.svg"},
  {id:"numberline",title:"La linea dei numeri",desc:"Vai avanti e indietro",icon:"↔️",color:"#e1f5ff",image:"images/objects/numberline.svg"},
  {id:"shapes",title:"Forme e geometria",desc:"Scopri le figure",icon:"🔺",color:"#f0e8ff",image:"images/objects/shapes.svg"},
  {id:"problems",title:"Problemi matematici",desc:"Ragiona e trova la soluzione",icon:"🧩",color:"#fff0d2",image:"images/objects/treasure.svg"},
  {id:"logic",title:"Logica e sequenze",desc:"Completa le serie",icon:"🧠",color:"#e3f5f1",image:"images/objects/pattern.svg"}
];