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

  const openInterval = 200,
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
        wallpaperImageText = 'Wallpaper Image',
        customFormatText = 'Add a custom format in script line ',
        hideShowText = bullet + ' Left-click to Hide/Show Date/Time\n' + bullet + ' Shift + Left-click for link targets of "_blank"\n' + bullet + ' Ctrl + Left-click for link targets of "_self"',
        switchLogo = 'Switch Logo Images',
        inputTooltip = '0 - 52',
        placeHolderText = 'Search Look-up',
        githubSite = 'https://raw.githubusercontent.com/Razzano/My_Wallpaper_Images/master/image',
        aURL = 'https://raw.githubusercontent.com/Razzano/My_Images/master/',
        downArrow = aURL + 'downArrow5.png',
        upArrow = aURL + 'upArrow5.png',
        image1 = aURL + 'logoGoogle.png',
        image2 = aURL + 'imageGoogle.png',
        image3 = aURL + 'World.png',
        image4 = aURL + 'search8.png',
        image5 = aURL + 'googleLogo11.png',
        image6 = aURL + 'googleLogo12.png',
        image7 = aURL + 'lightbulb.png',
        image8 = aURL + 'manSearching3.png',
        image9 = aURL + 'googleLogo15.png',
        image10 = aURL + 'googleLogo17.png',
        image11 = aURL + 'flag.png',
        image12 = aURL + 'face.png',
        imgCalendar = aURL + 'imageCalendar.png',
        imgClock16 = aURL + 'imageClock16.png',
        imgClock32 = aURL + 'imageClock32.png',
        gear24 = aURL + 'gear.png',
        gear32 = aURL + 'gear32.png',
        google32 = aURL + 'google32.png',
        logoOff32 = aURL + 'logoOff32.png',
        logoOn32 = aURL + 'logoOn32.png',
        off32 = aURL + 'off32.png',
        on32 = aURL + 'on32.png',
        off40 = aURL + 'off40.png',
        on40 = aURL + 'on40.png',
        smiley24 = aURL + 'smiley24.png',
        smiley32 = aURL + 'smiley32.png',
        star24 = aURL + 'star24.png',
        star24w = aURL + 'star24w.png',
        star32 = aURL + 'star32.png',
        star46 = aURL + 'star46.png',
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
        placeHolder = $q('html[itemtype="http://schema.org/WebPage"] #APjFqb'),
        imageCalendar = $c('img', {id: 'imageCalendar', src: imgCalendar, title: hideShowText, onmousedown: e => dateTimeToggle(e)}),
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
        divThemer = $c('div', {id: 'themerDiv'}),
        btnThemer = $c('button', {id: 'buttonThemer', innerHTML: wallpaperImageText, style: 'background-image: url('+ upArrow +') !important;', title: changeWallpaperTooltip, onclick: e => wallpaperButtonChanger(e)}),
        inpThemer = $c('input', {id: 'inputThemer', type: 'number', value: GM_getValue('wallpaperImage'), title: inputTooltip, oninput: e => wallpaperInputChanger(e)}),
        btnDown = $c('button', {id: 'buttonDown', style: 'background-image: url('+ downArrow +') !important;', title: '', onclick: e => wallpaperButtonChanger(e)}),
        divLogo = $c('div', {id: 'divLogo'}),
        labelLogo = $c('label', {id: 'labelLogo', innerHTML: 'Logo Changer'}),
        upLogo = $c('button', {id: 'upLogo', style: 'background-image: url('+ upArrow +') !important;', title: '', onclick: e => logoClick(e.target.id)}),
        inpLogo = $c('input', {id: 'inpLogo', type: 'number', value: GM_getValue('logoImageNum')}),
        dnLogo = $c('button', {id: 'dnLogo', style: 'background-image: url('+ downArrow +') !important;', title: '', onclick: e => logoClick(e.target.id)});

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
    let dupe = document.getElementsByClassName(className);
    if(dupe.length > 1) for(let i = 1; i < dupe.length; i++) dupe[i].parentNode.removeChild(dupe[i]);
  }

  function init() {
    window.removeEventListener('load', () => init());
    if (!body) return;
    body.id = 'gWP1';
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
    dateTime.title = addRemoveText;
    dateTimeContainer.appendChild(imageCalendar);
    dateTimeContainer.appendChild(dateTime);
    divThemer.appendChild(btnThemer);
    divThemer.appendChild(inpThemer);
    divThemer.appendChild(btnDown);
    divLogo.appendChild(labelLogo);
    divLogo.appendChild(upLogo);
    divLogo.appendChild(inpLogo);
    divLogo.appendChild(dnLogo);
    header.insertBefore(dateTimeContainer, header.firstChild);
    insertAfter(divThemer, dateTimeContainer); // adjusted order
    insertAfter(divLogo, divThemer);
    placeHolder.placeholder = placeHolderText;
    inpThemer.value = GM_getValue('wallpaperImage');
    applyLogo(num);
    const input = $q('#inpLogo');
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
    let date = new Date(),
        dt = date.getDate(),
        dy = date.getDay(),
        hr = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds(),
        mth = date.getMonth(),
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
      case 8: return customFormatText + 240;
      case 9: return customFormatText + 241;
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

  function applyLogo(num) {
    const input = $q('#inpLogo');
    if (num === 13) {
      GM_addStyle(`
        #gWP1 #LS8OJ { display: block !important; }
        #gWP1 form { margin-top: -86px !important; }
        #gWP1 #logoGoogle, #gWP1 .logo { display: none !important; }
      `);
      if (input) input.value = 13;
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
    if (id === 'upLogo') {
      next = (current % 13) + 1;
    } else if (id === 'dnLogo') {
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
      let getLogo = $q('#logoGoogle'),
          setLeft = (window.innerWidth / 2) - (getLogo.width / 2) + 'px';
      getLogo.style = 'left: ' + setLeft;
    } catch(ex) {}
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
        if (inp.value > 51) inp.value = 0;
        else inp.value = sum;
        break;
      case 'buttonDown':
        if (inp.value > 0) inp.value = sub;
        else inp.value = 52;
    }
    GM_setValue('wallpaperImage', inp.value);
    wallpaper(inp.value);
  }

  function wallpaperInputChanger(e) {
    let inp = $q('#inputThemer');
    inp.value = inp.value % 52;
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
  if (!GM_getValue('logoImageNum')) GM_setValue('logoImageNum', 1);
  if (!GM_getValue('wallpaperImage')) GM_setValue('wallpaperImage', 0);

  window.addEventListener('load', () => init());
  window.addEventListener('resize', () => onResize());
  window.addEventListener('unload', () => onClose());

  if (!initInterval) {
    initInterval = setInterval(() => {
      if (dateTimeContainer && divThemer) {
        clearInterval(initInterval);
        initInterval = null;
      } else {
        init();
      }
    }, openInterval);
  }

  GM_addStyle(`
    #gWP1 > div.L3eUgb > div.o3j99.n1xJcf.CoM3Df > a.w5hRs,
    #gWP1 #gb > div.gb_Q.gb_6.gb_Vf.gb_3f > div:nth-child(2) > a,
    #gWP1 #gb > div.gb_Ad.gb_6.gb_L,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.AghGtd,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.ssOUyb,
    #gWP1 > div.L3eUgb > div:nth-child(13) > div > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > a,
    #gWP1 > div.L3eUgb div.RNNXgb div.fzj3ad {
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
      margin-left: 3px !important;
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
    #gWP1 #buttonLogo {
      cursor: pointer !important;
      height: 28px !important;
      margin: 10px !important;
      opacity: .7 !important;
      width: 28px !important;
    }
    #gWP1 #buttonLogo:hover {
      opacity: 1 !important;
    }
    #gWP1 form {
      margin-top: 210px !important;
    }
    #gWP1 #themerDiv {
      height: 32px !important;
      margin-top: 10px !important;
    }
    #gWP1 #themerDiv * {
      background: transparent !important;
      border: none !important;
      color: #FFF !important;
      font: 20px monospace !important;
      opacity: .7 !important;
      text-shadow: 1px 1px 2px #000 !important;
    }
    #gWP1 #buttonThemer {
      background-position: bottom 6px right !important;
      background-repeat: no-repeat !important;
      width: 224px !important;
    }
    #gWP1 #inputThemer {
      text-align: center !important;
      width: 34px !important;
    }
    #gWP1 #buttonDown {
      background-position: center !important;
      background-repeat: no-repeat !important;
      cursor: pointer !important;
      height: 15px !important;
      margin-left: 0px !important;
      margin-right: 14px !important;
      position: relative !important;
      top: 2px !important;
      width: 21px !important;
    }
    #gWP1 #buttonThemer:hover,
    #gWP1 #buttonDown:hover {
      opacity: 1 !important;
      cursor: pointer !important;
    }
    #gWP1 #inputThemer:hover,
    #gWP1 #inputThemer:focus-within {
      opacity: 1 !important;
    }
    #gWP1 #divLogo {
      height: 32px !important;
      margin: 8px 0px 0px 10px !important;
    }
    #gWP1 #labelLogo {
      font: 20px monospace !important;
      opacity: .8 !important;
    }
    #gWP1 #upLogo {
      margin: 0px 10px !important;
    }
    #gWP1 #upLogo,
    #gWP1 #dnLogo {
      height: 15px !important;
      opacity: .6 !important;
      width: 21px !important;
    }
    #gWP1 #inpLogo {
      background: #000 !important;
      border: 1px solid #FFF !important;
      height: 22px !important;
      padding-top: 4px !important;
      position: relative !important;
      text-align: center !important;
      top: -1px !important;
      width: 24px !important;
    }
    #gWP1 ::-webkit-inner-spin-button,
    #gWP1 ::-webkit-outer-spin-button,
    #gWP1 ::-webkit-inner-spin-button,
    #gWP1 ::-webkit-outer-spin-button {
      display: none !important;
    }
    #gWP1 #dnLogo {
      margin: 0px 10px !important;
      position: relative !important;
      top: 2px !important;
    }
    #gWP1 #upLogo:hover,
    #gWP1 #dnLogo:hover {
      opacity: 1 !important;
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
