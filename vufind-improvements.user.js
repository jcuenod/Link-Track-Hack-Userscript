// ==UserScript==
// @name         Vufind Improver
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Improve vufind a bit with counts of books and built in renew buttons
// @author       James Cuénod
// @match        https://vufind.carli.illinois.edu/*/MyResearch/CheckedOut
// @grant        none
// ==/UserScript==
const url = window.location;

const cssRules = [`#bd ~ #bd {
	display: grid;
	grid-template-columns: auto 150px;
}`, `#yui-main {
	grid-column-start: 1;
}`, `.yui-b {
	grid-column-start: 2;
	margin-right: 0 !important;
	width: auto !important;
}`, `#tabnav {
	position: sticky;
	top: 20px;
}`, `.datagrid ~ div {
    display: none;
}`, `.renew {
	display:inline-block;
	margin-left: 5px;
	margin-top: -10px;
	padding: 1px 3px;
	border: 1px solid #ddd;
	border-radius: 3px;
	outline: none;
}`, `.renew:hover {
	background-color: #ccc;
}`, `.success .renew {
	background-color: #8f8;
}`, `.success .renew:hover {
	background-color: #5a5;
}`, `.failure .renew {
	background-color: #e54;
}`, `.failure .renew:hover {
	background-color: #c54;
}`, `.busy .renew {
	border-radius: 50%;
	-webkit-animation:spin 1s linear infinite;
	-moz-animation:spin 1s linear infinite;
	animation:spin 1s linear infinite;
}`, `@-moz-keyframes spin { 100% { -moz-transform: rotate(-360deg); transform:rotate(-360deg); } }`,
`@-webkit-keyframes spin { 100% { -webkit-transform: rotate(-360deg); transform:rotate(-360deg); } }`,
`@keyframes spin { 100% { -webkit-transform: rotate(-360deg); transform:rotate(-360deg); } }`];

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

const parseResponse = (response) => response.text().then((text) => text);

const clickHandler = (event, td) => {
	event.preventDefault();
	const key = event.target.getAttribute("data-key");
	td.classList.add("busy");
	postData({im_ubid: [key]}).then(resp => parseResponse(resp)).then(text => {
		const success = !text.match(".*fail.*");
		if (success) {
			parser=new DOMParser();
			htmlDoc=parser.parseFromString(text, "text/html");
			const renewTr = [...htmlDoc.querySelectorAll("tr")].filter(a => a.outerHTML.includes(key))[0];
			const dateTd = td.parentNode.querySelector("td[sorttable_customkey]");
			const newDateTd = renewTr.querySelector("td[sorttable_customkey]");
			dateTd.setAttribute("sorttable_customkey", newDateTd.getAttribute("sorttable_customkey"));
			dateTd.innerHTML = `<b>${newDateTd.innerHTML}</b>`;
		}
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
	const renewButtons = [];
	tds.forEach(td => {
		const newButton = document.createElement("a");
		newButton.appendChild(document.createTextNode("↺"));
		newButton.onclick = (e) => clickHandler(e, td);
		newButton.href = "#";
		newButton.classList.add("renew");

		const chkInput = td.querySelector("input");
		newButton.setAttribute("data-key", chkInput.value);
		chkInput.remove();

		td.appendChild(newButton);
		renewButtons.push(newButton);

		const counterTd = document.createElement("td");
		counterTd.appendChild(document.createTextNode(counter++));
		td.parentNode.insertBefore(counterTd, td.parentNode.firstChild);
	});

	const renewAllDiv = document.querySelector("form[name='Form1'] div:first-child");
	while (renewAllDiv.lastChild) {
		renewAllDiv.removeChild(renewAllDiv.lastChild);
	}
	const renewAllButton = document.createElement("button");
	renewAllButton.appendChild(document.createTextNode("Renew All"));
	renewAllButton.onclick = (e) => {
		e.preventDefault();
		renewButtons.forEach(b => b.click());
	};
	renewAllDiv.appendChild(renewAllButton);

	const sheet = window.document.styleSheets[0];
	cssRules.forEach(rule => {
		sheet.insertRule(rule, sheet.cssRules.length);
	});
})();

