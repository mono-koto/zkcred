# Notes / Resources

- [DID and VC: Untangling Decentralized Identifiers and Verifiable Credentials for the Web of Trust](https://dl.acm.org/doi/fullHtml/10.1145/3446983.3446992)
- [DID Specification Registries](https://www.w3.org/TR/did-spec-registries/)
- [The did:key Method v0.7](https://w3c-ccg.github.io/did-method-key/)
  - ![image.png](../assets/image_1666732510221_0.png)
- https://www.w3.org/TR/vc-imp-guide/#zero-knowledge-proofs
  - ZK proofs allow selective disclosure or full disclosure
    - Full disclosure
      - Standard VC presentation also reveals the signature
      - So a verifier has complete copy of the credential.
      - Signature becomes an identifier
      - ZK allows full disclosure without revealing reusable elements as identifiers.
    - Selective disclosure
      - Zero-knowledge methods allow a holder to choose which attributes to reveal and which attributes to withhold on a case-by-case basis without involving the issuer. The credential issuer only needs to provide a single verifiable credential that contains all of the attributes.
  - Predicate Proofs
    - Answer a true-false question.
    - Non-ZK would require issuer to issue a custom credential
    - ZK allows the holder to generate
- Classes of proof types: https://w3c-ccg.github.io/security-vocab/#classes
