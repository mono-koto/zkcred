(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[888],{

/***/ 5492:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/_app",
      function () {
        return __webpack_require__(5723);
      }
    ]);
    if(false) {}
  

/***/ }),

/***/ 5723:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ App; }
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5893);
// EXTERNAL MODULE: ./styles/globals.css
var globals = __webpack_require__(6774);
// EXTERNAL MODULE: ./pages/reactCOIServiceWorker.tsx
var reactCOIServiceWorker = __webpack_require__(9639);
;// CONCATENATED MODULE: ./components/Navbar.tsx

function Navbar() {
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: "p-3 ",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("h1", {
                className: "text-3xl",
                children: "\uD83E\uDEAA zkcred"
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                className: "text-slate-600",
                children: "Selective Disclosure of Verifiable Credentials via Zero-Knowledge Proofs"
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("nav", {})
        ]
    });
}

;// CONCATENATED MODULE: ./components/Footer.tsx

function Footer() {
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("footer", {
        className: "p-4",
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)("a", {
            href: "https://github.com/mono-koto/zkcred",
            children: "View on GitHub"
        })
    });
}

;// CONCATENATED MODULE: ./components/Layout.tsx



function Layout(param) {
    let { children  } = param;
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)(Navbar, {}),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("main", {
                className: "p-4",
                children: children
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(Footer, {})
        ]
    });
}

;// CONCATENATED MODULE: ./pages/_app.page.tsx




function App(param) {
    let { Component , pageProps  } = param;
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(Layout, {
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(Component, {
            ...pageProps
        })
    });
}


/***/ }),

/***/ 9639:
/***/ (function() {

function loadCOIServiceWorker() {
    if ( true && window.location.hostname != "localhost") {
        const coi = window.document.createElement("script");
        coi.setAttribute("src", "/coi-serviceworker.min.js"); // update if your repo name changes for npm run deploy to work successfully
        window.document.head.appendChild(coi);
    }
}
loadCOIServiceWorker();


/***/ }),

/***/ 6774:
/***/ (function() {

// extracted by mini-css-extract-plugin

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [774,179], function() { return __webpack_exec__(5492), __webpack_exec__(880); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);