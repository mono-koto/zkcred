import { SelectiveDiscloser } from './SelectiveDiscloser';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  CircuitString,
} from 'snarkyjs';

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
  zkAppInstance: SelectiveDiscloser,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivatekey });
    zkAppInstance.init();
    zkAppInstance.sign(zkAppPrivatekey);
  });
  await txn.send().wait();
}

describe('Add', () => {
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

  it('generates and deploys the `Add` smart contract', async () => {
    const zkAppInstance = new SelectiveDiscloser(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const num = zkAppInstance.counter.get();
    expect(num).toEqual(Field.one);
  });

  it('correctly updates the num state on the `Add` smart contract', async () => {
    const zkAppInstance = new SelectiveDiscloser(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.selectiveDisclosurePresentation({
        '@context': [
          CircuitString.fromString('https://www.w3.org/2018/credentials/v1'),
        ],
        id: CircuitString.fromString('foo'),
        type: [
          CircuitString.fromString('VerifiableCredential'),
          CircuitString.fromString('CreditScoreCredential'),
        ],
        issuer: CircuitString.fromString('did:example:123'),
        issuanceDate: CircuitString.fromString('2021-09-01T19:23:24Z'),
        credentialSubject: {
          id: CircuitString.fromString('did:example:123'),
          creditScore: Field(700),
        },
        proof: {
          type: 'CLSignature2019',
          signature: CircuitString.fromString(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          ),
          signatureCorrectnessProof: CircuitString.fromString(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          ),
          issuerData: CircuitString.fromString(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          ),
          attributes: CircuitString.fromString(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          ),
        },
      });
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    const updatedNum = zkAppInstance.counter.get();
    expect(updatedNum).toEqual(Field(1));
  });
});
