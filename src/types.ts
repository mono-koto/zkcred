import { CircuitString } from 'snarkyjs';

export interface BasicIssuedCredential {
  '@context': CircuitString[];
  id: CircuitString;
  type: CircuitString[];
  issuer: CircuitString;
  issuanceDate: CircuitString;
  credentialSubject: CredentialSubject;
  proof: CredentialProof;
}

export interface CredentialSubject {
  id: CircuitString;
}

export interface CredentialProof {
  type: 'CLSignature2019';
}

// Loosely adapted from https://www.w3.org/TR/vc-data-model/#zero-knowledge-proofs
export interface CLSignature2019Proof extends CredentialProof {
  type: 'CLSignature2019';
  issuerData: CircuitString;
  attributes: CircuitString;
  signature: CircuitString;
  signatureCorrectnessProof: CircuitString;
}

/// https://w3c-ccg.github.io/ldp-bbs2020/#the-bbs-signature-proof-suite-2020
// export interface BbsSignatureProof2020 extends CredentialProof {
//   type: 'BBS+Signature2020';
//   created: CircuitString;
//   verificationMethod: CircuitString;
//   proofPurpose: CircuitString;
//   proofValue: CircuitString;
//   nonce: CircuitString;
// }
