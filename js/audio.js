(function() {
  let ctx=null, mGain=null, sGain=null;
  function getS() { return (window.G&&window.G.settings)?window.G.settings.getSettings():{musicEnabled:true,musicVolume:0.5,sfxVolume:0.7}; }
  function initAudio() {
    try { const C=window.AudioContext||window.webkitAudioContext; if(!C)return; ctx=new C(); mGain=ctx.createGain(); mGain.connect(ctx.destination); sGain=ctx.createGain(); sGain.connect(ctx.destination); applyVolumes(); } catch(e){}
  }
  function resumeAudio() { try{if(ctx&&ctx.state==='suspended')ctx.resume();}catch(e){} }
  function applyVolumes() { const s=getS(); if(mGain)mGain.gain.value=s.musicEnabled?s.musicVolume:0; if(sGain)sGain.gain.value=s.sfxVolume; }
  function tone(f,d,t) {
    t=t||'square'; if(!ctx||!sGain)return; const s=getS(); if(s.sfxVolume<=0)return;
    try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=t;o.frequency.value=f;g.gain.value=0.3;g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+d);o.connect(g);g.connect(sGain);o.start();o.stop(ctx.currentTime+d);}catch(e){}
  }
  function playShoot(){tone(800,0.08,'square')} function playHit(){tone(200,0.12,'sawtooth')}
  function playJump(){tone(400,0.08,'sine')} function playBlock(){tone(600,0.06,'triangle')}
  function playRoundStart(){tone(523,0.15,'sine');setTimeout(function(){tone(659,0.15,'sine');},150);}
  function playWin(){tone(523,0.12,'sine');setTimeout(function(){tone(659,0.12,'sine');},130);setTimeout(function(){tone(784,0.25,'sine');},260);}
  function playLose(){tone(300,0.15,'sawtooth');setTimeout(function(){tone(200,0.25,'sawtooth');},180);}
  window.G = window.G || {};
  window.G.audio = {initAudio,resumeAudio,applyVolumes,playShoot,playHit,playJump,playBlock,playRoundStart,playWin,playLose};
})();