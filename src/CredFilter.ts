import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PrivateKey,
  PublicKey,
  isReady,
  Poseidon,
  Encoding,
  DeployArgs,
  Permissions,
} from 'snarkyjs';

export { isReady, Field, Encoding };

// Wait till our SnarkyJS instance is ready
await isReady;

export class CredFilter extends SmartContract {
  @state(PublicKey) user1 = State<PublicKey>();
  @state(Field) message = State<Field>();
  @state(Field) messageHistoryHash = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init(publicKey: PublicKey) {
    this.user1.set(publicKey);
    this.message.set(Field(0));
    this.messageHistoryHash.set(Field(0));
  }

  @method publishMessage(message: Field, signerPrivateKey: PrivateKey) {
    const signerPublicKey = signerPrivateKey.toPublicKey();

    const user1 = this.user1.get();
    signerPublicKey.equals(user1).assertEquals(true);
    this.message.set(message);

    const oldHash = this.messageHistoryHash.get();
    const newHash = Poseidon.hash([message, oldHash]);

    this.messageHistoryHash.set(newHash);
  }
}
