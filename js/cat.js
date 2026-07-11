  /* hero A.H bar — cat: walk-cycle patrol; only reacts when cursor is NEAR the bar; resumes walk when it leaves */
  (function(){
    var cat=document.querySelector('.hero-badge .cat'); if(!cat) return;
    var run=cat.parentElement, bar=document.querySelector('.hero-badge');
    var q=function(c){return cat.querySelector('.'+c);};
    var sit=q('s-sit'), roll=q('s-roll');
    var walkF=[q('s-walka'),q('s-walk'),q('s-walkb'),q('s-walk')];
    var runF=[q('s-runa'),q('s-runb'),q('s-runc'),q('s-rund'),q('s-rune'),q('s-runf')];
    var uniq=[sit,roll,q('s-walk'),q('s-walka'),q('s-walkb'),q('s-run'),q('s-runa'),q('s-runb'),q('s-runc'),q('s-rund'),q('s-rune'),q('s-runf')];
    if(bar) bar.style.cursor="url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'18'%20height%3D'26'%20viewBox%3D'0%200%2018%2026'%3E%3Cpath%20d%3D'M8%2013.5%20q3%204%200.5%207%20q-2%203%201.5%204.5'%20fill%3D'none'%20stroke%3D'%23d94f6a'%20stroke-width%3D'1.3'%20stroke-linecap%3D'round'%2F%3E%3Ccircle%20cx%3D'8'%20cy%3D'8'%20r%3D'6.4'%20fill%3D'%23ec6a7e'%2F%3E%3Ccircle%20cx%3D'8'%20cy%3D'8'%20r%3D'6.4'%20fill%3D'none'%20stroke%3D'%23bd4356'%20stroke-width%3D'1'%2F%3E%3Cpath%20d%3D'M2%206.4%20Q8%203.8%2014%207.4%20M2%2010%20Q8%207.4%2014.4%2011%20M4%203%20Q7.4%208%206.4%2014%20M12.4%203%20Q9%208%2010.6%2014'%20fill%3D'none'%20stroke%3D'%23bd4356'%20stroke-width%3D'0.9'%20opacity%3D'0.75'%2F%3E%3C%2Fsvg%3E\") 8 8, auto";
    var mq=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq&&mq.matches){ return; }
    var INSET=0, CAT_W=40, SPEED=0.35, CHASE=1.4, ARRIVE=2, PLAY_RANGE=34, WAIT=2000, BOUNCE=1.5, NEAR=85;
    var catX=INSET, facing=1, dist=0, ambTarget=null, ambPhase='go', ambWaitEnd=0,
        haveMouse=false, mx=0, my=0, prevInt=false, rdist=0, lastRx=null, raf=null, on=false, lastNow=0;
    document.addEventListener('mousemove',function(e){ haveMouse=true; mx=e.clientX; my=e.clientY; });
    document.addEventListener('mouseleave',function(){ haveMouse=false; });
    function clamp(v,a,b){return v<a?a:v>b?b:v;}
    function distToRect(px,py,r){ var dx=Math.max(r.left-px,0,px-r.right), dy=Math.max(r.top-py,0,py-r.bottom); return Math.sqrt(dx*dx+dy*dy); }
    function showOnly(el){ for(var i=0;i<uniq.length;i++) uniq[i].style.opacity=(uniq[i]===el)?1:0; }
    function tick(now){
      var dt=lastNow?now-lastNow:16.667; lastNow=now; if(dt>50)dt=50;
      var fs=dt/16.667;   /* 60fps'e normalize — yüksek Hz ekranlarda hız sabit kalır */
      var rect=run.getBoundingClientRect(), brect=bar.getBoundingClientRect();
      var span=Math.max(0,run.clientWidth-CAT_W-INSET*2);
      var interactive = haveMouse && distToRect(mx,my,brect) < NEAR;
      if(prevInt && !interactive){ ambPhase='go'; ambTarget=(catX < INSET+span/2)?(INSET+span):INSET; }
      prevInt=interactive;
      var targetX;
      if(interactive){ targetX=clamp(mx-rect.left-CAT_W/2,INSET,INSET+span); }
      else{
        if(ambTarget==null){ ambTarget=INSET+span; ambPhase='go'; }
        if(ambPhase==='wait'){
          if(now>=ambWaitEnd){ ambTarget=(ambTarget<=INSET)?INSET+span:INSET; ambPhase='go'; targetX=ambTarget; }
          else targetX=catX;
        } else targetX=ambTarget;
      }
      var dx=targetX-catX, ad=Math.abs(dx), moving=ad>ARRIVE;
      if(moving){ var step=Math.min((interactive?CHASE:SPEED)*fs,ad); catX+=(dx>0?1:-1)*step; facing=dx>0?1:-1; dist+=step; }
      else if(!interactive && ambPhase==='go'){ ambPhase='wait'; ambWaitEnd=now+WAIT; }
      var overBar=interactive && my<=rect.bottom+18 && my>=rect.top-18;
      var playing=interactive && !moving && overBar && ad<=PLAY_RANGE;
      if(playing) facing=(mx>rect.left+catX+CAT_W/2)?1:-1;
      var Ws=playing?63:(moving?(interactive?53:55):27), half=Ws/2, M=4;
      var rx=Math.max(half-20+M, Math.min(catX, run.clientWidth-20-half-M));
      if(lastRx==null) lastRx=rx;
      rdist+=Math.abs(rx-lastRx); lastRx=rx;
      var yy=0, rot=0;
      if(moving) yy=-BOUNCE*Math.abs(Math.sin((rdist/16)*Math.PI));
      else if(playing){ yy=-2*Math.abs(Math.sin(now/130)); rot=2.5*Math.sin(now/160); }
      cat.style.transform='translate('+rx+'px,'+yy+'px) rotate('+rot+'deg)';
      var cur;
      if(playing) cur=roll;
      else if(moving){ var F=interactive?runF:walkF, st=interactive?9:8; cur=F[Math.floor(rdist/st)%F.length]; }
      else cur=sit;
      showOnly(cur);
      var sc='scaleX('+facing+')'; for(var i=0;i<uniq.length;i++) uniq[i].style.transform=sc;
      raf=requestAnimationFrame(tick);
    }
    function startLoop(){ if(!on){on=true; raf=requestAnimationFrame(tick);} }
    function stopLoop(){ on=false; if(raf)cancelAnimationFrame(raf); raf=null; }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){en.forEach(function(x){x.isIntersecting?startLoop():stopLoop();});},{threshold:0}).observe(cat);
    } else startLoop();
  })();
  
