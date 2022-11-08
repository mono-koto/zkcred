import {
  AccountUpdate,
  Field,
  isReady,
  Mina,
  PrivateKey,
  PublicKey,
  shutdown,
  Signature,
} from 'snarkyjs';
import { CredFilter } from './CredFilter';
// import UnprovenVC from './unproven-vc-template.json';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

function createLocalBlockchain() {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: CredFilter,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey,
  args: [PublicKey]
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivatekey });
    zkAppInstance.init(...args);
    zkAppInstance.sign(zkAppPrivatekey);
  });
  await txn.send().wait();
}

let deployerAccount: PrivateKey,
  zkAppAddress: PublicKey,
  zkAppPrivateKey: PrivateKey;

beforeEach(async () => {
  await isReady;
  deployerAccount = createLocalBlockchain();
  zkAppPrivateKey = PrivateKey.random();
  zkAppAddress = zkAppPrivateKey.toPublicKey();
});

afterAll(async () => {
  // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
  // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
  // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
  setTimeout(shutdown, 0);
});

describe('CredFilter', () => {
  describe('init()', () => {
    it('should deploy with public key', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const zkAppInstance = new CredFilter(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount, [
        publicKey,
      ]);

      const issuerPublicKey = await zkAppInstance.issuerPublicKey.get();
      expect(issuerPublicKey.toBase58()).toEqual(publicKey.toBase58());
    });
  });

  describe('selectivelyVerify()', () => {
    let issuerPrivateKey: PrivateKey;
    let zkAppInstance: CredFilter;
    beforeEach(async () => {
      issuerPrivateKey = PrivateKey.random();
      const publicKey = issuerPrivateKey.toPublicKey();
      zkAppInstance = new CredFilter(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount, [
        publicKey,
      ]);
    });

    it('should verify with public key', async () => {
      const holderPrivateKey = PrivateKey.random();

      const txn = await Mina.transaction(deployerAccount, () => {
        zkAppInstance.selectivelyVerify(
          holderPrivateKey,
          new Field(0),
          new Field(0),
          new Field(0),
          Signature.create(issuerPrivateKey, [
            new Field(0),
            new Field(0),
            new Field(0),
          ]),
          new Field(0),
          Signature.create(issuerPrivateKey, [new Field(0)])
        );
        zkAppInstance.sign(zkAppPrivateKey);
      });
      await txn.send().wait();
      const events = await zkAppInstance.fetchEvents();
      expect(events[0].type).toEqual('passed-test');
    });
  });
});
