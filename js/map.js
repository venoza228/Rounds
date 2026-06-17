(function() {
  const W=800, GY=440;
  const MAPS = [
    {bg:'linear-gradient(180deg,#1a1d2e 0%,#2d1b4e 60%,#3d2a5e 100%)',gc:'#3d2a5e',gr:'#5a8a3a',p:[{x:0,y:GY,w:W,h:60,t:'g'},{x:50,y:340,w:120,h:20,t:'p'},{x:630,y:340,w:120,h:20,t:'p'},{x:330,y:280,w:140,h:20,t:'p'}]},
    {bg:'linear-gradient(180deg,#ff7e5f 0%,#feb47b 50%,#5a3a7e 100%)',gc:'#2a1a3e',gr:'#6a5a8a',p:[{x:0,y:GY,w:W,h:60,t:'g'},{x:80,y:360,w:160,h:20,t:'p'},{x:560,y:360,w:160,h:20,t:'p'},{x:280,y:280,w:240,h:20,t:'p'},{x:360,y:180,w:80,h:20,t:'p'}]},
    {bg:'linear-gradient(180deg,#0a0a1a 0%,#1a0a2a 60%,#2a0a1a 100%)',gc:'#1a1a2a',gr:'#4a4a5a',p:[{x:0,y:GY,w:W,h:60,t:'g'},{x:100,y:380,w:100,h:20,t:'p'},{x:280,y:340,w:100,h:20,t:'p'},{x:420,y:340,w:100,h:20,t:'p'},{x:600,y:380,w:100,h:20,t:'p'},{x:240,y:220,w:320,h:20,t:'p'}]},
    {bg:'radial-gradient(ellipse at center,#1a0a3a 0%,#0a0a1a 100%)',gc:'#2a1a4a',gr:'#6a4aaa',p:[{x:0,y:GY,w:W,h:60,t:'g'},{x:120,y:360,w:100,h:20,t:'p'},{x:580,y:360,w:100,h:20,t:'p'},{x:300,y:280,w:200,h:20,t:'p'},{x:160,y:180,w:120,h:20,t:'p'},{x:520,y:180,w:120,h:20,t:'p'}]},
    {bg:'linear-gradient(180deg,#0a2a1a 0%,#1a4a2a 60%,#2a5a3a 100%)',gc:'#3a2a1a',gr:'#5a8a3a',p:[{x:0,y:GY,w:W,h:60,t:'g'},{x:100,y:370,w:80,h:20,t:'p'},{x:620,y:370,w:80,h:20,t:'p'},{x:250,y:310,w:120,h:20,t:'p'},{x:430,y:310,w:120,h:20,t:'p'},{x:340,y:230,w:120,h:20,t:'p'}]}
  ];
  let platforms=[], elP=null, elG=null;
  function initMap(p,g){elP=p;elG=g;}
  function setMap(i){
    elP.innerHTML='';platforms=[];const m=MAPS[i];elG.style.background=m.bg;
    for(let k=0;k<m.p.length;k++){
      const d=m.p[k],el=document.createElement('div');el.className='platform';
      el.style.left=d.x+'px';el.style.top=d.y+'px';el.style.width=d.w+'px';el.style.height=d.h+'px';
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('width',d.w);svg.setAttribute('height',d.h);svg.setAttribute('viewBox','0 0 '+d.w+' '+d.h);
      if(d.t==='g'){
        const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('width',d.w);r.setAttribute('height',d.h);r.setAttribute('fill',m.gc);svg.appendChild(r);
        const gr=document.createElementNS('http://www.w3.org/2000/svg','rect');gr.setAttribute('width',d.w);gr.setAttribute('height','6');gr.setAttribute('fill',m.gr);svg.appendChild(gr);
      } else {
        const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('width',d.w);r.setAttribute('height',d.h);r.setAttribute('fill','#4a3a7e');r.setAttribute('stroke','#8a6ade');r.setAttribute('stroke-width','2');svg.appendChild(r);
      }
      el.appendChild(svg);elP.appendChild(el);platforms.push(d);
    }
  }
  function collide(e){
    e.onGround=false;
    for(let i=0;i<platforms.length;i++){
      const p=platforms[i];
      if(e.x+e.w>p.x&&e.x<p.x+p.w&&e.vy>=0&&e.y+e.h>p.y&&e.y+e.h<p.y+p.h+15&&e.y<p.y){
        e.y=p.y-e.h;e.vy=0;e.onGround=true;
      }
    }
  }
  window.G=window.G||{};
  window.G.map={initMap,setMap,collide,GAME_W:W,GAME_H:500};
})();