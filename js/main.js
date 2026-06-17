(function() {
  let ysdk=null,clang='ru';const isFile=window.location.protocol==='file:';
  let selMode='bot',selMap=0;
  function initSDK(){
    if(isFile||typeof YaGames==='undefined'||!YaGames.init){applyLang();return;}
    YaGames.init().then(function(sdk){
      ysdk=sdk;try{if(sdk.environment&&sdk.environment.i18n){const l=sdk.environment.i18n.lang;if(l==='ru'||l==='en')clang=l;}}catch(e){}
      applyLang();try{if(sdk.features&&sdk.features.LoadingAPI)sdk.features.LoadingAPI.ready();}catch(e){}
    }).catch(function(){applyLang();});
  }
  function applyLang(){
    if(!window.lang||!window.lang[clang]){clang='ru';if(!window.lang||!window.lang[clang])return;}
    const t=window.lang[clang];
    const ids={'menu-title':t.title,'label-mode':t.mode,'label-map':t.map,'opt-bot':t.botMode,'opt-local':t.localMode,
      'btn-start':t.start,'btn-menu-settings':'⚙ '+t.settings,'settings-title':t.settings,'label-music':t.music,
      'label-sfx':t.sfx,'label-controls':t.controls,'btn-close-settings':t.close,'btn-back':t.back};
    for(const id in ids){const el=document.getElementById(id);if(el&&ids[id])el.textContent=ids[id];}
    if(t.maps&&t.maps.length>=5){for(let i=0;i<5;i++){const mb=document.getElementById('opt-map-'+i);if(mb)mb.textContent=t.maps[i];}}
  }
  function showMenu(){document.getElementById('menu-screen').classList.remove('hidden');document.getElementById('game-area').classList.add('hidden');document.getElementById('mobile-controls').classList.add('hidden');}
  function showGame(){
    document.getElementById('menu-screen').classList.add('hidden');document.getElementById('game-area').classList.remove('hidden');
    if(window.G.device.isMobile()){document.getElementById('mobile-controls').classList.remove('hidden');
      document.getElementById('joy-right').style.visibility=selMode==='bot'?'hidden':'visible';
    }else document.getElementById('mobile-controls').classList.add('hidden');
  }
  function setupMenu(){
    const mo=document.querySelectorAll('#mode-options .menu-option');
    for(let i=0;i<mo.length;i++)mo[i].addEventListener('click',function(){for(let j=0;j<mo.length;j++)mo[j].classList.remove('active');this.classList.add('active');selMode=this.getAttribute('data-mode');});
    const mp=document.querySelectorAll('#map-options .menu-option');
    for(let i=0;i<mp.length;i++)mp[i].addEventListener('click',function(){for(let j=0;j<mp.length;j++)mp[j].classList.remove('active');this.classList.add('active');selMap=parseInt(this.getAttribute('data-map'),10);});
    document.getElementById('btn-start').addEventListener('click',function(){window.G.audio.resumeAudio();window.G.game.setMatchConfig(selMode,selMap);showGame();window.G.game.startMatch();});
    document.getElementById('btn-menu-settings').addEventListener('click',function(){document.getElementById('settings-overlay').classList.add('show');});
    document.getElementById('btn-back').addEventListener('click',showMenu);
  }
  function setupSettings(){
    const ov=document.getElementById('settings-overlay'),bs=document.getElementById('btn-settings'),bc=document.getElementById('btn-close-settings');
    const tm=document.getElementById('toggle-music'),vm=document.getElementById('volume-music'),vs=document.getElementById('volume-sfx'),sc=document.getElementById('select-controls');
    const s=window.G.settings.getSettings();tm.checked=s.musicEnabled;vm.value=Math.round(s.musicVolume*100);vs.value=Math.round(s.sfxVolume*100);sc.value=s.controlScheme;
    function open(){ov.classList.add('show');}function close(){ov.classList.remove('show');}
    bs.addEventListener('click',open);bc.addEventListener('click',close);
    document.addEventListener('toggleSettings',function(){if(ov.classList.contains('show'))close();else open();});
    function av(){if(window.G.audio)window.G.audio.applyVolumes();}
    tm.addEventListener('change',function(){window.G.settings.updateSetting('musicEnabled',this.checked);av();});
    vm.addEventListener('input',function(){window.G.settings.updateSetting('musicVolume',parseInt(this.value,10)/100);av();});
    vs.addEventListener('input',function(){window.G.settings.updateSetting('sfxVolume',parseInt(this.value,10)/100);av();});
    sc.addEventListener('change',function(){window.G.settings.updateSetting('controlScheme',this.value);});
  }
  function setupFS(){document.getElementById('btn-fullscreen').addEventListener('click',function(){try{if(!document.fullscreenElement){if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen();}else if(document.exitFullscreen)document.exitFullscreen();}catch(e){}});}
  function init(){
    const req=['settings','device','audio','map','ui','bullet','player','bot','input','game'];
    window.G=window.G||{};const miss=req.filter(function(m){return!window.G[m];});
    if(miss.length>0){alert('Missing: '+miss.join(', '));return;}
    initSDK();window.G.audio.initAudio();
    window.G.map.initMap(document.getElementById('platforms'),document.getElementById('game-area'));
    window.G.bullet.initBullets(document.getElementById('svg-layer'));
    window.G.ui.initUI(document.getElementById('hp-player-bar'),document.getElementById('hp-bot-bar'),document.getElementById('score-player'),document.getElementById('score-bot'),document.getElementById('round-overlay'),document.getElementById('round-text'),document.getElementById('svg-layer'));
    window.G.player.initPlayer(document.getElementById('player'),document.getElementById('bot'),document.getElementById('player-shield'),document.getElementById('bot-shield'));
    window.G.bot.initBot(document.getElementById('bot'),document.getElementById('bot-shield'));
    window.G.input.initInput();
    window.G.input.setupJoystick('left',document.getElementById('joy-left'),document.getElementById('joy-left').querySelector('.joy-knob'),window.G.input.triggerShoot1);
    window.G.input.setupJoystick('right',document.getElementById('joy-right'),document.getElementById('joy-right').querySelector('.joy-knob'),window.G.input.triggerShoot2);
    window.G.game.setMatchEndCallback(showMenu);
    window.G.game.initGame(window.lang,clang);window.G.game.init();
    setupMenu();setupSettings();setupFS();
    document.addEventListener('click',window.G.audio.resumeAudio,{once:true});
    document.addEventListener('touchstart',window.G.audio.resumeAudio,{once:true});
    showMenu();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();