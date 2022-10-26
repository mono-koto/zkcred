import {
  Circuit,
  DeployArgs,
  Field,
  method,
  Permissions,
  SmartContract,
  state,
  State,
} from 'snarkyjs';
import type {
  BasicIssuedCredential,
  CLSignature2019Proof,
  CredentialSubject,
} from './types';

export interface CreditScoreCredentialSubject extends CredentialSubject {
  creditScore: Field;
}

export interface CreditScoreIssuedCredential extends BasicIssuedCredential {
  credentialSubject: CreditScoreCredentialSubject;
  proof: CLSignature2019Proof;
}

const MINIMUM_CREDIT_SCORE = 600;

export class SelectiveDiscloser extends SmartContract {
  @state(Field) counter = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    this.counter.set(Field(0));
  }

  @method selectiveDisclosurePresentation(vc: CreditScoreIssuedCredential) {
    // const { issuer, issuanceDate, type, '@context': context } = vc;
    const {
      // id,
      creditScore,
    } = vc.credentialSubject;
    // const { issuerData, attributes, signature, signatureCorrectnessProof } =
    //   vc.proof;

    // TODO - verify the proof

    const currentState = this.counter.get();
    this.counter.assertEquals(currentState);
    const newState = Circuit.if(
      creditScore.gt(Field(MINIMUM_CREDIT_SCORE)),
      currentState.add(1),
      currentState
    );
    this.counter.set(newState);
  }
}
