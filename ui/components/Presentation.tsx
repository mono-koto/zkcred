import { useState } from "react";
import { Field, PublicKey, Signature } from "snarkyjs";

interface ParseResult {
  error?: string;
  value?: any;
}

interface Arguments {
  credentialSubjectId: PublicKey;
  credentialSubjectData1: Field;
  credentialSubjectData2: Field;
  credentialSubjectProof: Signature;
}

export default function Presentation() {
  const [parsedValue, setParsedValue] = useState<ParseResult>({});

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

    setParsedValue({
      value: vc,
    });
  };
  let args: Arguments | undefined;
  if (parsedValue.value) {
    const { credentialSubject, proof } = parsedValue.value;
    args = {
      credentialSubjectId: PublicKey.fromJSON(credentialSubject.id),
      credentialSubjectData1: Field.fromJSON(credentialSubject.data[0]),
      credentialSubjectData2: Field.fromJSON(credentialSubject.data[1]),
      credentialSubjectProof: Signature.fromJSON(proof.credentialSubjectData),
    };
  }

  return (
    <div>
      <h1>Presentation</h1>
      <div className="flex flex-row gap-4">
        <div className="w-5/12">
          <textarea
            className="text-sm w-full border-2 p-2 border-black font-mono whitespace-pre"
            spellCheck={false}
            rows={30}
            onChange={handleChange}
          ></textarea>
          <div>{parsedValue.error}</div>
        </div>
        <div className="shrink-1">&rarr;</div>
        <div className="w-6/12 flex flex-col gap-2">
          <div>
            <button
              className="bg-blue-500 active:bg-yellow-500 text-white p-2 rounded text-xl disabled:opacity-50"
              disabled={!args}
            >
              Present
            </button>
          </div>

          <h2 className="text-lg">Disclose Arguments:</h2>

          <div>
            <div className="text-sm">credentialSubjectId (PublicKey)</div>
            <div className="overflow-scroll whitespace-pre font-mono">
              {args?.credentialSubjectId.toBase58()}
            </div>
          </div>
          <div>
            <div className="text-sm">credentialSubjectData1 (Field)</div>
            <div className="overflow-scroll whitespace-pre font-mono">
              {args?.credentialSubjectData1?.toString()}
            </div>
          </div>
          <div>
            <div className="text-sm">credentialSubjectData2 (Field)</div>
            <div className="overflow-scroll whitespace-pre font-mono">
              {args?.credentialSubjectData2?.toString()}
            </div>
          </div>
          <div>
            <div className="text-sm">credentialSubjectProof (Signature)</div>
            <div className="overflow-scroll whitespace-pre font-mono">
              {JSON.stringify(
                args?.credentialSubjectProof?.toJSON() || {},
                null,
                2
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
