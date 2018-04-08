// ==UserScript==
// @name         Vufind Improver
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Improve vufind a bit with counts of books and built in renew buttons
// @author       James Cuénod
// @match        https://vufind.carli.illinois.edu/*/MyResearch/CheckedOut
// @grant        none
// ==/UserScript==

const url = "https://vufind.carli.illinois.edu/all/vf/MyResearch/CheckedOut";

const serialize = (obj, prefix) => {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
};

const postData = (data) => {
  // Default options are marked with *
  return fetch(url, {
    body: serialize(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // *manual, follow, error
    referrer: 'no-referrer', // *client, no-referrer
  });
};

const parseResponse = (response) => response.text().then((text) => !text.match(".*fail.*"));

const clickHandler = (td) => {
    const chkInput = td.querySelector("input");
    const key = chkInput.value;
    td.classList.add("busy");
    postData({im_ubid: [key]}).then(resp => parseResponse(resp)).then(success => {
        td.classList.add(success ? "success" : "failure");
        td.classList.remove("busy");
    }).catch(error => alert(error));
};

(function() {
    'use strict';
    const tds = document.querySelectorAll(".datagrid.sortable td:last-child");

    const firstTh = document.querySelector(".datagrid.sortable th:first-child");
    const newTh = document.createElement("th");
    firstTh.parentNode.insertBefore(newTh, firstTh);

    let counter = 1;
    tds.forEach(td => {
        const newButton = document.createElement("a");
        newButton.appendChild(document.createTextNode("↺"));
        newButton.onclick = () => clickHandler(td);
        newButton.href = "#";
        newButton.classList.add("renew");
        td.appendChild(newButton);

        const counterTd = document.createElement("td");
        counterTd.appendChild(document.createTextNode(counter++));
        td.parentNode.insertBefore(counterTd, td.parentNode.firstChild);
    });
})();
