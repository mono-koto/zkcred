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
import { SelectiveVCSketch } from './SelectiveVCSketch';
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
  zkAppInstance: SelectiveVCSketch,
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

describe('SelectiveVCSketch', () => {
  describe('init()', () => {
    it('should deploy with public key', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const zkAppInstance = new SelectiveVCSketch(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount, [
        publicKey,
      ]);

      const issuerPublicKey = await zkAppInstance.issuerPublicKey.get();
      expect(issuerPublicKey.toBase58()).toEqual(publicKey.toBase58());
    });
  });

  describe('selectivelyDisclose()', () => {
    let issuerPrivateKey: PrivateKey;
    let zkAppInstance: SelectiveVCSketch;
    beforeEach(async () => {
      issuerPrivateKey = PrivateKey.random();
      const publicKey = issuerPrivateKey.toPublicKey();
      zkAppInstance = new SelectiveVCSketch(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount, [
        publicKey,
      ]);
    });

    it('should verify with public key', async () => {
      const holderPrivateKey = PrivateKey.random();
      const holderPublicKey = holderPrivateKey.toPublicKey();

      const txn = await Mina.transaction(deployerAccount, () => {
        zkAppInstance.selectivelyDisclose(
          holderPrivateKey,
          holderPublicKey,
          new Field(100),
          new Field(99),
          Signature.create(issuerPrivateKey, [
            ...holderPublicKey.toFields(),
            new Field(100),
            new Field(99),
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

    it('should reject if bad values', async () => {
      const holderPrivateKey = PrivateKey.random();
      const holderPublicKey = holderPrivateKey.toPublicKey();

      expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkAppInstance.selectivelyDisclose(
            holderPrivateKey,
            holderPublicKey,
            new Field(0),
            new Field(1),
            Signature.create(issuerPrivateKey, [
              ...holderPublicKey.toFields(),
              new Field(0),
              new Field(0),
            ]),
            new Field(0),
            Signature.create(issuerPrivateKey, [new Field(0)])
          );
          zkAppInstance.sign(zkAppPrivateKey);
        })
      ).rejects;
    });

    it('should reject if mismatched subject', async () => {
      const holderPrivateKey = PrivateKey.random();
      const badHolderPublicKey = PrivateKey.random().toPublicKey();

      expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkAppInstance.selectivelyDisclose(
            holderPrivateKey,
            badHolderPublicKey,
            new Field(0),
            new Field(0),
            Signature.create(issuerPrivateKey, [
              ...badHolderPublicKey.toFields(),
              new Field(0),
              new Field(0),
            ]),
            new Field(0),
            Signature.create(issuerPrivateKey, [new Field(0)])
          );
          zkAppInstance.sign(zkAppPrivateKey);
        })
      ).rejects;
    });
  });
});
