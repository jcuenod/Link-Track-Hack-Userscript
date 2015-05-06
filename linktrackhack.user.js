// ==UserScript==
// @name         Google Link Hack
// @namespace    https://github.com/jcuenod/Link-Track-Hack-Userscript
// @version      0.1
// @description  Transform google links into untrackable links by holding the 'alt' key
// @author       jcuenod
// @grant        GM_addStyle
// @include       http://*.google.*
// @include       https://*.google.*
// @include       http://*.youtube.*
// @include       https://*.youtube.*
// @include       file://*
// ==/UserScript==

// TODO: highlight link that is hovered
// TODO: show OSD?

var $;

// Add jQuery
(function(){
    if (typeof unsafeWindow.jQuery == 'undefined') {
        var GM_Head = document.getElementsByTagName('head')[0] || document.documentElement,
            GM_JQ = document.createElement('script');

        GM_JQ.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
        GM_JQ.type = 'text/javascript';
        GM_JQ.async = true;

        GM_Head.insertBefore(GM_JQ, GM_Head.firstChild);
    }
    GM_wait();
})();

// Check if jQuery's loaded
function GM_wait() {
    if (typeof unsafeWindow.jQuery == 'undefined') {
        window.setTimeout(GM_wait, 100);
    } else {
        $ = unsafeWindow.jQuery.noConflict(true);
        letsJQuery();
    }
}

// All your GM code must be inside this function
function letsJQuery() {
    console.log("glh: setting up google link hack");
    $(document).on("ready", function(){
        $(document).on("keydown", function (e) {
            if (e.which == 18)
                createPseudoLinks($); //create
        }).on("keyup", function (e) {
            if (e.which == 18)
                $(".linklify").remove(); //delete
        });
    });
    console.log("glh: done");
}



GM_addStyle ( "                                     \
.linklify:hover {                                   \
opacity: 0.7;          \
}                                               \
" );

function createPseudoLinks(jQ)
{
    jQ("a[href]").each(function(){
        jQThis = jQ(this);
        jQ('body').append(jQ("<a>").css({
            'width': jQThis.width() + 4,
            'height': jQThis.height() + 4,
            'top': jQThis.offset().top -2,
            'left': jQThis.offset().left -2,
            'position': 'absolute',
            'display': "block",
            'backgroundColor': "#555",
            'opacity': 0.5,
            'borderRadius': 2
        }).attr("href", jQThis.attr("href")).addClass("linklify"));
    });
}
