"use strict";
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[837],{

/***/ 1837:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Selective": function() { return /* binding */ Selective; }
/* harmony export */ });
/* harmony import */ var snarkyjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6400);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Selective extends snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .SmartContract */ .C3 {
    constructor() {
        super(...arguments);
        this.owner = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.issuer = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.events = {
            'passed-test': snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh,
        };
    }
    init() {
        super.init();
        const issuerPublicKey = 'B62qnx57d2gX2wHxR7zmsUM2cvFprDyqFEu1FXtGgvorpYXNhVbbMLs';
        this.issuer.set(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey.fromBase58 */ .nh.fromBase58(issuerPublicKey));
    }
    setOwner(owner) {
        this.owner.set(owner);
    }
    setIssuer(issuer, ownerPrivateKey) {
        this.owner.assertEquals(this.owner.get());
        this.owner.get().assertEquals(ownerPrivateKey.toPublicKey());
        this.issuer.set(issuer);
    }
    present(holderPrivateKey, credentialSubjectId, credentialSubjectData1, credentialSubjectData2, credentialSubjectSigned) {
        // In our simplified presentation, the signer must be the subject
        const signerPublicKey = holderPrivateKey.toPublicKey();
        credentialSubjectId.assertEquals(signerPublicKey);
        // The credential subject and data must be signed by the issuer
        // that is set on the contract
        this.issuer.assertEquals(this.issuer.get());
        const issuerPublicKey = this.issuer.get();
        const msg = [
            ...credentialSubjectId.toFields(),
            credentialSubjectData1,
            credentialSubjectData2,
        ];
        credentialSubjectSigned.verify(issuerPublicKey, msg).assertTrue();
        // Business logic here - whatever we actually want to disclose
        // In this case, we're disclosing whether
        // credentialSubjectData1 >= credentialSubjectData2
        // TODO - inject or dynamically dispatch to alternative logic
        credentialSubjectData1.gte(credentialSubjectData2).assertTrue();
        // If all of the above is true, we can disclose that we have passed the
        // test without ever disclosing the private data
        this.emitEvent('passed-test', signerPublicKey);
    }
}
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh),
    __metadata("design:type", Object)
], Selective.prototype, "owner", void 0);
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh),
    __metadata("design:type", Object)
], Selective.prototype, "issuer", void 0);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh]),
    __metadata("design:returntype", void 0)
], Selective.prototype, "setOwner", null);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh, snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PrivateKey */ ._q]),
    __metadata("design:returntype", void 0)
], Selective.prototype, "setIssuer", null);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PrivateKey */ ._q,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Signature */ .Pc]),
    __metadata("design:returntype", void 0)
], Selective.prototype, "present", null);


/***/ })

}]);