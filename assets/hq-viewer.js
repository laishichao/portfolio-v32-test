(()=>{
const imgs=[...document.querySelectorAll('img[data-full]')];if(!imgs.length)return;
const style=document.createElement('style');style.textContent=`
.hq-viewer{position:fixed;inset:0;z-index:2147483600;background:rgba(3,4,5,.97);display:none;flex-direction:column;color:white;font:14px system-ui,sans-serif;touch-action:none}.hq-viewer.is-open{display:flex}
.hq-top{position:absolute;z-index:3;top:10px;left:10px;right:10px;display:flex;align-items:center;gap:8px;pointer-events:none}
.hq-action{pointer-events:auto;cursor:pointer;background:rgba(26,29,32,.88);border:1px solid #6a6e70;border-radius:30px;color:#fff;padding:9px 13px;font:inherit}
.hq-counter{margin-left:auto;background:#111a;padding:8px 12px;border-radius:12px}
.hq-canvas{flex:1;position:relative;overflow:hidden;touch-action:none;cursor:grab}.hq-canvas.is-drag{cursor:grabbing}
.hq-full{position:absolute;top:50%;left:50%;max-width:none;max-height:none;transform-origin:center center;user-select:none;-webkit-user-drag:none;will-change:transform;opacity:0}
.hq-help{position:absolute;bottom:14px;left:0;right:0;text-align:center;color:#bbb;font-size:12px;pointer-events:none}
@media(max-width:600px){.hq-action{padding:9px 10px}.hq-help{font-size:11px}}
`;document.head.append(style);
const view=document.createElement('div');view.className='hq-viewer';view.setAttribute('role','dialog');view.setAttribute('aria-modal','true');view.innerHTML=`<div class="hq-top"><button class="hq-action" data-a="close" aria-label="关闭">✕</button><button class="hq-action" data-a="out" aria-label="缩小">−</button><button class="hq-action" data-a="in" aria-label="放大">＋</button><button class="hq-action" data-a="reset">还原</button><button class="hq-action" data-a="prev">‹</button><button class="hq-action" data-a="next">›</button><span class="hq-counter"></span></div><div class="hq-canvas"><img class="hq-full" draggable="false"><span class="hq-help">滚轮 / 双指缩放 · 拖动查看 · Esc 关闭</span></div>`;document.body.append(view);
let idx=0,scale=1,tx=0,ty=0,minScale=1,baseW=1,baseH=1,start=null,touches=new Map();const canvas=view.querySelector('.hq-canvas'),img=view.querySelector('.hq-full'),counter=view.querySelector('.hq-counter');
function limits(){const maxX=Math.max(0,(baseW*scale-canvas.clientWidth)/2),maxY=Math.max(0,(baseH*scale-canvas.clientHeight)/2);tx=Math.max(-maxX,Math.min(maxX,tx));ty=Math.max(-maxY,Math.min(maxY,ty))}
function render(){limits();img.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(${scale})`}
function fit(){const w=img.naturalWidth||1,h=img.naturalHeight||1,r=Math.min(canvas.clientWidth/w,canvas.clientHeight/h,1);baseW=w*r;baseH=h*r;img.style.width=baseW+'px';img.style.height=baseH+'px';scale=1;tx=ty=0;render()}
function zoom(f,x=canvas.clientWidth/2,y=canvas.clientHeight/2){let old=scale;scale=Math.max(1,Math.min(4,scale*f));const k=scale/old;tx=(tx-(x-canvas.clientWidth/2))*k+(x-canvas.clientWidth/2);ty=(ty-(y-canvas.clientHeight/2))*k+(y-canvas.clientHeight/2);render()}
function load(i){idx=(i+imgs.length)%imgs.length;scale=1;tx=ty=0;img.style.opacity='0';img.onload=()=>{fit();img.style.opacity='1'};img.onerror=()=>{counter.textContent='高清图片加载失败'};img.src=imgs[idx].dataset.full;counter.textContent=`${idx+1} / ${imgs.length}`;if(img.complete&&img.naturalWidth){fit();img.style.opacity='1'}}
function close(){view.classList.remove('is-open');document.body.style.overflow='';img.removeAttribute('src');touches.clear()}
imgs.forEach((el,i)=>{el.style.cursor='zoom-in';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',(el.alt||'图片')+'，点击放大');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}});el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.body.style.overflow='hidden';view.classList.add('is-open');load(i)})});
view.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.a;if(a==='close')close();if(a==='prev')load(idx-1);if(a==='next')load(idx+1);if(a==='reset'){scale=1;tx=ty=0;render()}if(a==='in')zoom(1.4);if(a==='out')zoom(1/1.4)}));
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoom(e.deltaY<0?1.2:1/1.2,e.clientX-r.left,e.clientY-r.top)},{passive:false});
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});start={x:e.clientX,y:e.clientY,tx,ty};canvas.classList.add('is-drag')});
let pinch=null;canvas.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;const old=touches.get(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const p=[...touches.values()],dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch)zoom(dist/pinch,((p[0].x+p[1].x)/2)-canvas.getBoundingClientRect().left,((p[0].y+p[1].y)/2)-canvas.getBoundingClientRect().top);pinch=dist;start=null}else if(scale>1){tx+=e.clientX-old.x;ty+=e.clientY-old.y;render()}});
function pointerEnd(e){touches.delete(e.pointerId);pinch=null;start=null;canvas.classList.remove('is-drag')};canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);
canvas.addEventListener('dblclick',e=>{const r=canvas.getBoundingClientRect();if(scale>1){scale=1;tx=ty=0;render()}else zoom(2,e.clientX-r.left,e.clientY-r.top)});
document.addEventListener('keydown',e=>{if(!view.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')load(idx-1);if(e.key==='ArrowRight')load(idx+1)});
window.addEventListener('resize',()=>{if(view.classList.contains('is-open')&&img.naturalWidth)fit()});
})();