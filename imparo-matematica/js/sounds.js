function speak(text){
  if(!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(String(text).replace(/[⭐★]/g,""));
  utterance.lang="it-IT";utterance.rate=.88;utterance.pitch=1.12;
  window.speechSynthesis.speak(utterance);
}
function playTone(good=true){
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";osc.frequency.value=good?660:220;gain.gain.setValueAtTime(.12,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.22);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.23);
  }catch(e){}
}