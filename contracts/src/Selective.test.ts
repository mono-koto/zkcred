import {
  AccountUpdate,
  isReady,
  Mina,
  PrivateKey,
  PublicKey,
  shutdown,
} from 'snarkyjs';
import { Selective } from './Selective';

let proofsEnabled = false;

describe('Selective', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Selective;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) Selective.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0].privateKey;
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Selective(zkAppAddress);
  });

  afterAll(() => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([zkAppPrivateKey]).send();
  }

  it('passes', () => {
    expect(true).toBe(true);
  });

  it('generates and deploys the `Selective` smart contract', async () => {
    await localDeploy();

    const owner = zkApp.owner.get();
    expect(owner.toBase58()).toEqual(
      'B62qiTKpEPjGTSHZrtM8uXiKgn8So916pLmNJKDhKeyBQL9TDb3nvBG'
    );

    const issuer = zkApp.issuer.get();
    expect(issuer.toBase58()).toEqual(
      'B62qpKoe4nhvAuXPfy8MwawX5LtCyj8pbV8hMMsjPV2XdjgxQywohmw'
    );
  });

  // describe('SelectiveDisclosure', () => {
  //   describe('init()', () => {
  //     it('should deploy with public key', async () => {
  //       const privateKey = PrivateKey.random();
  //       const publicKey = privateKey.toPublicKey();
  //       const zkAppInstance = new SelectiveDisclosure(zkAppAddress);
  //       await localDeploy();

  //       const issuerPublicKey = await zkAppInstance.issuer.get();
  //       expect(issuerPublicKey.toBase58()).toEqual(publicKey.toBase58());
  //     });
  //   });

  //   describe('selectivelyDisclose()', () => {
  //     let issuerPrivateKey: PrivateKey;
  //     let zkAppInstance: SelectiveDisclosure;
  //     beforeEach(async () => {
  //       issuerPrivateKey = PrivateKey.random();
  //       const publicKey = issuerPrivateKey.toPublicKey();
  //       zkAppInstance = new SelectiveDisclosure(zkAppAddress);
  //       await localDeploy();
  //     });

  //     it('should verify with public key', async () => {
  //       const holderPrivateKey = PrivateKey.random();
  //       const holderPublicKey = holderPrivateKey.toPublicKey();

  //       const txn = await Mina.transaction(deployerAccount, () => {
  //         zkAppInstance.selectivelyDisclose(
  //           holderPrivateKey,
  //           holderPublicKey,
  //           new Field(100),
  //           new Field(99),
  //           Signature.create(issuerPrivateKey, [
  //             ...holderPublicKey.toFields(),
  //             new Field(100),
  //             new Field(99),
  //           ]),
  //           new Field(0),
  //           Signature.create(issuerPrivateKey, [new Field(0)])
  //         );
  //         zkAppInstance.sign(zkAppPrivateKey);
  //       });
  //       await txn.send();
  //       const events = await zkAppInstance.fetchEvents();
  //       expect(events[0].type).toEqual('passed-test');
  //     });

  //     it('should reject if bad values', async () => {
  //       const holderPrivateKey = PrivateKey.random();
  //       const holderPublicKey = holderPrivateKey.toPublicKey();

  //       expect(async () =>
  //         Mina.transaction(deployerAccount, () => {
  //           zkAppInstance.selectivelyDisclose(
  //             holderPrivateKey,
  //             holderPublicKey,
  //             new Field(0),
  //             new Field(1),
  //             Signature.create(issuerPrivateKey, [
  //               ...holderPublicKey.toFields(),
  //               new Field(0),
  //               new Field(0),
  //             ]),
  //             new Field(0),
  //             Signature.create(issuerPrivateKey, [new Field(0)])
  //           );
  //           zkAppInstance.sign(zkAppPrivateKey);
  //         })
  //       ).rejects;
  //     });

  //     it('should reject if mismatched subject', async () => {
  //       const holderPrivateKey = PrivateKey.random();
  //       const badHolderPublicKey = PrivateKey.random().toPublicKey();

  //       expect(async () =>
  //         Mina.transaction(deployerAccount, () => {
  //           zkAppInstance.selectivelyDisclose(
  //             holderPrivateKey,
  //             badHolderPublicKey,
  //             new Field(0),
  //             new Field(0),
  //             Signature.create(issuerPrivateKey, [
  //               ...badHolderPublicKey.toFields(),
  //               new Field(0),
  //               new Field(0),
  //             ]),
  //             new Field(0),
  //             Signature.create(issuerPrivateKey, [new Field(0)])
  //           );
  //           zkAppInstance.sign(zkAppPrivateKey);
  //         })
  //       ).rejects;
  //     });
  //   });
  // });

  // it('generates and deploys the `Add` smart contract', async () => {
  //   await localDeploy();
  //   const num = zkApp.num.get();
  //   expect(num).toEqual(Field(1));
  // });

  // it('correctly updates the num state on the `Add` smart contract', async () => {
  //   await localDeploy();

  //   // update transaction
  //   const txn = await Mina.transaction(deployerAccount, () => {
  //     zkApp.update();
  //   });
  //   await txn.prove();
  //   await txn.send();

  //   const updatedNum = zkApp.num.get();
  //   expect(updatedNum).toEqual(Field(3));
  // });
});
