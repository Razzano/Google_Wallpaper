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

  const openInterval = 20,
        themerInterval = 30000,
        timerLong = 10000,
        timerShort = 1000,
        dateTimeFormatCount = 9,
        am = 'AM',
        pm = 'PM',
        arrow = '\u21D2',
        asterisk = '\u002A', // '*'
        bullet = '\u2022', // '•'
        clock = '\u23F0', // '⏰' or '\u23F2',
        colon = ':',
        colons = '::',
        comma = ',',
        heart = '❤️',
        hyphen = '-',
        slash = '/',
        space = ' ',
        watch = '\u231A', // '⌚'
        addRemoveText = bullet + ' Left-click to Add/Remove :seconds\n' + bullet + ' Shift + Left-click to Add/Remove AM/PM\n' + bullet + ' Ctrl + Left-click to change Date format 1 - 9',
        changeWallpaperTooltip = 'Left-click to change wallpaper',
        wallpaperImageText = 'Wallpaper image',
        customFormatText = 'Add a custom format in script line ',
        hideShowText = bullet + ' Left-click to Hide/Show Date/Time\n' + bullet + ' Shift + Left-click for link targets of "_blank"\n' + bullet + ' Ctrl + Left-click for link targets of "_self"',
        inputTooltip = '0 - 51',
        placeHolderText = 'Search Look-up',
        githubSite = 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image',
        downArrow = 'https://raw.githubusercontent.com/Razzano/My_Images/master/downArrow.png',
        upArrow = 'https://raw.githubusercontent.com/Razzano/My_Images/master/upArrow.png',
        googleImage = 'https://raw.githubusercontent.com/Razzano/My_Images/master/logoGoogle.png',
        imgCalendar = 'https://raw.githubusercontent.com/Razzano/My_Images/master/imageCalendar.png',
        imgClock16 = 'https://raw.githubusercontent.com/Razzano/My_Images/master/imageClock16.png',
        imgClock32 = 'https://raw.githubusercontent.com/Razzano/My_Images/master/imageClock32.png',
        DayNameAbbr = 'Sun.,Mon.,Tue.,Wed.,Thu.,Fri.,Sat.',
        daynameabbr = DayNameAbbr.split(','),
        DayName = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
        dayname = DayName.split(','),
        DayNo = '"",01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31',
        dayno = DayNo.split(','),
        DayNum = '"",1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31',
        daynum = DayNum.split(','),
        DayOrd = '"",1st,2nd,3rd,4th,5th,6th,7th,8th,9th,10th,11th,12th,13th,14th,15th,16th,17th,18th,19th,20th,21st,22nd,23rd,24th,25th,26th,27th,28th,29th,30th,31st',
        dayord = DayOrd.split(','),
        MonthName = 'January,February,March,April,May,June,July,August,September,October,November,December',
        monthname = MonthName.split(','),
        MonthNameAbbr = 'Jan.,Feb.,Mar.,Apr.,May,Jun.,Jul.,Aug.,Sep.,Oct.,Nov.,Dec.',
        monthnameabbr = MonthNameAbbr.split(','),
        MonthNo = '01,02,03,04,05,06,07,08,09,10,11,12',
        monthno = MonthNo.split(','),
        MonthNum = '1,2,3,4,5,6,7,8,9,10,11,12',
        monthnum = MonthNum.split(','),
        body = $q('html[itemtype="http://schema.org/WebPage"] > body'),
        header = $q('html[itemtype="http://schema.org/WebPage"] #gb'),
        center = $q('html[itemtype="http://schema.org/WebPage"] .FPdoLc.lJ9FBc > center'),
        placeHolder = $q('html[itemtype="http://schema.org/WebPage"] textarea[name="q"]'),
        searchButton = $q('html[itemtype="http://schema.org/WebPage"] input[name="btnK"]'),
        settingsBtn = $q('body > div.L3eUgb > div:nth-child(7) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > span > span'),
        imageCalendar = $c('img', {id: 'imageCalendar', src: imgCalendar, title: hideShowText, onmousedown: e => dateTimeToggle(e)}),
        dateTimeContainer = $c('div', {id: 'dateTimeContainer'}),
        dateTime = $c('span', {id: 'dateTime', onmousedown: e => dateTimeToggleSecondsAmPm(e)}),
        logoGoogle = $c('img', {id: 'logoGoogle', src: googleImage}),
        divThemer = $c('div', {id: 'themerDiv'}),
        btnThemer = $c('button', {id: 'buttonThemer', innerHTML: wallpaperImageText, title: changeWallpaperTooltip, onclick: e => wallpaperButtonChanger(e)}),
        inpThemer = $c('input', {id: 'inputThemer', type: 'number', value: GM_getValue('wallpaperImage'), title: inputTooltip, oninput: e => wallpaperInputChanger(e)}),
        btnDown = $c('button', {id: 'buttonDown', style: 'background-image: url(' + downArrow + ') !important;', title: '', onclick: e => wallpaperButtonChanger(e)});

  let clockInterval,
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

  function dateTimeFormat(int) {
    if (!GM_getValue('defaultDateTimeView')) return;
    let date = new Date(),
        dt = date.getDate(),
        dy = date.getDay(),
        hr = date.getHours(),
        min = date.getMinutes(),
        mth = date.getMonth(),
        sec = date.getSeconds(),
        yr = date.getFullYear(),
        d = daynum[dt],
        dd = dayno[dt],
        ddd = dayord[dt],
        m = monthnum[mth],
        mm = monthno[mth],
        mmm = monthnameabbr[mth],
        mmmm = monthname[mth],
        w = daynameabbr[dy],
        ww = dayname[dy],
        yy = yr - 2000,
        yyyy = yr,
        hr12, hr24, ampm,
        span = $c('img', {src: imgClock16});
    if (hr > 12) { hr12 = hr - 12; hr24 = hr }
    else { hr12 = hr; hr24 = hr }
    if (hr < 10) { hr12 = hr; hr24 = '0' + hr }
    if (hr === 0) { hr12 = 12; hr24 = '00' }
    min < 10 ? min = ':0' + min : min = ':' + min;
    if (GM_getValue('defaultSecondsView')) sec < 10 ? sec = ':0' + sec : sec = ':' + sec;
    else sec = '';
    if (GM_getValue('defaultAMPM')) hr < 12 ? ampm = am : ampm = pm;
    else ampm = '';
    switch (int) {
      // RETURN OPTIONS: (w / ww) + (m / mm / mmm / mmmm) + (d / dd / ddd) +  (yy / yyyy) + (hr12 / hr24) + (min) + (sec) + (ampm) special characters: arrow, asterisk, bullet, clock, colon, colons, comma, hyphen, slash, space, watch
      case 1: return ww + space + arrow + space + mmmm + space + ddd + comma + space + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sunday ?? March 1st, 2021 ?? 12:34 AM
      case 2: return w + space + bullet + space + mmm + space + d + comma + space + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • Mar. 1, 2021 • 12:34 AM
      case 3: return w + space + arrow + space + mmm + space + dd + comma + space + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • Mar. 01, 2021 • 12:34 AM
      case 4: return w + space + bullet + space + m + hyphen + d + hyphen + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • 3-1-2021 • 12:34 AM
      case 5: return w + space + bullet + space + mm + hyphen + dd + hyphen + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • 03-01-2021 • 12:34 AM
      case 6: return w + space + bullet + space + m + slash + d + slash + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • 3/1/2021 • 12:34 AM
      case 7: return w + space + bullet + space + mm + slash + dd + slash + yyyy + space + clock + space + hr12 + min + sec + space + ampm; // Sun. • 03/01/2021 • 12:34 AM
      // Delete "customFormatText + 148" or "customFormatText + 149" text below and add RETURN OPTIONS with desired format and special characters.
      case 8: return customFormatText + 148;
      case 9: return customFormatText + 149;
  } }

  function dateTimeDefault() {
    dateTime.hidden = false;
    dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'));
    dateTime.title = addRemoveText;
    dateTimeTimer();
  }

  function dateTimeTimer() {
    clearInterval(clockInterval);
    if (!GM_getValue('defaultDateTimeView')) return;
    if (GM_getValue('defaultSecondsView')) clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, timerShort);
    else clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, timerLong);
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
    if (!e.button === 0) return;
    let bool1, bool2, int, target;
    e.preventDefault();
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.button === 0) {
      bool1 = GM_getValue('defaultSecondsView') !== true ? true : false;
      GM_setValue('defaultSecondsView', bool1);
      dateTimeTimer();
    } else if (e.shiftKey && !e.ctrlKey && !e.altKey && e.button === 0) {
      bool2 = GM_getValue('defaultAMPM') !== true ? true : false;
      GM_setValue('defaultAMPM', bool2);
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey && e.button === 0) {
      int = GM_getValue('dateFormat') + 1;
      int < dateTimeFormatCount + 1 ? GM_setValue('dateFormat', int) : GM_setValue('dateFormat', 1);
    }
    dateTime.title = addRemoveText;
    dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'));
  }

  function init() {
    window.removeEventListener('load', () => init());
    try {
      body.id = 'gWP1';
      searchButton.id = 'gSearch';
      if (GM_getValue('defaultDateTimeView')) dateTimeDefault();
      else { dateTime.hidden = true; clearInterval(clockInterval) }
      dateTime.title = addRemoveText;
      dateTimeContainer.appendChild(imageCalendar);
      dateTimeContainer.appendChild(dateTime);
      divThemer.appendChild(btnThemer);
      divThemer.appendChild(inpThemer);
      divThemer.appendChild(btnDown);
      header.insertBefore(dateTimeContainer, header.firstChild);
      insertAfter(logoGoogle, dateTimeContainer);
      insertAfter(divThemer, logoGoogle);
      placeHolder.placeholder = placeHolderText;
      center.appendChild(settingsBtn);
      inpThemer.value = GM_getValue('wallpaperImage');
      onResize();
      searchLinksWhere();
      wallpaper(GM_getValue('wallpaperImage'));
    } catch(ex) {}
  }

  function onClose() {
    window.removeEventListener('unload', () => onClose());
    window.removeEventListener('resize', () => onResize());
    clearInterval(clockInterval);
    clearInterval(initInterval);
    clearInterval(wallpaperInterval);
  }

  function onResize() {
    let width = (window.innerWidth / 2) - (logoGoogle.clientWidth / 2) + 'px';
    logoGoogle.style = 'left: ' + width;
  }

  function searchLinksWhere() {
    let links = $q('a', true);
    for (let i = 0; i < links.length; i++) links[i].setAttribute('target', GM_getValue('linkTarget'));
  }

  function wallpaper(e) {
    if (e === 0) {
      GM_addStyle(''+
        'body#gWP1 {'+
        '  background: initial !important;'+
        '}'+
      '');
    } else {
      GM_addStyle(''+
        'body#gWP1 {'+
         '  background:  url('+ githubSite + e + '.jpg) no-repeat center / cover !important;'+
        '}'+
      '');
  } }

  function wallpaperButtonChanger(e) {
    let inp = $q('#inputThemer'),
        num1 = parseInt(inp.value),
        sum = parseInt(num1 + 1),
        sub = parseInt(num1 - 1);
    switch (e.target.id) {
      case 'buttonThemer':
        if (inp.value > 50) inp.value = 0;
        else inp.value = sum;
        break;
      case 'buttonDown':
        if (inp.value > 0) inp.value = sub;
        else inp.value = 51;
    }
    GM_setValue('wallpaperImage', inp.value);
    wallpaper(inp.value);
  }

  function wallpaperInputChanger(e) {
    let inp = $q('#inputThemer');
    if (inp.value > 51) inp.value = 51;
    else if (inp.value < 0) inp.value = 0;
    else inp.value = inp.value;
    GM_setValue('wallpaperImage', inp.value);
    wallpaper(inp.value);
  }

  function wallpaperSite() {
    let num = GM_getValue('wallpaperImage');
    wallpaper(num);
  }

  if (!GM_getValue('dateFormat')) GM_setValue('dateFormat', 1);
  if (!GM_getValue('defaultAMPM')) GM_setValue('defaultAMPM', false);
  if (!GM_getValue('defaultDateTimeView')) GM_setValue('defaultDateTimeView', false);
  if (!GM_getValue('defaultSecondsView')) GM_setValue('defaultSecondsView', false);
  if (!GM_getValue('linkTarget')) GM_setValue('linkTarget', '_blank');
  if (!GM_getValue('wallpaperImage')) GM_setValue('wallpaperImage', 0);

  window.addEventListener('load', () => init());
  window.addEventListener('resize', () => onResize());
  window.addEventListener('unload', () => onClose());

  initInterval = setInterval(() => {
    if (!dateTimeContainer || !divThemer || !logoGoogle) init();
    else clearInterval(initInterval);
  }, openInterval);

  GM_addStyle(''+
    'html, body#gWP1 {'+
    '  width: 99.9% !important;'+
    '}'+
    'body#gWP1 {'+
    '  background:  url(' + githubSite + GM_getValue('wallpaperImage') +'.jpg) no-repeat center / cover fixed !important;'+
    '}'+
    '#gWP1 #gb {'+
    '  background: transparent !important;'+
    '}'+
    /*'#gWP1 #gb > div {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  border-radius: 16px !important;'+
    '  padding: 0 4px 0 0 !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+*/
    /*'#gWP1 #gb > div > a,'+*/
    '#gWP1 > div:nth-child(9) > div,'+
    '#gWP1 #gb > div > div.gb_Qe > div.gb_3c > div.gb_cd.gb_0.gb_I,'+
    '#gWP1 .o3j99.LLD4me.LS8OJ,'+
    '#gWP1 .vcVZ7d,'+
    '#gWP1 input[name="btnI"],'+
    '#gWP1 .nDcEnd,'+
    '#gWP1 .goxjub,'+
    '#gWP1 > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf.emcav > div.RNNXgb > div > div.dRYYxd > div.XDyW0e,'+
    '#gWP1 promo-middle-slot > div,'+
    '#gWP1 .KxwPGc {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 > .gb_l,'+
    '#gWP1 .MV3Tnb {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 #dateTimeContainer {'+
    '  display: inline-flex !important;'+
    '  left: 13px !important;'+
    '  position: absolute !important;'+
    '  top: 12px !important;'+
    '}'+
    '#gWP1 #imageCalendar {'+
    '  cursor: pointer !important;'+
    '  margin: 0 !important;'+
    '  position: relative !important;'+
    '  top: -1px !important;'+
    '}'+
    '#gWP1 #dateTimeContainer > #dateTime {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 8px !important;'+
    '  box-shadow: none !important;'+
    '  color: #FFF !important;'+
    '  cursor: pointer !important;'+
    '  font: 14px monospace !important;'+
    '  padding: 5px 8px 0 8px !important;'+
    '  position: relative !important;'+
    '  top: -1px !important;'+
    '}'+
    '#gWP1 #imageCalendar:hover + #dateTime {'+
    '  background: #900 !important;'+
    '  border-color: #C00 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #dateTimeContainer > #dateTime:hover {'+
    '  background: #181A1B !important;'+
    '  border: 1px solid #000 !important;'+
    '}'+
    '#gWP1 #logoGoogle {'+
    '  position: absolute !important;'+
    '  top: 0 !important;'+
    '}'+
    '#gb > div.gb_M.gb_0.gb_Mf.gb_Tf {'+
    '  margin-top: 12px !important;'+
    '}'+
    '#gWP1 #themerDiv {'+
    '  display: inline-block !important;'+
    '  margin: 14px 2px 0 10px !important;'+
    '}'+
    '#gWP1 #buttonThemer,'+
    '#gWP1 #inputThemer {'+
    '  border: none !important;'+
    '  color: #FFF !important;'+
    '  opacity: .7 !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 #buttonThemer {'+
    '  background-repeat: no-repeat !important;'+
    '  background-position: right !important;'+
    '  margin: 0 !important;'+
    '  width: 110px !important;'+
    '}'+
    '#gWP1 #inputThemer {'+
    '  background: transparent !important;'+
    '  text-align: center !important;'+
    '  width: 22px !important;'+
    '}'+
    '#gWP1 #buttonDown {'+
    '  background: transparent !important;'+
    '  background-repeat: no-repeat !important;'+
    '  border: none !important;'+
    '  color: #FFF !important;'+
    '  opacity: .7 !important;'+
    '  cursor: pointer !important;'+
    '  height: 10px !important;'+
    '  margin: 0 0 0 3px !important;'+
    '  position: relative !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '  width: 11px !important;'+
    '}'+
    '#gWP1 #buttonThemer:hover,'+
    '#gWP1 #buttonDown:hover {'+
    '  opacity: 1 !important;'+
    '  cursor: pointer !important;'+
    '}'+
    '#gWP1 #inputThemer:hover,'+
    '#gWP1 #inputThemer:focus-within {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 #inputThemer::-webkit-inner-spin-button,'+
    '#gWP1 #inputThemer::-webkit-outer-spin-button,'+
    '#gWP1 #inputThemer::-webkit-inner-spin-button,'+
    '#gWP1 #inputThemer::-webkit-outer-spin-button {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 .om7nvf {'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 form {'+
    '  margin-top: 156px !important;'+
    '}'+
    '#gWP1 .gb_Vd.gb_Xa.gb_Kd {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  border-radius: 10px !important;'+
    '  padding-left: 0 !important;'+
    '}'+
    '#gWP1 .gb_A:hover > .gb_Ue {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .gb_Ma.gb_gd.gb_lg.gb_f.gb_zf {'+
    '  left: -4px !important;'+
    '  margin-right: 6px !important;'+
    '  padding: 0 !important;'+
    '  position: relative !important;'+
    '}'+
    '#gWP1 .gb_Vd {'+
    '  padding: 0 8px 0 4px !important;'+
    '}'+
    '#gWP1 #gbwa {'+
    '  margin: 0 -4px 0 -11px !important;'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 .gb_0c {'+
    '  margin-right: -10px !important;'+
    '}'+
    '#gWP1 .o3j99.LLD4me.yr19Zb.LS8OJ {'+
    '  margin-top: -90px !important;'+
    '}'+
    '#gWP1 .k1zIA.rSk4se {'+
    '  margin: auto !important;'+
    '  text-align: center !important;'+
    '}'+
    '#gWP1 .iblpc {'+
    '  opacity: 0 !important;'+
    '}'+
    '#gWP1 .ACRAdd {'+
    '  border: none !important;'+
    '}'+
    '#gWP1 .RNNXgb {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  max-width: 200px !important;'+
    '  text-align: center !important;'+
    '}'+
    '#gWP1 .RNNXgb,'+
    '#gWP1 #gSearch {'+
    '  border: 1px solid transparent !important;'+
    '  box-shadow: none !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 .RNNXgb textarea.gLFyf {'+
    '  color: #FFF !important;'+
    '  max-width: 130px !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover,'+
    '#gWP1 .RNNXgb:focus-within,'+
    '#gWP1 .RNNXgb:hover .gLFyf,'+
    '#gWP1 .RNNXgb:focus-within .gLFyf {'+
    '  filter: brightness(1.5) !important;'+
    '  margin: auto !important;'+
    '  max-width: 584px !important;'+
    '  text-align: left !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover .iblpc,'+
    '#gWP1 .RNNXgb:focus-within .iblpc {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover,'+
    '#gWP1 .RNNXgb:focus-within,'+
    '#gWP1 #gSearch:hover,'+
    '#gWP1 #submit:hover,'+
    '#gWP1 center > input:hover {'+
    '  background: rgba(0, 0, 0, .5) !important;'+
    '  border-color: #777 !important;'+
    '  color: #FFF !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover .iblpc,'+
    '#gWP1 .RNNXgb:focus-within .iblpc {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 .RNNXgb .Gdd5U {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover .Gdd5U,'+
    '#gWP1 .RNNXgb:focus-within .Gdd5U {'+
    '  display: block !important;'+
    '}'+
    '#gWP1 #gSearch {'+
    '  border-radius: 8px !important;'+
    '  max-height: 36px !important;'+
    '  text-decoration: none !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 center > input,'+
    '#gWP1 center > span {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 4px !important;'+
    '  color: #999 !important;'+
    '  cursor: pointer !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '  width: auto !important;'+
    '}'+
    '#gWP1 center > input {'+
    '  height: 32px  !important;'+
    '  padding: 0 15px !important;'+
    '}'+
    '#gWP1 center > span {'+
    '  padding: 7px 0 !important;'+
    '}'+
    '#gWP1 center > span:hover {'+
    '  border: 1px solid #666 !important;'+
    '}'+
    '#gWP1 #gbqfbb,'+
    '#gWP1 .XDyW0e,'+
    '#gWP1 .cF4V5c g-menu-item:nth-child(8) {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover .XDyW0e,'+
    '#gWP1 .RNNXgb:focus-within .XDyW0e {'+
    '  display: block !important;'+
    '}'+
    '#gWP1 .ErsxPb.dPaec,'+
    '#gWP1 .EpPYLd.GZnQqe.LGiluc {'+
    '  border: none !important;'+
    '}'+
    '#gWP1 .o3j99.c93Gbe {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 .KxwPGc.SSwjIe > div {'+
    '  background: rgba(0, 0, 0, .3) !important;'+
    '  border-radius: 10px !important;'+
    '  min-width: 32px !important;'+
    '  padding: 0 4px !important;'+
    '}'+
    '#gWP1 .ayzqOc.pHiOh {'+
    '  color: #999 !important;'+
    '  padding-right: 15px !important;'+
    '  text-decoration: none !important;'+
    '}'+
    '#gWP1 .ayzqOc.pHiOh:hover {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .EwsJzb.sAKBe.B8Kd8d {'+
    '  border: 1px solid #666 !important;'+
    '  margin: 5px 0 0 79px !important;'+
    '}'+
    '#gWP1 .xtSCL {'+
    '  margin: 0 !important;'+
    '}'+
    '#gWP1 .o3j99.n1xJcf.Ne6nSd a,'+
    '#gWP1 .o3j99.n1xJcf.Ne6nSd svg {'+
    '  color: #CCC !important;'+
    '}'+
    '#gWP1 .o3j99.n1xJcf.Ne6nSd a:hover,'+
    '#gWP1 .o3j99.n1xJcf.Ne6nSd svg:hover {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .UjBGL.pkWBse.iRQHZe {'+
    '  background: transparent !important;'+
    '  margin: 0 0 0 36px !important;'+
    '}'+
    '#gWP1 .cF4V5c.yTik0.wplJBd.PBn44e.iQXTJe {'+
    '  background: rgb(26, 28, 29) !important;'+
    '  border: 1px solid #666 !important;'+
    '  border-radius: 6px !important;'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 .cF4V5c g-menu {'+
    '  padding-bottom: 0 !important;'+
    '}'+
    '#gWP1 .cF4V5c g-menu-item:nth-child(6) span {'+
    '  line-height: 30px !important;'+
    '}'+
    '#gWP1 .cF4V5c g-menu-item:nth-child(6) {'+
    '  margin-bottom: -5px !important;'+
    '}'+
    '#gWP1 g-menu-item:hover {'+
    '  background: #333 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 g-menu-item:first-of-type {'+
    '  border-radius: 6px 6px 0 0 !important;'+
    '}'+
    '#gWP1 g-menu-item:nth-child(6) {'+
    '  border-radius: 0 0 6px 6px !important;'+
    '}'+
    '#gWP1 g-menu-item.EpPYLd.GZnQqe.LGiluc:hover {'+
    '  background: none !important;'+
    '}'+
    '#gWP1 #gb > div > div[style*="width: 370px; z-index: 991; height: 470px"] {'+
    '  height: calc(-86px + 100vh) !important;'+
    '  margin-top: 49px !important;'+
    '}'+
    '#gWP1 .pHiOh,'+
    '#gWP1 a.gb_C {'+
    '  padding-right: 0px !important;'+
    '}'+
    '#gWP1 a.gb_d.gb_Aa.gb_D {'+
    '  margin-left: 0px !important;'+
    '}'+
    '#gWP1 #gbwa > div > a:hover > svg {'+
    '  fill: #FFF !important;'+
    '}'+
    '#gWP1 .pHiOh {'+
    '  padding-right: 0px !important;'+
    '  position: relative !important;'+
    '  top: 0 !important;'+
    '}'+
    '#gWP1 a.pHiOh::before {'+
    '  content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAOdJREFUOE+lkj1ywjAQhb/X4yqhg5ukCCWuMgMl3ME5CblDKKFNyuQOOULogAr6TcRIHlnYHnusSj+rb9/bXREtM5sAS+AJeADOQCHpEMfFe4WDma2A94bAtaRt3dsNkHzOgZ8o+NfvayHyskPQWNIpsfUIHP3dNLXjALv/jAvg7jGy52rjkuwluRqVywG+gOeOgG9JsxQwWEEBbIBc0mddpc1sDnwAr5LeUgXBn7vvX8TBbew6SL5TL5LK4XN/K4e2UTYzC8liSAXQNO/e5gi4RDGZpGtnQCOkLWtDSytKeimICh4g2R8nwnUfSvaudQAAAABJRU5ErkJggg==) !important;'+
    '  position: relative !important;'+
    '  top: 3px !important;'+
    '}'+
    '#gWP1 .lJ9FBc {'+
    '  background: transparent !important;'+
    '}'+
    '#gWP1 > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div.SDkEP {'+
    '}'+
    '#gWP1 > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div.SDkEP > div.fM33ce.dRYYxd > button {'+
    '  display: none !important;'+
    '}'+
  '');

})();
