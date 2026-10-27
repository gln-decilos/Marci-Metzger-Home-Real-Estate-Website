var $=function(q,c) {
    return Array.from((c||document).querySelectorAll(q))
}
,
rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var nav=$('nav.top')[0],
bar=$('.bar')[0],
bg=$('.burger')[0],
ul=$('nav.top ul')[0];
var maxS=1,wasScrolled=null,ticking=false;
function measure() {
    maxS=Math.max(document.documentElement.scrollHeight-innerHeight,1)
}
function paint() {
    ticking=false;
    var s=scrollY>20;
    if(s!==wasScrolled){wasScrolled=s;nav.classList.toggle('scrolled',s)}
    bar.style.transform='scaleX('+Math.min(scrollY/maxS,1)+')'
}
function tick() {
    if(!ticking){ticking=true;requestAnimationFrame(paint)}
}
measure();
addEventListener('resize',measure);
addEventListener('load',measure);
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
function countUp(b) {
    if (b.dataset.countStarted === 'true') return;
    b.dataset.countStarted = 'true';
    var n = Number(b.dataset.count) || 0;
    var d = Number(b.dataset.dec) || 0;
    var prefix = b.dataset.pre || '';
    var suffix = b.dataset.suf || '';

    // Respect reduced-motion settings while still showing the correct values.
    if (rm) {
        b.textContent = prefix + n.toFixed(d) + suffix;
        return;
    }

    var start = performance.now();
    function animate(now) {
        var progress = Math.min((now - start) / 1400, 1);
        var value = n * (1 - Math.pow(1 - progress, 3));
        b.textContent = prefix + value.toFixed(d) + suffix;
        if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

var counters = $('[data-count]');
if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            co.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    counters.forEach(function(counter) { co.observe(counter); });
} else {
    counters.forEach(countUp);
}
var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)$('a',ul).forEach(function(a){a.toggleAttribute('aria-current',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
$('section[id],header[id]').forEach(function(x){so.observe(x)});
document.getElementById('cf').onsubmit=function(e) {
    e.preventDefault();
    document.getElementById('ok').textContent='Thank you. Marci will be in touch shortly.';
    e.target.reset()
}
;

// Accessible photo gallery preview with details and thumbnail navigation.
(function () {
    var galleryCards = Array.from(document.querySelectorAll('#sc .g'));
    if (!galleryCards.length) return;

    var photos = galleryCards.map(function (card) {
        var image = card.querySelector('img');
        var location = card.querySelector('small');
        var title = card.querySelector('strong');
        return {
            src: image ? image.getAttribute('src') : '',
            alt: image ? image.getAttribute('alt') || '' : '',
            location: location ? location.textContent.trim() : 'Photo gallery',
            title: title ? title.textContent.trim() : (image ? image.alt : 'Gallery photo'),
            description: image ? (image.getAttribute('data-description') || '') : ''
        };
    });

    var modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.setAttribute('role', 'presentation');
    modal.innerHTML = [
        '<div class="gallery-dialog" role="dialog" aria-modal="true" aria-label="Photo preview">',
        '  <div class="gallery-preview">',
        '    <img class="gallery-main-image" src="" alt="">',
        '    <button class="gallery-close" type="button" aria-label="Close photo preview">&times;</button>',
        '    <button class="gallery-step gallery-prev" type="button" aria-label="Previous photo">&#8249;</button>',
        '    <button class="gallery-step gallery-next" type="button" aria-label="Next photo">&#8250;</button>',
        '  </div>',
        '  <div class="gallery-info">',
        '    <p class="gallery-count"></p>',
        '    <h3 class="gallery-title"></h3>',
        '    <p class="gallery-description"></p>',
        '    <div class="gallery-thumbnails" aria-label="Choose a photo"></div>',
        '  </div>',
        '</div>'
    ].join('');
    document.body.appendChild(modal);

    var mainImage = modal.querySelector('.gallery-main-image');
    var count = modal.querySelector('.gallery-count');
    var title = modal.querySelector('.gallery-title');
    var description = modal.querySelector('.gallery-description');
    var thumbnails = modal.querySelector('.gallery-thumbnails');
    var closeButton = modal.querySelector('.gallery-close');
    var previousButton = modal.querySelector('.gallery-prev');
    var nextButton = modal.querySelector('.gallery-next');
    var activeIndex = 0;
    var lastFocusedElement = null;

    photos.forEach(function (photo, index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery-thumb';
        button.setAttribute('aria-label', 'View photo: ' + photo.title);
        button.innerHTML = '<img src="' + photo.src.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" alt="">';
        button.addEventListener('click', function () { showPhoto(index); });
        thumbnails.appendChild(button);
    });
    var thumbnailButtons = Array.from(thumbnails.querySelectorAll('.gallery-thumb'));

    function showPhoto(index) {
        activeIndex = (index + photos.length) % photos.length;
        var photo = photos[activeIndex];
        mainImage.src = photo.src;
        mainImage.alt = photo.alt;
        count.textContent = photo.location + '  /  ' + (activeIndex + 1) + ' of ' + photos.length;
        title.textContent = photo.title;
        description.textContent = photo.description || photo.alt || 'Explore this view of Pahrump and the surrounding community.';
        thumbnailButtons.forEach(function (button, i) {
            var selected = i === activeIndex;
            button.classList.toggle('is-active', selected);
            if (selected) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
    }

    function openModal(index, trigger) {
        lastFocusedElement = trigger || document.activeElement;
        showPhoto(index);
        modal.classList.add('is-open');
        document.body.classList.add('gallery-modal-open');
        closeButton.focus();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.classList.remove('gallery-modal-open');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }

    galleryCards.forEach(function (card, index) {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-haspopup', 'dialog');
        card.addEventListener('click', function (event) {
            event.preventDefault();
            if (window.galleryWasDragged) return;
            openModal(index, card);
        });
        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(index, card);
            }
        });
    });

    closeButton.addEventListener('click', closeModal);
    previousButton.addEventListener('click', function () { showPhoto(activeIndex - 1); });
    nextButton.addEventListener('click', function () { showPhoto(activeIndex + 1); });
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (!modal.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeModal();
        if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
        if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
    });
})();


// Smooth, inertia-style page scrolling (desktop mouse / trackpad only).
// Touch devices and "reduce motion" users keep the browser's native scrolling.
(function () {
    if (rm || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    var root = document.documentElement;
    var EASE = 0.085;          // lower = floatier, higher = snappier
    var target = scrollY, current = scrollY, raf = 0, last = 0;

    root.classList.add('smooth-js');

    function maxScroll() { return Math.max(root.scrollHeight - innerHeight, 0); }
    function clamp(v) { return Math.max(0, Math.min(maxScroll(), v)); }
    function locked() { return document.body.classList.contains('gallery-modal-open'); }

    function frame(now) {
        var dt = Math.min((now - last) / 16.67, 3) || 1;   // keeps speed identical on 60/120/144 Hz screens
        last = now;
        current += (target - current) * (1 - Math.pow(1 - EASE, dt));
        if (Math.abs(target - current) < 0.5) current = target;
        scrollTo(0, current);
        raf = current === target ? 0 : requestAnimationFrame(frame);
    }

    function go(y) {
        if (!raf) { current = scrollY; last = performance.now(); }
        target = clamp(y);
        if (!raf) raf = requestAnimationFrame(frame);
    }

    addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.defaultPrevented || locked()) return;               // pinch-zoom, handled, modal open
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) return;     // horizontal gestures (gallery)
        if (e.target.closest && e.target.closest('textarea, select')) return;
        e.preventDefault();
        var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
        if (!raf) target = scrollY;
        go(target + d);
    }, { passive: false });

    // Scrollbar drag, find-in-page, etc.: stay in sync with the real position.
    addEventListener('scroll', function () {
        if (Math.abs(scrollY - current) > 2) {
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
            target = current = scrollY;
        }
    }, { passive: true });

    // Nav / anchor links glide to their section.
    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey) return;
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        var id = a.getAttribute('href');
        var el = id.length > 1 ? document.querySelector(id) : null;
        if (!el && id !== '#') return;
        e.preventDefault();
        go(el && id !== '#home' ? el.getBoundingClientRect().top + scrollY - 96 : 0);
        if (history.replaceState) history.replaceState(null, '', id);
    });

    // Keyboard scrolling glides too.
    addEventListener('keydown', function (e) {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || locked()) return;
        var t = document.activeElement;
        if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName) || (t && t.isContentEditable)) return;
        var y = raf ? target : scrollY, k = e.key;
        if (k === 'ArrowDown') y += 90;
        else if (k === 'ArrowUp') y -= 90;
        else if (k === 'PageDown' || (k === ' ' && !e.shiftKey)) y += innerHeight * 0.9;
        else if (k === 'PageUp' || (k === ' ' && e.shiftKey)) y -= innerHeight * 0.9;
        else if (k === 'Home') y = 0;
        else if (k === 'End') y = maxScroll();
        else return;
        e.preventDefault();
        go(y);
    });
})();
