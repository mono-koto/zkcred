import { useState } from "react";
import { Field, PrivateKey, Signature } from "snarkyjs";

interface ParseResult {
  error?: string;
  value?: any;
}

const privateKey = "EKEu7Bsgg8cecNDtV1ToYQvD6hDGh5h9Q7AAFA2sF8nw7bRVUgcn";

const defaultText = `
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential"],
  "credentialSchema": {
    "id": "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",
    "type": "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"
  },
  "issuer": "did:example:Wz4eUg7SetGfaUVCn8U9d62oDYrUJLuUtcy619",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "data": [1, 2]
  }
}`;

function strToFields(s: string): Field[] {
  const bytes = [...new TextEncoder().encode(s)];
  const fields: Field[] = [];
  for (let i = 0; i < bytes.length; i += 32) {
    fields.push(Field.fromBytes(bytes.slice(i, i + 32)));
  }
  return fields;
}

function strToSignature(s: string, privateKey: PrivateKey): Signature {
  const fields = strToFields(s);
  return Signature.create(privateKey, fields);
}

function addProofToVC(vc: any, privateKey: string) {
  const issuerPrivateKey = PrivateKey.fromBase58(privateKey);

  const signedIssuer = strToSignature(vc.issuer, issuerPrivateKey);
  const signedSubjectId = strToSignature(
    vc.credentialSubject.id,
    issuerPrivateKey
  );
  const signedSubjectData = strToSignature(
    vc.credentialSubject.data,
    issuerPrivateKey
  );

  vc.proof = {
    type: "SnarkyCredentialVerification2022",
    issuer: signedIssuer.toJSON(),
    credentialSubjectId: signedSubjectId.toJSON(),
    credentialSubjectData: signedSubjectData.toJSON(),
  };
}

export default function Main() {
  const [parsedValue, setParsedValue] = useState<ParseResult>({});
  const [issuerPrivateKey, setIssuerPrivateKey] = useState<string>(privateKey);

  const onIssuerPrivateKeyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIssuerPrivateKey(event.target.value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(event.currentTarget.value);
    let vc: any = {};
    try {
      vc = JSON.parse(event.currentTarget.value);
    } catch (e: any) {
      setParsedValue({
        error: e.message,
      });
      return;
    }

    addProofToVC(vc, issuerPrivateKey);

    setParsedValue({
      value: vc,
    });
  };

  return (
    <div>
      <h1>Issuance</h1>
      <input
        type="text"
        onChange={onIssuerPrivateKeyChange}
        value={privateKey}
      />
      <br />
      <textarea
        spellCheck={false}
        cols={60}
        rows={20}
        onChange={handleChange}
        defaultValue={defaultText}
      ></textarea>
      <div>{parsedValue.error}</div>
      <div>
        <pre>
          <code>{JSON.stringify(parsedValue.value, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
