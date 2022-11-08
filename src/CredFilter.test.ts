import {
  AccountUpdate,
  isReady,
  Mina,
  PrivateKey,
  PublicKey,
  shutdown,
} from 'snarkyjs';
import { CredFilter } from './CredFilter';

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

const keys = {
  Bob: PrivateKey.fromBase58(
    'EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F'
  ),
  SuperBob: PrivateKey.fromBase58(
    'EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg'
  ),
  MegaBob: PrivateKey.fromBase58(
    'EKE9qUDcfqf6Gx9z6CNuuDYPe4XQQPzFBCfduck2X4PeFQJkhXtt'
  ), // This one says duck in it :)
  Jack: PrivateKey.fromBase58(
    'EKFS9v8wxyrrEGfec4HXycCC2nH7xf79PtQorLXXsut9WUrav4Nw'
  ),
};

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
      const privateKey = keys['Bob'];
      const publicKey = privateKey.toPublicKey();

      const zkAppInstance = new CredFilter(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount, [
        publicKey,
      ]);

      const user1 = await zkAppInstance.user1.get();
      expect(user1.toBase58()).toEqual(publicKey.toBase58());
    });
  });
});
