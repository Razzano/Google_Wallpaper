// ==UserScript==
// @name         Google w/Wallpaper + Date/Time + Logos
// @namespace    srazzano
// @version      2.4.5
// @description  Modernized Google with centered logo (no flash), wallpaper & date/time
// @author       Sonny Razzano a.k.a. srazzano
// @match        https://www.google.com/*
// @match        https://google.com/*
// @exclude      https://www.google.com/search*
// @exclude      https://google.com/search*
// @icon         https://raw.githubusercontent.com/srazzano/Images/master/googleicon64.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {

  'use strict';

  const $c = (type, props = {}, ...children) => {
    const node = document.createElement(type);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key.startsWith('on') && typeof value === 'function') {
        const event = key.substring(2).toLowerCase();
        node.addEventListener(event, value);
      }
      else if (key === 'style' && typeof value === 'object') {
        Object.assign(node.style, value);
      }
      else if (key === 'className' || key === 'class') {
        node.className = Array.isArray(value) ? value.join(' ') : value;
      }
      else if (key in node) {
        node[key] = value;
      }
      else {
        node.setAttribute(key, value);
      }
    });
    children.flat(Infinity).forEach(child => {
      if (child == null) return;
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(child));
      }
      else if (child instanceof Node) {
        node.appendChild(child);
      }
    });
    return node;
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

  const _aURL = 'https://raw.githubusercontent.com/Razzano/My_Images/master/';
  const _githubSite = 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image';
  const _dateTimeFormatCount = 4;
  const _timerLong = 10000;
  const _timerShort = 1000;

  // If adding logo, make changes in lines 110, 146, 252 & 259
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
    calendar: _aURL + 'imageCalendar.png'
  };

  const _Logo = [null];
  for (let i = 1; i <= 16; i++) { // 1 ← Change 16 to 17
    _Logo.push($c('img', {id: 'logoGoogle', class: 'logo', src: _Image[`logo${i}`]}));
  }

  const _Text = {
    changeWallpaperTooltip: 'Left-click to change wallpaper',
    inputLogoTooltip: '1 - 16 (0 = Default Google Logo)',
    inputThemerTooltip: '1 - 52 (0 = Default Google Background)',
    switchLogo: 'Left-click to change logos',
    toggleText: `• Left-click: toggle seconds\n• Shift+Left: toggle AM/PM\n• Ctrl+Left: cycle date format (1-4)`
  };

  let _clockInterval = null;
  let _currentWallpaperStyle = null;

  const updateCalendarTooltip = () => {
    const cal = $id('imageCalendar');
    if (cal) {
      cal.title = getTooltipText();
  } }

  const getTooltipText = () => {
    const target = GM_getValue('linkTarget', '_blank'),
          mode = target === '_blank' ? 'New Tab ( target = "_blank" )' : 'Active Tab ( target = "_self" )';
    return `Tooltip Controls:
       • Left-click  → Toggle Date/Time Container
       • Shift + Left-click  → Open in New Tab ( target = "_blank" )
       • Ctrl + Left-click   → Open in Active Tab ( target = "_self" )
       Current Target:
              • ${mode}`;
  };

  const applyLogo = (num) => {
    const existing = $id('logoGoogle');
    if (existing) existing.remove();
    num = parseInt(num, 10);
    if (isNaN(num) || num < 0 || num > 17) { // 2 ← Change 17 to 18
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

  const getDateTime = (format = 1) => {
    const now = new Date();
    const dy = now.getDay(), dt = now.getDate(), mth = now.getMonth(), yr = now.getFullYear(),
          dayAbbr = ['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'][dy],
          dayFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dy],
          monthAbbr = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'][mth],
          mPadded = (mth + 1) < 10 ? '0' + (mth + 1) : (mth + 1),
          suffix = ['th', 'st', 'nd', 'rd'][(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th',
          ordinal = dt + suffix;
    const hr = now.getHours(), min = now.getMinutes(), sec = now.getSeconds(),
          hr12 = hr % 12 || 12,
          hr24 = hr,
          minStr = min < 10 ? ':0' + min : ':' + min,
          secStr = GM_getValue('defaultSecondsView', false) ? (sec < 10 ? ':0' + sec : ':' + sec) : '',
          ampm = GM_getValue('defaultAMPM', false) ? (hr < 12 ? 'AM' : 'PM') : '';
    switch(format){
      case 1: return `${dayFull} ⇒ ${monthAbbr} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 2: return `${dayAbbr} • ${monthAbbr} ${dt}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 3: return `${dayAbbr} • ${mPadded}/${dt < 10 ? '0'+dt : dt}/${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 4: return `${dayFull}, ${monthAbbr} ${dt}, ${yr} ⏰ ${hr24}${minStr}${secStr} ${ampm}`;
      default: return `${dayFull} ⇒ ${monthAbbr} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
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
  }

  const logoClick = (id) => {
    let current = GM_getValue('logoImageNum', 1),
        next = (id.includes('up') || id === 'buttonLogo') ? (current + 1) % 17 : (current - 1 + 17) % 17; // 3 ← Change 17 to 18
    applyLogo(next);
  }

  const handleLogoInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(17, val)); // 4 ← Change 17 to 18
    applyLogo(val);
  }

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
  }

  const wallpaperInputChanger = () => {
    const inpThemer = $id('inputThemer');
    let val = parseInt(inpThemer.value) || 0;
    val = Math.max(0, Math.min(52, val));
    inpThemer.value = val;
    GM_setValue('wallpaperImage', val);
    applyWallpaper(val);
  }

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

  const dateTimeToggle = (e) => {
    if (e.button !== 0) return;
    const dtEl = $id('dateTime');
    if (!dtEl) return;
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      const newHiddenState = !dtEl.hidden;
      dtEl.hidden = newHiddenState;
      GM_setValue('defaultDateTimeView', newHiddenState);
      if (newHiddenState) {
        if (_clockInterval) {
          clearInterval(_clockInterval);
          _clockInterval = null;
        }
      } else {
        dtEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
        startClock();
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
  } }

  const dateTimeToggleSecondsAmPm = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      GM_setValue('defaultSecondsView', !GM_getValue('defaultSecondsView', false));
      startClock();
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      GM_setValue('defaultAMPM', !GM_getValue('defaultAMPM', false));
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      let fmt = GM_getValue('dateFormat', 1);
      fmt = (fmt >= _dateTimeFormatCount) ? 1 : fmt + 1;
      GM_setValue('dateFormat', fmt);
    }
    const el = $id('dateTime');
    if (el) {
      el.textContent = getDateTime(GM_getValue('dateFormat', 1));
  } }

  const init = () => {
    document.removeEventListener('DOMContentLoaded', init);
    const body = document.body;
    const textArea = $id('APjFqb');
    if (!body) return;
    body.id = 'gWP1';
    const dtContainer = $c('div', {
      id: 'dateTimeContainer'
    });
    const imageCalendar = $c('img', {
      id: 'imageCalendar',
      src: _Image.calendar,
      title: getTooltipText(),
      onclick: dateTimeToggle
    });
    const dateTimeEl = $c('span', {
      id: 'dateTime',
      title: _Text.toggleText,
      onclick: dateTimeToggleSecondsAmPm
    });
    dtContainer.append(imageCalendar, dateTimeEl);
    const changerContainer = $c('div', {
      id: 'changerContainer'
    });
    const buttonThemer = $c('button', {
      id: 'buttonThemer',
      textContent: 'Wallpaper 🠉',
      title: _Text.changeWallpaperTooltip,
      onclick: wallpaperButtonChanger
    });
    const inputThemer = $c('input', {
      id: 'inputThemer',
      type: 'number',
      value: GM_getValue('wallpaperImage', 0),
      title: _Text.inputThemerTooltip,
      oninput: wallpaperInputChanger
    });
    const downThemer = $c('button', {
      id: 'downThemer',
      textContent: '🠋 Wallpaper',
      title: _Text.changeWallpaperTooltip,
      onclick: wallpaperButtonChanger
    });
    const spacer = $c('span', {
      id: 'spacerX',
      textContent: '|'
    });
    const buttonLogo = $c('button', {
      id: 'buttonLogo',
      textContent: 'Logo 🠉',
      title: _Text.switchLogo,
      onclick: e => logoClick(e.target.id)
    });
    const inputLogo = $c('input', {
      id: 'inputLogo',
      type: 'number',
      value: GM_getValue('logoImageNum', 1),
      title: _Text.inputLogoTooltip,
      oninput: handleLogoInput
    });
    const downLogo = $c('button', {
      id: 'downLogo',
      textContent: '🠋 Logo',
      title: _Text.switchLogo,
      onclick: e => logoClick(e.target.id)
    });
    changerContainer.append(buttonThemer, inputThemer, downThemer, spacer, buttonLogo, inputLogo, downLogo);
    const header = $id('gb') || $q('header') || body;
    prepend(header, dtContainer);
    dtContainer.after(changerContainer);
    applyWallpaper(GM_getValue('wallpaperImage', 0));
    applyLogo(GM_getValue('logoImageNum', 1));
    textArea.placeholder = 'Search Look-up';
    if (GM_getValue('defaultDateTimeView', true)) {
      dateTimeEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
      startClock();
    } else {
      dateTimeEl.style.display = 'none';
    }
    searchLinksWhere();
    if (imageCalendar) {
      imageCalendar.onclick = null;
      imageCalendar.addEventListener('click', dateTimeToggle, false);
    }
    const dtEl = $id('dateTime');
    if (dtEl) {
      const shouldHide = GM_getValue('defaultDateTimeView', false);
      dtEl.hidden = shouldHide;
      if (!shouldHide) {
          dtEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
          startClock();
  } } }

  if (GM_getValue('dateFormat') === undefined) GM_setValue('dateFormat', 1);
  if (GM_getValue('dateTimeHidden') === undefined) GM_setValue('dateTimeHidden', false);
  if (GM_getValue('defaultDateTimeView') === undefined) GM_setValue('defaultDateTimeView', true);
  if (GM_getValue('defaultSecondsView') === undefined) GM_setValue('defaultSecondsView', false);
  if (GM_getValue('defaultAMPM') === undefined) GM_setValue('defaultAMPM', true);
  if (GM_getValue('linkTarget') === undefined) GM_setValue('linkTarget', '_blank');
  if (GM_getValue('logoImageNum') === undefined) GM_setValue('logoImageNum', 1);
  if (GM_getValue('wallpaperImage') === undefined) GM_setValue('wallpaperImage', 0);

  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

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
    #gbqfbb,
    #LS8OJ > div.k1zIA.kKvsb > div.IzOpfd {
      display: none !important;
    }
    body#gWP1 #imageCalendar {
      cursor: pointer !important;
      margin: 0px !important;
      position: relative !important;
      top: -1px !important;
    }
    body#gWP1 #dateTimeContainer {
      display: inline-flex !important;
      font: 20px monospace !important;
      height: 32px !important;
      left: 50% !important;
      position: absolute !important;
      top: 590px !important;
      transform: translateX(-50%) !important;
    }
    body#gWP1 #dateTime {
      background: rgba(0,0,0,.3) !important;
      display: block !important;
      border: 1px solid transparent !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      color: #FFF !important;
      cursor: pointer !important;
      margin: 0px 0px 0px 3px !important;
      min-width: 0px !important;
      padding: 0px 6px !important;
      user-select: none !important;;
    }
    body#gWP1 #imageCalendar:hover + #dateTime {
      background: #900 !important;
      border-color: #C00 !important;
      color: #FFF !important;
    }
    body#gWP1 #dateTime[hidden] {
      background: transparent !important;
      border: none !important;
      display: none !important;
      width: 0px !important;
    }
    body#gWP1 #dateTime:hover {
      border: 1px solid #000 !important;
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
    body#gWP1 #changerContainer {
      background: rgba(0,0,0,.2) !important;
      border: 1px solid #FFF !important;
      border-radius: 8px !important;
      box-shadow: 0 1px 3px rgba(2555, 255, 255, 0.15) !important;
      height: 33px !important;
      left: 50% !important;
      margin: 4px 4px 0px 0px !important;
      padding: 4px 16px 0px 16px !important;
      position: absolute !important;
      top: 516px !important;
      transform: translateX(-50%) !important;
    }
    body#gWP1 #buttonThemer {
      color: #FFF !important;
      cursor: pointer !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #inputThemer {
      background: rgba(0,0,0,.2) !important;
      border: 1px solid #FFF !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(2555, 255, 255, 0.15) !important;
      color: #FFF !important;
      cursor: pointer !important;
      height: 22px !important;
      margin: 0px 4px !important;
      opacity: .7 !important;
      padding-top: 4px !important;
      position: relative !important;
      text-align: center !important;
      top: 0px !important;
      width: 30px !important;
    }
    body#gWP1 #downThemer {
      cursor: pointer !important;
      height: 32px !important;
      margin-right: 15px !important;
      opacity: .7 !important;
    }
    body#gWP1 #spacerX {
      color: #FFF !important;
      filter: brightness(2) !important;
      opacity: 1 !important;
      pointer-events: none !important;
    }
    body#gWP1 #buttonLogo {
      color: #FFF !important;
      cursor: pointer !important;
      margin-left: 14px !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #inputLogo {
      background: rgba(0,0,0,.2) !important;
      border: 1px solid #FFF !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(2555,255,255,0.15) !important;
      color: #FFF !important;
      cursor: pointer !important;
      height: 22px !important;
      margin: 0px 4px !important;
      opacity: .7 !important;
      padding-top: 4px !important;
      position: relative !important;
      text-align: center !important;
      top: 0px !important;
      width: 30px !important;
    }
    body#gWP1 #downLogo {
      cursor: pointer !important;
      height: 32px !important;
      opacity: .7 !important;
    }
    body#gWP1 #changerContainer > button,
    body#gWP1 #changerContainer > input {
      font-family: monospace !important;
      font-size: 120% !important;
    }
    body#gWP1 #changerContainer > button:hover {
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
    }
    body#gWP1 #gb > div.gb_z > div:nth-child(2) {
      height: calc(-70px + 100vh) !important;
    }
  `);
})();


