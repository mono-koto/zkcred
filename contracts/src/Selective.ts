import {
  Field,
  method,
  PrivateKey,
  PublicKey,
  Signature,
  SmartContract,
  state,
  State,
} from 'snarkyjs';

export class Selective extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(PublicKey) issuer = State<PublicKey>();

  events = {
    'passed-test': PublicKey,
  };

  init() {
    super.init();

    // await isReady;

    if (process.env.ISSUER_PUBLIC_KEY) {
      this.issuer.set(PublicKey.fromBase58(process.env.ISSUER_PUBLIC_KEY));
    } else {
      this.issuer.set(PublicKey.empty());
    }
    if (process.env.OWNER_PUBLIC_KEY) {
      this.owner.set(PublicKey.fromBase58(process.env.OWNER_PUBLIC_KEY));
    } else {
      this.owner.set(PublicKey.empty());
    }
  }

  @method setOwner(owner: PublicKey) {
    this.owner.set(owner);
  }

  @method setIssuer(issuer: PublicKey, ownerPrivateKey: PrivateKey) {
    this.owner.assertEquals(this.owner.get());
    this.owner.get().assertEquals(ownerPrivateKey.toPublicKey());
    this.issuer.set(issuer);
  }

  @method disclose(
    holderPrivateKey: PrivateKey,
    credentialSubjectId: PublicKey,
    credentialSubjectData1: Field,
    credentialSubjectData2: Field,
    credentialSubjectProof: Signature,
    issuer: Field,
    issuerProof: Signature
  ) {
    const signerPublicKey = holderPrivateKey.toPublicKey();
    credentialSubjectId.assertEquals(signerPublicKey);

    signerPublicKey.assertEquals(credentialSubjectId);

    this.issuer.assertEquals(this.issuer.get());
    const issuerPublicKey = this.issuer.get();
    credentialSubjectProof
      .verify(issuerPublicKey, [
        ...credentialSubjectId.toFields(),
        credentialSubjectData1,
        credentialSubjectData2,
      ])
      .assertTrue();
    issuerProof.verify(issuerPublicKey, [issuer]).assertTrue();
    credentialSubjectData1.gte(credentialSubjectData2).assertTrue();

    this.emitEvent('passed-test', signerPublicKey);
  }
}
