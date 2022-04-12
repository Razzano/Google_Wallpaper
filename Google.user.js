// ==UserScript==
// @name         Google w/Wallpaper
// @namespace    srazzano
// @version      1.0.1
// @description  Layout and Theme
// @author       Sonny Razzano a.k.a. srazzano
// @match        https://*.google.com/*
// @icon         https://raw.githubusercontent.com/srazzano/Images/master/googleicon64.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {

  'use strict';

  const body = $q('html[itemtype="http://schema.org/WebPage"] > body'),
        signIn = $q('html[itemtype="http://schema.org/WebPage"] a.gb_1.gb_2.gb_9d.gb_9c'),
        div1 = $q('html[itemtype="http://schema.org/WebPage"] .o3j99.LLD4me.LS8OJ'),
        div2 = $q('html[itemtype="http://schema.org/WebPage"] .gb_Wd.gb_Za.gb_Ld > .gb_Se'),
        center = $q('html[itemtype="http://schema.org/WebPage"] .FPdoLc.lJ9FBc > center'),
        form = $q('html[itemtype="http://schema.org/WebPage"] .L3eUgb form'),
        settingsBtn = $q('html[itemtype="http://schema.org/WebPage"] div.o3j99.c93Gbe > div.KxwPGc.SSwjIe > div.KxwPGc.iTjxkf > span'),
        placeHolder = $q('html[itemtype="http://schema.org/WebPage"] input[name="q"]'),
        searchButton = $q('html[itemtype="http://schema.org/WebPage"] input[name="btnK"]'),
        divHeader = $c('div', {id: 'headerButtonsDiv'}),
        imgCalendar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABT0lEQVR42mNkAAKp9Iv/GYgELMxMYJqZmZHh/mQdRkZSNMPAfwZGMM0IYpFjADJANyCMkIaHocYgahVOA57O0Fv17x8Dw7//IH8ygB37H6qCEcj5s5c1DK8BD6fqrTp+5w9DRP81hsNNOgxyIkwMJ+/+ZQjrvcoANJywAQ+m6K16/O4fg5IYE4N0xiWGvXU6DM5NV8CSRBkA8sLbL/8Z9EouM2yq0GYwVmBmuPrkL4NbC5EueDRNb9XDNwgXPJ6ux3D9KQkG3Jqou+rcg7/gMPAwUmWYncrJcPPZXwaXZiINeDJdbxUjJJ0w/PzDwMDOwsDw+y+Ez8pMRCzcmqyyCpLaGKDpDRWwH+IP+/+TGayGkf0vA6Ncs+3/X39/E52QLh3+uwqZj24AQQA0AM4W23uakVGx1eH/998/SDYApJkB5k2JBguiMxTIAJhmEAAA4quznkbNVyMAAAAASUVORK5CYII=',
        urlCalendar = 'https://calendar.google.com/calendar/u/0/r',
        btnCalendar = $c('button', {id: 'btnCalendar', className: 'hBtn', textContent: 'Calendar', title: urlCalendar, style: 'background: url('+ imgCalendar +') no-repeat 4px center', onclick: () => window.open(urlCalendar, GM_getValue('linksWhere'))}),
        imgChrome = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlklEQVR42rWRPUiCYRDH/8/7RYqWOFRCS1/UbFC2GBWRU4RUBkVDQ7S1hVptlklBWIsgNDVEKtQmRkTY0OIbYW01BxZhgRmp2aNWYj2GBP3hOO6O+90dR8DQyrIzy8rbF2zke46UAySeE4jH4zTKokajgUqpYgNY08bGLfD79/D6msrHoijCbB5BwOcDE2CzW/EXOVdW/wlwPWBops5NzfSRClKbazk8u/kVQBv1hOflbCbDnEhroDU9Bck/ALTZkX7LLAocX8n2DgpZ/AKMHu/rH5IJWSGIqKJGCKkEovf1Dst5wLouih2PjDpJQhV9mcQLSHYYoOg3IZ1O4zFyDHJ7BJ4nEDjkvSQJCKjNhQ1c9Rdov8vAdXAFjShB693FfKgBsafCqNpqYNMcgzpqgShxIBzdkJorPFQE5LS1HUVblxEbjWtfzZ/KQTzdDlSnTvPNhOPgDJlKAUpOxIluHLORHubRvslzaO+Xim8MDpYCcrponcF0uJMNmLqENmb9HTDRZMTD5RTzBG+fG6qXw5+ASn5WTu9OGbH/eUCknAAAAABJRU5ErkJggg==',
        urlChrome = 'https://chrome.google.com/webstore/category/extensions',
        btnChrome = $c('button', {id: 'btnChrome', className: 'hBtn', textContent: 'Chrome Store', title: urlChrome, style: 'background: url('+ imgChrome +') no-repeat 4px center', onclick: () => window.open(urlChrome, GM_getValue('linksWhere'))}),
        imgEarth = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnUlEQVR42m1TTUgUYRh+vvn5ZnZnd2ZnTVk3icTWRPuFIDDtqJUQrKc6ei2CQPDSpUsZgtClLh2kLkkHhWghIToURnVTCDaFWq0Uf3c3dded3Z3p+2bX0a1eZmDm5Xuf53mf93sJ/op7L7easzv26PJmsTe9VfbznBkUc41hecrQhME7V4PfD54nB3+Gnmcnfq4V+3rOBWlzhILKlXzZdvA7ncf4dB6RsDw5ct3o/wfg5lh6riVKY8GAH44DCAJj1oDGcOUQYbk2M48Xn4uYWbTnHw2YrR4AZ46EpXiAFcNxHzc4kCwBx6OAWKVqNXYxnCgkBEIsroTwnr+kCsmu02HKekfAJzDpxC12Qdjrp0AsUqGTmJQWvYBbT3esjqNKGxl69sNZyIRQKAleAZUIuk+qjJ14SihT0t5UAaWije10Dm9mMyDxkV+OLYZqJsFBVErQ2aFCYSBONdfRVAHi36US8OTVMsiV4VVHolotQNUH3S+g64TqgYpCBYQbzBMPxtdALt9fcQRZw042B0kSoWgKa5V4RWeOUTYJyc3smcuBOEniAwPoufvNSW+KKBZKIOyUrMiob6qrKnFcts52H3RNqFFnl4G3H1MgF268niiUjXgRDV4L9YfDkFXZM4QDn40piJiSp2xmJonk14VJcn5gvDkQPZVcW6X0oIma7oNRr7uzc6pJrkYUCIplB+WtRWt7abbNbZaroIFD8fV0yJs/D5/uh9mge83be/IzSVjb65PTjy/1e1f54u33cyL1xVY29kfKwQhjpKydgKG5ntBSCmUrP//uYff+Vd4LrkQ1j/RtrmTprm0yNqnqWgmqmEFdxLB204sJzvzfbeTBPZF8oVHFiPZSf527zlZuI1fILk2V8pnBT2PXatb5D06f/8vKDSZRAAAAAElFTkSuQmCC',
        urlEarth = 'https://earth.google.com/web/@0,-6.8073,0a,22251752.77375655d,35y,0h,0t,0r',
        btnEarth = $c('button', {id: 'btnEarth', className: 'hBtn', textContent: 'Earth', title: urlEarth, style: 'background: url('+ imgEarth +') no-repeat 4px center', onclick: () => window.open(urlEarth, GM_getValue('linksWhere'))}),
        imgMail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABMElEQVR42mN85Wz6nwEIfjEw9MvsPV3EQAT4vYelD0gVgtiMMANA4DMjY9gU3Ygt/PyffjY0NPxD0sMYGrqKSVv7Gnu1TYs3kL8KLoFsAMyQQ9GZm7m5uX+Hhob+a2xsZGRgsGeSlPzMlqQchKIZqwEwQxbbJG9lYHj+B8T/ws3N2m5Y6YWuGWyAU+uX/yv2OWL1K8gguYpzDNg0goDlG3+IASAOLkMEK88z4NIMdwFMEJsh2AyAacYwAARm73cK4/3/fxUOA8KAmlEDEd2AfdU8jHddzEJhhiAZEMbq8me1yYrg/wQNANEwQ6AGgDWDGEQZAIx/5tWrV/8FGQKKBZBmmBixLmAEpkRGLS0txmvXrv2vr6//z8jI+J9oF4Do////g2mYRhgYQgbgAugGAAAzKLYhKvyRPwAAAABJRU5ErkJggg==',
        urlMail = 'https://mail.google.com/mail/ca/u/0/#inbox',
        btnMail = $c('button', {id: 'btnMail', className: 'hBtn', textContent: 'GMail', title: urlMail, style: 'background: url('+ imgMail +') no-repeat 4px center', onclick: () => window.open(urlMail, GM_getValue('linksWhere'))}),
        imgMaps = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACEElEQVR42o2Ty2sTURTGv9kIJZGx4kJUrGhQFELQcSPJygekKYg7l/VNjIsgqAVbF+6s4J/gwrbRYqfRjbErH+hK4zLgwpY4o41CxReMZcjM9d5zcm9GV71w577O9zvfPZexsMa2dOKIEN0IQghAxMg0Xllq31qLePH4YaUCYsEAmkvI09eWtedBmaHgw7g3cphcy8AX7kfK2vz2k4DO4HoCqCBr9/0yhb8ZvoUw7uLQwnUDiKXoOYkFmivf8f7XH4LuSw/gwGCaAZnaBfG2NImDjTE05aja/idXjaNnEmCp7Cs/GCDne+0UHNkJsEsClNBpXCPxu9JtAqjsdI0owsu6xy70FTakaa26tbN2Xmjh/9nVgZdfxlJ1lbIlC6iGzIIs4o6Zc0JXmyVIiDu0241ieJdDsq8zqxegZxyaOdsHiB4gIVa9FdxBEATYePMKA+RzquwE2D59RmiRhviFL0b8e9McPM+j/YGxCgE+VCdQLBYZsG3qtHGgml/omAuNuPOYLcckVpAwDGGPV/H1xiTy+TwDtiYAnwp92yNuHdrabDmi83a7jaB2F+tOjsJxHAZsmTpFcZ8Ly8ZFSYp1MQgnPw8vMqTVaiGVSiGXyzFg871R0TG2pXi+boToibWTuQr/TL7vI5vNMkAsHhP9zI/+EZriJoBuhZ3Ytq0BR+ls2H1sRMlXSV5D79cvRQbwF5scUJszafjwAAAAAElFTkSuQmCC',
        urlMaps = 'https://www.google.com/maps/@36.1489458,-115.0874625,15z?hl=en&authuser=0',
        btnMaps = $c('button', {id: 'btnMaps', className: 'hBtn', textContent: 'GMaps', title: urlMaps, style: 'background: url('+ imgMaps +') no-repeat 4px center', onclick: () => window.open(urlMaps, GM_getValue('linksWhere'))}),
        imgMSEdge = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKklEQVR42mN876/4nwEP6M96hE+agXHUgGFhAPOSd3gN+CEkNmrA8DcAAKkTP3nVsyb/AAAAAElFTkSuQmCC',
        urlMSEdge = 'https://www.microsoft.com',
        btnMSEdge = $c('button', {id: 'btnMSEdge', className: 'hBtn', textContent: 'MS Store', title: urlMSEdge, style: 'background: url('+ imgMSEdge +') no-repeat 4px center', onclick: () => window.open(urlMSEdge, GM_getValue('linksWhere'))}),
        imgNews = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAClElEQVR42o2SW0gUURjH/2cua2tby0CieYtatQyMLiBEFFmEBBFImClWREHh0lsERWJaKUFZSaAvgtFLYIH2EBUmJqwrJkpQCEUZ3toEV8fLuDPOzOnMzrTsZg8dOHO+c+b8f9/lfARxI/9GKcUWCSYoKAUINbGOqJCpAJ0SmOyQ+xLG6L2X5I+GxAN8DyopSfOAY8JUKKiSfuCoZwylU4X4rK1nABMILSJ09fm/AbmNFdSXxeNZej/cUCESHWCi6eEUtE9sRUu2GzOygtC1F6sBl8p89L4fSBY0tqPOZB5Z2GaEIPw4D1gBZJFH6+QsGgaGo1rS2eijRTsN3P3+BOGV1CjMyt8CUMe2IjfmRVDD2lNsWA7hysfrmDENkMG2dLojR8SFoQAWDCkGcBgx21qtIlq2R5PR1FeBoDwPUlWWSR9e5nB+qA8Lug3gWHCGIyZOolEQ++gsmrWqDaifnLb/y++yqP9TEEumhOICAWf3iwh+NdD0VsPFQy4c3M5HwRqr6elmBS5FxqNAOTJe95IooLs5m7aqAWzblIJzB0Q0dChITuIw8pOFm2QiSbC9G6wXwksEbpZC7fuTKOgK2IA9u3w090wPbpeno2NQYx5FpHkJRqZMLEYo9uUJsaeeCJu49fQXTr0pQVlggMSe8Vj9BK0sSsFGL4eWrmUc3y2C5zm0f9DhFp1CsvwXVbYuzKGzJoMk9EFx3Th1eyTUlIjwJgssXBPV7SpOFLqwN8euwQp7Rn/bMqDM4dXNzETAkdpxKrglCBwgsPu6YU+e2bxzy2QRqNa5MovuuqzVAH6NFN/ZTkPF9YRzpkdm0fM34HD1KAN4EwFxwvgG0yMyeu9sTgRk+/Ip4V34n0ENDWPfRqLa3wYbMFCh4PdOAAAAAElFTkSuQmCC',
        urlNews = 'https://news.google.com/topstories?hl',
        btnNews = $c('button', {id: 'btnNews', className: 'hBtn', textContent: 'News', title: urlNews, style: 'background: url('+ imgNews +') no-repeat 4px center', onclick: () => window.open(urlNews, GM_getValue('linksWhere'))}),
        imgPhotos = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5ElEQVR42mNkIABeOZv+B1JhYntPr8Ymz0ikASCwGmhIGCUGYDUExYCvO1hDgRQIr+b2+L0a3YB/QMyE5h1GJM2roJrhtgENCUM24D9EA4orGHFohoGwr90Gq2Ccb//+M3AxMaK6AOrsVQzYwWqgASiuwggDoAH/GfAAoAFgjVDNGFGJNRZMVgTDAjOU7+5CvLHEiEUzSngADViNI3zAYcSIphkjPIAGhOEIo9X7qnkwDMCIjTMRaxmdWr9gRDFIM4YXsLkAZACIBhoCT2RAzZgJCZcrYAYQHYjohpBlALJ3CBkAAL5FbdsK51LmAAAAAElFTkSuQmCC',
        urlPhotos = 'https://photos.google.com/?pageId=none',
        btnPhotos = $c('button', {id: 'btnPhotos', className: 'hBtn', textContent: 'Photos', title: urlPhotos, style: 'background: url('+ imgPhotos +') no-repeat 4px center', onclick: () => window.open(urlPhotos, GM_getValue('linksWhere'))}),
        imgPlay = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzklEQVR42pWTvUscQRjGn3dm78RwfqGYcLn6hGskVSCFjYVcc1Zu/oH0VtqEI4VNCsWQnGgsJNi5JxY2KuJ3DisRAzGQFLGJFhaxSCKsuzO+M3uai1nFG5hi3o/fPM87uyTWfw2g+bPXnFrAWWvg4tFYGXUssgDAo2wR0tcIk4QwM051ATRJj1QI6ipCSUCTMLl7qbEA1cAAzSefA7khKCSqaaZB3wmKFKSkpy/4wBDyQyD3kiHiuiiHhzjEaSwoUtAkWAHBQrgfvHV6Dmg5+Kf468k+sk826X9Ai/SgNUjVQAJjZ5iVOKwlwLPz31g9moFu4LiE2/gU5b+AdgaYJlUDsXaYkiti8WgFvedf7I3a4XjSdNoRuRGgwygwAI4HpgrXSuY/DCH/vBQ11QIce4wAupMBJln1f6Wk/P41+j59ZHcEerEHp+vnFeCGhTQ/Y1C9oQrpPv6OrVeDNpZwlBkR5OgaGnsQM8THkQViC5pBs9NjyO9UICQ/Jg/DESFCJdzWvdVbnjETWTAzmHzzFv2VbSSEguQthIptjAVMld6hsLFlEw+Sfpkb3ft9yhnypkoT6Fuu4EL7yH5bqu9nKvzY9cZHSmhr+nOn3Lh1CbI13UN9EkzxAAAAAElFTkSuQmCC',
        urlPlay = 'https://play.google.com/store/apps',
        btnPlay = $c('button', {id: 'btnPlay', className: 'hBtn', textContent: 'Play Store', title: urlPlay, style: 'background: url('+ imgPlay +') no-repeat 4px center', onclick: () => window.open(urlPlay, GM_getValue('linksWhere'))}),
        imgPodcasts = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdElEQVR42mNkwAN+72H5D6JZXf4w4lLDOPgMeOVs+l9s72msGkxWBP8/E7GWEacBIM0gGmYAugtABoBoZEOoY4BT65f/+6p5GAkZgAxgehhBDJAAMQYguwCmj3IDkJ1DKBrRDQB7YXDEAtUSEqEwwAYG3gAAuNudhTC8LbkAAAAASUVORK5CYII=',
        urlPodcasts = 'https://podcasts.google.com/',
        btnPodcasts = $c('button', {id: 'btnPodcasts', className: 'hBtn', textContent: 'Podcasts', title: urlPodcasts, style: 'background: url('+ imgPodcasts +') no-repeat 4px center', onclick: () => window.open(urlPodcasts, GM_getValue('linksWhere'))}),
        imgTranslate = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACM0lEQVR42oWTz2sTQRTHvzOzWxrzY1uNpoGKTYkHhdZLaa1VUTCKNhZtTEU8+uOmtCcVvXgRUWulB/8FIaVe/AWeBC8KogdFRCUUS4n4o5q0S9TN7vpmdhuSFtLHzrzdZd7nve+8GZa5Y+YYnKzrAg7IXPVAfmuCj0yPBqfQwFhmYsFljHtBywCCY4oAIw0BwzWA2mDpHauEBxfirCHgqA/wCPUAOfWE3qAzNAshGA0Bh3Q6NDHm0jpGgNseYH0YOLXLQjQIFIrA+FMdFVrcYZg43fcTa1sjBKBKXS+T9Ap0hAAAx+VBC4/fCrz+whFuBkplrxJOmca259EWDSAcWkOZWT1gaNyrYPLEP5y/14R9Wxykttqo2MCl+7qSkk4WsKPzLyanH+Hq2ZNV/bZtE+CWB7iStvDkncCrGY7ehIOBpEMyNLUPBptDV+glNE3Aph/zCyY2xqIY2tkDdtgHbIgAZ2gPYgbwvcRw95lQXlYgmIOD8efoSsaQnysg2mqge3PCk5C+WdPGJavriKv8/vY8fnx9gUBzE46nBqgaTXWFDd7w27gyvhosp47IPILFh2gxgji2tw+6rqsNZYeWAaptqqHJd44KRns/omyZeD8zi8yefnBOAHkXzD92dmV2OmVMDg6fid2J3xjuXsS3X0W0rWvxJDQ6pgeuL0pwzv+cuNj/eSweCygw59yTgFXMh2TPbfuQ3dQeUK2UpUuAugurAZYg11KfcrquKYDKTMM0y/gPuRvvNRWbsbkAAAAASUVORK5CYII=',
        urlTranslate = 'https://translate.google.com/?hl=en',
        btnTranslate = $c('button', {id: 'btnTranslate', className: 'hBtn', textContent: 'Translate', title: urlTranslate, style: 'background: url('+ imgTranslate +') no-repeat 4px center', onclick: () => window.open(urlTranslate, GM_getValue('linksWhere'))}),
        imgYouTube = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAX0lEQVR42s2SwQoAIQhEx2t9X37k9n91NBGWTkE1sOxchHBeoyggJf8AGPB4KYfe6maVS/OEWAQgRlgCzJ9V/Y9KAF7lDLRGAKJTCEBKQO9f72BT/B1EWuYSmfgxAgsYuQErVcPEBlcAAAAASUVORK5CYII=',
        urlYouTube = 'https://www.youtube.com/?gl=US',
        btnYouTube = $c('button', {id: 'btnYouTube', className: 'hBtn', textContent: 'YouTube', title: urlYouTube, style: 'background: url('+ imgYouTube +') no-repeat 4px center', onclick: () => window.open(urlYouTube, GM_getValue('linksWhere'))}),
        imgYouTubeTV = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAbElEQVR42mNkAIL/DAyrgFQoA2lgNSMDQxgjmZoRhvwHO4B8gNuA/0DhwEAGhg0bKDAABEAGZGUxMDx/TqYBcJWMFLggM5OB4cULeocBkYDydAB2LSUpEZ8KmPcYwQiHFwaPAaTGBsxQig0AAAp6OVWm895eAAAAAElFTkSuQmCC',
        urlYouTubeTV = 'https://tv.youtube.com/library',
        btnYouTubeTV = $c('button', {id: 'btnYouTubeTV', className: 'hBtn', textContent: 'YouTube TV', title: urlYouTubeTV, style: 'background: url('+ imgYouTubeTV +') no-repeat 4px center', onclick: () => window.open(urlYouTubeTV, GM_getValue('linksWhere'))}),
        headerBtnsDiv = $c('div', {id: 'headerBtnsDiv'}),
        headerBtnsCnt = $c('div', {id: 'headerBtnsCnt'}),
        btnClearAll = $c('button', {id: 'btnClearAll', textContent: 'Clear All', onclick: e => clearSelectAll(e)}),
        btnSelectAll = $c('button', {id: 'btnSelectAll', textContent: 'Select All', onclick: e => clearSelectAll(e)}),
        headerBtnCalendarLAB = $c('label', {id: 'labelCalendar', className: 'label'}),
        headerBtnCalendarCB = $c('input', {id: 'headerBtnCalendar', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnCalendar"), onclick: e => displayHdrButtons(e)}),
        headerBtnCalendarSPN = $c('span', {id: 'spanCalendar', className: 'span', textContent: 'Calendar'}),
        headerBtnChromeLAB = $c('label', {id: 'labelChrome', className: 'label'}),
        headerBtnChromeCB = $c('input', {id: 'headerBtnChrome', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnChrome"), onclick: e => displayHdrButtons(e)}),
        headerBtnChromeSPN = $c('span', {id: 'spanChrome', className: 'span', textContent: 'Chrome Store'}),
        headerBtnEarthLAB = $c('label', {id: 'labelEarth', className: 'label'}),
        headerBtnEarthCB = $c('input', {id: 'headerBtnEarth', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnEarth"), onclick: e => displayHdrButtons(e)}),
        headerBtnEarthSPN = $c('span', {id: 'spanEarth', className: 'span', textContent: 'Earth'}),
        headerBtnMailLAB = $c('label', {id: 'labelMail', className: 'label'}),
        headerBtnMailCB = $c('input', {id: 'headerBtnMail', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnMail"), onclick: e => displayHdrButtons(e)}),
        headerBtnMailSPN = $c('span', {id: 'spanMail', className: 'span', textContent: 'GMail'}),
        headerBtnMapsLAB = $c('label', {id: 'labelMaps', className: 'label'}),
        headerBtnMapsCB = $c('input', {id: 'headerBtnMaps', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnMaps"), onclick: e => displayHdrButtons(e)}),
        headerBtnMapsSPN = $c('span', {id: 'spanMaps', className: 'span', textContent: 'GMaps'}),
        headerBtnMSEdgeLAB = $c('label', {id: 'labelMSEdge', className: 'label'}),
        headerBtnMSEdgeCB = $c('input', {id: 'headerBtnMSEdge', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnMSEdge"), onclick: e => displayHdrButtons(e)}),
        headerBtnMSEdgeSPN = $c('span', {id: 'spanMSEdge', className: 'span', textContent: 'MS Store'}),
        headerBtnNewsLAB = $c('label', {id: 'labelNews', className: 'label'}),
        headerBtnNewsCB = $c('input', {id: 'headerBtnNews', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnNews"), onclick: e => displayHdrButtons(e)}),
        headerBtnNewsSPN = $c('span', {id: 'spanNews', className: 'span', textContent: 'News'}),
        headerBtnPhotosLAB = $c('label', {id: 'labelPhotos', className: 'label'}),
        headerBtnPhotosCB = $c('input', {id: 'headerBtnPhotos', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnPhotos"), onclick: e => displayHdrButtons(e)}),
        headerBtnPhotosSPN = $c('span', {id: 'spanPhotos', className: 'span', textContent: 'Photos'}),
        headerBtnPlayLAB = $c('label', {id: 'labelPlay', className: 'label'}),
        headerBtnPlayCB = $c('input', {id: 'headerBtnPlay', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnPlay"), onclick: e => displayHdrButtons(e)}),
        headerBtnPlaySPN = $c('span', {id: 'spanPlay', className: 'span', textContent: 'Play Store'}),
        headerBtnPodcastsLAB = $c('label', {id: 'labelPodcasts', className: 'label'}),
        headerBtnPodcastsCB = $c('input', {id: 'headerBtnPodcasts', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnPodcasts"), onclick: e => displayHdrButtons(e)}),
        headerBtnPodcastsSPN = $c('span', {id: 'spanPodcasts', className: 'span', textContent: 'Podcasts'}),
        headerBtnTranslateLAB = $c('label', {id: 'labelTranslate', className: 'label'}),
        headerBtnTranslateCB = $c('input', {id: 'headerBtnTranslate', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnTranslate"), onclick: e => displayHdrButtons(e)}),
        headerBtnTranslateSPN = $c('span', {id: 'spanTranslate', className: 'span', textContent: 'Translate'}),
        headerBtnYouTubeLAB = $c('label', {id: 'labelYouTube', className: 'label'}),
        headerBtnYouTubeCB = $c('input', {id: 'headerBtnYouTube', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnYouTube"), onclick: e => displayHdrButtons(e)}),
        headerBtnYouTubeSPN = $c('span', {id: 'spanYouTube', className: 'span', textContent: 'YouTube'}),
        headerBtnYouTubeTVLAB = $c('label', {id: 'labelYouTubeTV', className: 'label'}),
        headerBtnYouTubeTVCB = $c('input', {id: 'headerBtnYouTubeTV', className: 'input', type: 'checkbox', checked: GM_getValue("headerBtnYouTubeTV"), onclick: e => displayHdrButtons(e)}),
        headerBtnYouTubeTVSPN = $c('span', {id: 'spanYouTubeTV', className: 'span', textContent: 'YouTube TV'}),
        openInterval = 20,
        themerInterval = 30000,
        timerLong = 10000,
        timerShort = 1000,
        dateTimeFormatCount = 9,
        am = 'AM',
        pm = 'PM',
        bullet = '•',
        comma = ',',
        hyphen = '-',
        slash = '/',
        space = ' ',
        star = '★',
        addRemoveText = bullet + ' Left-click to Add/Remove :seconds\n' + bullet + ' Shift + Left-click to Add/Remove AM/PM\n' + bullet + ' Ctrl + Left-click to change Date format',
        changeWallpaperOffText = 'Change wallpaper: Off',
        changeWallpaperOnText = 'Change wallpaper: On',
        customFormatText = 'Add a custom format in script line ',
        dailyText = 'Daily',
        defaultWallpaperText = 'Static wallpaper image',
        setHeaderButtonsText = 'Set Header Buttons',
        hideShowText = bullet + ' Left-click to Hide/Show Date/Time',
        hourlyText = 'Hourly',
        linksCurrentText = 'Button Links in current tab: True',
        linksNewText = 'Button Links in new tab: True',
        offText = 'Off',
        onText = 'On',
        optionsText = 'Options',
        placeHolderText = 'Search Look-up',
        activeWallpaperTooltip = 'Active wallpaper image',
        buttonSitesTooltip = 'Change between GitHub and Sonco host sites',
        changeImageSiteText = 'Wallpaper host site:',
        closePopupTooltip = 'Close Popup',
        dailyHourlyTooltip = 'Change wallpaper Daily/Hourly',
        defaultWallpaperTooltip = '1 - 35 and 0 for no wallpaper',
        logoCenterTooltip = 'Reposition logo to top-center',
        logoLeftTooltip = 'Reposition Logo to Top-Left',
        settingOffTooltip = 'Setting to Off will enable static wallpaper',
        settingOnTooltip = 'Setting to On will disable static wallpaper',
        DayNameAbbr = 'Sun.,Mon.,Tue.,Wed.,Thu.,Fri.,Sat.',
        daynameabbr = DayNameAbbr.split(','),
        DayName = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
        dayname = DayName.split(','),
        DayNo = '"",01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31',
        dayno = DayNo.split(','),
        DayNum = '"",1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31',
        daynum = DayNum.split(','),
        DayOrd = '"",1ˢᵗ,2ⁿᵈ,3ʳᵈ,4ᵗʰ,5ᵗʰ,6ᵗʰ,7ᵗʰ,8ᵗʰ,9ᵗʰ,10ᵗʰ,11ᵗʰ,12ᵗʰ,13ᵗʰ,14ᵗʰ,15ᵗʰ,16ᵗʰ,17ᵗʰ,18ᵗʰ,19ᵗʰ,20ᵗʰ,21ˢᵗ,22ⁿᵈ,23ʳᵈ,24ᵗʰ,25ᵗʰ,26ᵗʰ,27ᵗʰ,28ᵗʰ,29ᵗʰ,30ᵗʰ,31ˢᵗ',
        dayord = DayOrd.split(','),
        MonthName = 'January,February,March,April,May,June,July,August,September,October,November,December',
        monthname = MonthName.split(','),
        MonthNameAbbr = 'Jan.,Feb.,Mar.,Apr.,May,Jun.,Jul.,Aug.,Sep.,Oct.,Nov.,Dec.',
        monthnameabbr = MonthNameAbbr.split(','),
        MonthNo = '01,02,03,04,05,06,07,08,09,10,11,12',
        monthno = MonthNo.split(','),
        MonthNum = '1,2,3,4,5,6,7,8,9,10,11,12',
        monthnum = MonthNum.split(','),
        githubSite = 'https://raw.githubusercontent.com/srazzano/Images/master/image',
        soncoSite = 'https://sonco.synthasite.com/resources/image',
        googleImage = 'data:image/png;base64,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',
        themeOff = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACE0lEQVR42pWSS4hSYRTHz+QrEV/DmKAoIqi1yIWWu8BVIrgKJHDRqo0Ybdyam1au3AhCtJYZ3YQJEiIItokJcVW5EfGFNk4+8IV6s3M+nIg7d2D6w+E797vn/7vnO/c7Ap4KhYIIl+cYLzEeH7bPMd5jnAUCAe7f+iOe+cF+v/9mt9tBJpOBSCQCfAaJRAK9Xo+Cw72HCPl+DYDmY47jLl0uF4xGI8D8L2C73YLFYoFOpwPdbncpFotNCPnFB6R0Ol0EAxqNBsjlchZkXi6XLNdqtZDNZnsej+cDAl7xARf4lZPZbMa+pFKpmGmz2cBisYDVagVOpxOq1SqYTKYRAnSCgHa7zVo3m83s7CQ6f6vVArfbDaVSCWw2myAghYOLjMdjmM/nrAOFQgG73Q5oj2ai1+uhWCz+8Pl8ZaEjHGPxxXq9vkMGXBmAjCTqRqlUglQqXWNuvDZEUjKZfGS1Ws8nkwlMp1M2QPqldCy1Wk3AXS6Xe5bJZD4K3gOSwWC4F4vFhrjCYDAAo9HIuimXy1/y+fxrLPna7/d/3wggBYPBVDQajdRqNZo4DIdDiMfjL/DVKZq3N97EK/n9/qcI+FSv18HhcECz2YREIvEEzZ/5tYIAbP9uOp1e0SxIGo0GwuHwfQQ0bgUgVSqV/VXu9XrfIPQdAn7+F4CMh/xtKBQ6QcDlrQGoGBkPHfixgyoCFvyiP+nSCSCyiE9MAAAAAElFTkSuQmCC',
        themeOn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACKElEQVR42pWSS2gTURSG/+nEpCE2qWkSQaK0iosRKUSNuinMQmoFKaKCmyKCEsSISzdWQcWNbhSjYhARdKELUapQFZVgu7CtWgR1ELH1EYtNbPNoXm0zif90UpBJlHrgzD1z/3u+OefOEWCwDz0QueyhH6D7K9tD9Gv0O2s6of55XjAkS9phaX2XDY0tgMmmC8UskByF8vpWVoMSolQBmOzkMirJZ+wwvWRYAOqsuljK81FP0GYokWNpvrQQMmkEhKR1HUE4fMDMZX7dA6heXRSjTI4B5kNAahjKm0eXCDhsBMSltlMuCA+R+j4IR1Mj1RW6WP6G1EQSjuUbGW+H0nfiFwHuaoC8z4XMXWDWATTsYNWVFgpsYeo+sCgFLN7FNm7UBISkte5guhDH2Gdg5SpW3OCc02amJjHCvWXcs9e7obyL12zBOT0txr3Nal30ExBLMmGpro2NAx525F0NRL+IJYtFdVddomZnjzZt2LopMVRWS8ix2kQG+GELw2cOwLoEyBXMxe6Lpp1P+nMPas5BxTy958Xx1lYVaQIEQYTVouLkFevA9Xv5I9RfaT/2XwB0bUHo5oXO4NuBHgwWw2h3BtC8G3sp3abP/nUS563Dj/beq77Hz54PY8TOFkoB+A+ijVK/8WxNgDZ25/Yjr3wFMhzIF+/x9Gdi7tY/LhSASCRSno9lWT7OJUyP/RegkqjFpxm7GE4sGEDr1hIrFWzj0kfPGg/9BuI3xhFLjykHAAAAAElFTkSuQmCC',
        imgClock = 'data:image/png;base64,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',
        logoButton = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAs0lEQVR42mNkoDFgHLWAKhY8mCi6CkiFYpEKU8h/vRpJXSgynygLYJpANNSSUGyWQOVXAdmMJFmAzUIsFoWBDAcxKLYAzaJV6OIELbBdcec/PoMPR6jA9WCzhGoWkO0DSoKHahaQAuhvAdD7uOIgDD0TUdMCuOGkpDJiLUBxOS0sIDt4CFkAz/5QALJgNakW4bIApQBDUwK3CFvpSYwFoehFMAP2TAWyJIxkH1AbjFpAEAAARmVuGUdYZKsAAAAASUVORK5CYII=',
        popCloseBtn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAbElEQVR42mNkoANgHLVk1JKBs+Tu3bv/lZWVGcmVJ2gJyAAYG5tBhORJ8gk2g4i1gChLsBlIigVEW4JuESkWkGQJqUE0OH2CzQJSLCIpdQFBGNDQ1UCxUCB7FbEWDZ58QtMcTy0wasmoJbQDAGtLSRok0brUAAAAAElFTkSuQmCC',
        downButton = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAuklEQVR42mNkoAFgHDWUPob+BwJGICCkGZc6XIamAamZ+AwGGQik0oFKZhFrKEj8LRALYjMYauB7IBYGSv8nOkyB+jyA1HawIiSDoQaCgCdQeAfRYYpkwBkgZQwzGMnAs0CuCS59hAzVB1JzYQbDDATiZKChF8kyFGrwSiAVhiS0CmhgOD49xBgqCaSuArEgAyRytIGGPqfIUKjB7UCqAog7gAZWElJPdI4CGrwfaKAjMWqHeN4fOYYCALmCRxW5rmXrAAAAAElFTkSuQmCC',
        upButton = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAsElEQVR42mNkoAFgHDV04Az9////fkZGRkeqGQo0sB1IVQBxB9DgSooNBRooCaSuArEgEL8HYm2gwc8pNXQlkApDEloFNDScbEOBBuoDqblAbIwkfBaIk4EGXyTX0DMwA4GGMAL5/2EGA7kmJBsK1O8BpLbDDEQShxnsCRTeQbShQH0g8bdALIhsIJrBoEgTBnmAWEPTgNRMbAaiGZwOVDKLWEP/4zOQkLphmPeHp6EA2JNHFW0nieAAAAAASUVORK5CYII=',
        optionsBtn = $c('input', {id: 'gOptions', type: 'button', value: optionsText, onclick: e => optionsPopup(e)}),
        optionsPop = $c('div', {id: 'gOptionsPopup', style: 'display: none;'}),
        divButtons = $c('div', {id: 'divButtons', className: 'popDiv'}),
        divLinks = $c('div', {id: 'divLinkss', className: 'popDiv'}),
        divNumber = $c('div', {id: 'divNumbers', className: 'popDiv'}),
        divSites = $c('div', {id: 'divSites', className: 'popDiv'}),
        divThemer = $c('div', {id: 'divThemer', className: 'popDiv'}),
        spanLinks = $c('span', {id: 'spanLinks', className: 'popSpan'}),
        spanNumber = $c('span', {id: 'spanNumber', className: 'popSpan'}),
        spanSites = $c('span', {id: 'spanSites', className: 'popSpan'}),
        spanThemer = $c('span', {id: 'spanThemer', className: 'popSpan'}),
        btnClose = $c('button', {id: 'btnClose', style: 'background: url('+ popCloseBtn +') no-repeat center', onclick: e => optionsPopup(e)}),
        btnClose2 = $c('button', {id: 'btnClose2', style: 'background: url('+ popCloseBtn +') no-repeat center', onclick: e => optionsPopup(e)}),
        themeImage = $c('img', {id: 'themeImage'}),
        logo1 = $c('span', {id: 'logo1'}),
        logo1Btn = $c('input', {id: 'logo1Btn', type: 'image', src: logoButton, title: logoCenterTooltip, onclick: () => repositionLogo()}),
        logo2 = $c('span', {id: 'logo2'}),
        logo2Btn = $c('input', {id: 'logo2Btn', type: 'image', src: logoButton, title: logoLeftTooltip, onclick: () => repositionLogo()}),
        dateTimeContainer = $c('div', {id: 'dateTimeContainer'}),
        btnClock = $c('button', {id: 'gClock', style: 'background: url('+ imgClock +') no-repeat center', title: hideShowText, onmousedown: e => dateTimeToggle(e)}),
        dateTime = $c('span', {id: 'dateTime', onmousedown: e => dateTimeToggleSecondsAmPm(e)}),
        btnThemer = $c('button', {id: 'buttonThemer', onclick: e => wallpaperThemer(e)}),
        btnWhen = $c('button', {id: 'buttonWhen', onclick: e => wallpaperDailyHourly(e)}),
        btnStatic = $c('button', {id: 'buttonStatic', onclick: e => wallpaperButtonChanger(e)}),
        btnUp = $c('input', {id: 'buttonUp', type: 'image', src: upButton, onclick: e => wallpaperButtonChanger(e)}),
        inpStatic = $c('input', {id: 'inputStatic', type: 'number', min: 0, max: 35, oninput: e => wallpaperInputChanger(e)}),
        btnDown = $c('input', {id: 'buttonDown', type: 'image', src: downButton, onclick: e => wallpaperButtonChanger(e)}),
        spnSites = $c('button', {id: 'spanSites', title: buttonSitesTooltip, onclick: e => wallpaperSite(e)}),
        btnSites = $c('button', {id: 'buttonSites', title: buttonSitesTooltip, onclick: e => wallpaperSite(e)}),
        btnSearchLinks = $c('button', {id: 'searchLinks', onclick: e => searchLinksWhere(e)}),
        displayButtons = $c('button', {id: 'displayButtons', textContent: setHeaderButtonsText, onclick: e => setHdrButtons(e)});

  let clockInterval,
      initInterval,
      wallpaperInterval;

  function $c(type, props) {
    let node = document.createElement(type);
    if (props && typeof props == 'object') for (let prop in props) typeof node[prop] == 'undefined' ? node.setAttribute(prop, props[prop]) : node[prop] = props[prop];
    return node;
  }

  function $i(newNode, refNode) {
    if (refNode.nextSibling) return refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    return refNode.parentNode.appendChild(newNode);
  }

  function $q(el, all) {
    if (all) return document.querySelectorAll(el);
    return document.querySelector(el);
  }

  function clearSelectAll(e) {
    let clr = $q('.input', true);
    e.preventDefault();
    switch (e.target.id) {
      case 'btnClearAll':
        for (let i = 0; i < clr.length; i++) {
          clr[i].checked = false;
          GM_setValue(clr[i].id, false);
          let hdrBtn = clr[i].id.replace('headerB', 'b');
          try { document.getElementById(hdrBtn).style.display = 'none'; } catch(ex) {}
        }
        break;
      case 'btnSelectAll':
        for (let i = 0; i < clr.length; i++) {
          clr[i].checked = true;
          GM_setValue(clr[i].id, true);
          let hdrBtn = clr[i].id.replace('headerB', 'b');
          try { document.getElementById(hdrBtn).style.display = 'block'; } catch(ex) {}
          viewHdrButtons();
        }
        break;
  } }

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
        hr12, hr24, ampm;
    if (hr > 12) {hr12 = hr - 12; hr24 = hr}
    else {hr12 = hr; hr24 = hr}
    if (hr < 10) {hr12 = hr; hr24 = '0' + hr}
    if (hr === 0) {hr12 = 12; hr24 = '00'}
    min < 10 ? min = ':0' + min : min = ':' + min;
    if (GM_getValue('defaultSecondsView')) sec < 10 ? sec = ':0' + sec : sec = ':' + sec;
    else sec = '';
    if (GM_getValue('defaultAMPM')) hr < 12 ? ampm = am : ampm = pm;
    else ampm = '';
    switch (int) {
      // RETURN OPTIONS: (w / ww) + (m / mm / mmm / mmmm) + (d / dd / ddd) +  (yy / yyyy) + (hr12 / hr24) + (min) + (sec) + (ampm) special characters: bullet, comma, hyphen, slash, space, star
      case 1: return ww + space + bullet + space + mmmm + space + ddd + comma + space + yyyy + space + star + space + hr12 + min + sec + space + ampm; // Sunday • March 1ˢᵗ, 2021 ★ 12:34 AM
      case 2: return w + space + bullet + space + mmm + space + d + comma + space + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • Mar. 1, 2021 • 12:34 AM
      case 3: return w + space + bullet + space + mmm + space + dd + comma + space + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • Mar. 01, 2021 • 12:34 AM
      case 4: return w + space + bullet + space + m + hyphen + d + hyphen + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • 3-1-2021 • 12:34 AM
      case 5: return w + space + bullet + space + mm + hyphen + dd + hyphen + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • 03-01-2021 • 12:34 AM
      case 6: return w + space + bullet + space + m + slash + d + slash + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • 3/1/2021 • 12:34 AM
      case 7: return w + space + bullet + space + mm + slash + dd + slash + yyyy + space + bullet + space + hr12 + min + sec + space + ampm; // Sun. • 03/01/2021 • 12:34 AM
      // Delete "customFormatText + 210/customFormatText + 211" text below and add return options with bullet, comma, hyphen, slash, space, star characters.
      case 8: return customFormatText + 292;
      case 9: return customFormatText + 293;
  } }

  function dateTimeDefault() {
    dateTime.hidden = false;
    dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'));
    dateTime.title = addRemoveText + ' (' + GM_getValue('dateFormat') + ')';
    dateTimeTimer();
  }

  function dateTimeTimer() {
    clearInterval(clockInterval);
    if (!GM_getValue('defaultDateTimeView')) return;
    if (GM_getValue('defaultSecondsView')) clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, timerShort);
    else clockInterval = setInterval(function() {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'))}, timerLong);
  }

  function dateTimeToggle(e) {
    let bool;
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.button === 0) {
      bool = dateTime.hidden !== true ? true : false;
      dateTime.hidden = bool;
      GM_setValue('defaultDateTimeView', !bool);
      if (bool) clearInterval(clockInterval);
      else {dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat')); dateTimeTimer()}
  } }

  function dateTimeToggleSecondsAmPm(e) {
    if (!e.button === 0) return;
    let bool1, bool2, int;
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
      dateTime.title = addRemoveText + ' (' + GM_getValue('dateFormat') + ')';
    }
    dateTime.textContent = dateTimeFormat(GM_getValue('dateFormat'));
  }

  function displayHdrButtons(e) {
    let cbBtn = e.target.id,
        hdrBtn = cbBtn.replace('headerB', 'b'),
        bool = GM_getValue(e.target.id) !== true ? true : false;
    GM_setValue(e.target.id, bool);
    if (bool) viewHdrButtons();
    else document.getElementById(hdrBtn).style.display = 'none';
  }

  function optionsPopup(e) {
    let pop = $q('#gOptionsPopup'),
        btnsPop = $q('#headerBtnsDiv');
    e.preventDefault();
    switch (e.target.id) {
      case 'gOptions':
        if (pop.style.display === 'none') pop.style.display = 'block';
        else pop.style.display = 'none';
        if (btnsPop) btnsPop.style.display = 'none';
        break;
      case 'btnClose':
        pop.style.display = 'none';
        btnsPop.style.display = 'none';
        break;
      case 'btnClose2':
        btnsPop.style.display = 'none';
        break;
  } }

  function repositionLogo() {
    let bool = GM_getValue('googleLogoLeft') !== true ? true : false;
    GM_setValue('googleLogoLeft', bool);
    if (bool) {
      logo1.style.opacity = 1;
      logo2.style.opacity = 0;
    } else {
      logo1.style.opacity = 0;
      logo2.style.opacity = 1;
  } }

  function searchPopupLinks() {
    let links = $q('#gWP1 #dEjpnf > li > a', true);
    for (let i = 0; i < links.length; i++) links[i].setAttribute('target', GM_getValue('linksWhere'));
  }

  function searchLinksWhere(e) {
    let bool = GM_getValue('linksWhere') !== '_blank' ? '_blank' : '_self';
    e.preventDefault();
    GM_setValue('linksWhere', bool);
    bool === '_self' ? btnSearchLinks.textContent = linksCurrentText : btnSearchLinks.textContent = linksNewText;
    searchPopupLinks();
  }

  function setHdrButtons(e) {
    e.preventDefault();
    center.appendChild(headerBtnsDiv);
    if (headerBtnsDiv.style.display === 'flex') headerBtnsDiv.style.display = 'none';
    else headerBtnsDiv.style.display = 'flex';
  }

  function viewHdrButtons() {
    try {
      if (GM_getValue('headerBtnCalendar')) {
        divHeader.appendChild(btnCalendar);
        btnCalendar.style.display = 'block';
      }
      if (GM_getValue('headerBtnChrome')) {
        divHeader.appendChild(btnChrome);
        btnChrome.style.display = 'block';
      }
      if (GM_getValue('headerBtnEarth')) {
        divHeader.appendChild(btnEarth);
        btnEarth.style.display = 'block';
      }
      if (GM_getValue('headerBtnMail')) {
        divHeader.appendChild(btnMail);
        btnMail.style.display = 'block';
      }
      if (GM_getValue('headerBtnMaps')) {
        divHeader.appendChild(btnMaps);
        btnMaps.style.display = 'block';
      }
      if (GM_getValue('headerBtnMSEdge')) {
        divHeader.appendChild(btnMSEdge);
        btnMSEdge.style.display = 'block';
      }
      if (GM_getValue('headerBtnNews')) {
        divHeader.appendChild(btnNews);
        btnNews.style.display = 'block';
      }
      if (GM_getValue('headerBtnPhotos')) {
        divHeader.appendChild(btnPhotos);
        btnPhotos.style.display = 'block';
      }
      if (GM_getValue('headerBtnPlay')) {
        divHeader.appendChild(btnPlay);
        btnPlay.style.display = 'block';
      }
      if (GM_getValue('headerBtnPodcasts')) {
        divHeader.appendChild(btnPodcasts);
        btnPodcasts.style.display = 'block';
      }
      if (GM_getValue('headerBtnTranslate')) {
        divHeader.appendChild(btnTranslate);
        btnTranslate.style.display = 'block';
      }
      if (GM_getValue('headerBtnYouTube')) {
        divHeader.appendChild(btnYouTube);
        btnYouTube.style.display = 'block';
      }
      if (GM_getValue('headerBtnYouTubeTV')) {
        divHeader.appendChild(btnYouTubeTV);
        btnYouTubeTV.style.display = 'block';
      }
    } catch(ex) {}
  }

  function wallpaper() {
    let date = new Date(),
        day = date.getDate(),
        hour = date.getHours();
    try {
      if (GM_getValue('themeChanger')) {
        if (GM_getValue('changeThemeHourly')) {
          hour === 0 ? hour = 24 : hour = hour;
          GM_setValue('wallpaperImage', hour);
          body.style.background = 'url('+ GM_getValue('imageSite') + hour +'.jpg) no-repeat center center / cover';
          btnThemer.title = activeWallpaperTooltip + hour + '\n' + settingOffTooltip;
        } else {
          day = daynum[day];
          GM_setValue('wallpaperImage', day);
          body.style.background = 'url('+ GM_getValue('imageSite') + day +'.jpg) no-repeat center center / cover';
          btnThemer.title = activeWallpaperTooltip + day + '\n' + settingOffTooltip;
        }
        btnThemer.innerHTML = changeWallpaperOnText;
        btnWhen.style = 'opacity: 1; pointer-events: all';
        themeImage.src = themeOn;
        divNumber.style = 'opacity: .5; pointer-events: none';
      } else {
        if (GM_getValue('wallpaperStaticImage') === 0) body.style.background = 'initial';
        else body.style.background = 'url('+ GM_getValue('imageSite') + GM_getValue('wallpaperStaticImage') +'.jpg) no-repeat center center / cover';
        btnThemer.innerHTML = changeWallpaperOffText;
        btnThemer.title = activeWallpaperTooltip + GM_getValue('wallpaperStaticImage') + '\n' + settingOnTooltip;
        btnWhen.style = 'opacity: .5; pointer-events: none';
        themeImage.src = themeOff;
        divNumber.style = 'opacity: 1; pointer-events: all';
      }
    } catch (ex) {}
  }

  function wallpaperButtonChanger(e) {
    let num = GM_getValue('wallpaperStaticImage');
    e.preventDefault();
    switch (e.target.id) {
      case 'buttonStatic': case 'buttonUp':
        num > 34 ? num = 0 : num = parseInt(num + 1);
        break;
      case 'buttonDown':
        num < 1 ? num = 35 : num = parseInt(num - 1);
        break;
    }
    inpStatic.value = num;
    GM_setValue('wallpaperStaticImage', parseInt(num));
    wallpaper();
  }

  function wallpaperDailyHourly(e) {
    let bool = GM_getValue('changeThemeHourly') !== true ? true : false;
    e.preventDefault();
    GM_setValue('changeThemeHourly', bool);
    bool ? btnWhen.innerHTML = hourlyText : btnWhen.innerHTML = dailyText;
    wallpaper();
  }

  function wallpaperInputChanger(e) {
    let inp = e.target.value;
    e.preventDefault();
    GM_setValue('wallpaperStaticImage', parseInt(inp));
    wallpaper();
  }

  function wallpaperSite(e) {
    let str = GM_getValue('imageSite');
    e.preventDefault();
    if (str === githubSite) {
      GM_setValue('imageSite', soncoSite);
      btnSites.innerHTML = 'Sonco';
    } else {
      GM_setValue('imageSite', githubSite);
      btnSites.innerHTML = 'GitHub';
    }
    wallpaper();
  }

  function wallpaperThemer(e) {
    let bool = GM_getValue('themeChanger') !== true ? true : false;
    e.preventDefault();
    GM_setValue('themeChanger', bool);
    wallpaperTimer(bool);
  }

  function wallpaperTimer(e) {
    e ? wallpaperInterval = setInterval(() => wallpaper(), themerInterval) : clearInterval(wallpaperInterval);
    wallpaper();
  }

  function whenClose() {
    window.removeEventListener('unload', () => whenClose());
    clearInterval(wallpaperInterval);
    clearInterval(clockInterval);
  }

  function init() {
    window.removeEventListener('load', () => init());
    viewHdrButtons();
    logo1.appendChild(logo1Btn);
    logo2.appendChild(logo2Btn);
    center.insertBefore(optionsBtn, center.childNodes[4]);
    body.appendChild(logo1);
    body.id = 'gWP1';
    if (GM_getValue('googleLogoLeft')) {
      logo1.style.opacity = 1;
      logo2.style.opacity = 0;
    } else {
      logo1.style.opacity = 0;
      logo2.style.opacity = 1;
    }
    if (GM_getValue('defaultDateTimeView')) dateTimeDefault();
    else {dateTime.hidden = true; clearInterval(clockInterval)}
    dateTime.title = addRemoveText + ' (' + GM_getValue('dateFormat') + ')';
    div1.insertBefore(divHeader, div1.firstChild);
    div1.insertBefore(logo2, div1.firstChild.nextSibling);
    div1.insertBefore(form, div1.lastChild);
    dateTimeContainer.appendChild(btnClock);
    dateTimeContainer.appendChild(dateTime);
    div2.appendChild(dateTimeContainer);
    searchButton.id = 'gSearch';
    placeHolder.placeholder = placeHolderText;
    btnWhen.title = dailyHourlyTooltip;
    GM_getValue('changeThemeHourly') ? btnWhen.innerHTML = hourlyText : btnWhen.innerHTML = dailyText;
    if (GM_getValue('themeChanger')) {
      btnThemer.innerHTML = changeWallpaperOnText;
      btnWhen.style = 'opacity: 1; pointer-events: all';
      themeImage.src = themeOn;
    } else {
      btnThemer.innerHTML = changeWallpaperOffText;
      btnWhen.style = 'opacity: .5; pointer-events: none';
      themeImage.src = themeOff;
    }
    if (GM_getValue('imageSite') === githubSite) btnSites.innerHTML = 'GitHub';
    else btnSites.innerHTML = 'Sonco';
    btnStatic.textContent = defaultWallpaperText;
    btnStatic.title = defaultWallpaperTooltip;
    inpStatic.value = GM_getValue('wallpaperStaticImage');
    divThemer.appendChild(btnThemer);
    divThemer.appendChild(btnWhen);
    divThemer.appendChild(themeImage);
    spanThemer.appendChild(divThemer);
    divNumber.appendChild(btnStatic);
    divNumber.appendChild(btnUp);
    divNumber.appendChild(inpStatic);
    divNumber.appendChild(btnDown);
    spanNumber.appendChild(divNumber);
    divLinks.appendChild(btnSearchLinks);
    spanLinks.appendChild(divLinks);
    spnSites.innerHTML = changeImageSiteText;
    divSites.appendChild(spnSites);
    divSites.appendChild(btnSites);
    spanSites.appendChild(divSites);
    btnSearchLinks.textContent = GM_getValue('linksWhere') === '_self' ? linksCurrentText : linksNewText;
    divButtons.appendChild(displayButtons);
    optionsPop.appendChild(divButtons);
    optionsPop.appendChild(divThemer);
    optionsPop.appendChild(divNumber);
    optionsPop.insertBefore(divButtons, optionsPop.firstChild);
    optionsPop.insertBefore(divLinks, optionsPop.firstChild);
    optionsPop.appendChild(divSites);
    optionsPop.appendChild(btnClose);
    center.appendChild(settingsBtn);
    center.appendChild(optionsPop);
    headerBtnsCnt.appendChild(btnClearAll);
    headerBtnsCnt.appendChild(btnSelectAll);
    headerBtnsDiv.appendChild(headerBtnsCnt);
    headerBtnCalendarLAB.appendChild(headerBtnCalendarCB);
    headerBtnCalendarLAB.appendChild(headerBtnCalendarSPN);
    headerBtnsDiv.appendChild(headerBtnCalendarLAB);
    headerBtnChromeLAB.appendChild(headerBtnChromeCB);
    headerBtnChromeLAB.appendChild(headerBtnChromeSPN);
    headerBtnsDiv.appendChild(headerBtnChromeLAB);
    headerBtnEarthLAB.appendChild(headerBtnEarthCB);
    headerBtnEarthLAB.appendChild(headerBtnEarthSPN);
    headerBtnsDiv.appendChild(headerBtnEarthLAB);
    headerBtnMailLAB.appendChild(headerBtnMailCB);
    headerBtnMailLAB.appendChild(headerBtnMailSPN);
    headerBtnsDiv.appendChild(headerBtnMailLAB);
    headerBtnMapsLAB.appendChild(headerBtnMapsCB);
    headerBtnMapsLAB.appendChild(headerBtnMapsSPN);
    headerBtnsDiv.appendChild(headerBtnMapsLAB);
    headerBtnMSEdgeLAB.appendChild(headerBtnMSEdgeCB);
    headerBtnMSEdgeLAB.appendChild(headerBtnMSEdgeSPN);
    headerBtnsDiv.appendChild(headerBtnMSEdgeLAB);
    headerBtnNewsLAB.appendChild(headerBtnNewsCB);
    headerBtnNewsLAB.appendChild(headerBtnNewsSPN);
    headerBtnsDiv.appendChild(headerBtnNewsLAB);
    headerBtnPhotosLAB.appendChild(headerBtnPhotosCB);
    headerBtnPhotosLAB.appendChild(headerBtnPhotosSPN);
    headerBtnsDiv.appendChild(headerBtnPhotosLAB);
    headerBtnPlayLAB.appendChild(headerBtnPlayCB);
    headerBtnPlayLAB.appendChild(headerBtnPlaySPN);
    headerBtnsDiv.appendChild(headerBtnPlayLAB);
    headerBtnPodcastsLAB.appendChild(headerBtnPodcastsCB);
    headerBtnPodcastsLAB.appendChild(headerBtnPodcastsSPN);
    headerBtnsDiv.appendChild(headerBtnPodcastsLAB);
    headerBtnTranslateLAB.appendChild(headerBtnTranslateCB);
    headerBtnTranslateLAB.appendChild(headerBtnTranslateSPN);
    headerBtnsDiv.appendChild(headerBtnTranslateLAB);
    headerBtnYouTubeLAB.appendChild(headerBtnYouTubeCB);
    headerBtnYouTubeLAB.appendChild(headerBtnYouTubeSPN);
    headerBtnsDiv.appendChild(headerBtnYouTubeLAB);
    headerBtnYouTubeTVLAB.appendChild(headerBtnYouTubeTVCB);
    headerBtnYouTubeTVLAB.appendChild(headerBtnYouTubeTVSPN);
    headerBtnsDiv.appendChild(headerBtnYouTubeTVLAB);
    headerBtnsDiv.appendChild(btnClose2);
    wallpaper();
  }

  if (!GM_getValue('changeThemeHourly')) GM_setValue('changeThemeHourly', false);
  if (!GM_getValue('dateFormat')) GM_setValue('dateFormat', 1);
  if (!GM_getValue('defaultAMPM')) GM_setValue('defaultAMPM', false);
  if (!GM_getValue('defaultDateTimeView')) GM_setValue('defaultDateTimeView', false);
  if (!GM_getValue('defaultSecondsView')) GM_setValue('defaultSecondsView', false);
  if (!GM_getValue('googleLogoLeft')) GM_setValue('googleLogoLeft', false);
  if (!GM_getValue('headerBtnCalendar')) GM_setValue('headerBtnCalendar', false);
  if (!GM_getValue('headerBtnChrome')) GM_setValue('headerBtnChrome', false);
  if (!GM_getValue('headerBtnEarth')) GM_setValue('headerBtnEarth', false);
  if (!GM_getValue('headerBtnMail')) GM_setValue('headerBtnMail', false);
  if (!GM_getValue('headerBtnMaps')) GM_setValue('headerBtnMaps', false);
  if (!GM_getValue('headerBtnMSEdge')) GM_setValue('headerBtnMSEdge', false);
  if (!GM_getValue('headerBtnNews')) GM_setValue('headerBtnNews', false);
  if (!GM_getValue('headerBtnPhotos')) GM_setValue('headerBtnPhotos', false);
  if (!GM_getValue('headerBtnPlay')) GM_setValue('headerBtnPlay', false);
  if (!GM_getValue('headerBtnPodcasts')) GM_setValue('headerBtnPodcasts', false);
  if (!GM_getValue('headerBtnTranslate')) GM_setValue('headerBtnTranslate', false);
  if (!GM_getValue('headerBtnYouTube')) GM_setValue('headerBtnYouTube', false);
  if (!GM_getValue('headerBtnYouTubeTV')) GM_setValue('headerBtnYouTubeTV', false);
  if (!GM_getValue('imageSite')) GM_setValue('imageSite', githubSite);
  if (!GM_getValue('linksWhere')) GM_setValue('linksWhere', '_self');
  if (!GM_getValue('themeChanger')) GM_setValue('themeChanger', false);
  if (!GM_getValue('wallpaperImage')) GM_setValue('wallpaperImage', 0);
  if (!GM_getValue('wallpaperStaticImage')) GM_setValue('wallpaperStaticImage', 0);

  wallpaperTimer(GM_getValue('themeChanger'));

  initInterval = setInterval(() => {
    signIn ? signIn.click() : clearInterval(initInterval);
  }, openInterval);

  window.addEventListener('load', () => init());
  window.addEventListener('unload', () => whenClose());

  GM_addStyle(''+
    '#gWP1 .o3j99.c93Gbe {'+
    '  background: transparent !important;'+
    '}'+
    '#gWP1 #headerButtonsDiv {'+
    '  display: inline-flex !important;'+
    '  margin-bottom: -20px !important;'+
    '  position: absolute !important;'+
    '  top: 14px !important;'+
    '  z-index: 999 !important;'+
    '}'+
    '#gWP1 #headerButtonsDiv > .hBtn {'+
    '  background-color: rgba(0, 0, 0, 0.3) !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 6px !important;'+
    '  color: #CCC !important;'+
    '  height: 32px !important;'+
    '  margin: 0 5px !important;'+
    '  padding: 4px !important;'+
    '  text-indent: 22px !important;'+
    '}'+
    '#gWP1 #headerButtonsDiv > .hBtn:hover {'+
    '  background-color: #000 !important;'+
    '  border-color: #000 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #gOptionsPopup {'+
    '  background: #222 !important;'+
    '  border: 1px solid #666 !important;'+
    '  border-radius: 6px !important;'+
    '  bottom: 212px !important;'+
    '  left: 0 !important;'+
    '  padding: 0 !important;'+
    '  position: relative !important;'+
    '  text-align: left !important;'+
    '  width: 250px !important;'+
    '}'+
    '#gWP1 #gOptionsPopup > .popDiv {'+
    '  padding: 2px !important;'+
    '}'+
    '#gWP1 #gOptionsPopup > #btnClose,'+
    '#gWP1 #headerBtnsDiv > #btnClose2 {'+
    '  background-color: #222 !important;'+
    '  border: 1px solid #666 !important;'+
    '  border-radius: 50% !important;'+
    '  height: 25px !important;'+
    '  position: absolute !important;'+
    '  right: -13px !important;'+
    '  top: -13px !important;'+
    '  width: 25px !important;'+
    '}'+
    '#gWP1 #gOptionsPopup > #btnClose:hover,'+
    '#gWP1 #headerBtnsDiv > #btnClose2:hover {'+
    '  background-color: #900 !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv {'+
    '  background: #222 !important;'+
    '  border: 1px solid #666 !important;'+
    '  border-radius: 6px !important;'+
    '  bottom: 489px !important;'+
    '  flex-direction: column !important;'+
    '  left: -198px !important;'+
    '  padding: 4px 4px 2px 4px !important;'+
    '  position: relative !important;'+
    '  text-align: left !important;'+
    '  width: 134px !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #headerBtnsCnt {'+
    '  margin: auto !important;'+
    '  padding: 8px 0 6px 0 !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv #btnClearAll {'+
    '  margin-right: 16px !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv #btnClearAll,'+
    '#gWP1 #headerBtnsDiv #btnSelectAll {'+
    '  color: #CCC !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv #btnClearAll:hover,'+
    '#gWP1 #headerBtnsDiv #btnSelectAll:hover {'+
    '  background-color: #333 !important;'+
    '  color: #FFF !important;'+
    '  cursor: pointer !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > label {'+
    '  padding: 4px 0 !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > label:hover {'+
    '  background-color: #333 !important;'+
    '  cursor: pointer !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > label > span {'+
    '  color: #CCC !important;'+
    '  position: relative !important;'+
    '  top: -1px !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > label:hover > span {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > label > span:after {'+
    '  margin-left: 4px !important;'+
    '  position: relative !important;'+
    '  top: 3px !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelCalendar > span:after {'+
    '  content: url(' + imgCalendar + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelChrome > span:after {'+
    '  content: url(' + imgChrome + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelEarth > span:after {'+
    '  content: url(' + imgEarth + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelMail > span:after {'+
    '  content: url(' + imgMail + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelMaps > span:after {'+
    '  content: url(' + imgMaps + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelMSEdge > span:after {'+
    '  content: url(' + imgMSEdge + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelNews > span:after {'+
    '  content: url(' + imgNews + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelPhotos > span:after {'+
    '  content: url(' + imgPhotos + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelPlay > span:after {'+
    '  content: url(' + imgPlay + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelPodcasts > span:after {'+
    '  content: url(' + imgPodcasts + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelTranslate > span:after {'+
    '  content: url(' + imgTranslate + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelYouTube > span:after {'+
    '  content: url(' + imgYouTube + ')  !important;'+
    '}'+
    '#gWP1 #headerBtnsDiv > #labelYouTubeTV > span:after {'+
    '  content: url(' + imgYouTubeTV + ')  !important;'+
    '}'+
    '#gWP1 > .L3eUgb > .o3j99.LLD4me.yr19Zb.LS8OJ > div > .lnXdpd,'+
    '#gWP1 #hplogo,'+
    '#gWP1 #hpcta,'+
    '#gWP1 #hpcanvas,'+
    '#gWP1 #hplogocta,'+
    '#gWP1 .ddlsv-cta_,'+
    '#gWP1 .MV3Tnb,'+
    '#gWP1 #gb > div > div:nth-child(1) > div,'+
    '#gWP1 #gbqfbb,'+
    '#gWP1 > .L3eUgb > .o3j99.c93Gbe > div > .KxwPGc.ssOUyb,'+
    '#gWP1 > .L3eUgb > .o3j99.c93Gbe > div > .KxwPGc.AghGtd,'+
    '#gWP1 > .L3eUgb > .o3j99.c93Gbe > div > .KxwPGc.iTjxkf > a,'+
    '#gWP1 > .L3eUgb > .o3j99.qarstb > div,'+
    '#gWP1 > .L3eUgb > .o3j99.LLD4me.LS8OJ > div > .SuUcIb,'+
    '#gWP1 > .L3eUgb > .o3j99.LLD4me.LS8OJ > div > div:nth-child(2),'+
    '#gWP1 #yDmH0d,'+
    '#gWP1 #gb > div > .gb_0a.gb_E.gb_k.gb_1a.gb_la > .gb_Qf.gb_sb,'+
    '#gWP1 .gb_If.gb_qb,'+
    '#gWP1 .XDyW0e,'+
    '#gWP1 .QlyBfb {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 #gb {'+
    '  background: transparent !important;'+
    '}'+
    '#gWP1 > #logo1,'+
    '#gWP1 #logo2 {'+
    '  background: url('+ googleImage +') no-repeat !important;'+
    '  border: none !important;'+
    '  min-height: 164px !important;'+
    '  transition: all .5s ease-in-out !important;'+
    '  width: 512px !important;'+
    '}'+
    '#gWP1 > #logo1 {'+
    '  left: 0 !important;'+
    '  margin: 10px !important;'+
    '  position: absolute !important;'+
    '  top: 0 !important;'+
    '}'+
    '#gWP1 #logo2 {'+
    '  position: absolute !important;'+
    '  top: 74px !important;'+
    '}'+
    '#gWP1 #logo1Btn,'+
    '#gWP1 #logo2Btn {'+
    '  background-color: transparent !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 50% !important;'+
    '  float: right !important;'+
    '  height: 24px !important;'+
    '  margin-right: -32px !important;'+
    '  position: relative !important;'+
    '  width: 24px !important;'+
    '  z-index: 999 !important;'+
    '}'+
    '#gWP1 #logo1Btn:hover,'+
    '#gWP1 #logo2Btn:hover {'+
    '  background-color: #181A1B !important;'+
    '  border: 1px solid #000 !important;'+
    '}'+
    '#gWP1 .gb_z.gb_hd.gb_f.gb_Af {'+
    '  border: 1px solid #333 !important;'+
    '  border-radius: 50% !important;'+
    '  height: 38px !important;'+
    '  margin-right: 4px !important;'+
    '  padding: 0 !important;'+
    '  position: relative !important;'+
    '  top: -3px !important;'+
    '  width: 38px !important;'+
    '}'+
    '#gWP1 #gbwa > div > a {'+
    '  background-color: transparent !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 50% !important;'+
    '  box-shadow: none !important;'+
    '}'+
    '#gWP1 #gbwa > div > a:hover {'+
    '  background-color: #181A1B !important;'+
    '  border-color: #777 !important;'+
    '}'+
    '#gWP1 #gbwa > div > a > svg {'+
    '  color: #999 !important;'+
    '}'+
    '#gWP1 #gbwa > div > a:hover > svg {'+
    '  background-color: #181A1B !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .gb_Zd .gb_Se {'+
    '  background-color: rgba(0, 0, 0, .3) !important;'+
    '  border-radius: 12px !important;'+
    '  display: inline-flex !important;'+
    '  padding: 4px 5px 1px 0 !important;'+
    '}'+
    '#gWP1 .gb_La.gb_ed.gb_jg.gb_f.gb_xf {'+
    '  margin-top: -2px !important;'+
    '}'+
    '#gWP1 .gb_Aa {'+
    '  height: 40px !important;'+
    '  margin-top: -3px !important;'+
    '  position: relative !important;'+
    '  right: 4px !important;'+
    '  width: 40px !important;'+
    '}'+
    '#gWP1 .gb_La .gb_A {'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 .gb_hd {'+
    '  margin: 3px 4px 0 8px !important;'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 #dateTimeContainer {'+
    '  display: inline-flex !important;'+
    '}'+
    '#gWP1 #gClock {'+
    '  border-radius: 50% !important;'+
    '  cursor: pointer !important;'+
    '  filter: grayscale(1) brightness(.65) !important;'+
    '  height: 40px !important;'+
    '  width: 40px !important;'+
    '}'+
    '#gWP1 #dateTimeContainer > #dateTime {'+
    '  background-color: transparent !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 8px !important;'+
    '  box-shadow: none !important;'+
    '  color: #FFF !important;'+
    '  cursor: pointer !important;'+
    '  font: 16px monospace !important;'+
    '  height: 25px !important;'+
    '  margin-left: 8px !important;'+
    '  min-width: 100px !important;'+
    '  padding: 6px 8px !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 #gClock:hover + #dateTime {'+
    '  background: #900 !important;'+
    '  border-color: #C00 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #dateTimeContainer:hover > #gClock {'+
    '  filter: none !important;'+
    '  opacity: .7 !important;'+
    '}'+
    '#gWP1 #dateTimeContainer:hover > #gClock:hover {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 #dateTimeContainer > #dateTime:hover {'+
    '  background-color: #181A1B !important;'+
    '  border: 1px solid #000 !important;'+
    '}'+
    '#gWP1 #popClose {'+
    '  border: 1px solid #333 !important;'+
    '  border-radius: 50% !important;'+
    '  height: 24px !important;'+
    '  position: absolute !important;'+
    '  right: -12px !important;'+
    '  top: -12px !important;'+
    '  width: 24px !important;'+
    '}'+
    '#gWP1 #popClose:hover {'+
    '  background-color: #C00 !important;'+
    '}'+
    '#gWP1 #divThemer {'+
    '  margin-top: -1px !important;'+
    '  padding-right: 8px !important;'+
    '}'+
    '#gWP1 #divSites {'+
    '  margin-top: 2px !important;'+
    '}'+
    '#gWP1 #gOptionsPopup > .popDiv:hover {'+
    '  background-color: #333 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #gOptionsPopup > .popDiv:hover > button {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #themeImage {'+
    '  left: 9px !important;'+
    '  opacity: 0 !important;'+
    '  position: relative !important;'+
    '  top: 3px !important;'+
    '}'+
    '#gWP1 #buttonStatic,'+
    '#gWP1 #buttonThemer,'+
    '#gWP1 #displayButtons,'+
    '#gWP1 #searchLinks,'+
    '#gWP1 #divLinks,'+
    '#gWP1 #divButtons,'+
    '#gWP1 #buttonSites {'+
    '  cursor: pointer !important;'+
    '}'+
    '#gWP1 #displayButtons,'+
    '#gWP1 #searchLinks {'+
    '  text-align: left !important;'+
    '  width: 100% !important;'+
    '}'+
    '#gWP1 #buttonThemer,'+
    '#gWP1 #displayButtons,'+
    '#gWP1 #searchLinks {'+
    '  color: #CCC !important;'+
    '  padding: 7px 0 7px 9px !important;'+
    '}'+
    '#gWP1 #buttonWhen,'+
    '#gWP1 #buttonSites {'+
    '  border: 1px solid #CCC !important;'+
    '  border-radius: 4px !important;'+
    '  margin: 0 8px !important;'+
    '  padding: 4px 8px !important;'+
    '}'+
    '#gWP1 #buttonStatic {'+
    '  color: #CCC !important;'+
    '  margin: 0 !important;'+
    '  padding: 7px 7px 7px 8px !important;'+
    '}'+
    '#gWP1 #buttonUp,'+
    '#gWP1 #buttonDown {'+
    '  background: transparent !important;'+
    '  height: 20px !important;'+
    '  opacity: .5 !important;'+
    '  position: relative !important;'+
    '  top: 5px !important;'+
    '  width: 21px !important;'+
    '}'+
    '#gWP1 #buttonStatic:hover + #buttonUp,'+
    '#gWP1 #buttonUp:hover,'+
    '#gWP1 #buttonDown:hover {'+
    '  opacity: 1 !important;'+
    '}'+
    'body#gWP1 #buttonUp {'+
    '  margin: 0 !important;'+
    '}'+
    '#gWP1 #inputStatic {'+
    '  appearance: textfield !important;'+
    '  -moz-appearance: textfield !important;'+
    '  border: 1px solid #666 !important;'+
    '  border-radius: 4px !important;'+
    '  color: #FFF !important;'+
    '  height: 18px !important;'+
    '  margin: 0 4px !important;'+
    '  opacity: .5 !important;'+
    '  text-align: center !important;'+
    '  width: 28px !important;'+
    '}'+
    '#gWP1 #divNumber:hover > #inputStatic,'+
    '#gWP1 #inputStatic:hover,'+
    '#gWP1 #inputStatic:focus-within {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 #spanSites {'+
    '  cursor: pointer !important;'+
    '  margin-left: 9px !important;'+
    '}'+
    '#gWP1 #buttonSites {'+
    '  width: 64px !important;'+
    '}'+
    '#gWP1 #inputStatic::-webkit-inner-spin-button,'+
    '#gWP1 #inputStatic::-webkit-outer-spin-button {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 #divThemer:hover > #buttonThemer,'+
    '#gWP1 #divThemer:hover > #buttonWhen,'+
    '#gWP1 #divNumber:hover > #buttonStatic,'+
    '#gWP1 #divNumber:hover > #inputStatic,'+
    '#gWP1 #divLinks:hover > #searchLinks,'+
    '#gWP1 #divSites:hover > #spanSites{'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #divSites:hover > #buttonSites,'+
    '#gWP1 #buttonWhen:hover,'+
    '#gWP1 #buttonSites:hover {'+
    '  background: #000 !important;'+
    '  border-color: #666 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 #divThemer:hover > #themeImage {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 > .L3eUgb form {'+
    '  position: absolute !important;'+
    '  top: 268px !important;'+
    '  width: 584px !important;'+
    '}'+
    '#gWP1 > .L3eUgb form .iblpc {'+
    '  opacity: 0 !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover .iblpc,'+
    '#gWP1 .RNNXgb:focus-within .iblpc {'+
    '  opacity: 1 !important;'+
    '}'+
    '#gWP1 .A8SBwf {'+
    '  padding: 0 !important;'+
    '}'+
    '#gWP1 > .L3eUgb > .o3j99.LLD4me.LS8OJ > .ayzqOc {'+
    '  display: inline-flex !important;'+
    '  position: absolute !important;'+
    '  top: 341px !important;'+
    '}'+
    '#gWP1 .RNNXgb,'+
    '#gWP1 #gSearch {'+
    '  background: transparent !important;'+
    '  border: 1px solid transparent !important;'+
    '  box-shadow: none !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 #gSearch {'+
    '  border-radius: 8px !important;'+
    '  max-height: 36px !important;'+
    '  text-decoration: none !important;'+
    '  text-shadow: 1px 1px 2px #000 !important;'+
    '}'+
    '#gWP1 center > input {'+
    '  background-color: rgba(0, 0, 0, 0.3) !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 4px !important;'+
    '  color: #AAA !important;'+
    '  cursor: pointer !important;'+
    '  height: 32px  !important;'+
    '  padding: 0 10px !important;'+
    '  width: auto !important;'+
    '}'+
    '#gWP1 center > span {'+
    '  background-color: rgba(0, 0, 0, 0.3) !important;'+
    '  border: 1px solid transparent !important;'+
    '  border-radius: 4px !important;'+
    '  color: #AAA !important;'+
    '  margin-left: 5px !important;'+
    '  padding: 7px 0 !important;'+
    '  width: auto !important;'+
    '}'+
    '#gWP1 center > span:hover {'+
    '  border: 1px solid #666 !important;'+
    '}'+
    '#gWP1 .ayzqOc.pHiOh {'+
    '  color: #AAA !important;'+
    '  text-decoration: none !important;'+
    '}'+
    '#gWP1 center > span:hover .ayzqOc.pHiOh {'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .gLFyf.gsfi {'+
    '  color: #CCC !important;'+
    '  filter: brightness(2) !important;'+
    '  text-align: center !important;'+
    '  margin-left: -35px !important;'+
    '}'+
    '#gWP1 .gLFyf.gsfi:focus-within {'+
    '  text-align: left !important;'+
    '  margin-left: 0 !important;'+
    '}'+
    '#gWP1 .RNNXgb:hover,'+
    '#gWP1 .RNNXgb:focus-within,'+
    '#gWP1 #gSearch:hover,'+
    '#gWP1 #submit:hover,'+
    '#gWP1 center > input:hover {'+
    '  background-color: rgba(0, 0, 0, .5) !important;'+
    '  border-color: #777 !important;'+
    '  color: #FFF !important;'+
    '}'+
    '#gWP1 .aajZCb {'+
    '  background-color: rgba(0, 0, 0, .5) !important;'+
    '  border: 1px solid #CCC !important;'+
    '}'+
    '#gWP1 .xtSCL {'+
    '  display: none !important;'+
    '}'+
    '#gWP1 .lJ9FBc {'+
    '  height: 50px !important;'+
    '}'+
    '#gWP1 .sbct:hover {'+
    '  background: rgba(255, 255, 255, .9) !important;'+
    '}'+
    '#gWP1 .BKRPef.M2vV3 > span {'+
    '  border: none !important;'+
    '  margin-right: 0 !important;'+
    '}'+
    '#gWP1 #gb > div > div[style*="width: 328px;"] {'+
    '  height: calc(-140px + 100vh) !important;'+
    '}'+
    '#gWP1 .gb_Wd.gb_Za.gb_Ld > div[style] {'+
    '  margin-top: 50px !important;'+
    '}'+
  '');

})();
