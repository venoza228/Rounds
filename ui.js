(function() {
  let hp1,hp2,sc1,sc2,ov,txt,svg,si1,st1,si2,st2,eff=[],co,cc,ct,tmr;
  let cardTimerInterval = null;

  function initUI(a,b,c,d,e,f,g){
    hp1=a;hp2=b;sc1=c;sc2=d;ov=e;txt=f;svg=g;
    si1=document.getElementById('shield-icon-p1');st1=document.getElementById('shield-timer-p1');
    si2=document.getElementById('shield-icon-p2');st2=document.getElementById('shield-timer-p2');
    co=document.getElementById('card-selection-overlay');
    cc=document.getElementById('cards-container');
    ct=document.getElementById('card-selection-title');
    tmr=document.getElementById('card-timer');
  }
  function updateHPBars(a,b){if(hp1)hp1.style.width=(a.hp/a.maxHp*100)+'%';if(hp2)hp2.style.width=(b.hp/b.maxHp*100)+'%';}
  function updateScore(a,b){if(sc1)sc1.textContent=a;if(sc2)sc2.textContent=b;}
  function showOverlay(){if(ov)ov.classList.add('show');}
  function hideOverlay(){if(ov)ov.classList.remove('show');}
  function setOverlayText(t){if(txt)txt.textContent=t;}
  function updSI(ic,tm,en){
    if(!ic||!tm)return;ic.classList.remove('ready','active','cooldown');
    if(en.shieldTimer>0){ic.classList.add('active');tm.textContent='';}
    else if(en.shieldCooldown>0){ic.classList.add('cooldown');tm.textContent=Math.ceil(en.shieldCooldown);}
    else{ic.classList.add('ready');tm.textContent='';}
  }
  function updateShieldIcons(a,b){updSI(si1,st1,a);updSI(si2,st2,b);}
  function createHitEffect(x,y,c){
    if(!svg)return;const ci=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ci.setAttribute('cx',x);ci.setAttribute('cy',y);ci.setAttribute('r','2');ci.setAttribute('fill',c);svg.appendChild(ci);eff.push({c:ci,l:1,m:20});
  }
  function updateEffects(dt){
    for(let i=eff.length-1;i>=0;i--){const e=eff[i];e.l-=dt*0.05;const r=e.m*(1-e.l);
    e.c.setAttribute('r',r);e.c.setAttribute('opacity',Math.max(0,e.l));
    if(e.l<=0){if(e.c.parentNode)svg.removeChild(e.c);eff.splice(i,1);}}
  }
  function clearEffects(){for(let i=0;i<eff.length;i++){if(eff[i].c.parentNode)svg.removeChild(eff[i].c);}eff=[];}

  function showCardSelection(cards, lang, onSelect) {
    if(!co||!cc) return;
    cc.innerHTML = '';
    ct.textContent = lang.cardSelect || 'CHOOSE UPGRADE';
    
    let timeLeft = 10;
    if(tmr) tmr.textContent = timeLeft;

    cards.forEach(function(c, idx) {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `<div class="card-name">${lang[c.nk]||c.id}</div><div class="card-icon">${c.icon}</div><div class="card-desc">${lang[c.dk]||''}</div>`;
      el.addEventListener('click', function() {
        clearInterval(cardTimerInterval);
        onSelect(c);
      });
      cc.appendChild(el);
    });

    co.classList.remove('hidden');
    
    if(cardTimerInterval) clearInterval(cardTimerInterval);
    cardTimerInterval = setInterval(function() {
      timeLeft--;
      if(tmr) tmr.textContent = timeLeft;
      if(timeLeft <= 0) {
        clearInterval(cardTimerInterval);
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        onSelect(randomCard);
      }
    }, 1000);
  }

  function hideCardSelection() {
    if(co) co.classList.add('hidden');
    if(cardTimerInterval) clearInterval(cardTimerInterval);
  }

  window.G=window.G||{};
  window.G.ui={initUI,updateHPBars,updateScore,showOverlay,hideOverlay,setOverlayText,createHitEffect,updateEffects,clearEffects,updateShieldIcons,showCardSelection,hideCardSelection};
})();