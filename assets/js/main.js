var $=function(q,c) {
    return Array.from((c||document).querySelectorAll(q))
}
,
rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var nav=$('nav.top')[0],
bar=$('.bar')[0],
bg=$('.burger')[0],
ul=$('nav.top ul')[0];
function tick() {
    nav.classList.toggle('scrolled',scrollY>20);
    bar.style.transform='scaleX('+(scrollY/(document.body.scrollHeight-innerHeight||1))+')'
}
addEventListener('scroll',tick,{passive:true});
tick();
bg.onclick=function() {
    var o=ul.classList.toggle('open');
    bg.setAttribute('aria-expanded',o)
}
;
$('a',ul).forEach(function(a){a.onclick=function(){ul.classList.remove('open');bg.setAttribute('aria-expanded',false)}});
var sc=document.getElementById('sc'),
mid=document.getElementById('mid');
function ctr() {
    sc.scrollLeft=mid.offsetLeft-(sc.clientWidth-mid.offsetWidth)/2
}
ctr();
addEventListener('load',ctr);
var dn=0,
sx=0,
sl=0;
sc.onpointerdown=function(e) {
    dn=1;
    sx=e.clientX;
    sl=sc.scrollLeft
}
;
addEventListener('pointerup',function(){dn=0;sc.classList.remove('drag')});
addEventListener('pointermove',function(e){if(dn&&Math.abs(e.clientX-sx)>4){sc.classList.add('drag');sc.scrollLeft=sl-(e.clientX-sx)}});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
$('.head,.about>*,.c,.g,.find-area,.logos img,.contact>*').forEach(function(el,i){if(!rm){el.classList.add('rv');el.style.setProperty('--d',(i%4)*.09+'s');io.observe(el)}});
var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var b=e.target,n=+b.dataset.count,d=+b.dataset.dec||0,t0=performance.now();(function f(t){var p=Math.min((t-t0)/1400,1),v=n*(1-Math.pow(1-p,3));b.textContent=(b.dataset.pre||'')+v.toFixed(d)+(b.dataset.suf||'');if(p<1)requestAnimationFrame(f)})(t0)})},{threshold:.6});
$('[data-count]').forEach(function(b){if(!rm)co.observe(b)});
var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)$('a',ul).forEach(function(a){a.toggleAttribute('aria-current',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
$('section[id],header[id]').forEach(function(x){so.observe(x)});
document.getElementById('cf').onsubmit=function(e) {
    e.preventDefault();
    document.getElementById('ok').textContent='Thank you. Marci will be in touch shortly.';
    e.target.reset()
}
;
