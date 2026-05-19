// ==UserScript==
// @name         Google w/Wallpaper
// @namespace    srazzano
// @version      1.0.1
// @description  Layout and Theme
// @author       Sonny Razzano a.k.a. srazzano
// @match        https://www.google.com/*
// @icon         https://raw.githubusercontent.com/srazzano/Images/master/googleicon64.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {

  'use strict';

  const CONFIG = {
        githubSite: 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image',
        aURL: 'https://raw.githubusercontent.com/Razzano/My_Images/master/',
        timerLong: 10000,
        timerShort: 1000,
        dateTimeFormatCount: 4
  };

  const texts = {
        addRemoveText: `• Left-click: toggle seconds\n• Shift+Left: toggle AM/PM\n• Ctrl+Left: cycle date format (1-4)`,
        changeWallpaperTooltip: 'Left-click to change wallpaper',
        wallpaperImageText: 'Wallpaper Image',
        logoChangerText: 'Logo Changer',
        hideShowText: `• Left-click to Hide/Show Date/Time\n• Shift + Left-click for link targets of _blank\n• Ctrl + Left-click for link targets of _self`,
        switchLogo: 'Left-click to change logos',
        inputThemerTooltip: '0 - 52 (0 = Default background)',
        inputLogoTooltip: '0 - 12 (0 = Default logo)',
        placeHolderText: 'Search Look-up'
  };

  const aURL = CONFIG.aURL;
  const image1 = aURL + 'logoGoogle.png';
  const image2 = aURL + 'imageGoogle.png';
  const image3 = aURL + 'World.png';
  const image4 = aURL + 'search8.png';
  const image5 = aURL + 'googleLogo11.png';
  const image6 = aURL + 'googleLogo12.png';
  const image7 = aURL + 'lightbulb.png';
  const image8 = aURL + 'manSearching3.png';
  const image9 = aURL + 'googleLogo15.png';
  const image10 = aURL + 'googleLogo17.png';
  const image11 = aURL + 'flag.png';
  const image12 = aURL + 'face.png';
  const downArrow = aURL + 'downArrow7.png';
  const upArrow = aURL + 'upArrow5.png';
  const imgCalendar = aURL + 'imageCalendar.png';

  const body = $q('html[itemtype="http://schema.org/WebPage"] > body'),
        header = $q('html[itemtype="http://schema.org/WebPage"] #gb'),
        placeHolder = $q('html[itemtype="http://schema.org/WebPage"] #APjFqb'),
        imageCalendar = $c('img', {id: 'imageCalendar', src: imgCalendar, title: texts.hideShowText, onmousedown: e => dateTimeToggle(e)}),
        dateTimeContainer = $c('div', {id: 'dateTimeContainer'}),
        dateTime = $c('span', {id: 'dateTime', onmousedown: e => dateTimeToggleSecondsAmPm(e)}),
        logo1 = $c('img', {id: 'logoGoogle', class: 'logo', src: image1}), // Google Text Image Small
        logo2 = $c('img', {id: 'logoGoogle', class: 'logo', src: image2}), // Google Text Image Large
        logo3 = $c('img', {id: 'logoGoogle', class: 'logo', src: image3}), // World Image
        logo4 = $c('img', {id: 'logoGoogle', class: 'logo', src: image4}), // Man Search Image
        logo5 = $c('img', {id: 'logoGoogle', class: 'logo', src: image5}), // Silver G Image
        logo6 = $c('img', {id: 'logoGoogle', class: 'logo', src: image6}), // Red-Green-Blue G Image
        logo7 = $c('img', {id: 'logoGoogle', class: 'logo', src: image7}), // Lightbulb Image
        logo8 = $c('img', {id: 'logoGoogle', class: 'logo', src: image8}), // Man Search Image
        logo9 = $c('img', {id: 'logoGoogle', class: 'logo', src: image9}), // Google Logo Image Square
        logo10 = $c('img', {id: 'logoGoogle', class: 'logo', src: image10}), // Google Logo Image Round
        logo11 = $c('img', {id: 'logoGoogle', class: 'logo', src: image11}), // Flag Image
        logo12 = $c('img', {id: 'logoGoogle', class: 'logo', src: image12}), // Look Image
        changerContainer = $c('div', {id: 'changerContainer'}),
        buttonThemer = $c('button', {id: 'buttonThemer', innerHTML: texts.wallpaperImageText, style: 'background-image: url('+ upArrow +') !important;', title: texts.changeWallpaperTooltip, onclick: e => wallpaperButtonChanger(e)}),
        inputThemer = $c('input', {id: 'inputThemer', type: 'number', value: GM_getValue('wallpaperImage'), title: texts.inputThemerTooltip, oninput: e => wallpaperInputChanger()}),
        downThemer = $c('button', {id: 'downThemer', style: 'background-image: url('+ downArrow +') !important;', title: '', onclick: e => wallpaperButtonChanger(e)}),
        buttonLogo = $c('button', {id: 'buttonLogo', innerHTML: texts.logoChangerText, style: 'background-image: url('+ upArrow +') !important;', title: texts.switchLogo, onclick: e => logoClick(e.target.id)}),
        inputLogo = $c('input', {id: 'inputLogo', type: 'number', value: GM_getValue('logoImageNum'), title: texts.inputLogoTooltip, }),
        downLogo = $c('button', {id: 'downLogo', style: 'background-image: url('+ downArrow +') !important;', title: '', onclick: e => logoClick(e.target.id)});

  const logos = [null, logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9, logo10, logo11, logo12];

  let clockInterval,
      getLogo,
      initInterval,
      wallpaperInterval;

  function $c(type, props) {
    let node = document.createElement(type);
    try {
      if (props && typeof props == 'object') for (let prop in props) typeof node[prop] == 'undefined' ? node.setAttribute(prop, props[prop]) : node[prop] = props[prop];
      return node;
    } catch(ex) {}
  }

  function $q(el, all) {
    if (all) return document.querySelectorAll(el);
    return document.querySelector(el);
  }

  function insertAfter(newNode, refNode) {
    if (refNode.nextSibling) return refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    return refNode.parentNode.appendChild(newNode);
  }

  function removeDupes(className) {
    document.querySelectorAll('.' + className).forEach((el, i) => {
      if (i > 0) el.remove();
    });
  }

  function init() {
    window.removeEventListener('load', () => init());
    if (!body) return;
    body.id = 'gWP1';
    if (GM_getValue('dateFormat') < 1 || GM_getValue('dateFormat') > 4) {
      GM_setValue('dateFormat', 1);
    }
    if (GM_getValue('defaultDateTimeView')) {
      dateTimeDefault();
    } else {
      dateTime.hidden = true;
      clearInterval(clockInterval);
    }
    let num = GM_getValue('logoImageNum', 1);
    if (num < 1 || num > 13) {
      num = 1;
      GM_setValue('logoImageNum', 1);
    }
    dateTime.title = texts.addRemoveText;
    dateTimeContainer.appendChild(imageCalendar);
    dateTimeContainer.appendChild(dateTime);
    changerContainer.appendChild(buttonThemer);
    changerContainer.appendChild(inputThemer);
    changerContainer.appendChild(downThemer);
    changerContainer.appendChild(buttonLogo);
    changerContainer.appendChild(inputLogo);
    changerContainer.appendChild(downLogo);
    header.insertBefore(dateTimeContainer, header.firstChild);
    insertAfter(changerContainer, dateTimeContainer);
    placeHolder.placeholder = texts.placeHolderText;
    inputThemer.value = GM_getValue('wallpaperImage');
    applyLogo(num);
    const input = document.getElementById('inputLogo');
    if (input) {
      input.addEventListener('input', handleLogoInput);
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogoInput(e);
      });
    }
    onResize();
    searchLinksWhere();
    wallpaper(GM_getValue('wallpaperImage'));
  }

  function dateTimeFormat(int) {
    if (!GM_getValue('defaultDateTimeView')) return;
    if (!Number.isInteger(int) || int < 1 || int > 4) {
	     throw new RangeError('int must be an integer between 1 and 4');
	   }
    const date = new Date();
    const locale = navigator.language;
    const getPart = (options) => new Intl.DateTimeFormat(locale, options).format(date);
    const parts = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).formatToParts(date);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const day = parseInt(map.day);
    const dayPadded = map.day.padStart(2, '0');
    const year = map.year;
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1 ? 0 : day % 10)] || 'th';
    const ordinal = day + suffix;
    let hr = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    const hr12 = hr % 12 || 12;
    const minStr = min < 10 ? ':0' + min : ':' + min;
    const secStr = GM_getValue('defaultSecondsView', false) ? (sec < 10 ? ':0' + sec : ':' + sec) : '';
    const ampm = GM_getValue('defaultAMPM', false) ? (hr >= 12 ? 'PM' : 'AM') : '';
    const formats = [
      null,
      () => `${map.weekday} ⇒ ${map.month} ${ordinal}, ${year} ⏰ ${hr12}${minStr}${secStr} ${ampm}`, // 1: Monday ⇒ January 1st, 2026
      () => `${getPart({weekday: 'short'})} * ${getPart({month: 'short'})} ${day}, ${year} 🕑 ${hr12}${minStr}${secStr} ${ampm}`, // 2: Mon * Jan 1, 2026
      () => `${map.weekday} • ${getPart({month: 'numeric'})}/${dayPadded}/${year} ⏰ ${hr12}${minStr}${secStr} ${ampm}`, // 3: Monday • 1/01/2026
      () => `${getPart({weekday: 'short'})} :: ${getPart({month: '2-digit'})}-${dayPadded}-${year} 🕑 ${hr12}${minStr}${secStr} ${ampm}` // 4: Mon :: 01-01-2026
    ];
    return formats[int]();
  }

  function dateTimeDefault() {
    dateTime.hidden = false;
    dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'));
    dateTime.title = texts.addRemoveText;
    dateTimeTimer();
  }

  function dateTimeTimer() {
    clearInterval(clockInterval);
    if (!GM_getValue('defaultDateTimeView')) return;
    if (GM_getValue('defaultSecondsView')) clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, CONFIG.timerShort);
    else clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, CONFIG.timerLong);
  }

  function dateTimeToggle(e) {
    let bool, target;
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.button === 0) {
      bool = dateTime.hidden !== true ? true : false;
      dateTime.hidden = bool;
      GM_setValue('defaultDateTimeView', !bool);
      if (bool) clearInterval(clockInterval);
      else { dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat')); dateTimeTimer() }
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey && e.button === 0) {
      GM_setValue('linkTarget', "_blank");
      searchLinksWhere()
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey && e.button === 0) {
      GM_setValue('linkTarget', "_self");
      searchLinksWhere()
  } }

  function dateTimeToggleSecondsAmPm(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!e.shiftKey && !e.ctrlKey) {
      GM_setValue('defaultSecondsView', !GM_getValue('defaultSecondsView', false));
      dateTimeTimer();
    } else if (e.shiftKey) {
      GM_setValue('defaultAMPM', !GM_getValue('defaultAMPM', false));
    } else if (e.ctrlKey) {
      let f = GM_getValue('dateFormat', 1);
      GM_setValue('dateFormat', f >= CONFIG.dateTimeFormatCount ? 1 : f + 1);
    }
    document.getElementById('dateTime').textContent = dateTimeFormat(GM_getValue('dateFormat', 1));
  }

  function applyLogo(num) {
    const input = document.getElementById('inputLogo');
    if (num === 13) {
      GM_addStyle(`
        #gWP1 #LS8OJ { display: block !important; }
        #gWP1 form { margin-top: -86px !important; }
        #gWP1 #logoGoogle, #gWP1 .logo { display: none !important; }
      `);
      if (input) input.value = 0;
      return;
    }
    GM_addStyle(`
      #gWP1 #LS8OJ { display: none !important; }
      #gWP1 form { margin-top: 210px !important; }
      #gWP1 #logoGoogle, #gWP1 .logo { display: inline-block !important; }
    `);
    if (logos[num]) {
      insertAfter(logos[num], dateTimeContainer);
    }
    if (input) input.value = num;
    removeDupes('logo');
  }

  function logoClick(id) {
    let current = GM_getValue('logoImageNum', 1);
    let next;
    if (id === 'buttonLogo') {
      next = (current % 13) + 1;
    } else if (id === 'downLogo') {
      next = ((current - 2) % 13 + 13) % 13 + 1;
    } else {
      return;
    }
    GM_setValue('logoImageNum', next);
    applyLogo(next);
    onResize();
  }

  function handleLogoInput(e) {
    let val = e.target.value.trim();
    let num;
    if (val.toLowerCase() === "default" || val === "13") {
      num = 13;
    } else {
      num = parseInt(val);
      if (isNaN(num)) return;
      if (num < 1) num = 1;
      if (num > 13) num = 13;
    }
    GM_setValue('logoImageNum', num);
    applyLogo(num);
    onResize();
  }

  function onClose() {
    window.removeEventListener('unload', () => onClose());
    window.removeEventListener('resize', () => onResize());
    clearInterval(clockInterval);
    clearInterval(initInterval);
    clearInterval(wallpaperInterval);
  }

  function onResize() {
    try {
      let getLogo = document.getElementById('logoGoogle'),
          setLeft = (window.innerWidth / 2) - (getLogo.width / 2) + 'px';
      getLogo.style = 'left: ' + setLeft;
    } catch(ex) {}
  }

  function searchLinksWhere() {
    let links = $q('a', true);
    for (let i = 0; i < links.length; i++) links[i].setAttribute('target', GM_getValue('linkTarget'));
  }

  function wallpaper(num) {
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

  function wallpaperButtonChanger(e) {
    let inp = document.getElementById('inputThemer'),
        num1 = parseInt(inp.value),
        sum = parseInt(num1 + 1),
        sub = parseInt(num1 - 1);
    switch (e.target.id) {
      case 'buttonThemer':
        if (inp.value > 51) inp.value = 0;
        else inp.value = sum;
        break;
      case 'downThemer':
        if (inp.value > 0) inp.value = sub;
        else inp.value = 52;
    }
    GM_setValue('wallpaperImage', inp.value);
    wallpaper(inp.value);
  }

  function wallpaperInputChanger() {
    let inp = document.getElementById('inputThemer');
    inp.value = inp.value % 52;
    GM_setValue('wallpaperImage', inp.value);
    wallpaper(inp.value);
  }

  function wallpaperSite() {
    let num = GM_getValue('wallpaperImage');
    wallpaper(num);
  }

  function start() {
    if (GM_getValue('dateFormat') === undefined) GM_setValue('dateFormat', 1);
    if (GM_getValue('defaultAMPM') === undefined) GM_setValue('defaultAMPM', false);
    if (GM_getValue('defaultDateTimeView') === undefined) GM_setValue('defaultDateTimeView', false);
    if (GM_getValue('defaultSecondsView') === undefined) GM_setValue('defaultSecondsView', false);
    if (GM_getValue('linkTarget') === undefined) GM_setValue('linkTarget', '_blank');
    if (GM_getValue('logoImageNum') === undefined) GM_setValue('logoImageNum', 1);
    if (GM_getValue('wallpaperImage') === undefined) GM_setValue('wallpaperImage', 0);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
  } }

  window.addEventListener('load', () => init());
  window.addEventListener('resize', () => onResize());
  window.addEventListener('unload', () => onClose());

  start();

  GM_addStyle(`
    #gWP1 > div.L3eUgb > div.o3j99.n1xJcf.CoM3Df > a.w5hRs,
    #gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f > div:nth-child(2) > a,
    #gWP1 #gb > div.gb_Ad.gb_6.gb_L,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.AghGtd,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.ssOUyb,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > a,
    #gWP1 > div.L3eUgb div.RNNXgb div.fzj3ad,
    #gWP1 > div.L3eUgb > div.o3j99.qarstb > div:nth-child(3) {
      display: none !important;
    }
    #gWP1 #imageCalendar {
      cursor: pointer !important;
      margin: 0px !important;
      position: relative !important;
      top: -1px !important;
    }
    #gWP1 #dateTimeContainer {
      display: inline-flex !important;
      font: 20px monospace !important;
      height: 32px !important;
      left: 13px !important;
      position: absolute !important;
      top: 10px !important;
    }
    #gWP1 #dateTimeContainer > #dateTime {
      background: rgba(0, 0, 0, .3) !important;
      border: 1px solid transparent !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      color: #FFF !important;
      cursor: pointer !important;
      margin: 0px 0px 0px 3px !important;
      padding: 0px 6px !important;
    }
    #gWP1 #imageCalendar:hover + #dateTime {
      background: #900 !important;
      border-color: #C00 !important;
      color: #FFF !important;
    }
    #gWP1 #dateTimeContainer > #dateTime:hover {
      background: #181A1B !important;
      border: 1px solid #000 !important;
    }
    #gWP1 #logoGoogle {
      max-height: 100% !important;
      max-width: 100% !important;
      position: absolute !important;
      top: 0px !important;
    }
    #gWP1 form {
      margin-top: 210px !important;
    }
    #gWP1 #changerContainer {
      height: 52px !important;
      margin: 0px !important;
      position: relative !important;
      top: -3px !important;
    }
    #gWP1 #buttonThemer,
    #gWP1 #buttonLogo {
      background-position: bottom 6px right !important;
      background-repeat: no-repeat !important;
      cursor: pointer !important;
      font: 20px monospace !important;
      margin-right: 13px !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    #gWP1 #buttonThemer {
      width: 224px !important;
    }
    #gWP1 #buttonLogo {
      width: 190px !important;
    }
    #gWP1 #inputThemer,
    #gWP1 #inputLogo {
      background: #000 !important;
      border: 2px outset #FFF !important;
      cursor: pointer !important;
      font: 20px monospace !important;
      height: 22px !important;
      padding-top: 4px !important;
      position: relative !important;
      text-align: center !important;
      top: -1px !important;
      width: 27px !important;
    }
    #gWP1 #downThemer,
    #gWP1 #downLogo {
      background-repeat: no-repeat !important;
      cursor: pointer !important;
      height: 32px !important;
      margin: 0px !important;
      opacity: .6 !important;
      position: relative !important;
      top: 7px !important;
      width: 47px !important;
    }
    #gWP1 #changerContainer > button:hover,
    #gWP1 #changerContainer > button:focus-within,
    #gWP1 #changerContainer > input:hover,
    #gWP1 #changerContainer > input:focus-within {
      opacity: 1 !important;
    }
    #gWP1 ::-webkit-inner-spin-button,
    #gWP1 ::-webkit-outer-spin-button,
    #gWP1 ::-webkit-inner-spin-button,
    #gWP1 ::-webkit-outer-spin-button {
      display: none !important;
    }
    #gb > div.gb_Q.gb_6.gb_Vf.gb_3f {
      padding-right: 0px !important;
    }
    a {
      text-decoration: none !important;
    }
    body#gWP1 {
      background:  url( + githubSite + GM_getValue(wallpaperImage) +.jpg) no-repeat center / cover fixed !important;
    }
    #gWP1 > div.L3eUgb > div:nth-child(13) > div {
      background: transparent !important;
    }
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe {
      float: right !important;
    }
  `);

})();
