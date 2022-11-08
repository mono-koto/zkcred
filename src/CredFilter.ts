import {
  DeployArgs,
  Encoding,
  Field,
  isReady,
  method,
  Permissions,
  PrivateKey,
  PublicKey,
  Signature,
  SmartContract,
  state,
  State,
} from 'snarkyjs';

export { isReady, Field, Encoding };

// Wait till our SnarkyJS instance is ready
await isReady;

export class CredFilter extends SmartContract {
  @state(PublicKey) issuerPublicKey = State<PublicKey>();

  events = {
    'passed-test': PublicKey,
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init(publicKey: PublicKey) {
    this.issuerPublicKey.set(publicKey);
  }

  /// Holder can publish that they passed test
  /// but only if the credential is (a) verified
  /// and (b) privately passes the test.
  @method selectivelyVerify(
    holderPrivateKey: PrivateKey,
    credentialSubjectId: Field,
    credentialSubjectData1: Field,
    credentialSubjectData2: Field,
    credentialSubjectProof: Signature,
    issuer: Field,
    issuerProof: Signature
  ) {
    const signerPublicKey = holderPrivateKey.toPublicKey();

    this.issuerPublicKey.assertEquals(this.issuerPublicKey.get());
    const key = this.issuerPublicKey.get();
    credentialSubjectProof
      .verify(key, [
        credentialSubjectId,
        credentialSubjectData1,
        credentialSubjectData2,
      ])
      .assertTrue();
    issuerProof.verify(key, [issuer]).assertTrue();
    credentialSubjectData1.gte(credentialSubjectData2).assertTrue();

    this.emitEvent('passed-test', signerPublicKey);
  }
}
