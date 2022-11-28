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

  @method present(
    holderPrivateKey: PrivateKey,
    credentialSubjectId: PublicKey,
    credentialSubjectData1: Field,
    credentialSubjectData2: Field,
    credentialSubjectSigned: Signature
  ) {
    // In our simplified presentation, the signer must be the subject
    const signerPublicKey = holderPrivateKey.toPublicKey();
    credentialSubjectId.assertEquals(signerPublicKey);

    // The credential subject and data must be signed by the issuer
    // that is set on the contract
    this.issuer.assertEquals(this.issuer.get());
    const issuerPublicKey = this.issuer.get();
    credentialSubjectSigned
      .verify(issuerPublicKey, [
        ...credentialSubjectId.toFields(),
        credentialSubjectData1,
        credentialSubjectData2,
      ])
      .assertTrue();

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
