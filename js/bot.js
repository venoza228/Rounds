(function() {
  const MS=3,JP=-12,GR=0.6,SD=1.0,SC=5.0;
  const bot={id:'player2',x:660,y:380,vx:0,vy:0,w:40,h:60,hp:100,maxHp:100,onGround:false,facing:-1,blocking:false,shootCooldown:60,aiTimer:0,aiState:'approach',shieldTimer:0,shieldCooldown:0};
  let el=null,sh=null;
  function initBot(a,b){el=a;sh=b;}
  function update(dt,tgt){
    const dx=tgt.x-bot.x,dist=Math.abs(dx);bot.facing=dx>0?1:-1;
    bot.aiTimer-=dt;if(bot.aiTimer<=0){bot.aiTimer=30+Math.floor(Math.random()*40);const r=Math.random();
      if(dist<150)bot.aiState=r<0.15?'block':r<0.35?'retreat':'attack';
      else bot.aiState=r<0.7?'approach':'jump';}
    let mx=0;
    if(bot.aiState==='approach')mx=dx>0?1:-1;
    else if(bot.aiState==='retreat')mx=dx>0?-1:1;
    else if(bot.aiState==='attack'){mx=dx>0?1:-1;if(dist<250)mx*=0.3;}
    else if(bot.aiState==='block'){if(bot.shieldCooldown<=0&&bot.shieldTimer<=0){bot.shieldTimer=SD;window.G.audio.playBlock();}}
    else if(bot.aiState==='jump'){mx=dx>0?1:-1;if(bot.onGround&&Math.random()<0.3){bot.vy=JP;bot.onGround=false;}}
    if(bot.shieldTimer>0){bot.shieldTimer-=dt/60;if(bot.shieldTimer<=0){bot.shieldTimer=0;bot.shieldCooldown=SC;bot.blocking=false;}else bot.blocking=true;}
    else{bot.blocking=false;if(bot.shieldCooldown>0){bot.shieldCooldown-=dt/60;if(bot.shieldCooldown<0)bot.shieldCooldown=0;}}
    if(sh){if(bot.shieldTimer>0)sh.classList.add('active');else sh.classList.remove('active');}
    bot.shootCooldown-=dt;if(bot.shootCooldown<=0&&dist<500&&Math.random()<0.05){const bx=bot.facing>0?bot.x+bot.w:bot.x-8,by=bot.y+bot.h/2;window.G.bullet.createBullet('player2',bx,by,bot.facing,Math.random()<0.4);bot.shootCooldown=60+Math.floor(Math.random()*40);window.G.audio.playShoot();}
    bot.vx=mx*MS*0.85*(bot.blocking?0.3:1);bot.vy+=GR*dt;bot.x+=bot.vx*dt;bot.y+=bot.vy*dt;
    if(bot.x<0)bot.x=0;if(bot.x+bot.w>window.G.map.GAME_W)bot.x=window.G.map.GAME_W-bot.w;
    window.G.map.collide(bot);if(el){el.style.left=bot.x+'px';el.style.top=bot.y+'px';}
  }
  function resetBot(){bot.x=660;bot.y=380;bot.vx=0;bot.vy=0;bot.hp=bot.maxHp;bot.blocking=false;bot.shootCooldown=60;bot.facing=-1;bot.aiTimer=0;bot.aiState='approach';bot.onGround=false;bot.shieldTimer=0;bot.shieldCooldown=0;}
  function getBot(){return bot;}
  window.G=window.G||{};
  window.G.bot={initBot,update,resetBot,getBot};
})();