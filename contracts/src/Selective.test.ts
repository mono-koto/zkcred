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
import { Selective } from './Selective';

let proofsEnabled = false;

describe('Selective', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Selective;

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([zkAppPrivateKey]).send();
  }

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) Selective.compile();
  });

  beforeEach(async () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0].privateKey;
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Selective(zkAppAddress);

    await localDeploy();
  });

  afterAll(() => {
    setTimeout(shutdown, 0);
  });

  it('generates and deploys the `Selective` smart contract', async () => {
    const owner = zkApp.owner.get();
    expect(owner.toBase58()).toEqual(PublicKey.empty().toBase58());

    const issuer = zkApp.issuer.get();
    expect(issuer.toBase58()).toEqual(PublicKey.empty().toBase58());
  });

  describe('setOwner', () => {
    it('sets the owner', async () => {
      const newOwner = PrivateKey.random().toPublicKey();
      const txn = await Mina.transaction(deployerAccount, () => {
        zkApp.setOwner(newOwner);
      });
      await txn.prove();
      await txn.sign([deployerAccount]).send();
      expect(zkApp.owner.get().toBase58()).toEqual(newOwner.toBase58());
    });
  });

  describe('setIssuer', () => {
    it('sets the issuer if the caller is the owner', async () => {
      const newOwnerPrivateKey = PrivateKey.random();
      const newOwner = newOwnerPrivateKey.toPublicKey();
      const newIssuer = PrivateKey.random().toPublicKey();
      const txn = await Mina.transaction(deployerAccount, () => {
        zkApp.setOwner(newOwner);
      });
      await txn.prove();
      await txn.sign([deployerAccount]).send();

      const txn2 = await Mina.transaction(deployerAccount, () => {
        zkApp.setIssuer(newIssuer, newOwnerPrivateKey);
      });
      await txn2.prove();
      await txn2.sign([deployerAccount]).send();

      expect(zkApp.issuer.get().toBase58()).toEqual(newIssuer.toBase58());
    });

    it('fails to set the issuer if the owner private key is not provided', async () => {
      const newIssuer = PrivateKey.random().toPublicKey();

      await expect(
        Mina.transaction(deployerAccount, () => {
          zkApp.setIssuer(newIssuer, PrivateKey.random());
        })
      ).rejects.toThrow();
    });
  });

  describe('disclose()', () => {
    let issuerPrivateKey: PrivateKey;

    beforeEach(async () => {
      const txn = await Mina.transaction(deployerAccount, () => {
        zkApp.setOwner(deployerAccount.toPublicKey());
      });
      await txn.prove();
      await txn.sign([deployerAccount]).send();

      issuerPrivateKey = PrivateKey.random();
      const issuer = issuerPrivateKey.toPublicKey();

      const txn2 = await Mina.transaction(deployerAccount, () => {
        zkApp.setIssuer(issuer, deployerAccount);
      });
      await txn2.prove();
      await txn2.sign([deployerAccount]).send();
    });

    it('should verify with public key', async () => {
      const holderPrivateKey = PrivateKey.random();
      const holderPublicKey = holderPrivateKey.toPublicKey();

      const txn = await Mina.transaction(deployerAccount, () => {
        zkApp.disclose(
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
      });
      await txn.prove();
      await txn.sign([deployerAccount]).send();

      const events = await zkApp.fetchEvents();
      expect(events[0].type).toEqual('passed-test');
    });

    it('should reject if bad values', async () => {
      const holderPrivateKey = PrivateKey.random();
      const holderPublicKey = holderPrivateKey.toPublicKey();

      await expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkApp.disclose(
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
        })
      ).rejects;
    });

    it('should reject if mismatched subject', async () => {
      const holderPrivateKey = PrivateKey.random();
      const badHolderPublicKey = PrivateKey.random().toPublicKey();

      expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkApp.disclose(
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
          zkApp.sign(zkAppPrivateKey);
        })
      ).rejects;
    });
  });
});
