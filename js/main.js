/*
 *  EtudieCA by Slava Knyazev
 *  Expo-Sciences 2016-2017
 *  Built from viruzx/erablio
 */



(function (r) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = r() } else if (typeof define === "function" && define.amd) { define([], r) } else { var e; if (typeof window !== "undefined") { e = window } else if (typeof global !== "undefined") { e = global } else if (typeof self !== "undefined") { e = self } else { e = this } e.base64js = r() } })(function () { var r, e, t; return function r(e, t, n) { function o(i, a) { if (!t[i]) { if (!e[i]) { var u = typeof require == "function" && require; if (!a && u) return u(i, !0); if (f) return f(i, !0); var d = new Error("Cannot find module '" + i + "'"); throw d.code = "MODULE_NOT_FOUND", d } var c = t[i] = { exports: {} }; e[i][0].call(c.exports, function (r) { var t = e[i][1][r]; return o(t ? t : r) }, c, c.exports, r, e, t, n) } return t[i].exports } var f = typeof require == "function" && require; for (var i = 0; i < n.length; i++)o(n[i]); return o }({ "/": [function (r, e, t) { "use strict"; t.byteLength = c; t.toByteArray = v; t.fromByteArray = s; var n = []; var o = []; var f = typeof Uint8Array !== "undefined" ? Uint8Array : Array; var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; for (var a = 0, u = i.length; a < u; ++a) { n[a] = i[a]; o[i.charCodeAt(a)] = a } o["-".charCodeAt(0)] = 62; o["_".charCodeAt(0)] = 63; function d(r) { var e = r.length; if (e % 4 > 0) { throw new Error("Invalid string. Length must be a multiple of 4") } return r[e - 2] === "=" ? 2 : r[e - 1] === "=" ? 1 : 0 } function c(r) { return r.length * 3 / 4 - d(r) } function v(r) { var e, t, n, i, a, u; var c = r.length; a = d(r); u = new f(c * 3 / 4 - a); n = a > 0 ? c - 4 : c; var v = 0; for (e = 0, t = 0; e < n; e += 4, t += 3) { i = o[r.charCodeAt(e)] << 18 | o[r.charCodeAt(e + 1)] << 12 | o[r.charCodeAt(e + 2)] << 6 | o[r.charCodeAt(e + 3)]; u[v++] = i >> 16 & 255; u[v++] = i >> 8 & 255; u[v++] = i & 255 } if (a === 2) { i = o[r.charCodeAt(e)] << 2 | o[r.charCodeAt(e + 1)] >> 4; u[v++] = i & 255 } else if (a === 1) { i = o[r.charCodeAt(e)] << 10 | o[r.charCodeAt(e + 1)] << 4 | o[r.charCodeAt(e + 2)] >> 2; u[v++] = i >> 8 & 255; u[v++] = i & 255 } return u } function l(r) { return n[r >> 18 & 63] + n[r >> 12 & 63] + n[r >> 6 & 63] + n[r & 63] } function h(r, e, t) { var n; var o = []; for (var f = e; f < t; f += 3) { n = (r[f] << 16) + (r[f + 1] << 8) + r[f + 2]; o.push(l(n)) } return o.join("") } function s(r) { var e; var t = r.length; var o = t % 3; var f = ""; var i = []; var a = 16383; for (var u = 0, d = t - o; u < d; u += a) { i.push(h(r, u, u + a > d ? d : u + a)) } if (o === 1) { e = r[t - 1]; f += n[e >> 2]; f += n[e << 4 & 63]; f += "==" } else if (o === 2) { e = (r[t - 2] << 8) + r[t - 1]; f += n[e >> 10]; f += n[e >> 4 & 63]; f += n[e << 2 & 63]; f += "=" } i.push(f); return i.join("") } }, {}] }, {}, [])("/") });

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function login() {
    $('#login').attr('action', '/login.html?'/* + Math.random().toString(36).substring(7)*/);
    $("input, .login-btn").fadeOut(function () {
        $(".loader").fadeIn();
    });
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
    } else {


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
    var searchStr = $(".modsearch").val();
    $(".new-mod-container").show();
    //$(".new-mod-container p:contains('" + searchStr + "')").parent().show();

    searchStr.split(/[^a-z0-9]/ig).forEach(function (sterm) {
        $(".new-mod-container").each(function () {
            var pool =  $(this).children("h2").text().toLowerCase() + " " + $(this).children("p.description").text().toLowerCase() + " " + $(this).children("p.seo").text().toLowerCase()
            if (!pool.includes(sterm)) {
                $(this).hide()
            }
            console.log(pool);
        })
    })
    /*searchStr.split(" ").forEach(function (sterm) {
        $(".new-mod-container p.seo").each(function () {
            if ($(this).text().toLowerCase().includes(sterm)) {
                $(this).parent().show()
            }
        })
    })*/
    if (searchStr == "") {
        $(".new-mod-container").show();
    }
})