/*
 *  EtudieCA by Slava Knyazev
 *  Expo-Sciences 2016-2017
 *  Built from viruzx/erablio
 */



(function (r) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = r() } else if (typeof define === "function" && define.amd) { define([], r) } else { var e; if (typeof window !== "undefined") { e = window } else if (typeof global !== "undefined") { e = global } else if (typeof self !== "undefined") { e = self } else { e = this } e.base64js = r() } })(function () { var r, e, t; return function r(e, t, n) { function o(i, a) { if (!t[i]) { if (!e[i]) { var u = typeof require == "function" && require; if (!a && u) return u(i, !0); if (f) return f(i, !0); var d = new Error("Cannot find module '" + i + "'"); throw d.code = "MODULE_NOT_FOUND", d } var c = t[i] = { exports: {} }; e[i][0].call(c.exports, function (r) { var t = e[i][1][r]; return o(t ? t : r) }, c, c.exports, r, e, t, n) } return t[i].exports } var f = typeof require == "function" && require; for (var i = 0; i < n.length; i++)o(n[i]); return o }({ "/": [function (r, e, t) { "use strict"; t.byteLength = c; t.toByteArray = v; t.fromByteArray = s; var n = []; var o = []; var f = typeof Uint8Array !== "undefined" ? Uint8Array : Array; var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; for (var a = 0, u = i.length; a < u; ++a) { n[a] = i[a]; o[i.charCodeAt(a)] = a } o["-".charCodeAt(0)] = 62; o["_".charCodeAt(0)] = 63; function d(r) { var e = r.length; if (e % 4 > 0) { throw new Error("Invalid string. Length must be a multiple of 4") } return r[e - 2] === "=" ? 2 : r[e - 1] === "=" ? 1 : 0 } function c(r) { return r.length * 3 / 4 - d(r) } function v(r) { var e, t, n, i, a, u; var c = r.length; a = d(r); u = new f(c * 3 / 4 - a); n = a > 0 ? c - 4 : c; var v = 0; for (e = 0, t = 0; e < n; e += 4, t += 3) { i = o[r.charCodeAt(e)] << 18 | o[r.charCodeAt(e + 1)] << 12 | o[r.charCodeAt(e + 2)] << 6 | o[r.charCodeAt(e + 3)]; u[v++] = i >> 16 & 255; u[v++] = i >> 8 & 255; u[v++] = i & 255 } if (a === 2) { i = o[r.charCodeAt(e)] << 2 | o[r.charCodeAt(e + 1)] >> 4; u[v++] = i & 255 } else if (a === 1) { i = o[r.charCodeAt(e)] << 10 | o[r.charCodeAt(e + 1)] << 4 | o[r.charCodeAt(e + 2)] >> 2; u[v++] = i >> 8 & 255; u[v++] = i & 255 } return u } function l(r) { return n[r >> 18 & 63] + n[r >> 12 & 63] + n[r >> 6 & 63] + n[r & 63] } function h(r, e, t) { var n; var o = []; for (var f = e; f < t; f += 3) { n = (r[f] << 16) + (r[f + 1] << 8) + r[f + 2]; o.push(l(n)) } return o.join("") } function s(r) { var e; var t = r.length; var o = t % 3; var f = ""; var i = []; var a = 16383; for (var u = 0, d = t - o; u < d; u += a) { i.push(h(r, u, u + a > d ? d : u + a)) } if (o === 1) { e = r[t - 1]; f += n[e >> 2]; f += n[e << 4 & 63]; f += "==" } else if (o === 2) { e = (r[t - 2] << 8) + r[t - 1]; f += n[e >> 10]; f += n[e >> 4 & 63]; f += n[e << 2 & 63]; f += "=" } i.push(f); return i.join("") } }, {}] }, {}, [])("/") });

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}


var base64map = "eyLDgSI6IkEiLCLEgiI6IkEiLCLhuq4iOiJBIiwi4bq2IjoiQSIsIuG6sCI6IkEiLCLhurIiOiJBIiwi4bq0IjoiQSIsIseNIjoiQSIsIsOCIjoiQSIsIuG6pCI6IkEiLCLhuqwiOiJBIiwi4bqmIjoiQSIsIuG6qCI6IkEiLCLhuqoiOiJBIiwiw4QiOiJBIiwix54iOiJBIiwiyKYiOiJBIiwix6AiOiJBIiwi4bqgIjoiQSIsIsiAIjoiQSIsIsOAIjoiQSIsIuG6oiI6IkEiLCLIgiI6IkEiLCLEgCI6IkEiLCLEhCI6IkEiLCLDhSI6IkEiLCLHuiI6IkEiLCLhuIAiOiJBIiwiyLoiOiJBIiwiw4MiOiJBIiwi6pyyIjoiQUEiLCLDhiI6IkFFIiwix7wiOiJBRSIsIseiIjoiQUUiLCLqnLQiOiJBTyIsIuqctiI6IkFVIiwi6py4IjoiQVYiLCLqnLoiOiJBViIsIuqcvCI6IkFZIiwi4biCIjoiQiIsIuG4hCI6IkIiLCLGgSI6IkIiLCLhuIYiOiJCIiwiyYMiOiJCIiwixoIiOiJCIiwixIYiOiJDIiwixIwiOiJDIiwiw4ciOiJDIiwi4biIIjoiQyIsIsSIIjoiQyIsIsSKIjoiQyIsIsaHIjoiQyIsIsi7IjoiQyIsIsSOIjoiRCIsIuG4kCI6IkQiLCLhuJIiOiJEIiwi4biKIjoiRCIsIuG4jCI6IkQiLCLGiiI6IkQiLCLhuI4iOiJEIiwix7IiOiJEIiwix4UiOiJEIiwixJAiOiJEIiwixosiOiJEIiwix7EiOiJEWiIsIseEIjoiRFoiLCLDiSI6IkUiLCLElCI6IkUiLCLEmiI6IkUiLCLIqCI6IkUiLCLhuJwiOiJFIiwiw4oiOiJFIiwi4bq+IjoiRSIsIuG7hiI6IkUiLCLhu4AiOiJFIiwi4buCIjoiRSIsIuG7hCI6IkUiLCLhuJgiOiJFIiwiw4siOiJFIiwixJYiOiJFIiwi4bq4IjoiRSIsIsiEIjoiRSIsIsOIIjoiRSIsIuG6uiI6IkUiLCLIhiI6IkUiLCLEkiI6IkUiLCLhuJYiOiJFIiwi4biUIjoiRSIsIsSYIjoiRSIsIsmGIjoiRSIsIuG6vCI6IkUiLCLhuJoiOiJFIiwi6p2qIjoiRVQiLCLhuJ4iOiJGIiwixpEiOiJGIiwix7QiOiJHIiwixJ4iOiJHIiwix6YiOiJHIiwixKIiOiJHIiwixJwiOiJHIiwixKAiOiJHIiwixpMiOiJHIiwi4bigIjoiRyIsIsekIjoiRyIsIuG4qiI6IkgiLCLIniI6IkgiLCLhuKgiOiJIIiwixKQiOiJIIiwi4rGnIjoiSCIsIuG4piI6IkgiLCLhuKIiOiJIIiwi4bikIjoiSCIsIsSmIjoiSCIsIsONIjoiSSIsIsSsIjoiSSIsIsePIjoiSSIsIsOOIjoiSSIsIsOPIjoiSSIsIuG4riI6IkkiLCLEsCI6IkkiLCLhu4oiOiJJIiwiyIgiOiJJIiwiw4wiOiJJIiwi4buIIjoiSSIsIsiKIjoiSSIsIsSqIjoiSSIsIsSuIjoiSSIsIsaXIjoiSSIsIsSoIjoiSSIsIuG4rCI6IkkiLCLqnbkiOiJEIiwi6p27IjoiRiIsIuqdvSI6IkciLCLqnoIiOiJSIiwi6p6EIjoiUyIsIuqehiI6IlQiLCLqnawiOiJJUyIsIsS0IjoiSiIsIsmIIjoiSiIsIuG4sCI6IksiLCLHqCI6IksiLCLEtiI6IksiLCLisakiOiJLIiwi6p2CIjoiSyIsIuG4siI6IksiLCLGmCI6IksiLCLhuLQiOiJLIiwi6p2AIjoiSyIsIuqdhCI6IksiLCLEuSI6IkwiLCLIvSI6IkwiLCLEvSI6IkwiLCLEuyI6IkwiLCLhuLwiOiJMIiwi4bi2IjoiTCIsIuG4uCI6IkwiLCLisaAiOiJMIiwi6p2IIjoiTCIsIuG4uiI6IkwiLCLEvyI6IkwiLCLisaIiOiJMIiwix4giOiJMIiwixYEiOiJMIiwix4ciOiJMSiIsIuG4viI6Ik0iLCLhuYAiOiJNIiwi4bmCIjoiTSIsIuKxriI6Ik0iLCLFgyI6Ik4iLCLFhyI6Ik4iLCLFhSI6Ik4iLCLhuYoiOiJOIiwi4bmEIjoiTiIsIuG5hiI6Ik4iLCLHuCI6Ik4iLCLGnSI6Ik4iLCLhuYgiOiJOIiwiyKAiOiJOIiwix4siOiJOIiwiw5EiOiJOIiwix4oiOiJOSiIsIsOTIjoiTyIsIsWOIjoiTyIsIseRIjoiTyIsIsOUIjoiTyIsIuG7kCI6Ik8iLCLhu5giOiJPIiwi4buSIjoiTyIsIuG7lCI6Ik8iLCLhu5YiOiJPIiwiw5YiOiJPIiwiyKoiOiJPIiwiyK4iOiJPIiwiyLAiOiJPIiwi4buMIjoiTyIsIsWQIjoiTyIsIsiMIjoiTyIsIsOSIjoiTyIsIuG7jiI6Ik8iLCLGoCI6Ik8iLCLhu5oiOiJPIiwi4buiIjoiTyIsIuG7nCI6Ik8iLCLhu54iOiJPIiwi4bugIjoiTyIsIsiOIjoiTyIsIuqdiiI6Ik8iLCLqnYwiOiJPIiwixYwiOiJPIiwi4bmSIjoiTyIsIuG5kCI6Ik8iLCLGnyI6Ik8iLCLHqiI6Ik8iLCLHrCI6Ik8iLCLDmCI6Ik8iLCLHviI6Ik8iLCLDlSI6Ik8iLCLhuYwiOiJPIiwi4bmOIjoiTyIsIsisIjoiTyIsIsaiIjoiT0kiLCLqnY4iOiJPTyIsIsaQIjoiRSIsIsaGIjoiTyIsIsiiIjoiT1UiLCLhuZQiOiJQIiwi4bmWIjoiUCIsIuqdkiI6IlAiLCLGpCI6IlAiLCLqnZQiOiJQIiwi4rGjIjoiUCIsIuqdkCI6IlAiLCLqnZgiOiJRIiwi6p2WIjoiUSIsIsWUIjoiUiIsIsWYIjoiUiIsIsWWIjoiUiIsIuG5mCI6IlIiLCLhuZoiOiJSIiwi4bmcIjoiUiIsIsiQIjoiUiIsIsiSIjoiUiIsIuG5niI6IlIiLCLJjCI6IlIiLCLisaQiOiJSIiwi6py+IjoiQyIsIsaOIjoiRSIsIsWaIjoiUyIsIuG5pCI6IlMiLCLFoCI6IlMiLCLhuaYiOiJTIiwixZ4iOiJTIiwixZwiOiJTIiwiyJgiOiJTIiwi4bmgIjoiUyIsIuG5oiI6IlMiLCLhuagiOiJTIiwixaQiOiJUIiwixaIiOiJUIiwi4bmwIjoiVCIsIsiaIjoiVCIsIsi+IjoiVCIsIuG5qiI6IlQiLCLhuawiOiJUIiwixqwiOiJUIiwi4bmuIjoiVCIsIsauIjoiVCIsIsWmIjoiVCIsIuKxryI6IkEiLCLqnoAiOiJMIiwixpwiOiJNIiwiyYUiOiJWIiwi6pyoIjoiVFoiLCLDmiI6IlUiLCLFrCI6IlUiLCLHkyI6IlUiLCLDmyI6IlUiLCLhubYiOiJVIiwiw5wiOiJVIiwix5ciOiJVIiwix5kiOiJVIiwix5siOiJVIiwix5UiOiJVIiwi4bmyIjoiVSIsIuG7pCI6IlUiLCLFsCI6IlUiLCLIlCI6IlUiLCLDmSI6IlUiLCLhu6YiOiJVIiwixq8iOiJVIiwi4buoIjoiVSIsIuG7sCI6IlUiLCLhu6oiOiJVIiwi4busIjoiVSIsIuG7riI6IlUiLCLIliI6IlUiLCLFqiI6IlUiLCLhuboiOiJVIiwixbIiOiJVIiwixa4iOiJVIiwixagiOiJVIiwi4bm4IjoiVSIsIuG5tCI6IlUiLCLqnZ4iOiJWIiwi4bm+IjoiViIsIsayIjoiViIsIuG5vCI6IlYiLCLqnaAiOiJWWSIsIuG6giI6IlciLCLFtCI6IlciLCLhuoQiOiJXIiwi4bqGIjoiVyIsIuG6iCI6IlciLCLhuoAiOiJXIiwi4rGyIjoiVyIsIuG6jCI6IlgiLCLhuooiOiJYIiwiw50iOiJZIiwixbYiOiJZIiwixbgiOiJZIiwi4bqOIjoiWSIsIuG7tCI6IlkiLCLhu7IiOiJZIiwixrMiOiJZIiwi4bu2IjoiWSIsIuG7viI6IlkiLCLIsiI6IlkiLCLJjiI6IlkiLCLhu7giOiJZIiwixbkiOiJaIiwixb0iOiJaIiwi4bqQIjoiWiIsIuKxqyI6IloiLCLFuyI6IloiLCLhupIiOiJaIiwiyKQiOiJaIiwi4bqUIjoiWiIsIsa1IjoiWiIsIsSyIjoiSUoiLCLFkiI6Ik9FIiwi4bSAIjoiQSIsIuG0gSI6IkFFIiwiypkiOiJCIiwi4bSDIjoiQiIsIuG0hCI6IkMiLCLhtIUiOiJEIiwi4bSHIjoiRSIsIuqcsCI6IkYiLCLJoiI6IkciLCLKmyI6IkciLCLKnCI6IkgiLCLJqiI6IkkiLCLKgSI6IlIiLCLhtIoiOiJKIiwi4bSLIjoiSyIsIsqfIjoiTCIsIuG0jCI6IkwiLCLhtI0iOiJNIiwiybQiOiJOIiwi4bSPIjoiTyIsIsm2IjoiT0UiLCLhtJAiOiJPIiwi4bSVIjoiT1UiLCLhtJgiOiJQIiwiyoAiOiJSIiwi4bSOIjoiTiIsIuG0mSI6IlIiLCLqnLEiOiJTIiwi4bSbIjoiVCIsIuKxuyI6IkUiLCLhtJoiOiJSIiwi4bScIjoiVSIsIuG0oCI6IlYiLCLhtKEiOiJXIiwiyo8iOiJZIiwi4bSiIjoiWiIsIsOhIjoiYSIsIsSDIjoiYSIsIuG6ryI6ImEiLCLhurciOiJhIiwi4bqxIjoiYSIsIuG6syI6ImEiLCLhurUiOiJhIiwix44iOiJhIiwiw6IiOiJhIiwi4bqlIjoiYSIsIuG6rSI6ImEiLCLhuqciOiJhIiwi4bqpIjoiYSIsIuG6qyI6ImEiLCLDpCI6ImEiLCLHnyI6ImEiLCLIpyI6ImEiLCLHoSI6ImEiLCLhuqEiOiJhIiwiyIEiOiJhIiwiw6AiOiJhIiwi4bqjIjoiYSIsIsiDIjoiYSIsIsSBIjoiYSIsIsSFIjoiYSIsIuG2jyI6ImEiLCLhupoiOiJhIiwiw6UiOiJhIiwix7siOiJhIiwi4biBIjoiYSIsIuKxpSI6ImEiLCLDoyI6ImEiLCLqnLMiOiJhYSIsIsOmIjoiYWUiLCLHvSI6ImFlIiwix6MiOiJhZSIsIuqctSI6ImFvIiwi6py3IjoiYXUiLCLqnLkiOiJhdiIsIuqcuyI6ImF2Iiwi6py9IjoiYXkiLCLhuIMiOiJiIiwi4biFIjoiYiIsIsmTIjoiYiIsIuG4hyI6ImIiLCLhtawiOiJiIiwi4baAIjoiYiIsIsaAIjoiYiIsIsaDIjoiYiIsIsm1IjoibyIsIsSHIjoiYyIsIsSNIjoiYyIsIsOnIjoiYyIsIuG4iSI6ImMiLCLEiSI6ImMiLCLJlSI6ImMiLCLEiyI6ImMiLCLGiCI6ImMiLCLIvCI6ImMiLCLEjyI6ImQiLCLhuJEiOiJkIiwi4biTIjoiZCIsIsihIjoiZCIsIuG4iyI6ImQiLCLhuI0iOiJkIiwiyZciOiJkIiwi4baRIjoiZCIsIuG4jyI6ImQiLCLhta0iOiJkIiwi4baBIjoiZCIsIsSRIjoiZCIsIsmWIjoiZCIsIsaMIjoiZCIsIsSxIjoiaSIsIsi3IjoiaiIsIsmfIjoiaiIsIsqEIjoiaiIsIsezIjoiZHoiLCLHhiI6ImR6Iiwiw6kiOiJlIiwixJUiOiJlIiwixJsiOiJlIiwiyKkiOiJlIiwi4bidIjoiZSIsIsOqIjoiZSIsIuG6vyI6ImUiLCLhu4ciOiJlIiwi4buBIjoiZSIsIuG7gyI6ImUiLCLhu4UiOiJlIiwi4biZIjoiZSIsIsOrIjoiZSIsIsSXIjoiZSIsIuG6uSI6ImUiLCLIhSI6ImUiLCLDqCI6ImUiLCLhursiOiJlIiwiyIciOiJlIiwixJMiOiJlIiwi4biXIjoiZSIsIuG4lSI6ImUiLCLisbgiOiJlIiwixJkiOiJlIiwi4baSIjoiZSIsIsmHIjoiZSIsIuG6vSI6ImUiLCLhuJsiOiJlIiwi6p2rIjoiZXQiLCLhuJ8iOiJmIiwixpIiOiJmIiwi4bWuIjoiZiIsIuG2giI6ImYiLCLHtSI6ImciLCLEnyI6ImciLCLHpyI6ImciLCLEoyI6ImciLCLEnSI6ImciLCLEoSI6ImciLCLJoCI6ImciLCLhuKEiOiJnIiwi4baDIjoiZyIsIselIjoiZyIsIuG4qyI6ImgiLCLInyI6ImgiLCLhuKkiOiJoIiwixKUiOiJoIiwi4rGoIjoiaCIsIuG4pyI6ImgiLCLhuKMiOiJoIiwi4bilIjoiaCIsIsmmIjoiaCIsIuG6liI6ImgiLCLEpyI6ImgiLCLGlSI6Imh2Iiwiw60iOiJpIiwixK0iOiJpIiwix5AiOiJpIiwiw64iOiJpIiwiw68iOiJpIiwi4bivIjoiaSIsIuG7iyI6ImkiLCLIiSI6ImkiLCLDrCI6ImkiLCLhu4kiOiJpIiwiyIsiOiJpIiwixKsiOiJpIiwixK8iOiJpIiwi4baWIjoiaSIsIsmoIjoiaSIsIsSpIjoiaSIsIuG4rSI6ImkiLCLqnboiOiJkIiwi6p28IjoiZiIsIuG1uSI6ImciLCLqnoMiOiJyIiwi6p6FIjoicyIsIuqehyI6InQiLCLqna0iOiJpcyIsIsewIjoiaiIsIsS1IjoiaiIsIsqdIjoiaiIsIsmJIjoiaiIsIuG4sSI6ImsiLCLHqSI6ImsiLCLEtyI6ImsiLCLisaoiOiJrIiwi6p2DIjoiayIsIuG4syI6ImsiLCLGmSI6ImsiLCLhuLUiOiJrIiwi4baEIjoiayIsIuqdgSI6ImsiLCLqnYUiOiJrIiwixLoiOiJsIiwixpoiOiJsIiwiyawiOiJsIiwixL4iOiJsIiwixLwiOiJsIiwi4bi9IjoibCIsIsi0IjoibCIsIuG4tyI6ImwiLCLhuLkiOiJsIiwi4rGhIjoibCIsIuqdiSI6ImwiLCLhuLsiOiJsIiwixYAiOiJsIiwiyasiOiJsIiwi4baFIjoibCIsIsmtIjoibCIsIsWCIjoibCIsIseJIjoibGoiLCLFvyI6InMiLCLhupwiOiJzIiwi4bqbIjoicyIsIuG6nSI6InMiLCLhuL8iOiJtIiwi4bmBIjoibSIsIuG5gyI6Im0iLCLJsSI6Im0iLCLhta8iOiJtIiwi4baGIjoibSIsIsWEIjoibiIsIsWIIjoibiIsIsWGIjoibiIsIuG5iyI6Im4iLCLItSI6Im4iLCLhuYUiOiJuIiwi4bmHIjoibiIsIse5IjoibiIsIsmyIjoibiIsIuG5iSI6Im4iLCLGniI6Im4iLCLhtbAiOiJuIiwi4baHIjoibiIsIsmzIjoibiIsIsOxIjoibiIsIseMIjoibmoiLCLDsyI6Im8iLCLFjyI6Im8iLCLHkiI6Im8iLCLDtCI6Im8iLCLhu5EiOiJvIiwi4buZIjoibyIsIuG7kyI6Im8iLCLhu5UiOiJvIiwi4buXIjoibyIsIsO2IjoibyIsIsirIjoibyIsIsivIjoibyIsIsixIjoibyIsIuG7jSI6Im8iLCLFkSI6Im8iLCLIjSI6Im8iLCLDsiI6Im8iLCLhu48iOiJvIiwixqEiOiJvIiwi4bubIjoibyIsIuG7oyI6Im8iLCLhu50iOiJvIiwi4bufIjoibyIsIuG7oSI6Im8iLCLIjyI6Im8iLCLqnYsiOiJvIiwi6p2NIjoibyIsIuKxuiI6Im8iLCLFjSI6Im8iLCLhuZMiOiJvIiwi4bmRIjoibyIsIserIjoibyIsIsetIjoibyIsIsO4IjoibyIsIse/IjoibyIsIsO1IjoibyIsIuG5jSI6Im8iLCLhuY8iOiJvIiwiyK0iOiJvIiwixqMiOiJvaSIsIuqdjyI6Im9vIiwiyZsiOiJlIiwi4baTIjoiZSIsIsmUIjoibyIsIuG2lyI6Im8iLCLIoyI6Im91Iiwi4bmVIjoicCIsIuG5lyI6InAiLCLqnZMiOiJwIiwixqUiOiJwIiwi4bWxIjoicCIsIuG2iCI6InAiLCLqnZUiOiJwIiwi4bW9IjoicCIsIuqdkSI6InAiLCLqnZkiOiJxIiwiyqAiOiJxIiwiyYsiOiJxIiwi6p2XIjoicSIsIsWVIjoiciIsIsWZIjoiciIsIsWXIjoiciIsIuG5mSI6InIiLCLhuZsiOiJyIiwi4bmdIjoiciIsIsiRIjoiciIsIsm+IjoiciIsIuG1syI6InIiLCLIkyI6InIiLCLhuZ8iOiJyIiwiybwiOiJyIiwi4bWyIjoiciIsIuG2iSI6InIiLCLJjSI6InIiLCLJvSI6InIiLCLihoQiOiJjIiwi6py/IjoiYyIsIsmYIjoiZSIsIsm/IjoiciIsIsWbIjoicyIsIuG5pSI6InMiLCLFoSI6InMiLCLhuaciOiJzIiwixZ8iOiJzIiwixZ0iOiJzIiwiyJkiOiJzIiwi4bmhIjoicyIsIuG5oyI6InMiLCLhuakiOiJzIiwiyoIiOiJzIiwi4bW0IjoicyIsIuG2iiI6InMiLCLIvyI6InMiLCLJoSI6ImciLCLhtJEiOiJvIiwi4bSTIjoibyIsIuG0nSI6InUiLCLFpSI6InQiLCLFoyI6InQiLCLhubEiOiJ0IiwiyJsiOiJ0IiwiyLYiOiJ0Iiwi4bqXIjoidCIsIuKxpiI6InQiLCLhuasiOiJ0Iiwi4bmtIjoidCIsIsatIjoidCIsIuG5ryI6InQiLCLhtbUiOiJ0IiwixqsiOiJ0IiwiyogiOiJ0IiwixaciOiJ0Iiwi4bW6IjoidGgiLCLJkCI6ImEiLCLhtIIiOiJhZSIsIsedIjoiZSIsIuG1tyI6ImciLCLJpSI6ImgiLCLKriI6ImgiLCLKryI6ImgiLCLhtIkiOiJpIiwiyp4iOiJrIiwi6p6BIjoibCIsIsmvIjoibSIsIsmwIjoibSIsIuG0lCI6Im9lIiwiybkiOiJyIiwiybsiOiJyIiwiyboiOiJyIiwi4rG5IjoiciIsIsqHIjoidCIsIsqMIjoidiIsIsqNIjoidyIsIsqOIjoieSIsIuqcqSI6InR6Iiwiw7oiOiJ1Iiwixa0iOiJ1Iiwix5QiOiJ1Iiwiw7siOiJ1Iiwi4bm3IjoidSIsIsO8IjoidSIsIseYIjoidSIsIseaIjoidSIsIsecIjoidSIsIseWIjoidSIsIuG5syI6InUiLCLhu6UiOiJ1IiwixbEiOiJ1IiwiyJUiOiJ1Iiwiw7kiOiJ1Iiwi4bunIjoidSIsIsawIjoidSIsIuG7qSI6InUiLCLhu7EiOiJ1Iiwi4burIjoidSIsIuG7rSI6InUiLCLhu68iOiJ1IiwiyJciOiJ1IiwixasiOiJ1Iiwi4bm7IjoidSIsIsWzIjoidSIsIuG2mSI6InUiLCLFryI6InUiLCLFqSI6InUiLCLhubkiOiJ1Iiwi4bm1IjoidSIsIuG1qyI6InVlIiwi6p24IjoidW0iLCLisbQiOiJ2Iiwi6p2fIjoidiIsIuG5vyI6InYiLCLKiyI6InYiLCLhtowiOiJ2Iiwi4rGxIjoidiIsIuG5vSI6InYiLCLqnaEiOiJ2eSIsIuG6gyI6InciLCLFtSI6InciLCLhuoUiOiJ3Iiwi4bqHIjoidyIsIuG6iSI6InciLCLhuoEiOiJ3Iiwi4rGzIjoidyIsIuG6mCI6InciLCLhuo0iOiJ4Iiwi4bqLIjoieCIsIuG2jSI6IngiLCLDvSI6InkiLCLFtyI6InkiLCLDvyI6InkiLCLhuo8iOiJ5Iiwi4bu1IjoieSIsIuG7syI6InkiLCLGtCI6InkiLCLhu7ciOiJ5Iiwi4bu/IjoieSIsIsizIjoieSIsIuG6mSI6InkiLCLJjyI6InkiLCLhu7kiOiJ5IiwixboiOiJ6Iiwixb4iOiJ6Iiwi4bqRIjoieiIsIsqRIjoieiIsIuKxrCI6InoiLCLFvCI6InoiLCLhupMiOiJ6IiwiyKUiOiJ6Iiwi4bqVIjoieiIsIuG1tiI6InoiLCLhto4iOiJ6IiwiypAiOiJ6IiwixrYiOiJ6IiwiyYAiOiJ6Iiwi76yAIjoiZmYiLCLvrIMiOiJmZmkiLCLvrIQiOiJmZmwiLCLvrIEiOiJmaSIsIu+sgiI6ImZsIiwixLMiOiJpaiIsIsWTIjoib2UiLCLvrIYiOiJzdCIsIuKCkCI6ImEiLCLigpEiOiJlIiwi4bWiIjoiaSIsIuKxvCI6ImoiLCLigpIiOiJvIiwi4bWjIjoiciIsIuG1pCI6InUiLCLhtaUiOiJ2Iiwi4oKTIjoieCJ9";
var Latinise = {}; Latinise.latin_map = JSON.parse(decodeURIComponent(escape(atob(base64map))));
String.prototype.latinise = function () { return this.replace(/[^A-Za-z0-9\[\] ]/g, function (a) { return Latinise.latin_map[a] || a }) };
String.prototype.latinize = String.prototype.latinise;
String.prototype.isLatin = function () { return this == this.latinise() }


function login() {
    $('#login').attr('action', '/login.html?'/* + Math.random().toString(36).substring(7)*/);
    $("input, .login-btn").fadeOut(function () {
        $(".loader").fadeIn(function () {

            $('#login').ajaxSubmit({
                success: function (response) {
                    changePage(response, true);
                },
                error: function (data) {

                    $(".loader").fadeOut(function () {

                        $("input, .login-btn").fadeIn();
                    });
                    //alert("Mauvais mot de passe!")
                    console.log("Failed to login");
                }
            });
        });
    });

}

function b64_to_utf8(s) {
    var arr = base64js.toByteArray(s);
    var i, str = '';
    for (i = 0; i < arr.length; i++) {
        str += '%' + ('0' + arr[i].toString(16)).slice(-2);
    }
    str = decodeURIComponent(str);
    console.log(str);
    return str;
}

var isAnimating = false;
$(window).blur(function () {
    $("#alttab").val(1);
})


$('body').on('click', '.science', function (event) {
    $("#answer").val($(this).data('option'));
    //detect which page has been selected
    //var newPage = $(this).data('href') + "?a=" + $(this).data('option') + "&q=" + $("#qid").val();

    eval($("#data_inject").html())


    $("form").ajaxSubmit();

    if (data.answer != $(this).data('option')) {
        $(this).addClass("nay");
        $("#answered").prepend("<p class='explain'>" + data.wrong + "</p>");
        $(".next-btn").hide();
        $(".punish").show()

        setTimeout(function () {
            $(".punish").fadeOut(500, "swing", function () {
                $(".next-btn").fadeIn(500, "swing");
            });
        }, 3500)
    } else {
        $("#answered").prepend("<p class='explain'>" + data.right + "</p>");
    }
    $(".science").eq(data.answer).addClass('yay');

    $(".science").removeClass('science');
    $(".explain").html($(".explain").html().replace(/(?:\r\n|\r|\n)/g, '<br />'))
    $("#answered").fadeIn(500, "swing", function () {
        $("body").animate({ scrollTop: $(document).height() }, "slow");
    });

    //if the page is not already being animated - trigger animation
    //if( !isAnimating ) changePage(newPage, true);
    //firstLoad = true;
});

$('body').on('click', '[data-type="page-transition"]', function (event) {
    event.preventDefault();
    //detect which page has been selected
    var newPage = $(this).data('href');
    //if the page is not animating - trigger animation
    if (!isAnimating) {
        changePage(newPage/* + '?' + Math.random().toString(36).substring(7)*/, true);
        console.log("Changing page");
    }

});
$('body').on('click', '.plusminus', function (event) {
    if ($(this).text() == "+") { $(this).text("-") } else { $(this).text("+") }
});

function addMod(modid) {
    $.ajax({
        url: "/addmod/" + modid
    });
}
function remMod(modid) {
    $.ajax({
        url: "/remmod/" + modid
    });
}
$('body').on('click', '.addmod', function (event) {
    if ($(this).text() == "+") {
        $(this).text("-");
        addMod($(this).data("modid"))
        $(".selection").append($('<a id="mod' + $(this).data("modid") + '" class="cd-btn" data-href="/' + $(this).data("modid") + '/q/" data-type="page-transition">' + $(this).data("modname") + '</a>').fadeIn().css("display", "inline-block"))
    } else {
        $(this).text("+")
        remMod($(this).data("modid"))
        $("#mod" + $(this).data("modid")).fadeOut(() => {
            $("#mod" + $(this).data("modid")).remove()
        });
    }

});
function changePage(url, bool) {
    gatrigger();
    isAnimating = true;
    // trigger page animation
    $('body').addClass('page-is-changing');
    //...
    loadNewContent(url, bool);
    //...
}

function loadNewContent(url, bool) {
    var newSectionName = 'cd-' + url.replace('.html', ''),
        section = $('<div class="cd-main-content ' + newSectionName + '"></div>');
    var startTime = Date.now();
    section.load(url + ' .cd-main-content > *', function (event) {
        // load new content and replace <main> content with the new one
        $('main').html(section);
        //...
        setTimeout(function () {

            $('body').removeClass('page-is-changing');

            //Animation will always last at least 850ms
        }, 850 - (Date.now() - startTime));
        //...
        isAnimating = false;
        if (url != window.location) {
            //add the new page to the window.history
            window.history.pushState({ path: url }, '', url);
        }
    });
}

$(window).on('popstate', function () {
    var newPageArray = location.pathname.split('/'),
        //this is the url of the page to be loaded 
        newPage = newPageArray[newPageArray.length - 1];
    if (!isAnimating) changePage(newPage);
});

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return undefined;
}
function gatrigger() {

    var username = readCookie("username")
    if (username !== undefined) {
        try {
            ga('set', 'userId', username);
        } catch (error) {

        }
    }
}

gatrigger()


$('body').on('keyup keypress', '.modsearch', function (event) {
    var searchStr = $(".modsearch").val().toLowerCase().latinize();
    $(".new-mod-container").show();
    //$(".new-mod-container p:contains('" + searchStr + "')").parent().show();

    searchStr.split(/[^a-z0-9]/ig).forEach(function (sterm) {
        $(".new-mod-container").each(function () {
            var pool = $(this).children(".new-mod-overlay").children("h2").text().toLowerCase().latinize() + " " + $(this).children(".new-mod-overlay").children("p.description").text().toLowerCase().latinize() + " " + $(this).children(".new-mod-overlay").children("p.seo").text().toLowerCase().latinize()
            if (!pool.includes(sterm)) {
                $(this).hide()
            }
            console.log(pool);
        })
    })

    if (searchStr == "") {
        $(".new-mod-container").show();
    }
    mansonry()
})

function mansonry() {
    $('.modules').packery({
        // options
        itemSelector: '.new-mod-container',
        gutter: 10
    });
}