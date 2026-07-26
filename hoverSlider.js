function hoverSlider(target = '.hover_slider', options = {}) {
  let conts;
  if (typeof target === 'string') {
    conts = document.querySelectorAll(target);
  } else if (target instanceof Element) {
    conts = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    conts = target;
  } else {
    return [];
  }

  const instances = [];

  conts.forEach(cont => {
    if (cont._hoverSliderDestroy) return;

    const imgs = [...cont.querySelectorAll('img')];
    const n = imgs.length;

    if (n === 0) return;

    const addedClass = !cont.classList.contains('hover_slider');
    if (addedClass) cont.classList.add('hover_slider');

    const appliedAttrs = [];
    for (const attr of ['fit', 'ind', 'border']) {
      if (!(attr in cont.dataset) && options[attr] != null) {
        cont.dataset[attr] = options[attr];
        appliedAttrs.push(attr);
      }
    }

    const flag = (key, fallback) => {
      if (!(key in cont.dataset)) return fallback ?? false;
      const value = cont.dataset[key];
      return value === '' || value === 'true';
    };

    const touchLoop = flag('touchLoop', options.touchLoop);
    const touchRelative = flag('touchRelative', options.touchRelative);
    const wait = flag('wait', options.wait);

    if (!('wait' in cont.dataset)) {
      cont.dataset.wait = wait;
      appliedAttrs.push('wait');
    }

    let ready = !wait;
    let destroyed = false;

    const appliedStyles = [];
    const appliedAria = [];

    const imgWindow = document.createElement('div');
    imgWindow.className = 'hover_slider-window';
    imgWindow.append(...imgs);
    cont.append(imgWindow);

    imgs.forEach((img, i) => {
      if (i > 0 && !img.hasAttribute('aria-hidden')) {
        img.setAttribute('aria-hidden', 'true');
        appliedAria.push(img);
      }
    });

    const indicator = document.createElement('div');
    indicator.className = 'hover_slider-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    const indmarks = imgs.map((img, i) => {
      const indmark = document.createElement('div');
      indmark.className = 'indmark';
      indmark.addEventListener('click', () => setActive(i));
      indicator.append(indmark);
      return indmark;
    });
    indmarks[0].classList.add('active');
    cont.append(indicator);

    const firstImg = imgs[0];

    firstImg.decode().catch(() => {}).then(() => {
      if (destroyed) return;
      applySize();
      cont.classList.add('hover_slider-cover_ready');
    });

    Promise.allSettled(imgs.map(img => img.decode())).then(results => {
      if (destroyed) return;
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed) console.warn(`hoverSlider: ${failed} of ${n} image(s) failed to decode`);
      cont.classList.add('hover_slider-ready');
      ready = true;
    });

    function setStyle(prop, value) {
      if (!cont.style[prop]) appliedStyles.push(prop);
      cont.style[prop] = value;
    }

    function applySize() {
      const c = cont.cloneNode(false);
      c.style.display = 'inline-block';
      c.style.alignSelf = 'flex-start';
      c.style.justifySelf = 'start';
      c.style.visibility = 'hidden';
      c.style.pointerEvents = 'none';
      if (cont.parentNode) cont.after(c); else document.body.append(c);
      const contWidth = c.offsetWidth;
      const contHeight = c.offsetHeight;
      c.remove();

      if (contWidth && contHeight) return;

      const {naturalWidth, naturalHeight} = firstImg;
      if (!naturalWidth || !naturalHeight) return;

      if (contWidth || contHeight) {
        setStyle('aspectRatio', `${naturalWidth / naturalHeight}`);
        return;
      }

      const src = firstImg.currentSrc || firstImg.src;
      const density = src.match(/@([23])x\.[a-z0-9]+(?:[?#]|$)/i);
      const scale = density ? Number(density[1]) : 1;
      setStyle('width', `${naturalWidth / scale}px`);
      setStyle('aspectRatio', `${naturalWidth / naturalHeight}`);
      setStyle('maxWidth', '100%');
    }

    let tsX, tsY, hasMovedOnce = false, allowSlide = true, curActiveId = 0, touchStartId = 0;

    imgWindow.addEventListener('touchstart', (e) => {
      tsX = e.touches[0].clientX;
      tsY = e.touches[0].clientY;
      allowSlide = false;
      touchStartId = curActiveId;
    });

    imgWindow.addEventListener('mousemove', handleMove);
    imgWindow.addEventListener('touchmove', handleMove);
    imgWindow.addEventListener('dragstart', (e) => e.preventDefault());

    imgWindow.setAttribute('tabindex', '0');
    imgWindow.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') setActive(curActiveId + 1);
      if (e.key === 'ArrowLeft') setActive(curActiveId - 1);
    });

    function handleMove(e) {
      if (e.touches) {
        if (hasMovedOnce) return nextStep(e);

        hasMovedOnce = true;
        const diffX = Math.abs(tsX - e.touches[0].clientX);
        const diffY = Math.abs(tsY - e.touches[0].clientY);
        if (diffX > diffY) {
          cont.classList.add('hover_slider-touch_active');
          allowSlide = true;
        }
      }

      nextStep(e);
    }

    function nextStep(e) {
      if (allowSlide !== true || !ready) return;

      if (e.touches) e.preventDefault();

      const curX = e.touches ? e.touches[0].clientX : e.clientX;
      const {left: contLeft, width: contWidth} = cont.getBoundingClientRect();
      if (!contWidth) return;

      const sectionWidth = contWidth / n;
      const relX = curX - contLeft;
      let relDiff = 0;

      if (e.touches && touchRelative) {
        relDiff = (tsX - contLeft) - (sectionWidth * touchStartId);
      }

      const x = (relX - relDiff) / sectionWidth;

      setActive(Math.floor(x), e.touches && touchLoop);
    }

    imgWindow.addEventListener('touchend', () => {
      hasMovedOnce = false;
      allowSlide = true;
      cont.classList.remove('hover_slider-touch_active');
    });

    let holdImg = null, holdSeq = 0;

    function holdUnder(prevImg, nextImg) {
      if (holdImg && holdImg !== prevImg) holdImg.classList.remove('prevActive');
      holdImg = prevImg;
      prevImg.classList.add('prevActive');

      const seq = ++holdSeq;
      nextImg.decode().catch(() => {}).then(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (destroyed || seq !== holdSeq) return;
          prevImg.classList.remove('prevActive');
          holdImg = null;
        }));
      });
    }

    function setActive(nextActiveId, loop = false) {
      if (!Number.isFinite(nextActiveId)) return;
      if (!loop && (nextActiveId < 0 || nextActiveId >= n)) return;
      nextActiveId = ((nextActiveId % n) + n) % n;
      if (nextActiveId === curActiveId) return;

      const prevImg = imgs[curActiveId];
      const nextImg = imgs[nextActiveId];

      nextImg.classList.add('active');
      prevImg.classList.remove('active');
      holdUnder(prevImg, nextImg);

      indmarks[curActiveId].classList.remove('active');
      indmarks[nextActiveId].classList.add('active');

      curActiveId = nextActiveId;
    }

    function destroy() {
      if (destroyed) return cont;
      destroyed = true;

      imgs.forEach(img => {
        img.classList.remove('active', 'prevActive');
        cont.append(img);
      });
      appliedAria.forEach(img => img.removeAttribute('aria-hidden'));
      indicator.remove();
      imgWindow.remove();
      appliedAttrs.forEach(attr => delete cont.dataset[attr]);
      appliedStyles.forEach(prop => cont.style[prop] = '');
      cont.classList.remove('hover_slider-cover_ready', 'hover_slider-ready', 'hover_slider-touch_active');
      if (addedClass) cont.classList.remove('hover_slider');
      delete cont._hoverSliderDestroy;
      return cont;
    }

    cont._hoverSliderDestroy = destroy;
    instances.push({el: cont, destroy});
  });

  return instances;
}
