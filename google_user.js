// ==UserScript==
// @name         Google w/Wallpaper + Date/Time + Logos
// @namespace    srazzano
// @version      2.4.9
// @description  Modernized Google with centered logo, wallpaper, date/time + draggable containers
// @author       Sonny Razzano a.k.a. srazzano
// @match        https://www.google.com/*
// @match        https://google.com/*
// @exclude      https://www.google.com/search*
// @exclude      https://google.com/search*
// @exclude      https://www.google.com/maps*
// @icon         https://raw.githubusercontent.com/srazzano/Images/master/googleicon64.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// =============================================================================
// NOTE: To open all Google App Links in new tabs, download Tampermonkey script:
// https://github.com/Razzano/Google_App_Links/blob/main/Open_in_New_Tab.js
// =============================================================================

(() => {

  'use strict';

  // ===========================================================================
  // DOM HELPERS
  // ===========================================================================

  const SVG_NS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = new Set([
    "svg","g","path","circle","text","line","rect","polyline","polygon",
    "foreignObject","defs","marker","stop","use"
  ]);

  const $el = (tag, props = {}, ...children) => {
    const isSVG = SVG_TAGS.has(tag);
    const el = isSVG
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value == null) continue;
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
        continue;
      }
      if (key === "className" || key === "class") {
        el.setAttribute("class", Array.isArray(value) ? value.join(" ") : value);
        continue;
      }
      if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
        continue;
      }
      if (key === "textContent") {
        el.textContent = value;
        continue;
      }
      if (isSVG) {
        el.setAttribute(key, value);
        continue;
      }
      if (key in el) {
        el[key] = value;
      } else {
        el.setAttribute(key, value);
    } }
    children.flat(Infinity).forEach(child => {
      if (child != null) el.append(child);
    });
    return el;
  };

  const $id = (id) => document.getElementById(id);
  const $q = (sel, ctx = document) => ctx?.querySelector(sel) ?? null;
  const $qa = (sel, ctx = document) => Array.from(ctx?.querySelectorAll(sel) ?? []);

  const insertAfter = (newEl, refEl) => {
    if (!refEl || !refEl.parentNode) {
      console.warn('insertAfter: refEl is null or has no parentNode', refEl);
      return null;
    }
    refEl.after(newEl);
    return newEl;
  };

  const makeDraggable = (elmnt, storageKey, dragSelector = null) => {
    let startX, startY, startLeft, startTop;
    let isDragging = false;
    const dragMouseDown = (e) => {
      if (dragSelector) {
        if (!e.target.closest(dragSelector)) return;
      } else {
        if (e.target.closest('button,input,select,textarea,img,span')) return;
        if (e.target !== elmnt) return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      if (elmnt.style.position !== 'fixed') {
        const rect = elmnt.getBoundingClientRect();
        elmnt.style.position = 'fixed';
        elmnt.style.left = rect.left + 'px';
        elmnt.style.top = rect.top + 'px';
        elmnt.style.transform = 'none';
        elmnt.classList.add('dragged');
      }
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(elmnt.style.left) || 0;
      startTop = parseFloat(elmnt.style.top) || 0;
      isDragging = true;
      document.addEventListener('mousemove', elementDrag, { passive: false });
      document.addEventListener('mouseup', closeDragElement, { once: true });
    };
    const elementDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elmnt.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - elmnt.offsetHeight));
      elmnt.style.left = `${newLeft}px`;
      elmnt.style.top = `${newTop}px`;
    };
    const closeDragElement = () => {
      isDragging = false;
      document.removeEventListener('mousemove', elementDrag);
      GM_setValue(storageKey + '_top', elmnt.style.top);
      GM_setValue(storageKey + '_left', elmnt.style.left);
    };
    elmnt.style.cursor = 'move';
    elmnt.style.userSelect = 'none';
    elmnt.addEventListener('mousedown', dragMouseDown);
  };

  const removeDupes = (className) => {
    const [first, ...dupes] = document.querySelectorAll('.' + className);
    dupes.forEach(el => el.remove());
  };

  const restorePosition = (el, key) => {
    const savedTop = GM_getValue(key + '_top');
    const savedLeft = GM_getValue(key + '_left');
    if (savedTop != null && savedLeft != null) {
      el.style.top = savedTop;
      el.style.left = savedLeft;
      el.style.transform = 'none';
    }
  };

  // ===========================================================================
  // ORIGINAL CODE
  // ===========================================================================

  const body = document.body;
  const BASE_SIZE = 314;
  const DAY_ABBR = ['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'];
  const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTH_ABBR = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
  const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const _SECOND = 1000;
  const _SECONDS = 5000;
  const _aURL = 'https://raw.githubusercontent.com/Razzano/My_Images/master/';
  const _githubSite = 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image';

  const _Icon = {
    ampm22: _aURL + 'AMPM2.png',
    calendar16: _aURL + 'calendar16.png',
    calendar22: _aURL + 'calendar22.png',
    calendar32D: _aURL + 'calendar32D.png',
    clock16: _aURL + 'clock16.png',
    clock22: _aURL + 'clock22.png',
    clock22L: _aURL + 'clock22L.png',
    clock26: _aURL + 'clock26.png',
    moon16: _aURL + 'moon16.png',
    moon22: _aURL + 'moon22.png',
    sun16: _aURL + 'sun16.png',
    sun22: _aURL + 'sun22.png',
  };

  const _Image = {
    logo1: _aURL + 'logoGoogle.png',
    logo2: _aURL + 'imageGoogle.png',
    logo3: _aURL + 'world.png',
    logo4: _aURL + 'search8.png',
    logo5: _aURL + 'silverG.png',
    logo6: _aURL + 'googleLogo12.png',
    logo7: _aURL + 'bulb.png',
    logo8: _aURL + 'search3.png',
    logo9: _aURL + 'googleLogo15.png',
    logo10: _aURL + 'googleLogo17.png',
    logo11: _aURL + 'flag.png',
    logo12: _aURL + 'face2.png',
    logo13: _aURL + 'eagle6.png',
    logo14: _aURL + 'monkey1.png',
    logo15: _aURL + 'globe2.png',
    logo16: _aURL + 'eyes7.png',
    logo17: '',
  };

  const _Text = {
    amText: 'AM',
    bodyIdText: 'gWP1',
    buttonLogoText: 'Logo 🠉',
    buttonThemerText: 'Wallpaper 🠉',
    downLogoText: '🠋 Logo',
    downThemerText: '🠋 Wallpaper',
    hideText: ' Hide',
    placeholderText: 'Search Look-up',
    pmText: 'PM',
    scalerBtnMinusText: '–',
    scalerBtnPlusText: '+',
    scalerBtnResetText: 'Reset',
    showText: ' Show',
    spacerXText: '|',
  };

  const _Title = {
    anaCalBtnTitle: 'Show/Hide Calendar Info',
    ampmBtnTitle: 'Show/Hide Clock AMPM',
    analogClockBtnTitle: 'Analog Clock',
    buttonLogoTitle: 'Left-click to change logos',
    buttonThemerTitle: 'Left-click to change wallpaper',
    dateTimeElTitle: 'Left-click → Show/Hide Seconds',
    digCalBtnTitle: 'Left-click → Show/Hide Calendar & Digital Time',
    downLogoTitle: 'Left-click to change logos',
    downThemerTitle: 'Left-click to change wallpaper',
    inputLogoTitle: 'Manually Enter:\n • 1 - 17 (0 = Default Google Logo, 17 = No Logo)',
    inputThemerTitle: 'Manually Enter:\n • 1 - 52 (0 = Default Google Background)',
    percentageDisplayTitle: 'Manually Enter Percentage:\n • Min. 30% = 90px Ø\n • Reset 100% = 300px Ø\n • Max. 200% = 600px Ø',
    scalerBtnDownTitle: 'Scale Down In 5% Increments',
    scalerBtnUpTitle: 'Scale Up In 5% Increments',
    scalerResetTitle: 'Reset To 100%',
    secondHandBtnTitle: 'Toggle Between Smooth/Tick Second Hand Movement',
    themeBtnTitle: 'Toggle Between Dark/Light Theme',
  };

  // ===========================================================================
  // GLOBAL VARIABLES
  // ===========================================================================

  let analogAnimationId = null;
  let analogClockRunning = false;
  let analogIntervalId = null;
  let _currentWallpaperStyle = null;
  let _interval = null;

  // ===========================================================================
  // LOGOS
  // ===========================================================================

  const _Logo = [null];

  for (let i = 1; i <= 16; i++) {
    _Logo.push($el('img', {id: 'logoGoogle', class: 'logo', src: _Image[`logo${i}`]}));
  }

  const applyLogo = (num) => {
    const existing = $id('logoGoogle');
    if (existing) existing.remove();
    num = parseInt(num, 10);
    if (isNaN(num) || num < 0 || num > 18) { // 1 ← Change 18 to 19
      num = 0;
    }
    const logoConfig = {
      3: { marginTop: '15px', transform: 'translateX(-50%)' },
      4: { marginTop: '64px', transform: 'translateX(-50%)' },
      5: { marginTop: '5px', transform: 'translateX(-50%)' },
      7: { marginTop: '25px', transform: 'translateX(-50%)' },
      8: { marginTop: '60px', transform: 'translateX(-180%)' },
      12: { marginTop: '5px', transform: 'translateX(-50%)' },
      13: { marginTop: '15px', transform: 'translateX(-50%)' },
      15: { marginTop: '25px', transform: 'translateX(-50%)' },
    };
    const config = logoConfig[num] || { marginTop: '40px', transform: 'translateX(-50%)' };
    GM_addStyle(`
      img[alt="Google"], #hplogo, #logo, .k1zIA img, #gWP1 #LS8OJ img, #gWP1 #LS8OJ .k1zIA {
        display: ${num === 0 ? 'block' : 'none'} !important;
        visibility: ${num === 0 ? 'visible' : 'hidden'} !important;
      }
      div:has(> img[alt="Google"]) {
        display: ${num === 0 ? 'block' : 'none'} !important;
      }
      #gWP1 #logoGoogle {
        margin-top: ${config.marginTop} !important;
      }
    `);
    if (num !== 0 && _Logo[num]) {
      const logoCopy = _Logo[num].cloneNode(false);
      logoCopy.id = 'logoGoogle';
      logoCopy.className = 'logo';
      logoCopy.style.cssText = `
        left: 50%;
        position: absolute;
        top: ${config.marginTop} !important;
        transform: ${config.transform} !important;
      `;
      body.prepend(logoCopy);
    } else if (num !== 0) {
      console.warn(`Logo #${num} not found`);
    }
    const inp = $id('inputLogo');
    if (inp) {
      inp.value = num;
    }
    GM_setValue('logoImageNum', num);
  };

  const logoClick = (id) => {
    let current = GM_getValue('logoImageNum', 1);
    let next = (id.includes('up') || id === 'buttonLogo') ? (current + 1) % 18 : (current - 1 + 18) % 18; // 2 ← Change 18 to 19
    applyLogo(next);
  };

  const handleLogoInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(18, val)); // 3 ← Change 18 to 19
    applyLogo(val);
  };

  // ===========================================================================
  // WALLPAPER
  // ===========================================================================

  const applyWallpaper = (num) => {
    if (_currentWallpaperStyle) {
      _currentWallpaperStyle.remove();
      _currentWallpaperStyle = null;
    }
    num = parseInt(num) || 0;
    if (num === 0) return;
    const css = `
      #gWP1 {
        background: url(${_githubSite}${num}.jpg) no-repeat center center / cover fixed !important;
      }
    `;
    _currentWallpaperStyle = GM_addStyle(css);
  };

  const wallpaperButtonChanger = (e) => {
    const inp = $id('inputThemer');
    let val = parseInt(inp.value) || 0;
    val = e.target.id.includes('down') ? val - 1 : val + 1;
    if (val > 52) {
      val = 0;
    }
    if (val < 0) {
      val = 52;
    }
    inp.value = val;
    GM_setValue('wallpaperImage', val);
    applyWallpaper(val);
  };

  const wallpaperInputChanger = () => {
    const inpThemer = $id('inputThemer');
    let val = parseInt(inpThemer.value) || 0;
    val = Math.max(0, Math.min(52, val));
    inpThemer.value = val;
    GM_setValue('wallpaperImage', val);
    applyWallpaper(val);
  };

  // ===========================================================================
  // ANALOG CLOCK
  // ===========================================================================

  const stopAnalogClock = () => {
    analogClockRunning = false;
    if (analogAnimationId) {
      cancelAnimationFrame(analogAnimationId);
      analogAnimationId = null;
    }
    if (analogIntervalId) {
      clearInterval(analogIntervalId);
      analogIntervalId = null;
    }
  };

  const applyAnalogClock = () => {
    if (!GM_getValue('analogClock', true)) return;
	   let displayedSecondDeg = 0;
    const smoothSecondHand = GM_getValue('smoothSecondHand', true);
    const ticks = [];
    const hourNumbers = [];
    const spacer3 = $el('span', {id: 'spacer3', class: 'spacerX', textContent: _Text.spacerXText});
    for (let i = 0; i < 60; i++) {
      const angleDeg = i * 6 - 90;
      const rad = angleDeg * Math.PI / 180;
      const isHourMark = (i % 5 === 0);
      const innerRadius = isHourMark ? 42 : 44.5;
      const outerRadius = 47;
      ticks.push(
        $el('line', {
          x1: 50 + innerRadius * Math.cos(rad),
          y1: 50 + innerRadius * Math.sin(rad),
          x2: 50 + outerRadius * Math.cos(rad),
          y2: 50 + outerRadius * Math.sin(rad),
          stroke: isHourMark ? '#2c3e50' : '#7f8c8d',
          strokeWidth: isHourMark ? '1.5' : '0.75',
          strokeLinecap: 'round'
        })
      );
    }
    for (let i = 0; i < 12; i++) {
      const hour = i === 0 ? 12 : i;
      const angleDeg = i * 30 - 90;
      const rad = angleDeg * Math.PI / 180;
      const radius = 37;
      hourNumbers.push($el('text', {
        className: 'Analog-Number',
        x: 50 + radius * Math.cos(rad),
        y: 50.8 + radius * Math.sin(rad),
        textContent: hour,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      }));
    }
    const calendarText = $el('div', {
      className: 'Analog-CalendarText'
    });
    const ampmBorder = $el('rect', {
      className: 'Analog-AMPMBorder',
      x: 44,
      y: 75,
      width: 12,
      height: 7,
      rx: 2,
      ry: 2
    });
    const ampmText = $el('text', {
      className: 'Analog-AMPMText',
      x: 45,
      y: 81,
      textAnchor: 'middle',
      dominantBaseline: 'middle'
    });
    const svg = $el('svg', { className: 'Analog', viewBox: '0 0 100 100' },
      $el('circle', {
        cx: 50,
        cy: 50,
        r: 47,
        fill: 'none',
        stroke: '#ccc',
        strokeWidth: 2
      }),
      ...ticks,
      ...hourNumbers,
      ampmBorder,
      ampmText,
      $el('line', { className: 'Analog-Hour-Hand', x1: 50, y1: 50, x2: 50, y2: 30 }),
      $el('line', { className: 'Analog-Minute-Hand', x1: 50, y1: 50, x2: 50, y2: 22 }),
      $el('line', { className: 'Analog-Second-Hand', x1: 50, y1: 55, x2: 50, y2: 15 }),
      $el('circle', { className: 'Analog-CenterCutout', cx: 50, cy: 50, r: 3 })
    );
    const Clock = $el('div', { className: 'Analog-Bigclock' }, svg);
    const ampmView = GM_getValue('ampmView', true);
    ampmBorder.style.display = ampmView ? '' : 'none';
    ampmText.style.display = ampmView ? '' : 'none';
    let currentPercent = 100;
    const percentageDisplay = $el('input', {
      className: 'scaler-text',
      type: 'number',
      value: '100',
      min: '30',
      max: '200',
      step: '1',
      title: _Title.percentageDisplayTitle,
      oninput(e) {
        const val = e.target.value;
        if (val === '') return;
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          setClockPercentage(num);
      } }
    });
    const setClockPercentage = (percent) => {
      currentPercent = Math.max(30, Math.min(200, percent));
      const pixelSize = Math.round((currentPercent / 100) * BASE_SIZE);
      Clock.style.setProperty('--clock-size', pixelSize + 'px');
      percentageDisplay.value = String(currentPercent);
      GM_setValue('clockSizePercent', currentPercent);
    };
    const moonImg = $el('img', {
      id: 'moonImg',
      src: _Icon.moon22
    });
    const themeBtn = $el('button', {
      className: 'ClockThemeToggle',
      title: _Title.themeBtnTitle
    }, moonImg);
    const setTheme = (dark) => {
      Clock.classList.toggle('dark', dark);
      moonImg.src = dark ? _Icon.sun22 : _Icon.moon22;
      GM_setValue('clockDarkTheme', dark);
    };
    setTheme(GM_getValue('clockDarkTheme', true));
    themeBtn.onclick = () => {
      setTheme(!Clock.classList.contains('dark'));
    };
    const clockImg = $el('img', {
      id: 'clockImg',
      src: _Icon.clock22L
    });
    const secondHandBtn = $el('button', {
      className: 'ClockSecondToggle',
      title: _Title.secondHandBtnTitle
    }, clockImg);
    const setSecondMode = (smooth) => {
      GM_setValue('smoothSecondHand', smooth);
    };
    setSecondMode(GM_getValue('smoothSecondHand', true));
	   secondHandBtn.onclick = () => {
      GM_setValue('smoothSecondHand', !GM_getValue('smoothSecondHand', true));
      startAnalogClock();
    };
    const calendarImg = $el('img', {
      id: 'calendarImg',
      src: _Icon.calendar22
    });
    const clockInfo = $el('div', {
	     className: 'Analog-Info' },
      calendarText
    );
    const anaCalBtn = $el('button', {
      id: 'anaCalBtn',
      className: 'scaler-info',
      title: _Title.anaCalBtnTitle,
      onclick() {
        clockInfo.classList.toggle('hidden');
        GM_setValue('calendarInfo', !clockInfo.classList.contains('hidden'));
      }
    }, calendarImg);
    const ampmImg = $el('img', {
      id: 'ampmImg',
      src: _Icon.ampm22
    });
    const ampmBtn = $el('button', {
      className: 'am-pm',
      title: _Title.ampmBtnTitle,
      onclick() {
        const visible = !GM_getValue('ampmView', true);
        ampmBorder.style.display = visible ? '' : 'none';
        ampmText.style.display = visible ? '' : 'none';
        GM_setValue('ampmView', visible);
      }
    }, ampmImg);
    const scalerControls = $el('div', {
      className: 'scaler-controls' },
      themeBtn,
      secondHandBtn,
      anaCalBtn,
      ampmBtn,
      spacer3,
      $el('button', {
        className: 'scaler-reset',
        textContent: _Text.scalerBtnResetText,
        title: _Title.scalerResetTitle,
        onclick: () => setClockPercentage(100)
      }),
      $el('button', {
        className: 'scaler-btn',
        textContent: _Text.scalerBtnMinusText,
        title: _Title.scalerBtnDownTitle,
        onclick: () => setClockPercentage(currentPercent - 5)
      }),
      percentageDisplay,
      $el('button', {
        className: 'scaler-btn',
        textContent: _Text.scalerBtnPlusText,
        title: _Title.scalerBtnUpTitle,
        onclick: () => setClockPercentage(currentPercent + 5)
      })
    );
    const savedPercent = GM_getValue('clockSizePercent', 100);
    setClockPercentage(savedPercent);
	   const controlsRow = $el('div', {
      className: 'ControlsRow' },
      scalerControls
    );
    const container = $el('div', {
      id: 'analogClockContainer', className: 'ClockContainer' },
      Clock,
      controlsRow,
      clockInfo
    );
    makeDraggable(container, 'analogClockContainer', '.Analog-Bigclock');
    restorePosition(container, 'analogClockContainer');
    const rect = container.getBoundingClientRect();
    if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
      container.style.left = '20px';
      container.style.top = '20px';
    }
    body.prepend(container);
    const updateAnalogClock = () => {
      if (!$id('analogClockContainer')) return;
      const smoothSecondHand = GM_getValue('smoothSecondHand', true);
      const now = new Date();
      const seconds = smoothSecondHand ? now.getSeconds() + now.getMilliseconds() / 1000 : now.getSeconds();
      const secondDeg = seconds * 6;
      const minuteDeg = now.getMinutes() * 6 + seconds * 0.1;
      const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + seconds * (0.5 / 60);
	     let targetDeg = secondDeg;
      if (targetDeg < displayedSecondDeg - 180) targetDeg += 360;
      displayedSecondDeg = targetDeg;
      Clock.style.setProperty('--secondDeg', `${displayedSecondDeg}deg`);
      Clock.style.setProperty('--minuteDeg', `${minuteDeg}deg`);
      Clock.style.setProperty('--hourDeg', `${hourDeg}deg`);
      const dy = now.getDay(), dt = now.getDate(), mth = now.getMonth(), yr = now.getFullYear();
      const dayAbbr = DAY_ABBR[dy], dayFull = DAY_FULL[dy], monthAbbr = MONTH_ABBR[mth], monthFull = MONTH_FULL[mth];
      const suffix = ['th', 'st', 'nd', 'rd'][(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th';
      const ordinal = dt + suffix;
      const h12 = String(now.getHours() % 12 || 12);
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      const ampm = now.getHours() < 12 ? _Text.amText : _Text.pmText;
      const secView = GM_getValue('secondsView', false);
      ampmText.textContent = ampm;
      calendarText.textContent = `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr} 🕑 ${h12}:${min}`;
      const digitalClock = $id('dateTime');
      if (digitalClock) {
        digitalClock.textContent = secView
          ? `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr} 🕑 ${h12}:${min}:${sec} ${ampm}`
          : `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr} 🕑 ${h12}:${min} ${ampm}`;
      }
    };
	   const showCalendarInfo = GM_getValue('calendarInfo', false);
    if (!showCalendarInfo) {
      clockInfo.classList.add('hidden');
    }
    const startAnalogClock = () => {
      stopAnalogClock();
      analogClockRunning = true;
      displayedSecondDeg = 0;
      const smooth = GM_getValue('smoothSecondHand', true);
      if (smooth) {
        const tick = () => {
          if (!analogClockRunning) return;
          updateAnalogClock();
          analogAnimationId = requestAnimationFrame(tick);
        };
        tick();
      } else {
        updateAnalogClock();
        analogIntervalId = setInterval(updateAnalogClock, _SECOND);
      }
    };
	   startAnalogClock();
  };

  const toggleAnalogClock = () => {
    const clock = GM_getValue('analogClock', true);
    const cont = $id('analogClockContainer');
    if (clock) {
      stopAnalogClock();
      GM_setValue('analogClock', false);
      cont.remove();
    } else {
      GM_setValue('analogClock', true);
      applyAnalogClock();
    }
    const btn = $id('analogClockBtn');
    btn.replaceChildren(
      $el('img', {
        src: _Icon.clock26,
        alt: 'Clock'
      }),
      GM_getValue('analogClock', true) ? _Text.hideText : _Text.showText
    );
  };

  // ===========================================================================
  // DATE / Digital TIME
  // ===========================================================================

  const applyDateTime = () => {
    const dtContainer = $el('div', {
      id: 'dateTimeContainer'
    });
    const imageCalendar = $el('img', {
      id: 'imageCalendar',
      src: _Icon.calendar32D
    });
    const digCalBtn = $el('button', {
      id: 'digCalBtn',
      src: _Icon.calendar32D,
      title: _Title.digCalBtnTitle,
      onclick: dateTimeToggle},
      imageCalendar
    );
    const dateTimeEl = $el('span', {
      id: 'dateTime',
      title: _Title.dateTimeElTitle,
      onclick: dateTimeToggleSeconds
    });
    dtContainer.append(digCalBtn, dateTimeEl);
    body.prepend(dtContainer);
    dtContainer.style.position = 'fixed';
    dtContainer.style.top = '590px';
    dtContainer.style.left = '50%';
    dtContainer.style.transform = 'translateX(-50%)';
    makeDraggable(dtContainer, 'dtContainer');
    restorePosition(dtContainer, 'dtContainer');
 };

  const updateDigitalClock = () => {
    const digitalClock = $id('dateTime');
    if (!digitalClock) {
      clearInterval(_interval);
      _interval = null;
      return;
    }
    const now = new Date();
    const dayFull = DAY_FULL[now.getDay()];
    const monthFull = MONTH_FULL[now.getMonth()];
    const dt = now.getDate();
    const yr = now.getFullYear();
    const suffix = ['th','st','nd','rd']
      [(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th';
    const h12 = String(now.getHours() % 12 || 12);
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const ampm = now.getHours() < 12 ? 'AM' : 'PM';
    const secView = GM_getValue('secondsView', false);
    digitalClock.textContent = secView
      ? `${dayFull} ⇒ ${monthFull} ${dt}${suffix}, ${yr} 🕑 ${h12}:${min}:${sec} ${ampm}`
      : `${dayFull} ⇒ ${monthFull} ${dt}${suffix}, ${yr} 🕑 ${h12}:${min} ${ampm}`;
  };

  const startDigitalClock = () => {
    clearInterval(_interval);
    _interval = null;
    const digitalClock = $id('dateTime');
    const dtPref = GM_getValue('dateTimeView', false);
    if (!dtPref || digitalClock.hidden) {
      digitalClock.hidden = !dtPref;
      return;
    }
    const delay = GM_getValue('secondsView', false) ? _SECOND : _SECONDS;
    _interval = setInterval(updateDigitalClock, delay);
    updateDigitalClock();
  };

  const dateTimeToggle = (e) => {
    if (e.button !== 0) return;
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      const dtEl = $id('dateTime');
      dtEl.hidden = !dtEl.hidden;
      GM_setValue('dateTimeView', !dtEl.hidden);
      if (dtEl.hidden) {
        clearInterval(_interval);
        _interval = null;
      } else {
        startDigitalClock();
    } }
  };

  const dateTimeToggleSeconds = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const enabled = !GM_getValue('secondsView', false);
    GM_setValue('secondsView', enabled);
    startDigitalClock();
  };

  // ===========================================================================
  // CONTROL CONTAINER
  // ===========================================================================

  const applyControlContainer = () => {
    const controlContainer = $el('div', {
      id: 'controlContainer'
    });
    const buttonThemer = $el('button', {
      id: 'buttonThemer',
      textContent: _Text.buttonThemerText,
      title: _Title.buttonThemerTitle,
      onclick: wallpaperButtonChanger
    });
    const inputThemer = $el('input', {
      id: 'inputThemer',
      type: 'number',
      value: GM_getValue('wallpaperImage', 0),
      title: _Title.inputThemerTitle,
      oninput: wallpaperInputChanger
    });
    const downThemer = $el('button', {
      id: 'downThemer',
      textContent: _Text.downThemerText,
      title: _Title.downThemerTitle,
      onclick: wallpaperButtonChanger
    });
    const buttonLogo = $el('button', {
      id: 'buttonLogo',
      textContent: _Text.buttonLogoText,
      title: _Title.buttonLogoTitle,
      onclick: e => logoClick(e.target.id)
    });
    const inputLogo = $el('input', {
      id: 'inputLogo',
      type: 'number',
      value: GM_getValue('logoImageNum', 1),
      title: _Title.inputLogoTitle,
      oninput: handleLogoInput
    });
    const downLogo = $el('button', {
      id: 'downLogo',
      textContent: _Text.downLogoText,
      title: _Title.downLogoTitle,
      onclick: e => logoClick(e.target.id)
    });
    const spacer1 = $el('span', {
      id: 'spacer1',
      class: 'spacerX',
      textContent: _Text.spacerXText
    });
    const spacer2 = $el('span', {
      id: 'spacer2',
      class: 'spacerX',
      textContent: _Text.spacerXText
    });
    const analogClockBtn = $el('button', {
      id: 'analogClockBtn',
      title: _Title.analogClockBtnTitle,
      onclick: toggleAnalogClock},
      $el('img', {
        src: _Icon.clock26,
        alt: 'Clock'
      }), ' Show'
    );
    controlContainer.append(
      buttonThemer,
      inputThemer,
      downThemer,
      spacer1,
      buttonLogo,
      inputLogo,
      downLogo,
      spacer2,
      analogClockBtn
    );
    body.prepend(controlContainer);
    controlContainer.style.position = 'fixed';
    controlContainer.style.top = '516px';
    controlContainer.style.left = '50%';
    controlContainer.style.transform = 'translateX(-50%)';
    makeDraggable(controlContainer, 'controlContainer');
    restorePosition(controlContainer, 'controlContainer');
  };

  // ===========================================================================
  // INITIALIZE
  // ===========================================================================

  const init = () => {
    if (!body) return;
    body.id = _Text.bodyIdText;
    const textArea = $id('APjFqb');
    if (textArea) textArea.placeholder = _Text.placeholderText;
    applyWallpaper(GM_getValue('wallpaperImage', 0));
    applyLogo(GM_getValue('logoImageNum', 1));
    applyControlContainer();
    applyDateTime();
    startDigitalClock();
    const showClock = GM_getValue('analogClock', true);
    const clock = $id('analogClockContainer');
    if (showClock) {
      requestAnimationFrame(() => applyAnalogClock());
    } else {
      clock?.remove();
    }
    const btn = $id('analogClockBtn');
    btn.replaceChildren($el('img', {src: _Icon.clock26, alt: 'Clock'}),
      GM_getValue('analogClock', true) ? _Text.hideText : _Text.showText
    );
  };

  // ===========================================================================
  // EVENT LISTENERS
  // ===========================================================================

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && GM_getValue('analogClock', true)) {
      if (!$id('analogClockContainer')) {
        applyAnalogClock();
    } }
  });

  window.addEventListener('pageshow', () => {
    if (GM_getValue('analogClock', true) && !$id('analogClockContainer')) {
      applyAnalogClock();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===========================================================================
  // CSS
  // ===========================================================================

  GM_addStyle(`
    #gWP1 > div.L3eUgb > div.o3j99.n1xJcf.CoM3Df > a.w5hRs,
    #gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f > div:nth-child(2) > a,
    #gWP1 #gb > div.gb_Ad.gb_6.gb_L,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.AghGtd,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.ssOUyb,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > a,
    #gWP1 > div.L3eUgb div.RNNXgb div.fzj3ad,
    #gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(3),
    #gWP1 #EUjKDc,
    #gWP1 #gbqfbb,
    #gWP1 #LS8OJ > div.k1zIA.kKvsb > div.IzOpfd,
    #gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(2){
      display: none !important;
    }
    #gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f {
      padding-right: 0px !important;
    }
    #gWP1 header a {
      color: #FFF !important;
      text-decoration: none !important;
    }
    #gWP1 header a > svg {
      fill: #FFF !important;
    }
    #gWP1 > div.L3eUgb > div:nth-child(13) > div {
      background: transparent !important;
    }
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe {
      background: transparent !important;
      float: right !important;
    }
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > span > span > g-popup > div.CcNe6e > div {
      background: #2A3A4B !important;
      border-radius: 6px !important;
      padding: 8px 16px !important;
    }
    #gWP1 #LS8OJ > div.k1zIA.rSk4se > svg {
      fill: #FFF !important;
    }
    #gWP1 > div.L3eUgb div.RNNXgb,
    #gWP1 > div.L3eUgb input.gNO89b {
      background: rgba(0,0,0,.2) !important;
    }
    #gWP1 #APjFqb {
      filter: brightness(2) !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    #gWP1 > div.L3eUgb div.RNNXgb > div.SDkEP > div.fM33ce.dRYYxd > div.ywK6Rd {
      background: none !important;
    }
    #gWP1 #gb > div.gb_z > div:nth-child(2) {
      height: calc(-70px + 100vh) !important;
    }
  `);
  GM_addStyle(`
    #logoGoogle {
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
      height: auto;
      left: 50%;
      max-width: 100%;
      opacity: 1;
      position: absolute;
      top: 0px;
      z-index: 999;
    }
    #dateTimeContainer {
      align-items: center;
      border-radius: 8px;
      box-sizing: border-box;
      display: inline-flex;
      font: 18px monospace;
      max-height: 32px;
      min-width: 32px;
      padding: 0px 8px;
      pointer-events: auto;
      user-select: none;
      z-index: 4;
    }
    #dateTimeContainer.dragged {
      transform: none;
    }
    #dateTimeContainer > * {
      pointer-events: auto;
    }
    #digCalBtn {
      border-radius: 8px;
      cursor: pointer;
      height: 33px;
      margin: 0px;
      width: 32px;
    }
    #imageCalendar {
      border-radius: 8px;
    }
    #imageCalendar:hover + #dateTime {
    }
    #dateTime {
      background: #34495e;
      border: 1px solid transparent;
      border-radius: 8px;
      box-shadow: none;
      color: #FFF;
      cursor: pointer;
      display: block;
      margin: 0px 0px 0px 2px;
      max-height: 32px;
      min-width: 0px;
      padding: 3px 10px;
      text-shadow: 1px 1px 2px #000;
      user-select: none;;
    }
    #dateTime[hidden] {
      background: none;
      border: none;
      display: none;
      padding: 0px;
      width: 0px;
    }
    #dateTime:hover {
    }
    #controlContainer {
      align-items: center;
      background: #2A3A4B;
      border: none;
      border-radius: 8px;
      height: 32px;
      min-width: 380px;
      padding: 0px 10px;
      box-sizing: border-box;
      pointer-events: auto;
      text-shadow: 1px 1px 2px #000;
      user-select: none;
      z-index: 2;
    }
    #controlContainer.dragged {
      transform: none;
    }
    #controlContainer > * {
      pointer-events: auto;
    }
    #buttonThemer {
      color: #FFF;
      cursor: pointer;
      opacity: .7;
      text-shadow: 1px 1px 2px #000;
    }
    #inputThemer {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(2555, 255, 255, 0.15);
      color: #FFF;
      cursor: pointer;
      height: 22px;
      margin: 0px 4px;
      opacity: .7;
      padding: 4px 0px;
      position: relative;
      text-align: center;
      top: 0px;
      width: 30px;
    }
    #downThemer {
      color: #FFF;
      cursor: pointer;
      opacity: .7;
      text-shadow: 1px 1px 2px #000;
    }
    #spacer1,
    #spacer2 {
      color: #FFF;
      filter: brightness(2);
      margin: 9px 16px 0px 16px;
      opacity: 1;
      pointer-events: none;
      text-align: center;
    }
    .spacerX {
      text-shadow: 1px 1px 2px #000;
    }
    #buttonLogo {
      color: #FFF;
      cursor: pointer;
      opacity: .7;
      text-shadow: 1px 1px 2px #000;
    }
    #inputLogo {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(255,255,255,0.15);
      color: #FFF;
      cursor: pointer;
      height: 22px;
      margin: 0px 4px;
      opacity: .7;
      padding: 4px 0px;
      position: relative;
      text-align: center;
      top: 0px;
      width: 30px;
    }
    #downLogo {
      color: #FFF;
      cursor: pointer;
      opacity: .7;
      text-shadow: 1px 1px 2px #000;
    }
    #controlContainer > button,
    #controlContainer > input {
      font-family: monospace;
      font-size: 18px;
    }
    #analogClockBtn {
      color: #fff;
      opacity: .7;
    }
    #analogClockBtn > img {
      height: 22px;
      position: relative;
      top: 5px;
      width: 22px;
    }
    #analogClockBtn:not(img):hover {
      color: orange;
      opacity: 1;
    }
    #controlContainer > button:not(#analogClockBtn):hover {
      filter: brightness(2);
      opacity: 1;
    }
    #inputThemer:hover,
    #inputThemer:focus-within,
    #inputLogo:hover,
    #inputLogo:focus-within {
      border-color: #999;
      filter: brightness(2);
      opacity: 1;
    }
    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
      display: none;
    }
    .ClockContainer {
      align-items: center;
      display: flex;
      flex-direction: column;
      font-family: system-ui, Arial, sans-serif;
      left: 50px;
      position: absolute;
      top: 100px;
      user-select: none;
      z-index: 3;
    }
    .Analog-Bigclock {
      align-self: center;
      cursor: move;
      flex-shrink: 0;
      height: var(--clock-size);
      margin: 0 auto;
      width: var(--clock-size);
    }
    .Analog {
      background: radial-gradient(circle at 50% 50%, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #fff;
      border-radius: 50%;
      box-shadow: inset 0 0 25px rgba(0,0,0,0.08), 0 15px 35px rgba(0,0,0,0.25);
      height: 100%;
      width: 100%;
    }
    .Analog-Second-Hand,
    .Analog-Minute-Hand,
    .Analog-Hour-Hand {
      stroke-linecap: round;
      transform-origin: 50% 50%;
    }
    .Analog-Second-Hand {
      transform: rotate(var(--secondDeg, 0deg));
    }
    .Analog-Minute-Hand {
      transform: rotate(var(--minuteDeg, 0deg));
    }
    .Analog-Hour-Hand {
      transform: rotate(var(--hourDeg, 0deg));
    }
    .Analog-Second-Hand {
      fill: #e74c3c;
      stroke: #e74c3c;
      stroke-width: 1;
    }
    .Analog-Minute-Hand {
      fill: #34495e;
      stroke: #34495e;
      stroke-width: 2;
    }
    .Analog-Hour-Hand {
      fill: #2c3e50;
      stroke: #2c3e50;
      stroke-width: 3;
    }
    .Analog-Number {
      fill: #2c3e50;
      font-family: system-ui, Arial, sans-serif;
      font-size: 6.8px;
      font-weight: 700;
      paint-order: stroke fill;
      stroke: none;
    }
    .Analog-CenterCutout {
      fill: #2c3e50;
      stroke: white;
      stroke-width: 3;
    }
    .Analog-Bigclock.dark .Analog {
      background: radial-gradient(circle at 50% 50%, #2c3e50 0%, #1a252f 100%);
      border-color: #ecf0f1;
    }
    .Analog-Bigclock.dark .Analog-Second-Hand {
      fill: #ff6b6b;
      stroke: #ff6b6b;
    }
    .Analog-Bigclock.dark .Analog-Minute-Hand,
    .Analog-Bigclock.dark .Analog-Hour-Hand {
      fill: #ecf0f1;
      stroke: #ecf0f1;
    }
    .Analog-Bigclock.dark .Analog-Number {
      fill: #fff;
    }
    .Analog-Bigclock.dark .Analog-CenterCutout {
      fill: #ecf0f1;
      stroke: #2c3e50;
    }
    .Analog-AMPMText {
      fill: #2A3A4B;
      font-size: 7px;
      font-weight: 300;
    }
    .Analog-Bigclock.dark .Analog-AMPMText {
      fill: #fff;
    }
    .Analog-AMPMBorder {
      fill: none;
      stroke: #2A3A4B;
      stroke-width: 0.25;
    }
    .Analog-Bigclock.dark .Analog-AMPMBorder {
      fill: none;
      stroke: #2A3A4B;
      stroke-width: 0.25;
    }
    .ControlsRow * {
      text-shadow: 1px 1px 2px #000;
    }
    .scaler-controls {
      align-items: center;
      background: #2A3A4B;
      border: none;
      border-radius: 8px;
      cursor: default;
      display: flex;
      gap: 15px;
      height: 32px;
      justify-content: center;
      margin-top: 4px;
      padding: 0px 0px 1px 0px;
      width: 384px;
    }
    .ClockThemeToggle,
    .ClockSecondToggle,
    .scaler-info,
    .am-pm {
      border: none;
      cursor: pointer;
      margin: 0px;
      padding: 0px;
      position: relative;
      top: 3px;
      width: 32px;
    }
    .ClockThemeToggle {
    }
    .scaler-info {
    }
    .scaler-reset {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      margin: 0px;
      padding: 0;
      position: relative;
      top: 1px;
    }
    .scaler-btn {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      opacity: .7;
      padding: 0px 4px;
    }
    .scaler-btn:hover {
      opacity: 1;
    }
    .scaler-text {
      background: rgba(255,255,255,.1);
      border: 1px solid #666;
      border-radius: 14px;
      color: #5294e2;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin-top: 0px;
      min-width: 32px;
      padding: 2px 2px 0px 0px;
    }
    .ClockThemeToggle,
    .ClockSecondToggle,
    .scaler-info,
    .am-pm,
    .scaler-reset {
      color: #ffffff;
      opacity: .7;
    }
    .ClockThemeToggle:hover,
    .ClockSecondToggle:hover,
    .scaler-info:hover,
    .am-pm:hover,
    .scaler-reset:hover {
      cursor: pointer;
      opacity: 1;
    }
    #spacer3 {
      color: #666;
      margin: 0px 6px 0px 0px;
      opacity: 1;
      pointer-events: none;
      text-align: center;
    }
    .Analog-Info {
      align-items: center;
      background: #2A3A4B;
      border-radius: 0px 0px 8px 8px;
      cursor: default;
      display: inline-flex;
      justify-content: center;
      margin-top: -6px;
      padding: 6px 0px 2px 0px;
	     text-align: center;
      width: 384px;
    }
    .Analog-Info * {
      text-shadow: 1px 1px 2px #000;
    }
    .Analog-CalendarText {
      display: inline-block;
      color: #fff;
      font-family: monospace;
      font-size: 16px;
      white-space: nowrap;
    }
    .ClockThemeToggle:hover,
    .scaler-reset:hover,
    .scaler-info:hover {
      color: #ffffff;
    }
    .scaler-text:hover,
    .scaler-text:focus-within {
      border-color: #ffffff;
      color: #ffffff;
    }
    .scaler-text::-webkit-inner-spin-button,
    .scaler-text::-webkit-outer-spin-button,
    .hidden {
      display: none;
    }
  `);
})();
