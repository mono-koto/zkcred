(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[319],{

/***/ 3454:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var ref, ref1;
module.exports = ((ref = __webpack_require__.g.process) == null ? void 0 : ref.env) && typeof ((ref1 = __webpack_require__.g.process) == null ? void 0 : ref1.env) === "object" ? __webpack_require__.g.process : __webpack_require__(7663);

//# sourceMappingURL=process.js.map

/***/ }),

/***/ 8125:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Issuance; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var snarkyjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6400);



const privateKey = "EKEzKKCCwzMThd4BnApG5ZPuARbxvh6YeV5BXHf6CmcmjscuLwa5";
const defaultUnsignedCredentialText = '{\n  "@context": [\n    "https://www.w3.org/2018/credentials/v1",\n    "https://www.w3.org/2018/credentials/examples/v1"\n  ],\n  "type": ["VerifiableCredential"],\n  "credentialSchema": {\n    "id": "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",\n    "type": "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"\n  },\n  "issuer": "B62qnx57d2gX2wHxR7zmsUM2cvFprDyqFEu1FXtGgvorpYXNhVbbMLs",\n  "credentialSubject": {\n    "id": "B62qpKoe4nhvAuXPfy8MwawX5LtCyj8pbV8hMMsjPV2XdjgxQywohmw",\n    "data": [100, 99]\n  }\n}';
const defaultUnsignedCredential = JSON.stringify(JSON.parse(defaultUnsignedCredentialText), null, 2);
function publicKeyToSignature(p, privateKey) {
    return snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .Signature.create */ .Pc.create(privateKey, p.toFields());
}
function addProofToVC(vc, privateKey) {
    const issuerPrivateKey = snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .PrivateKey.fromBase58 */ ._q.fromBase58(privateKey);
    const signedIssuer = publicKeyToSignature(snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .PublicKey.fromBase58 */ .nh.fromBase58(vc.issuer), issuerPrivateKey);
    const signedSubjectId = publicKeyToSignature(snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .PublicKey.fromBase58 */ .nh.fromBase58(vc.credentialSubject.id), issuerPrivateKey);
    const msg = [
        ...snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .PublicKey.fromBase58 */ .nh.fromBase58(vc.credentialSubject.id).toFields(),
        ...vc.credentialSubject.data.map((d)=>new snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .Field */ .gN(d))
    ];
    const signedSubjectData = snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .Signature.create */ .Pc.create(issuerPrivateKey, msg);
    console.log("signed msg:", msg, msg.map((m)=>m.toJSON()));
    vc.proof = {
        type: "SnarkyCredentialVerification2022",
        credentialSubject: signedSubjectData.toJSON()
    };
    return vc;
}
function Issuance() {
    var ref;
    const [parsedValue, setParsedValue] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});
    const [issuerPrivateKey, setIssuerPrivateKey] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(privateKey);
    const onIssuerPrivateKeyChange = (event)=>{
        setIssuerPrivateKey(event.target.value);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        (async ()=>{
            await snarkyjs__WEBPACK_IMPORTED_MODULE_2__/* .isReady */ .DK;
            setParsedValue({
                value: addProofToVC(JSON.parse(defaultUnsignedCredentialText), issuerPrivateKey)
            });
        })();
    }, []);
    const handleChange = (event)=>{
        console.log(event.currentTarget.value);
        let vc = {};
        try {
            vc = JSON.parse(event.currentTarget.value);
            addProofToVC(vc, issuerPrivateKey);
        } catch (e) {
            setParsedValue({
                error: e.message
            });
            return;
        }
        setParsedValue({
            value: vc
        });
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", {
                children: "Issuance"
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex flex-row gap-4",
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "w-1/2",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("textarea", {
                                className: "text-sm w-full border-2 p-2 border-black font-mono whitespace-pre",
                                spellCheck: false,
                                rows: 30,
                                onChange: handleChange,
                                defaultValue: defaultUnsignedCredential
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                                className: "text-sm mb-2 text-red-500",
                                children: parsedValue.error
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", {
                                        className: "text-sm",
                                        htmlFor: "issuerPrivateKey",
                                        children: "Issuer Private Key (Base-58)"
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", {
                                        className: "font-mono w-full border-black border-2 p-2",
                                        type: "text",
                                        id: "issuerPrivateKey",
                                        onChange: onIssuerPrivateKeyChange,
                                        value: privateKey
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                        className: "shrink-1",
                        children: "→"
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                        className: "shrink-0 grow overflow-scroll",
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("textarea", {
                            className: "border-2 border-gray text-slate-800 bg-slate-50 text-sm w-full font-mono whitespace-pre",
                            spellCheck: false,
                            rows: 30,
                            onChange: handleChange,
                            value: (ref = JSON.stringify(parsedValue.value, null, 2)) === null || ref === void 0 ? void 0 : ref.replaceAll(/\n/g, "\n"),
                            readOnly: true
                        })
                    })
                ]
            })
        ]
    });
}


/***/ }),

/***/ 7663:
/***/ (function(module) {

var __dirname = "/";
(function(){var e={229:function(e){var t=e.exports={};var r;var n;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){r=setTimeout}else{r=defaultSetTimout}}catch(e){r=defaultSetTimout}try{if(typeof clearTimeout==="function"){n=clearTimeout}else{n=defaultClearTimeout}}catch(e){n=defaultClearTimeout}})();function runTimeout(e){if(r===setTimeout){return setTimeout(e,0)}if((r===defaultSetTimout||!r)&&setTimeout){r=setTimeout;return setTimeout(e,0)}try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}function runClearTimeout(e){if(n===clearTimeout){return clearTimeout(e)}if((n===defaultClearTimeout||!n)&&clearTimeout){n=clearTimeout;return clearTimeout(e)}try{return n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}var i=[];var o=false;var u;var a=-1;function cleanUpNextTick(){if(!o||!u){return}o=false;if(u.length){i=u.concat(i)}else{a=-1}if(i.length){drainQueue()}}function drainQueue(){if(o){return}var e=runTimeout(cleanUpNextTick);o=true;var t=i.length;while(t){u=i;i=[];while(++a<t){if(u){u[a].run()}}a=-1;t=i.length}u=null;o=false;runClearTimeout(e)}t.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1){for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}}i.push(new Item(e,t));if(i.length===1&&!o){runTimeout(drainQueue)}};function Item(e,t){this.fun=e;this.array=t}Item.prototype.run=function(){this.fun.apply(null,this.array)};t.title="browser";t.browser=true;t.env={};t.argv=[];t.version="";t.versions={};function noop(){}t.on=noop;t.addListener=noop;t.once=noop;t.off=noop;t.removeListener=noop;t.removeAllListeners=noop;t.emit=noop;t.prependListener=noop;t.prependOnceListener=noop;t.listeners=function(e){return[]};t.binding=function(e){throw new Error("process.binding is not supported")};t.cwd=function(){return"/"};t.chdir=function(e){throw new Error("process.chdir is not supported")};t.umask=function(){return 0}}};var t={};function __nccwpck_require__(r){var n=t[r];if(n!==undefined){return n.exports}var i=t[r]={exports:{}};var o=true;try{e[r](i,i.exports,__nccwpck_require__);o=false}finally{if(o)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(229);module.exports=r})();

/***/ })

}]);