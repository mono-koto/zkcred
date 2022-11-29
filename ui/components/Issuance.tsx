import { useEffect, useState } from "react";
import { Field, isReady, PrivateKey, PublicKey, Signature } from "snarkyjs";

interface ParseResult {
  error?: string;
  value?: any;
}

const privateKey = "EKEzKKCCwzMThd4BnApG5ZPuARbxvh6YeV5BXHf6CmcmjscuLwa5";

const defaultUnsignedCredentialText = `{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential"],
  "credentialSchema": {
    "id": "did:example:cdf:35LB7w9ueWbagPL94T9bMLtyXDj9pX5o",
    "type": "did:example:schema:22KpkXgecryx9k7N6XN1QoN3gXwBkSU8SfyyYQG"
  },
  "issuer": "B62qnx57d2gX2wHxR7zmsUM2cvFprDyqFEu1FXtGgvorpYXNhVbbMLs",
  "credentialSubject": {
    "id": "B62qpKoe4nhvAuXPfy8MwawX5LtCyj8pbV8hMMsjPV2XdjgxQywohmw",
    "data": [100, 99]
  }
}`;

const defaultUnsignedCredential = JSON.stringify(
  JSON.parse(defaultUnsignedCredentialText),
  null,
  2
);

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
  const msg = [
    ...PublicKey.fromBase58(vc.credentialSubject.id).toFields(),
    ...vc.credentialSubject.data.map((d: number) => new Field(d)),
  ];
  const signedSubjectData = Signature.create(issuerPrivateKey, msg);
  console.log(
    "signed msg:",
    msg,
    msg.map((m) => m.toJSON())
  );

  vc.proof = {
    type: "SnarkyCredentialVerification2022",
    credentialSubject: signedSubjectData.toJSON(),
  };
  return vc;
}

export default function Issuance() {
  const [parsedValue, setParsedValue] = useState<ParseResult>({});
  const [issuerPrivateKey, setIssuerPrivateKey] = useState<string>(privateKey);

  const onIssuerPrivateKeyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIssuerPrivateKey(event.target.value);
  };

  useEffect(() => {
    (async () => {
      await isReady;
      setParsedValue({
        value: addProofToVC(
          JSON.parse(defaultUnsignedCredentialText),
          issuerPrivateKey
        ),
      });
    })();
  }, []);

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
            defaultValue={defaultUnsignedCredential}
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
