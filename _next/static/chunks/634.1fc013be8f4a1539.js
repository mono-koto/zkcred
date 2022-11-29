(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[634],{

/***/ 3454:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var ref, ref1;
module.exports = ((ref = __webpack_require__.g.process) == null ? void 0 : ref.env) && typeof ((ref1 = __webpack_require__.g.process) == null ? void 0 : ref1.env) === "object" ? __webpack_require__.g.process : __webpack_require__(7663);

//# sourceMappingURL=process.js.map

/***/ }),

/***/ 5088:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ Presentation; }
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5893);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(7294);
// EXTERNAL MODULE: ./node_modules/snarkyjs/dist/web/index.js
var web = __webpack_require__(6400);
;// CONCATENATED MODULE: ./components/zkAppSelectiveWorkerClient.ts
class zkAppSelectiveWorkerClient {
    // ---------------------------------------------------------------------------------------
    loadSnarkyJS() {
        return this._call("loadSnarkyJS", {});
    }
    setActiveInstanceToBerkeley() {
        return this._call("setActiveInstanceToBerkeley", {});
    }
    loadContract() {
        return this._call("loadContract", {});
    }
    compileContract() {
        return this._call("compileContract", {});
    }
    fetchAccount(param) {
        let { publicKey  } = param;
        const result = this._call("fetchAccount", {
            publicKey58: publicKey.toBase58()
        });
        return result;
    }
    initZkappInstance(publicKey) {
        return this._call("initZkappInstance", {
            publicKey58: publicKey.toBase58()
        });
    }
    createPresentTransaction(args) {
        return this._call("createPresentTransaction", {
            credentialHolderPrivateKeyJSON: args.credentialHolderPrivateKey.toJSON(),
            credentialSubjectIdJSON: args.credentialSubjectId.toJSON(),
            credentialSubjectData1JSON: args.credentialSubjectData1.toJSON(),
            credentialSubjectData2JSON: args.credentialSubjectData2.toJSON(),
            credentialSubjectSignedJSON: args.credentialSubjectSigned.toJSON()
        });
    }
    provePresentTransaction() {
        return this._call("provePresentTransaction", {});
    }
    async getTransactionJSON() {
        const result = await this._call("getTransactionJSON", {});
        return result;
    }
    _call(fn, args) {
        return new Promise((resolve, reject)=>{
            this.promises[this.nextId] = {
                resolve,
                reject
            };
            const message = {
                id: this.nextId,
                fn,
                args
            };
            this.worker.postMessage(message);
            this.nextId++;
        });
    }
    constructor(){
        this.worker = new Worker(__webpack_require__.tu(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(122), __webpack_require__.b)));
        this.promises = {};
        this.nextId = 0;
        this.worker.onmessage = (event)=>{
            this.promises[event.data.id].resolve(event.data.data);
            delete this.promises[event.data.id];
        };
    }
}


;// CONCATENATED MODULE: ./components/PresentButton.tsx




let transactionFee = 0.1;
function PresentButton(props) {
    let [state, setState] = (0,react.useState)({
        zkAppWorkerClient: null,
        hasWallet: null,
        hasBeenSetup: false,
        accountExists: false,
        publicKey: null,
        zkAppPublicKey: null,
        creatingTransaction: false
    });
    // -------------------------------------------------------
    // Do Setup
    (0,react.useEffect)(()=>{
        (async ()=>{
            if (!state.hasBeenSetup) {
                const zkAppWorkerClient = new zkAppSelectiveWorkerClient();
                console.log("Loading SnarkyJS...");
                await zkAppWorkerClient.loadSnarkyJS();
                console.log("done");
                await zkAppWorkerClient.setActiveInstanceToBerkeley();
                const mina = window.mina;
                if (mina == null) {
                    setState({
                        ...state,
                        hasWallet: false
                    });
                    return;
                }
                const publicKeyBase58 = (await mina.requestAccounts())[0];
                const publicKey = web/* PublicKey.fromBase58 */.nh.fromBase58(publicKeyBase58);
                console.log("using key", publicKey.toBase58());
                console.log("checking if account exists...");
                const res = await zkAppWorkerClient.fetchAccount({
                    publicKey: publicKey
                });
                const accountExists = res.error == null;
                await zkAppWorkerClient.loadContract();
                console.log("compiling zkApp");
                await zkAppWorkerClient.compileContract();
                console.log("zkApp compiled");
                const zkAppPublicKey = web/* PublicKey.fromBase58 */.nh.fromBase58("B62qpFP6zq6YSPGGE1qqbxmeVvhCxm47sWCbkb1PNMyjTSWgSdSs4Bg");
                await zkAppWorkerClient.initZkappInstance(zkAppPublicKey);
                console.log("fetching zkApp account...");
                await zkAppWorkerClient.fetchAccount({
                    publicKey: zkAppPublicKey
                });
                console.log("fetched");
                // // const currentNum = await zkAppWorkerClient.getNum();
                // // console.log("current state:", currentNum.toString());
                setState({
                    ...state,
                    zkAppWorkerClient,
                    hasWallet: true,
                    hasBeenSetup: true,
                    publicKey,
                    zkAppPublicKey,
                    accountExists
                });
            }
        })();
    }, []);
    // -------------------------------------------------------
    // Wait for account to exist, if it didn't
    (0,react.useEffect)(()=>{
        (async ()=>{
            if (state.hasBeenSetup && !state.accountExists) {
                for(;;){
                    console.log("checking if account exists...");
                    const res = await state.zkAppWorkerClient.fetchAccount({
                        publicKey: state.publicKey
                    });
                    const accountExists = res.error == null;
                    if (accountExists) {
                        break;
                    }
                    await new Promise((resolve)=>setTimeout(resolve, 1000));
                }
                setState({
                    ...state,
                    accountExists: true
                });
            }
        })();
    }, [
        state.hasBeenSetup
    ]);
    // -------------------------------------------------------
    // -------------------------------------------------------
    // Send a transaction
    const onSendTransaction = async (event)=>{
        setState({
            ...state,
            creatingTransaction: true
        });
        console.log("sending a transaction...");
        await state.zkAppWorkerClient.fetchAccount({
            publicKey: state.publicKey
        });
        await state.zkAppWorkerClient.createPresentTransaction({
            credentialHolderPrivateKey: web/* PrivateKey.fromBase58 */._q.fromBase58("EKEnFP8BP7tAgxwGFuGSq1XjhmVMXhP1CkZfmWWkaz98boET8bwG"),
            credentialSubjectId: props.credentialSubjectId,
            credentialSubjectData1: props.credentialSubjectData1,
            credentialSubjectData2: props.credentialSubjectData2,
            credentialSubjectSigned: props.credentialSubjectSigned
        });
        console.log("creating proof...");
        await state.zkAppWorkerClient.provePresentTransaction();
        console.log("getting Transaction JSON...");
        const transactionJSON = await state.zkAppWorkerClient.getTransactionJSON();
        console.log("requesting send transaction...");
        const { hash  } = await window.mina.sendTransaction({
            transaction: transactionJSON,
            feePayer: {
                fee: transactionFee,
                memo: ""
            }
        });
        console.log("See transaction at https://berkeley.minaexplorer.com/transaction/" + hash);
        setState({
            ...state,
            creatingTransaction: false
        });
    };
    // -------------------------------------------------------
    const enabled = props.credentialSubjectId && props.credentialSubjectData1 && props.credentialSubjectData2 && props.credentialSubjectSigned && state.hasBeenSetup;
    console.log(enabled, props.credentialSubjectId, props.credentialSubjectData1, props.credentialSubjectData2, props.credentialSubjectSigned, state.hasBeenSetup);
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("button", {
        onClick: onSendTransaction,
        className: "bg-blue-500 active:bg-yellow-500 text-white p-2 rounded text-xl disabled:opacity-50",
        disabled: !enabled,
        children: "Present"
    });
}

;// CONCATENATED MODULE: ./components/Presentation.tsx




function Presentation() {
    var ref, ref1, ref2;
    const [parsedValue, setParsedValue] = (0,react.useState)({});
    const handleChange = (event)=>{
        let vc = {};
        try {
            vc = JSON.parse(event.currentTarget.value);
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
    let args;
    if (parsedValue.value) {
        const { credentialSubject , proof  } = parsedValue.value;
        args = {
            credentialSubjectId: web/* PublicKey.fromJSON */.nh.fromJSON(credentialSubject.id),
            credentialSubjectData1: web/* Field.fromJSON */.gN.fromJSON(credentialSubject.data[0]),
            credentialSubjectData2: web/* Field.fromJSON */.gN.fromJSON(credentialSubject.data[1]),
            credentialSubjectSigned: web/* Signature.fromJSON */.Pc.fromJSON(proof.credentialSubject)
        };
    }
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("h1", {
                children: "Presentation"
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                className: "flex flex-row gap-4",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "w-5/12",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("textarea", {
                                className: "text-sm w-full border-2 p-2 border-black font-mono whitespace-pre",
                                spellCheck: false,
                                rows: 30,
                                onChange: handleChange
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                children: parsedValue.error
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        className: "shrink-1",
                        children: "→"
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "w-6/12 flex flex-col gap-2",
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)(PresentButton, {
                                    ...args
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("h2", {
                                className: "text-lg text-slate-600",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("code", {
                                        children: "present()"
                                    }),
                                    " Arguments:"
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "text-sm",
                                        children: "credentialSubjectId (PublicKey)"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "overflow-scroll whitespace-pre font-mono",
                                        children: args === null || args === void 0 ? void 0 : args.credentialSubjectId.toBase58()
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "text-sm",
                                        children: "credentialSubjectData1 (Field)"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "overflow-scroll whitespace-pre font-mono",
                                        children: args === null || args === void 0 ? void 0 : (ref = args.credentialSubjectData1) === null || ref === void 0 ? void 0 : ref.toString()
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "text-sm",
                                        children: "credentialSubjectData2 (Field)"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "overflow-scroll whitespace-pre font-mono",
                                        children: args === null || args === void 0 ? void 0 : (ref1 = args.credentialSubjectData2) === null || ref1 === void 0 ? void 0 : ref1.toString()
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "text-sm",
                                        children: "credentialSubjectSigned (Signature)"
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                        className: "overflow-scroll whitespace-pre font-mono",
                                        children: JSON.stringify((args === null || args === void 0 ? void 0 : (ref2 = args.credentialSubjectSigned) === null || ref2 === void 0 ? void 0 : ref2.toJSON()) || {}, null, 2)
                                    })
                                ]
                            })
                        ]
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