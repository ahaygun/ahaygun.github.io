  /* Renk teması (Amber varsayılan / Ocean) + kenarda süzülen kıvılcım zemini */
  (function(){
    "use strict";
    var body=document.body;
    var META_TC={amber:'#262a30', ocean:'#111c27'};      // tarayıcı chrome rengi
    var swatches=document.querySelectorAll('.theme-toggle .sw');
    var metaTC=document.querySelector('meta[name="theme-color"]');
    var rebuildSprite=function(){};                       // kıvılcım bloğu doldurur
    function load(){ try{ return localStorage.getItem('cv-palette'); }catch(e){ return null; } }
    function save(t){ try{ localStorage.setItem('cv-palette', t); }catch(e){} }
    function setTheme(t){
      if(t!=='ocean') t='amber';
      if(t==='amber') body.removeAttribute('data-palette'); else body.setAttribute('data-palette', t);
      for(var i=0;i<swatches.length;i++) swatches[i].classList.toggle('is-active', swatches[i].getAttribute('data-theme')===t);
      if(metaTC) metaTC.setAttribute('content', META_TC[t]);
      save(t); rebuildSprite();
    }
    for(var i=0;i<swatches.length;i++)(function(b){
      b.addEventListener('click', function(){ setTheme(b.getAttribute('data-theme')); });
    })(swatches[i]);

    /* ── kenar kıvılcımları (canvas) ── */
    var canvas=document.getElementById('bgfx'), ctx=canvas&&canvas.getContext&&canvas.getContext('2d');
    var shell=document.querySelector('.shell');
    var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(canvas&&ctx&&shell){
      var W=innerWidth, H=innerHeight, dpr=Math.min(2, window.devicePixelRatio||1);
      var PAD=6, bandL=0, bandR=W, px=-999, py=-999, hasP=false, parts=[], sprite=null;
      function rr(){ return Math.random(); }
      function clamp(v,a,b){ return v<a?a:v>b?b:v; }
      function cssv(n){ return getComputedStyle(body).getPropertyValue(n).trim(); }
      rebuildSprite=function(){
        var a2=cssv('--accent-2-rgb')||'255,194,125', a=cssv('--accent-rgb')||'255,138,77';
        var s=document.createElement('canvas'); s.width=s.height=48;
        var c=s.getContext('2d'), g=c.createRadialGradient(24,24,0,24,24,24);
        g.addColorStop(0,'rgba('+a2+',.95)'); g.addColorStop(.35,'rgba('+a+',.5)'); g.addColorStop(1,'rgba('+a+',0)');
        c.fillStyle=g; c.fillRect(0,0,48,48); sprite=s;
      };
      /* SOL kolon (avatar/rozet/başlık) serbest — kıvılcımlar nesnelerin arkasında kalır (canvas z-index:0).
         Yasak = yalnız ORTADAKİ ana metin kolonu: .hero-main (isim/bio) + .cards (bölüm içerikleri). */
      function zone(){ var r=shell.getBoundingClientRect(), cs=getComputedStyle(shell);
        var pr=parseFloat(cs.paddingRight)||0;
        var mainLeft=Infinity, els=document.querySelectorAll('.hero-main, .cards');
        for(var i=0;i<els.length;i++){ var l=els[i].getBoundingClientRect().left; if(l<mainLeft) mainLeft=l; }
        if(!isFinite(mainLeft)) mainLeft=r.left+(parseFloat(cs.paddingLeft)||0);
        bandL=Math.max(0, mainLeft-PAD); bandR=Math.min(W, r.right-pr+PAD); }
      /* yalnız dış kenarda üre (sol/sağ boşluk) — içerik sütununa hiç girmez */
      function spawnX(){ var lw=Math.max(0,bandL), rw=Math.max(0,W-bandR), t=lw+rw;
        if(t<10) return rr()*W;
        return (rr()*t<lw) ? rr()*bandL : bandR+rr()*(W-bandR); }
      /* içerik sütununda parlaklık 0 → yazı/görsel üstüne kıvılcım GELMEZ; kenara doğru yumuşak geçiş */
      function edgeA(x){ var soft=35;
        if(x<=bandL) return clamp((bandL-x)/soft,0,1);
        if(x>=bandR) return clamp((x-bandR)/soft,0,1);
        return 0; }
      function build(){ zone();
        var gutter=Math.max(0,bandL)+Math.max(0,W-bandR);
        var n=Math.round(clamp(gutter*H/1571, 112, 980)); parts=[];  /* yoğunluk +%40 */
        for(var i=0;i<n;i++) parts.push({x:spawnX(), y:rr()*H, vy:rr()*.30+.10, drift:(rr()-.5)*.34, ph:rr()*6.28, sp:rr()*.02+.008, r:rr()*6+2.5, a:rr()*.5+.30}); }
      function resize(){ W=innerWidth; H=innerHeight; canvas.width=W*dpr; canvas.height=H*dpr;
        canvas.style.width=W+'px'; canvas.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); build(); if(reduced) draw(); }
      function draw(){ ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='lighter';
        for(var i=0;i<parts.length;i++){ var p=parts[i];
          if(!reduced){ p.y-=p.vy; p.x+=p.drift; p.ph+=p.sp;
            if(hasP){ var cx=p.x-px, cy=p.y-py, d2=cx*cx+cy*cy, R=120;
              if(d2<R*R&&d2>1){ var f=(1-Math.sqrt(d2)/R)*1.6, inv=1/Math.sqrt(d2); p.x+=cx*inv*f; p.y+=cy*inv*f; } }
            if(p.y<-16){ p.y=H+16; p.x=spawnX(); }
            if(p.x<-16)p.x=W+16; else if(p.x>W+16)p.x=-16; }
          var flick=0.6+0.4*Math.sin(p.ph), vis=edgeA(p.x); if(vis<=0) continue;
          var r=p.r*(0.8+0.3*flick); ctx.globalAlpha=p.a*flick*vis; ctx.drawImage(sprite, p.x-r, p.y-r, r*2, r*2); }
        ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
      function loop(){ draw(); requestAnimationFrame(loop); }
      rebuildSprite();
      window.addEventListener('pointermove', function(e){ px=e.clientX; py=e.clientY; hasP=true; if(reduced) draw(); }, {passive:true});
      window.addEventListener('resize', resize);
      resize();
      if(!reduced) requestAnimationFrame(loop);
    }

    setTheme(load()||'amber');
  })();
  
