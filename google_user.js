// ==UserScript==
// @name         Google w/Wallpaper + Date/Time + Logo Switcher
// @namespace    srazzano
// @version      2.4.5
// @description  Modernized Google with centered logo (no flash), wallpaper & date/time
// @author       Sonny Razzano
// @match        https://www.google.com/*
// @match        https://google.com/*
// @exclude      https://www.google.com/search*
// @exclude      https://google.com/search*
// @icon         https://raw.githubusercontent.com/srazzano/Images/master/googleicon64.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function () {

  'use strict';

  const CONFIG = {
    aURL: 'https://raw.githubusercontent.com/Razzano/My_Images/master/',
    dateTimeFormatCount: 4,
    githubSite: 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image',
    timerLong: 10000,
    timerShort: 1000
  };

  const texts = {
    changeWallpaperTooltip: 'Left-click to change wallpaper',
    inputLogoTooltip: '1 - 12 (13 = Default Google logo)',
    inputThemerTooltip: '0 - 52 (0 = Default background)',
    logoChangerText: 'Logo Changer',
    placeHolderText: 'Search Look-up',
    switchLogo: 'Left-click to change logos',
    toggleText: `• Left-click: toggle seconds\n• Shift+Left: toggle AM/PM\n• Ctrl+Left: cycle date format (1-4)`,
    wallpaperImageText: 'Wallpaper Image'
  };

  const images = {
    logo1: CONFIG.aURL + 'logoGoogle.png',
    logo2: CONFIG.aURL + 'imageGoogle.png',
    logo3: CONFIG.aURL + 'World.png',
    logo4: CONFIG.aURL + 'search8.png',
    logo5: CONFIG.aURL + 'googleLogo11.png',
    logo6: CONFIG.aURL + 'googleLogo12.png',
    logo7: CONFIG.aURL + 'lightbulb.png',
    logo8: CONFIG.aURL + 'search2.png',
    logo9: CONFIG.aURL + 'googleLogo15.png',
    logo10: CONFIG.aURL + 'googleLogo17.png',
    logo11: CONFIG.aURL + 'flag.png',
    logo12: CONFIG.aURL + 'face.png',
    calendar: CONFIG.aURL + 'imageCalendar.png',
    upArrow: CONFIG.aURL + 'upArrow5.png',
    downArrow: CONFIG.aURL + 'downArrow7.png'
  };

  const logos = [null];
  for (let i = 1; i <= 12; i++) {
    logos.push($c('img', {id: 'logoGoogle', class: 'logo', src: images[`logo${i}`]}));
  }

  let clockInterval = null;

  const $id = (id) => document.getElementById(id);

  function $c(type, props = {}) {
    const node = document.createElement(type);
    Object.assign(node, props);
    return node;
  }

  function $q(sel) { return document.querySelector(sel); }

  function removeDupes(className) {
    document.querySelectorAll('.' + className).forEach((el, i) => { if (i > 0) el.remove(); });
  }

  function updateCalendarTooltip() {
    const cal = $id('imageCalendar');
    if (cal) cal.title = getTooltipText();
  }

  function getTooltipText() {
    return `• Left-click to Hide/Show Date/Time Container\n` +
           `• Shift + Left-click for link target in New Tab: '_blank'\n` +
           `• Ctrl + Left-click for link target in Active Tab: '_self'\n` +
           `• Current setting: ⇒ ${
              GM_getValue('linkTarget', '_blank') === '_blank'
              ? 'New Tab with target of "_blank"'
              : 'Active Tab with target of "_self"'
            }`;
  }

  function applyLogo(num) {
    num = parseInt(num) || 1;
    if (num < 1 || num > 13) num = 13;
    $id('logoGoogle')?.remove();
    //const margins = { 0: '-86px', 4: '168px', 13: '-86px' }; ⇒ For Logo at top
    //const marginTop = margins[num] ?? '210px'; ⇒ For Logo at top
    const margins = { 4: '64px', 8: '60px' };
    const marginTop = margins[num] ?? '40px';
    const translate = { 8: 'translateX(-180%)' }
    const transform = translate[num] ?? 'translateX(-50%)';
    //#gWP1 #LS8OJ { display: ${num === 13 ? 'block' : 'none'} !important; } ⇒ In GM_addStyle for logo at top
    //#gWP1 form, #gWP1 .RN6D2c { margin-top: ${marginTop} !important; } ⇒ In GM_addStyle for logo at top
    GM_addStyle(`
      #gWP1 #LS8OJ > div.k1zIA.rSk4se { display: ${num === 13 ? 'block' : 'none'} !important; }
      #gWP1 #logoGoogle { margin-top: ${marginTop} !important; }
    `);
    //top: 0 !important; ⇒ In logoCopy.style.cssText for logo at top
    //transform: translateX(-50%) !important;
    if (num !== 13 && logos[num]) {
      const logoCopy = logos[num].cloneNode(false);
      logoCopy.id = 'logoGoogle';
      logoCopy.className = 'logo';
      logoCopy.style.cssText = `
        position: absolute !important;
        left: 50% !important;
        top: ${marginTop} !important;
        transform: ${transform} !important;
        z-index: 999 !important;
        opacity: 0 !important;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) !important;
      `;
      const dtContainer = $id('dateTimeContainer');
      if (dtContainer) dtContainer.after(logoCopy);
      removeDupes('logo');
      requestAnimationFrame(() => {
        logoCopy.style.opacity = '1';
      });
    }
    const inp = $id('inputLogo');
    if (inp) {
      inp.value = (num === 13) ? 0 : num;
    }
    GM_setValue('logoImageNum', num);
  }

  function applyWallpaper(num) {
    num = parseInt(num) || 0;
    if (num === 0) {
      GM_addStyle(`body#gWP1 { background: initial !important; }`);
    } else {
      GM_addStyle(`
        body#gWP1 {
          background: url(${CONFIG.githubSite}${num}.jpg) no-repeat center center / cover !important;
          background-attachment: fixed !important;
        }
      `);
  } }

  function getDateTime(format = 1) {
    const now = new Date();
    const dy = now.getDay(), dt = now.getDate(), mth = now.getMonth(), yr = now.getFullYear();
    let hr = now.getHours(), min = now.getMinutes(), sec = now.getSeconds();
    const hr12 = hr % 12 || 12;
    const minStr = min < 10 ? ':0' + min : ':' + min;
    const secStr = GM_getValue('defaultSecondsView', false) ? (sec < 10 ? ':0' + sec : ':' + sec) : '';
    const ampm = GM_getValue('defaultAMPM', false) ? (hr < 12 ? 'AM' : 'PM') : '';
    const dayAbbr = ['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'][dy];
    const dayFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dy];
    const monthAbbr = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'][mth];
    const mPadded = (mth + 1) < 10 ? '0' + (mth + 1) : (mth + 1);
    const suffix = ['th', 'st', 'nd', 'rd'][(dt % 10 > 3 || Math.floor(dt / 10) === 1 ? 0 : dt % 10)] || 'th';
    const ordinal = dt + suffix;
    switch(format){
      case 1: return `${dayFull} ⇒ ${monthAbbr} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 2: return `${dayAbbr} • ${monthAbbr} ${dt}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 3: return `${dayAbbr} • ${mPadded}/${dt < 10 ? '0'+dt : dt}/${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
      case 4: return `${dayFull}, ${monthAbbr} ${dt}, ${yr} ⏰ ${hr<10?'0'+hr:hr}${minStr}${secStr} ${ampm}`;
      default: return `${dayFull} ⇒ ${monthAbbr} ${ordinal}, ${yr} ⏰ ${hr12}${minStr}${secStr} ${ampm}`;
  } }

  function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    const ms = GM_getValue('defaultSecondsView', false) ? CONFIG.timerShort : CONFIG.timerLong;
    clockInterval = setInterval(() => {
      const el = $id('dateTime');
      if (el) el.textContent = getDateTime(GM_getValue('dateFormat', 1));
    }, ms);
  }

  function logoClick(id) {
    let current = GM_getValue('logoImageNum', 1);
    let next = (id.includes('up') || id === 'buttonLogo')
      ? (current % 13) + 1
      : ((current - 2) % 13 + 13) % 13 + 1;
    applyLogo(next);
  }

  function handleLogoInput(e) {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    if (val === 0) val = 13; // 0 = Default Google logo
    val = Math.max(1, Math.min(13, val));
    applyLogo(val);
  }

  function wallpaperButtonChanger(e) {
    const inp = $id('inputThemer');
    let val = parseInt(inp.value) || 0;
    val = e.target.id.includes('down') ? val - 1 : val + 1;
    if (val > 52) val = 0;
    if (val < 0) val = 52;
    inp.value = val;
    GM_setValue('wallpaperImage', val);
    applyWallpaper(val);
  }

  function wallpaperInputChanger() {
    let val = parseInt(this.value) || 0;
    val = Math.max(0, Math.min(52, val));
    this.value = val;
    GM_setValue('wallpaperImage', val);
    applyWallpaper(val);
  }

  function searchLinksWhere() {
    const links = document.querySelectorAll('a');
    const target = GM_getValue('linkTarget', '_blank');
    links.forEach(link => {
      link.setAttribute('target', target);
    });
  }

  function dateTimeToggle(e) {
    if (e.button !== 0) return;
    const dtEl = document.getElementById('dateTime');
    if (!dtEl) return;
    if (!e.shiftKey && !e.ctrlKey) {
      const isHidden = GM_getValue('defaultDateTimeView');
      dtEl.hidden = isHidden;
      GM_setValue('defaultDateTimeView', !isHidden);
      if (isHidden) {
        dtEl.style.display = 'none';
        if (clockInterval) clearInterval(clockInterval);
      } else {
        dtEl.style.display = 'block';
        dtEl.textContent = getDateTime(GM_getValue('dateFormat', 1));
        startClock();
      }
      return;
    }
    else if (e.shiftKey && !e.ctrlKey) {
      GM_setValue('linkTarget', '_blank');
    }
    else if (e.ctrlKey && !e.shiftKey) {
      GM_setValue('linkTarget', '_self');
    }
	   searchLinksWhere();
    if (typeof updateCalendarTooltip === 'function') {
      updateCalendarTooltip();
  } }

  function dateTimeToggleSecondsAmPm(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!e.shiftKey && !e.ctrlKey) {
      GM_setValue('defaultSecondsView', !GM_getValue('defaultSecondsView', false));
      startClock();
    } else if (e.shiftKey && !e.ctrlKey) {
      GM_setValue('defaultAMPM', !GM_getValue('defaultAMPM', false));
    } else if (e.ctrlKey && !e.shiftKey) {
      let fmt = GM_getValue('dateFormat', 1);
      fmt = (fmt >= CONFIG.dateTimeFormatCount) ? 1 : fmt + 1;
      GM_setValue('dateFormat', fmt);
    }
    const el = $id('dateTime');
    if (el) el.textContent = getDateTime(GM_getValue('dateFormat', 1));
  }

  function init() {
    const body = document.body;
    if (!body) return;
    body.id = 'gWP1';
    const dtContainer = $c('div', {id: 'dateTimeContainer'});
    const imageCalendar = $c('img', {
      id: 'imageCalendar',
      src: images.calendar,
      title: getTooltipText(),
      onclick: dateTimeToggle
    });
    const dateTimeEl = $c('span', {
      id: 'dateTime',
      title: texts.toggleText,
      onclick: dateTimeToggleSecondsAmPm
    });
    dtContainer.append(imageCalendar, dateTimeEl);
    const changerContainer = $c('div', {id: 'changerContainer'});
    const buttonThemer = $c('button', {
      id: 'buttonThemer',
      innerHTML: texts.wallpaperImageText,
      style: `background-image: url(${images.upArrow}) !important;`,
      title: texts.changeWallpaperTooltip,
      onclick: wallpaperButtonChanger
    });
    const inputThemer = $c('input', {
      id: 'inputThemer',
      type: 'number',
      value: GM_getValue('wallpaperImage', 0),
      title: texts.inputThemerTooltip,
      oninput: wallpaperInputChanger
    });
    const downThemer = $c('button', {
      id: 'downThemer',
      style: `background-image: url(${images.downArrow}) !important;`,
      onclick: wallpaperButtonChanger
    });
    const buttonLogo = $c('button', {
      id: 'buttonLogo',
      innerHTML: texts.logoChangerText,
      style: `background-image: url(${images.upArrow}) !important;`,
      title: texts.switchLogo,
      onclick: e => logoClick(e.target.id)
    });
    const inputLogo = $c('input', {
      id: 'inputLogo',
      type: 'number',
      value: GM_getValue('logoImageNum', 1),
      title: texts.inputLogoTooltip,
      oninput: handleLogoInput
    });
    const downLogo = $c('button', {
      id: 'downLogo',
      style: `background-image: url(${images.downArrow}) !important;`,
      onclick: e => logoClick(e.target.id)
    });
    changerContainer.append(buttonThemer, inputThemer, downThemer, buttonLogo, inputLogo, downLogo);
    const header = $q('#gb') || $q('header') || body;
    header.prepend(dtContainer);
    dtContainer.after(changerContainer);
    applyWallpaper(GM_getValue('wallpaperImage', 0));
    applyLogo(GM_getValue('logoImageNum', 1));
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
  } }

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
    body#gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(3) {
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
      left: 13px !important;
      position: absolute !important;
      top: 10px !important;
    }
    body#gWP1 #dateTimeContainer > #dateTime {
      background: rgba(0, 0, 0, .3) !important;
      border: 1px solid transparent !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      color: #FFF !important;
      cursor: pointer !important;
      margin: 0px 0px 0px 3px !important;
      padding: 0px 6px !important;
    }
    body#gWP1 #imageCalendar:hover + #dateTime {
      background: #900 !important;
      border-color: #C00 !important;
      color: #FFF !important;
    }
    body#gWP1 #dateTimeContainer > #dateTime:hover {
      background: #181A1B !important;
      border: 1px solid #000 !important;
    }
    body#gWP1 #logoGoogle {
      max-height: 100% !important;
      max-width: 100% !important;
      position: absolute !important;
      top: 0px !important;
    }
    body#gWP1 #changerContainer {
      height: 52px !important;
      margin: 0px !important;
      position: relative !important;
      top: -3px !important;
    }
    body#gWP1 #buttonThemer,
    body#gWP1 #buttonLogo {
      background-position: bottom 6px right !important;
      background-repeat: no-repeat !important;
      color: #FFF !important;
      cursor: pointer !important;
      font: 20px monospace !important;
      margin-right: 13px !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    body#gWP1 #buttonThemer {
      width: 224px !important;
    }
    body#gWP1 #buttonLogo {
      width: 190px !important;
    }
    body#gWP1 #inputThemer,
    body#gWP1 #inputLogo {
      background: #000 !important;
      border: 2px solid #FFF !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(2555,255,255,0.15) !important;
      color: #FFF !important;
      cursor: pointer !important;
      font: 20px monospace !important;
      height: 22px !important;
      padding-top: 4px !important;
      position: relative !important;
      text-align: center !important;
      top: -1px !important;
      width: 32px !important;
    }
    body#gWP1 #inputThemer:hover,
    body#gWP1 #inputThemer:focus-within,
    body#gWP1 #inputLogo:hover,
    body#gWP1 #inputLogo:focus-within {
      border-color: #999 !important;
    }
    body#gWP1 #downThemer,
    body#gWP1 #downLogo {
      background-repeat: no-repeat !important;
      cursor: pointer !important;
      height: 32px !important;
      margin: 0px !important;
      opacity: .6 !important;
      position: relative !important;
      top: 7px !important;
      width: 47px !important;
    }
    body#gWP1 #changerContainer > button:hover,
    body#gWP1 #changerContainer > button:focus-within,
    body#gWP1 #changerContainer > input:hover,
    body#gWP1 #changerContainer > input:focus-within {
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
      background: url(${CONFIG.githubSite}GM_getValue(wallpaperImage)}.jpg) no-repeat center center / cover !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div {
      background: transparent !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe {
      float: right !important;
    }
    body#gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > span > span > g-popup > div.CcNe6e > div {
      background: #000 !important;
      border-radius: 6px !important;
      padding: 8px 16px !important;
    }
    #gWP1 #LS8OJ > div.k1zIA.rSk4se > svg {
      fill: #FFF !important;
    }
    #gWP1 > div.L3eUgb > div.o3j99.ikrT4e.KEY6ib > form > div:nth-child(1) > div > div.RNNXgb {
      background: rgba(0,0,0,.1) !important;
    }
  `);
})();
