import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  PrivateKey,
  Signature,
} from 'snarkyjs';

const ISSUER_PUBLIC_KEY = PublicKey.fromBase58(
  process.env.ISSUER_PUBLIC_KEY || ''
);
const OWNER_PUBLIC_KEY = PublicKey.fromBase58(
  process.env.OWNER_PUBLIC_KEY || ''
);

export class Selective extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(PublicKey) issuer = State<PublicKey>();

  init() {
    super.init();
    this.owner.set(OWNER_PUBLIC_KEY);
    this.issuer.set(ISSUER_PUBLIC_KEY);
  }

  @method selectivelyDisclose(
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

    signerPublicKey.toGroup().assertEquals(credentialSubjectId.toGroup());

    this.issuer.assertEquals(this.issuer.get());
    const key = this.issuer.get();
    credentialSubjectProof
      .verify(key, [
        ...credentialSubjectId.toFields(),
        credentialSubjectData1,
        credentialSubjectData2,
      ])
      .assertTrue();
    issuerProof.verify(key, [issuer]).assertTrue();
    credentialSubjectData1.gte(credentialSubjectData2).assertTrue();

    this.emitEvent('passed-test', signerPublicKey);
  }
}
