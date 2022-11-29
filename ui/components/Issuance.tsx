import { useState } from "react";
import { Field, PrivateKey, PublicKey, Signature } from "snarkyjs";

interface ParseResult {
  error?: string;
  value?: any;
}

const privateKey = "EKEu7Bsgg8cecNDtV1ToYQvD6hDGh5h9Q7AAFA2sF8nw7bRVUgcn";

const defaultText = JSON.stringify(
  JSON.parse(`{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential"],
  "credentialSchema": {
    "id": "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",
    "type": "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"
  },
  "issuer": "B62qpRvmPpgUsRT4aTMTbGSapfP84pCP7sc4Ws8XBqvbHqTe6DtgB4r",
  "credentialSubject": {
    "id": "B62qpKoe4nhvAuXPfy8MwawX5LtCyj8pbV8hMMsjPV2XdjgxQywohmw",
    "data": [100, 99]
  }
}`),
  null,
  2
);

function strToFields(s: string): Field[] {
  console.log("strToFields", s);
  const bytes = [...new TextEncoder().encode(s)];
  const fields: Field[] = [];
  for (let i = 0; i < bytes.length; i += 32) {
    console.log(fields);
    const slice = bytes.slice(i, i + 32);
    console.log("2");
    const field = Field.fromBytes(slice);
    console.log("3");

    fields.push(field);
    console.log(fields);
  }
  console.log("ret", s, fields);
  return fields;
}

function strToSignature(s: string, privateKey: PrivateKey): Signature {
  const fields = strToFields(s);
  console.log(fields.length);
  return Signature.create(privateKey, fields.slice(0, 1));
}

function publicKeyToSignature(p: PublicKey, privateKey: PrivateKey) {
  return Signature.create(privateKey, p.toFields());
}

function addProofToVC(vc: any, privateKey: string) {
  const issuerPrivateKey = PrivateKey.fromBase58(privateKey);

  const signedIssuer = publicKeyToSignature(
    PublicKey.fromBase58(vc.issuer),
    issuerPrivateKey
  );

  const signedSubjectId = publicKeyToSignature(
    PublicKey.fromBase58(vc.credentialSubject.id),
    issuerPrivateKey
  );

  const signedSubjectData = Signature.create(issuerPrivateKey, [
    ...PublicKey.fromBase58(vc.credentialSubject.id).toFields(),
    ...vc.credentialSubject.data.map((d: number) => new Field(d)),
  ]);

  vc.proof = {
    type: "SnarkyCredentialVerification2022",
    issuer: signedIssuer.toJSON(),
    credentialSubjectId: signedSubjectId.toJSON(),
    credentialSubjectData: signedSubjectData.toJSON(),
  };
}

export default function Issuance() {
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
      addProofToVC(vc, issuerPrivateKey);
    } catch (e: any) {
      setParsedValue({
        error: e.message,
      });
      return;
    }

    setParsedValue({
      value: vc,
    });
  };

  return (
    <div>
      <h1>Issuance</h1>
      <div className="flex flex-row gap-4">
        <div className="w-1/2">
          <textarea
            className="text-sm w-full border-2 p-2 border-black font-mono whitespace-pre"
            spellCheck={false}
            rows={30}
            onChange={handleChange}
            defaultValue={defaultText}
          ></textarea>
          <div className="text-sm mb-2 text-red-500">{parsedValue.error}</div>

          <div className="">
            <label className="text-sm" htmlFor="issuerPrivateKey">
              Issuer Private Key (Base-58)
            </label>
            <input
              className="font-mono w-full border-black border-2 p-2"
              type="text"
              id="issuerPrivateKey"
              onChange={onIssuerPrivateKeyChange}
              value={privateKey}
            />
          </div>
        </div>
        <div className="shrink-1">&rarr;</div>
        <div className="shrink-0 grow overflow-scroll">
          <textarea
            className="border-2 border-gray text-slate-800 bg-slate-50 text-sm w-full font-mono whitespace-pre"
            spellCheck={false}
            rows={30}
            onChange={handleChange}
            value={JSON.stringify(parsedValue.value, null, 2)?.replaceAll(
              /\n/g,
              "\n"
            )}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}
