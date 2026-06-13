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

(() => {
  'use strict';
  // ============ Helpers ============
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
      if (child == null) return;
      el.appendChild(
        child instanceof Node
          ? child
          : document.createTextNode(child)
      );
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
    refEl.parentNode.insertBefore(newEl, refEl.nextSibling);
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
      newLeft = Math.max(
        0,
        Math.min(
          newLeft,
          window.innerWidth - elmnt.offsetWidth
        )
      );
      newTop = Math.max(
        0,
        Math.min(
          newTop,
          window.innerHeight - elmnt.offsetHeight
        )
      );
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

  const prepend = (parent, child) => {
    parent.insertBefore(child, parent.firstChild);
    return child;
  };

  const removeDupes = (className) => {
    document.querySelectorAll('.' + className).forEach((el, i) => {
      if (i > 0) {
        el.remove();
      }
    });
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

  // ==================== ORIGINAL CODE ====================
  const DAY_ABBR = ['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'];
  const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTH_ABBR = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
  const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const _aURL = 'https://raw.githubusercontent.com/Razzano/My_Images/master/';
  const _githubSite = 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image';
  const _dateTimeFormatCount = 4;
  const _timerLong = 10000;
  const _timerShort = 1000;
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
    calendar: _aURL + 'imageCalendar.png',
    clock26: _aURL + 'clock26.png',
  };

  const _Logo = [null];
  for (let i = 1; i <= 16; i++) {
    _Logo.push($el('img', {id: 'logoGoogle', class: 'logo', src: _Image[`logo${i}`]}));
  };

  // ============ Global variables ============
  let _clockInterval = null;
  let _currentWallpaperStyle = null;

  // ============ Tooltip ============
  const updateCalendarTooltip = () => {
    const cal = $id('imageCalendar');
    if (cal) cal.title = getTooltipText();
  };

  const getTooltipText = () => {
    const target = GM_getValue('linkTarget', '_blank'),
          mode = target === '_blank' ? 'New Tab ( target = "_blank" )' : 'Active Tab ( target = "_self" )';
    return `Tooltip Controls:
       • Left-click → Toggle Date/Time Container
       • Shift + Left-click → Open in New Tab ( target = "_blank" )
       • Ctrl + Left-click → Open in Active Tab ( target = "_self" )
       Current Target:
              • ${mode}`;
  };

  // ============ Logos ============
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
      15: { marginTop: '25px', transform: 'translateX(-50%)' }
    };
    const config = logoConfig[num] || { marginTop: '40px', transform: 'translateX(-50%)' };
    GM_addStyle(`
      img[alt="Google"],
      #hplogo,
      #logo,
      .k1zIA img,
      #gWP1 #LS8OJ img,
      #gWP1 #LS8OJ .k1zIA {
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
        top: ${config.marginTop} !important;
        transform: ${config.transform} !important;
      `;
      const dtContainer = $id('dateTimeContainer');
      if (dtContainer) {
        dtContainer.after(logoCopy);
        requestAnimationFrame(() => {
          logoCopy.style.opacity = '1';
        });
      }
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
    let current = GM_getValue('logoImageNum', 1),
        next = (id.includes('up') || id === 'buttonLogo') ? (current + 1) % 18 : (current - 1 + 18) % 18; // 2 ← Change 18 to 19
    applyLogo(next);
  };

  const handleLogoInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(18, val)); // 3 ← Change 18 to 19
    applyLogo(val);
  };

  // ============ Wallpaper ============
  const applyWallpaper = (num) => {
    if (_currentWallpaperStyle) {
      _currentWallpaperStyle.remove();
      _currentWallpaperStyle = null;
    }
    num = parseInt(num) || 0;
    if (num === 0) return;
    const css = `
      body#gWP1 {
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

  // ============ Date Time ============
  const getDateTime = (format = 1) => {
    const now = new Date();
    const dy = now.getDay(), dt = now.getDate(), mth = now.getMonth(), yr = now.getFullYear();
    const dayAbbr = DAY_ABBR[dy];
    const dayFull = DAY_FULL[dy];
    const monthAbbr = MONTH_ABBR[mth];
    const monthFull = MONTH_FULL[mth];
    const mPadded = (mth + 1) < 10 ? '0' + (mth + 1) : (mth + 1),
          suffix = ['th', 'st', 'nd', 'rd'][(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th',
          ordinal = dt + suffix;
    const hr = now.getHours(), min = now.getMinutes(), sec = now.getSeconds(),
          hr12 = hr % 12 || 12,
          hr24 = hr,
          minStr = min < 10 ? ':0' + min : ':' + min,
          secStr = GM_getValue('defaultSecondsView', false) ? (sec < 10 ? ':0' + sec : ':' + sec) : '',
          ampm = GM_getValue('defaultAMPM', true) ? (hr < 12 ? 'AM' : 'PM') : '';
    switch(format){
      case 1: return `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 2: return `${dayAbbr} • ${monthAbbr} ${dt}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 3: return `${dayAbbr} • ${mPadded}/${dt < 10 ? '0'+dt : dt}/${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 4: return `${dayFull}, ${monthAbbr} ${dt}, ${yr} ⏰ ${hr24}${minStr}${secStr} ${ampm}`;
      default: return `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
    }
  };

  const dateTimeToggle = (e) => {
    if (e.button !== 0) return;
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      const dtEl = $id('dateTime');
      dtEl.hidden = !dtEl.hidden;
      GM_setValue('dateTimeView', !dtEl.hidden);
      if (!dtEl.hidden) {
        dtEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
        startClock();
      } else {
        clearInterval(_clockInterval);
        _clockInterval = null;
      }
      return;
    }
    if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      GM_setValue('linkTarget', '_blank');
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      GM_setValue('linkTarget', '_self');
    }
    searchLinksWhere();
    if (typeof updateCalendarTooltip === 'function') {
      updateCalendarTooltip();
    }
  };

  const dateTimeToggleSecondsAmPm = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      GM_setValue('defaultSecondsView', !GM_getValue('defaultSecondsView', false));
      startClock();
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      GM_setValue('defaultAMPM', !GM_getValue('defaultAMPM', true));
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      let fmt = GM_getValue('dateFormat', 1);
      fmt = (fmt >= _dateTimeFormatCount) ? 1 : fmt + 1;
      GM_setValue('dateFormat', fmt);
    }
    const el = $id('dateTime');
    if (el) {
      el.textContent = getDateTime(GM_getValue('dateFormat', 1));
  } }
  const startClock = () => {
    if (_clockInterval) {
      clearInterval(_clockInterval);
    }
    const ms = GM_getValue('defaultSecondsView', false) ? _timerShort : _timerLong;
    _clockInterval = setInterval(() => {
      const el = $id('dateTime');
      if (el) {
        el.textContent = getDateTime(GM_getValue('dateFormat', 1));
      }
    }, ms);
  };

  // ============ Link Targets ============
  const searchLinksWhere = () => {
    const mode = GM_getValue('linkTarget', '_blank');
    document.querySelectorAll('a[href]').forEach(link => {
      if (!link.href?.startsWith('http')) return;
      if (link.getAttribute('href').startsWith('#')) return;
      const url = new URL(link.href, location.href);
      const isExternal = !url.hostname.includes('google');
      if (isExternal || mode === '_blank') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else {
        link.target = '_self';
        link.rel = '';
      }
    });
  };

  // ============ Analog Clock ============
  const getClock = () => {
    if (!GM_getValue('analogClock', true)) return;
    const ticks = [];
    const hourNumbers = [];
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
        x: (50 + radius * Math.cos(rad)).toFixed(3),
        y: (48 + radius * Math.sin(rad) + 2.8).toFixed(3),
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
      y: 74,
      width: 12,
      height: 7,
      rx: 2,
      ry: 2
    });
    const ampmText = $el('text', {
      className: 'Analog-AMPMText',
      x: 45,
      y: 80,
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
    const BASE_SIZE = 314;
    let currentPercent = 100;
    const percentageDisplay = $el('input', {
      className: 'scaler-text',
      type: 'number',
      value: '100',
      min: '30',
      max: '200',
      step: '1',
      title: 'Manually Enter Percentage:\n • Min. 30% = 90px Ø\n • Reset 100% = 300px Ø\n • Max. 200% = 600px Ø',
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
	   const clockInfo = $el( 'div', {
	     className: 'Analog-Info' },
      calendarText
    );
    const themeBtn = $el('button', {
      className: 'ClockThemeToggle',
      title: 'Light/Dark Analog Clock Theme'
    });
    const setTheme = (dark) => {
      Clock.classList.toggle('dark', dark);
      themeBtn.textContent = dark ? '🌞 Light' : '🌙 Dark';
      GM_setValue('clockDarkTheme', dark);
    };
    setTheme(GM_getValue('clockDarkTheme', true));
    themeBtn.onclick = () => {
      setTheme(!Clock.classList.contains('dark'));
    };
    const scalerControls = $el('div', { className: 'scaler-controls' },
      themeBtn,
      $el('button', {
        className: 'scaler-reset',
        textContent: 'Reset',
        title: 'Reset To 100%',
        onclick: () => setClockPercentage(100)
      }),
      $el('button', {
        className: 'scaler-btn',
        textContent: '─',
        title: 'Scale Down In 5% Increments',
        onclick: () => setClockPercentage(currentPercent - 5)
      }),
      percentageDisplay,
      $el('button', {
        className: 'scaler-btn',
        textContent: '+',
        title: 'Scale Up In 5% Increments',
        onclick: () => setClockPercentage(currentPercent + 5)
      }),
      $el('button', {
      className: 'scaler-info',
      textContent: '📅 Date',
      title: 'Show/Hide Date Info',
      onclick() {
        clockInfo.classList.toggle('hidden');
        GM_setValue('calendarInfo', !clockInfo.classList.contains('hidden'));
      }})
    );
    const savedPercent = GM_getValue('clockSizePercent', 100);
    setClockPercentage(savedPercent);
	   const controlsRow = $el(
      'div',
      { className: 'ControlsRow' },
      scalerControls
    );
    const container = $el(
      'div',
      { id: 'analogClockContainer', className: 'ClockContainer' },
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
    document.body.appendChild(container);
    let displayedSecondDeg = 0;
    const updateClock = () => {
      const now = new Date();
      const dy = now.getDay(), dt = now.getDate(), mth = now.getMonth(), yr = now.getFullYear();
      const dayAbbr = DAY_ABBR[dy], dayFull = DAY_FULL[dy], monthAbbr = MONTH_ABBR[mth], monthFull = MONTH_FULL[mth];
      const suffix = ['th', 'st', 'nd', 'rd'][(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th';
      const ordinal = dt + suffix;
      const h12 = String(now.getHours() % 12 || 12);
      const min = String(now.getMinutes()).padStart(2, '0');
      const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
      const secondDeg = seconds * 6;
      let targetDeg = secondDeg;
      if (targetDeg < displayedSecondDeg - 180) targetDeg += 360;
      displayedSecondDeg = targetDeg;
      const minuteDeg = now.getMinutes() * 6 + seconds * 0.1;
      const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + seconds * (0.5 / 60);
      Clock.style.setProperty('--secondDeg', `${displayedSecondDeg}deg`);
      Clock.style.setProperty('--minuteDeg', `${minuteDeg}deg`);
      Clock.style.setProperty('--hourDeg', `${hourDeg}deg`);
      ampmText.textContent = now.getHours() < 12 ? 'AM' : 'PM';
      calendarText.textContent = `${dayFull} ⇒ ${monthFull} ${ordinal}, ${yr}\u3000${h12}:${min}`;
    };
    const showCalendarInfo = GM_getValue('calendarInfo', false);
    if (!showCalendarInfo) {
      clockInfo.classList.add('hidden')
    }
    const tick = () => {
      updateClock();
      requestAnimationFrame(tick);
    };
    tick();
    updateClock();
  };

  const toggleAnalogClock = () => {
    const clock = GM_getValue('analogClock', true);
    const cont = $id('analogClockContainer');
    if (clock) {
      GM_setValue('analogClock', false);
      cont.remove();
    } else {
      GM_setValue('analogClock', true);
      getClock();
    }
    const btn = $id('analogClockBtn');
    btn.replaceChildren(
      $el('img', {
        src: _Image.clock26,
        alt: 'Clock'
      }),
      GM_getValue('analogClock', true) ? ' Hide' : ' Show'
    );
  };

  // ============ Initialize ============
  const init = () => {
    document.removeEventListener('DOMContentLoaded', init);
    const body = document.body;
    if (!body) return;
    body.id = 'gWP1';
    const textArea = $id('APjFqb');
    const dtContainer = $el('div', { id: 'dateTimeContainer' });
    const imageCalendar = $el('img', {
      id: 'imageCalendar',
      src: _Image.calendar,
      title: getTooltipText(),
      onclick: dateTimeToggle
    });
    const dateTimeEl = $el('span', {
      id: 'dateTime',
      title: '• Left-click: toggle seconds\n• Shift+Left: toggle AM/PM\n• Ctrl+Left: cycle date format (1-4)',
      onclick: dateTimeToggleSecondsAmPm
    });
    dtContainer.append(imageCalendar, dateTimeEl);
    const changerContainer = $el('div', { id: 'changerContainer' });
    const buttonThemer = $el('button', {id: 'buttonThemer', textContent: 'Wallpaper 🠉', title: 'Left-click to change wallpaper', onclick: wallpaperButtonChanger});
    const inputThemer = $el('input', {id: 'inputThemer', type: 'number', value: GM_getValue('wallpaperImage', 0), title: 'Manually Enter:\n • 1 - 52 (0 = Default Google Background)', oninput: wallpaperInputChanger});
    const downThemer = $el('button', {id: 'downThemer', textContent: '🠋 Wallpaper', title: 'Left-click to change wallpaper', onclick: wallpaperButtonChanger});
    const spacer = $el('span', {class: 'spacerX', textContent: '|'});
    const buttonLogo = $el('button', {id: 'buttonLogo', textContent: 'Logo 🠉', title: 'Left-click to change logos', onclick: e => logoClick(e.target.id)});
    const inputLogo = $el('input', {id: 'inputLogo', type: 'number', value: GM_getValue('logoImageNum', 1), title: 'Manually Enter:\n • 1 - 17 (0 = Default Google Logo, 17 = No Logo)', oninput: handleLogoInput});
    const downLogo = $el('button', {id: 'downLogo', textContent: '🠋 Logo', title: 'Left-click to change logos', onclick: e => logoClick(e.target.id)});
    const spacer2 = $el('span', {class: 'spacerX', textContent: '|'});
    const analogClockBtn = $el('button', {id: 'analogClockBtn', title: 'Analog Clock', onclick: toggleAnalogClock}, $el('img', {src: _Image.clock26, alt: 'Clock'}), ' Show');
    changerContainer.append(buttonThemer, inputThemer, downThemer, spacer, buttonLogo, inputLogo, downLogo, spacer2, analogClockBtn);
    body.appendChild(dtContainer);
    body.appendChild(changerContainer);
    dtContainer.style.position = 'fixed';
    dtContainer.style.top = '590px';
    dtContainer.style.left = '50%';
    dtContainer.style.transform = 'translateX(-50%)';
    changerContainer.style.position = 'fixed';
    changerContainer.style.top = '516px';
    changerContainer.style.left = '50%';
    changerContainer.style.transform = 'translateX(-50%)';
    makeDraggable(dtContainer, 'dtContainer');
    makeDraggable(changerContainer, 'changerContainer');
    restorePosition(dtContainer, 'dtContainer');
    restorePosition(changerContainer, 'changerContainer');
    applyWallpaper(GM_getValue('wallpaperImage', 0));
    applyLogo(GM_getValue('logoImageNum', 1));
    if (textArea) textArea.placeholder = 'Search Look-up';
    if (imageCalendar) {
      imageCalendar.addEventListener('click', dateTimeToggle, false);
    }
    const dtEl = $id('dateTime');
    const dtPref = GM_getValue('dateTimeView', false);
    if (dtPref) {
      dtEl.hidden = false;
      dtEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
      startClock();
    } else {
      dtEl.hidden = true;
      clearInterval(_clockInterval);
      _clockInterval = null;
    }
    searchLinksWhere();
    const showClock = GM_getValue('analogClock', true);
    const clock = $id('analogClockContainer');
    if (showClock) {
      requestAnimationFrame(() => getClock());
    } else {
      clock?.remove();
    }
    const btn = $id('analogClockBtn');
    btn.replaceChildren($el('img', {src: _Image.clock26, alt: 'Clock'}),
      GM_getValue('analogClock', true) ? ' Hide' : ' Show'
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && GM_getValue('analogClock', true)) {
      if (!$id('analogClockContainer')) {
        getClock();
    } }
  });

  window.addEventListener('pageshow', () => {
    if (GM_getValue('analogClock', true) && !$id('analogClockContainer')) {
      getClock();
    }
  });

  // ============ CSS ============
  GM_addStyle(`
    body#gWP1 > div.L3eUgb > div.o3j99.n1xJcf.CoM3Df > a.w5hRs,
    body#gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f > div:nth-child(2) > a,
    body#gWP1 #gb > div.gb_Ad.gb_6.gb_L,
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.AghGtd,
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.ssOUyb,
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > a,
    body#gWP1 > div.L3eUgb div.RNNXgb div.fzj3ad,
    body#gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(3),
    body#gWP1 #EUjKDc,
    body#gWP1 #gbqfbb,
    body#gWP1 #LS8OJ > div.k1zIA.kKvsb > div.IzOpfd,
    body#gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(2){
      display: none !important;
    }
    body#gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f {
      padding-right: 0px !important;
    }
    body#gWP1 header a {
      color: #FFF !important;
      text-decoration: none !important;
    }
    body#gWP1 header a > svg {
      fill: #FFF !important;
    }
    body#gWP1 {
      background: url(${_githubSite}GM_getValue(wallpaperImage)}.jpg) no-repeat center center / cover fixed !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div {
      background: transparent !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe {
      background: transparent !important;
      float: right !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > span > span > g-popup > div.CcNe6e > div {
      background: rgba(0, 0, 0, .2) !important;
      border-radius: 6px !important;
      padding: 8px 16px !important;
    }
    body#gWP1 #LS8OJ > div.k1zIA.rSk4se > svg {
      fill: #FFF !important;
    }
    body#gWP1 > div.L3eUgb div.RNNXgb,
    body#gWP1 > div.L3eUgb input.gNO89b {
      background: rgba(0,0,0,.2) !important;
    }
    body#gWP1 #APjFqb {
      filter: brightness(2) !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    #gWP1 > div.L3eUgb div.RNNXgb > div.SDkEP > div.fM33ce.dRYYxd > div.ywK6Rd {
      background: none !important;
    }
    body#gWP1 #gb > div.gb_z > div:nth-child(2) {
      height: calc(-70px + 100vh) !important;
    }
    body#gWP1 #logoGoogle {
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) !important;
      height: auto !important;
      left: 50% !important;
      max-width: 100% !important;
      opacity: 1 !important;
      position: absolute !important;
      top: 0px !important;
      z-index: 999 !important;
    }
    body#gWP1 #dateTimeContainer {
      align-items: center !important;
      border-radius: 8px !important;
      box-sizing: border-box !important;
      display: inline-flex !important;
      font: 20px monospace !important;
      height: 32px !important;
      min-width: 32px !important;
      padding: 4px 16px !important;
      pointer-events: auto !important;
      user-select: none !important;
      z-index: 4 !important;
    }
    #dateTimeContainer.dragged {
      transform: none !important;
    }
    #dateTimeContainer > * {
      pointer-events: auto !important;
    }
    body#gWP1 #imageCalendar {
      cursor: pointer !important;
      margin: 0px !important;
    }
    body#gWP1 #imageCalendar:hover + #dateTime {
      background: #900 !important;
      border-color: #C00 !important;
      color: #FFF !important;
    }
    body#gWP1 #dateTime {
      background: rgba(0,0,0,.3) !important;
      border: 1px solid transparent !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      color: #FFF !important;
      cursor: pointer !important;
      display: block !important;
      height: 28px !important;
      margin: 0px 0px 0px 3px !important;
      min-width: 0px !important;
      padding: 1px 6px !important;
      user-select: none !important;;
    }
    body#gWP1 #dateTime[hidden] {
      background: none !important;
      border: none !important;
      display: none !important;
      padding: 0px !important;
      width: 0px !important;
    }
    body#gWP1 #dateTime:hover {
      border: 1px solid #000 !important;
    }
    body#gWP1 #changerContainer {
      align-items: center !important;
      background: rgba(0,0,0,0.35) !important;
      border: 2px solid #FFF !important;
      border-radius: 8px !important;
      height: 35px !important;
      min-width: 380px !important;
      padding: 0px 16px !important;
      box-sizing: border-box !important;
      pointer-events: auto !important;
      user-select: none !important;
      z-index: 2 !important;
    }
    body#gWP1 #changerContainer.dragged {
      transform: none !important;
    }
    body#gWP1 #changerContainer > * {
      pointer-events: auto !important;
    }
    body#gWP1 #buttonThemer {
      color: #FFF !important;
      cursor: pointer !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #inputThemer {
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(2555, 255, 255, 0.15) !important;
      color: #FFF !important;
      cursor: pointer !important;
      height: 22px !important;
      margin: 0px 4px !important;
      opacity: .7 !important;
      padding: 4px 0px !important;
      position: relative !important;
      text-align: center !important;
      top: 0px !important;
      width: 30px !important;
    }
    body#gWP1 #downThemer {
      color: #FFF !important;
      cursor: pointer !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 .spacerX {
      color: #FFF !important;
      filter: brightness(2) !important;
      margin: 9px 16px 0px 16px !important;
      opacity: 1 !important;
      pointer-events: none !important;
      text-align: center !important;
    }
    body#gWP1 #buttonLogo {
      color: #FFF !important;
      cursor: pointer !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #inputLogo {
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(255,255,255,0.15) !important;
      color: #FFF !important;
      cursor: pointer !important;
      height: 22px !important;
      margin: 0px 4px !important;
      opacity: .7 !important;
      padding: 4px 0px !important;
      position: relative !important;
      text-align: center !important;
      top: 0px !important;
      width: 30px !important;
    }
    body#gWP1 #downLogo {
      color: #FFF !important;
      cursor: pointer !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #changerContainer > button,
    body#gWP1 #changerContainer > input {
      font-family: monospace !important;
      font-size: 120% !important;
    }
    body#gWP1 #analogClockBtn {
      color: #fff;
      opacity: .7 !important;
    }
    body#gWP1 #analogClockBtn > img {
      height: 22px;
      position: relative;
      top: 6px;
      width: 22px;
    }
    body#gWP1 #analogClockBtn:not(img):hover {
      color: orange;
      opacity: 1 !important;
    }
    body#gWP1 #changerContainer > button:not(#analogClockBtn):hover {
      filter: brightness(2) !important;
      opacity: 1 !important;
    }
    body#gWP1 #inputThemer:hover,
    body#gWP1 #inputThemer:focus-within,
    body#gWP1 #inputLogo:hover,
    body#gWP1 #inputLogo:focus-within {
      border-color: #999 !important;
      filter: brightness(2) !important;
      opacity: 1 !important;
    }
    body#gWP1 ::-webkit-inner-spin-button,
    body#gWP1 ::-webkit-outer-spin-button,
    body#gWP1 ::-webkit-inner-spin-button,
    body#gWP1 ::-webkit-outer-spin-button {
      display: none !important;
    }
    body#gWP1 .ClockContainer {
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
    body#gWP1 .Analog-Bigclock {
      align-self: center;
      cursor: move;
      flex-shrink: 0;
      height: var(--clock-size);
      margin: 0 auto;
      width: var(--clock-size);
    }
    body#gWP1 .Analog {
      background: radial-gradient(circle at 50% 50%, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #fff !important;
      border-radius: 50% !important;
      box-shadow: inset 0 0 25px rgba(0,0,0,0.08), 0 15px 35px rgba(0,0,0,0.25);
      height: 100%;
      width: 100%;
    }
    body#gWP1 .Analog-Second-Hand,
    body#gWP1 .Analog-Minute-Hand,
    body#gWP1 .Analog-Hour-Hand {
      stroke-linecap: round;
      transform-origin: 50% 50%;
    }
    body#gWP1 .Analog-Second-Hand {
      transform: rotate(var(--secondDeg, 0deg));
    }
    body#gWP1 .Analog-Minute-Hand {
      transform: rotate(var(--minuteDeg, 0deg));
    }
    body#gWP1 .Analog-Hour-Hand {
      transform: rotate(var(--hourDeg, 0deg));
    }
    body#gWP1 .Analog-Second-Hand {
      fill: #e74c3c;
      stroke: #e74c3c;
      stroke-width: 1;
    }
    body#gWP1 .Analog-Minute-Hand {
      fill: #34495e;
      stroke: #34495e;
      stroke-width: 2;
    }
    body#gWP1 .Analog-Hour-Hand {
      fill: #2c3e50;
      stroke: #2c3e50;
      stroke-width: 3;
    }
    body#gWP1 .Analog-Number {
      fill: #2c3e50;
      font-family: system-ui, Arial, sans-serif;
      font-size: 6.8px;
      font-weight: 700;
      paint-order: stroke fill;
      stroke: none;
    }
    body#gWP1 .Analog-CenterCutout {
      fill: #2c3e50;
      stroke: white;
      stroke-width: 3;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog {
      background: radial-gradient(circle at 50% 50%, #2c3e50 0%, #1a252f 100%);
      border-color: #ecf0f1;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-Second-Hand {
      fill: #ff6b6b;
      stroke: #ff6b6b;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-Minute-Hand,
    body#gWP1 .Analog-Bigclock.dark .Analog-Hour-Hand {
      fill: #ecf0f1;
      stroke: #ecf0f1;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-Number {
      fill: #fff;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-CenterCutout {
      fill: #ecf0f1;
      stroke: #2c3e50;
    }
    body#gWP1 .Analog-AMPMText {
      fill: #0078d7;
      font-size: 7px;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-AMPMText {
      fill: #fff;
    }
    body#gWP1 .Analog-AMPMBorder {
      fill: none;
      stroke: #0078d7;
      stroke-width: 0.25;
    }
    body#gWP1 .Analog-Bigclock.dark .Analog-AMPMBorder {
      fill: none;
      stroke: #0078d7;
      stroke-width: 0.25;
    }
    body#gWP1 .ControlsRow {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
    }
    body#gWP1 .Analog-Info {
    align-items: center;
      background: #34495e;
      border-radius: 30px;
      display: inline-flex;
      gap: 12px;
      height: 35px;
      justify-content: center;
      margin: 1px auto 0px auto;
      padding: 0px 12px;
	     text-align: center;
      width: auto;
    }
    body#gWP1 .Analog-CalendarText {
      display: inline-block;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
    body#gWP1 .scaler-controls {
      align-items: center;
      background: #34495e;
      border-radius: 30px;
      display: flex;
      float: right;
      gap: 12px;
      height: 35px;
      justify-content: center;
      margin: 4px 0px 0px 0px;
      padding: 0px 4px;
      width: fit-content;
    }
    body#gWP1 .ClockThemeToggle,
    body#gWP1 .scaler-info {
      background: rgba(0, 0, 0, .4);
      border: none;
      border-radius: 18px;
      color: #7a8287;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      height: 29px;
      padding: 6px 6px 6px 4px;
      text-align: center;
      width: 68px;
    }
    body#gWP1 .scaler-reset {
      background: none;
      border: none;
      color: #7a8287;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin: 4px 4px 0px 4px;
      padding: 0;
    }
    body#gWP1 .scaler-btn {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0px 4px;
    }
    body#gWP1 .scaler-btn:hover {
      opacity: 0.8;
    }
    body#gWP1 .scaler-text {
      background: rgba(255,255,255,.1);
      border: 1px solid #666;
      border-radius: 14px;
      color: #5294e2;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin-top: -2px;
      min-width: 32px;
      padding: 1px 2px 0px 0px;
    }
    body#gWP1 .ClockThemeToggle:hover,
    body#gWP1 .scaler-reset:hover,
    body#gWP1 .scaler-info:hover {
      color: #ffffff;
    }
    body#gWP1 .scaler-text:hover,
    body#gWP1 .scaler-text:focus-within {
      border-color: #ffffff;
      color: #ffffff;
    }
    body#gWP1 .scaler-text::-webkit-inner-spin-button,
    body#gWP1 .scaler-text::-webkit-outer-spin-button,
    body#gWP1 .hidden {
      display: none;
    }
  `);
})();
