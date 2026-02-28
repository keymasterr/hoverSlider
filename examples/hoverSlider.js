function hoverSlider(target = '.hover_slider', options = {}) {
  let conts;
  if (typeof target === 'string') {
    conts = document.querySelectorAll(target);
  } else if (target instanceof Element) {
    conts = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    conts = target;
  } else {
    return;
  }

  conts.forEach(cont => {
    if (cont._hoverSliderDestroy) return;

    cont.classList.add('hover_slider');
    const imgs = cont.querySelectorAll('img');
    const n = imgs.length;

    if (n === 0) return;

    const appliedAttrs = [];
    for (const attr of ['fit', 'ind', 'border']) {
      if (!(attr in cont.dataset) && options[attr] != null) {
        cont.dataset[attr] = options[attr];
        appliedAttrs.push(attr);
      }
    }

    const touchLoop = 'touchLoop' in cont.dataset
      ? cont.dataset.touchLoop === 'true'
      : options.touchLoop ?? false;

    const touchRelative = 'touchRelative' in cont.dataset
      ? cont.dataset.touchRelative === 'true'
      : options.touchRelative ?? false;

    const imgWindow = document.createElement('div');
    imgWindow.className = 'hover_slider-window';
    imgWindow.append(...imgs);
    cont.append(imgWindow);

    const indicator = document.createElement('div');
    indicator.className = 'hover_slider-indicator';
    for (let i = 0; i < n; i++) {
      const indmark = document.createElement('div');
      indmark.addEventListener('click', () => setActive(i));
      indmark.className = 'indmark';
      indicator.append(indmark);
    }
    indicator.querySelector('.indmark').classList.add('active');
    indicator.setAttribute('aria-hidden', 'true');
    cont.append(indicator);

    const firstImg = imgs[0];

    firstImg.decode().then(() => {
      const c = cont.cloneNode(false);
      c.style.display = 'inline-block';
      document.body.appendChild(c);
      const contWidth = c.offsetWidth;
      const contHeight = c.offsetHeight;
      document.body.removeChild(c);

      const naturalWidth = firstImg.naturalWidth;
      const naturalHeight = firstImg.naturalHeight;

      if (contWidth && contHeight) {
      } else if (contWidth || contHeight) {
        cont.style.aspectRatio = `${naturalWidth / naturalHeight}`;
      } else {
        const scale = firstImg.src.includes('@2x') ? 2 : (firstImg.src.includes('@3x') ? 3 : 1);
        cont.style.width = `${naturalWidth / scale}px`;
        cont.style.height = `${naturalHeight / scale}px`;
      }
    }).catch((errorMessage) => console.error("Image loading error:", errorMessage));

    let tsX, tsY, hasMovedOnce = false, allowSlide = true, curActiveId = 0, touchStartId;

    imgWindow.addEventListener('touchstart', (e) => {
      tsX = e.touches[0].clientX;
      tsY = e.touches[0].clientY;
      allowSlide = false;
      touchStartId = curActiveId;
    });

    imgWindow.addEventListener('mousemove', handleMove);
    imgWindow.addEventListener('touchmove', handleMove);

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
      if (allowSlide !== true) return;

      e.preventDefault();
      const curX = e.touches ? e.touches[0].clientX : e.clientX;
      const {left: contLeft} = cont.getBoundingClientRect();
      const sectionWidth = cont.offsetWidth / n;
      const relX = curX - contLeft;
      let relDiff = 0;

      if (e.touches && touchRelative) {
        relDiff = (tsX - contLeft) - (sectionWidth * (touchStartId));
      }

      const x = (relX  - relDiff) / sectionWidth;
      let nextActiveId = Math.floor(x);

      setActive(nextActiveId, e.touches && touchLoop);
    }

    imgWindow.addEventListener('touchend', () => {
      hasMovedOnce = false;
      allowSlide = true;
      cont.classList.remove('hover_slider-touch_active');
    });

    function setActive(nextActiveId, loop = false) {
      if (typeof nextActiveId === 'undefined' || curActiveId === nextActiveId) return;
      if (!loop && (nextActiveId < 0 || nextActiveId >= n)) return;
      nextActiveId = ((nextActiveId % n) + n) % n;

      const currentActiveImg = imgs[nextActiveId];
      const previousActiveImgs = cont.querySelectorAll('.active');

      if (previousActiveImgs.length > 0) {
        previousActiveImgs.forEach(el => {
          el.classList.replace('active','prevActive');
        });
      }

      currentActiveImg.classList.add('active');
      previousActiveImgs.forEach(el => {el.classList.remove('prevActive')});

      const indmarks = indicator.querySelectorAll('.indmark');
      indmarks.forEach(el => el.classList.remove('active'));
      indmarks[nextActiveId].classList.add('active');

      curActiveId = nextActiveId;
    }

    cont._hoverSliderDestroy = () => {
      imgs.forEach(img => {
        img.classList.remove('active', 'prevActive');
        cont.append(img);
      });
      indicator.remove();
      imgWindow.remove();
      appliedAttrs.forEach(attr => delete cont.dataset[attr]);
      delete cont._hoverSliderDestroy;
      return cont;
    };
  });
}