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
    const issuer = zkApp.issuer.get();
    expect(issuer.toBase58()).toEqual(
      'B62qnx57d2gX2wHxR7zmsUM2cvFprDyqFEu1FXtGgvorpYXNhVbbMLs'
    );
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
    let holderPrivateKey: PrivateKey;
    let subjectPublicKey: PublicKey;
    let nonSubjectPublicKey: PublicKey;

    beforeEach(async () => {
      holderPrivateKey = PrivateKey.random();
      subjectPublicKey = holderPrivateKey.toPublicKey();
      nonSubjectPublicKey = PrivateKey.random().toPublicKey();

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

    it('successfully verifies with valid inputs', async () => {
      const txn = await Mina.transaction(deployerAccount, () => {
        zkApp.present(
          holderPrivateKey,
          subjectPublicKey,
          new Field(100),
          new Field(99),
          Signature.create(issuerPrivateKey, [
            ...subjectPublicKey.toFields(),
            new Field(100),
            new Field(99),
          ])
        );
      });
      await txn.prove();
      await txn.sign([deployerAccount]).send();

      const events = await zkApp.fetchEvents();
      expect(events[0].type).toEqual('passed-test');
    });

    it('should reject if fails business logic', async () => {
      await expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkApp.present(
            holderPrivateKey,
            subjectPublicKey,
            new Field(99),
            new Field(100),
            Signature.create(issuerPrivateKey, [
              ...subjectPublicKey.toFields(),
              new Field(99),
              new Field(100),
            ])
          );
        })
      ).rejects;
    });

    it('should reject if signed values are wrong', async () => {
      await expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkApp.present(
            holderPrivateKey,
            subjectPublicKey,
            new Field(100),
            new Field(99),
            Signature.create(issuerPrivateKey, [
              ...subjectPublicKey.toFields(),
              new Field(0),
              new Field(0),
            ])
          );
        })
      ).rejects;
    });

    it('should reject if subject is not holder', async () => {
      await expect(async () =>
        Mina.transaction(deployerAccount, () => {
          zkApp.present(
            holderPrivateKey,
            nonSubjectPublicKey,
            new Field(0),
            new Field(0),
            Signature.create(issuerPrivateKey, [
              ...nonSubjectPublicKey.toFields(),
              new Field(0),
              new Field(0),
            ])
          );
        })
      ).rejects;
    });
  });
});
