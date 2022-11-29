import {
  fetchAccount,
  Field,
  isReady,
  Mina,
  PrivateKey,
  PublicKey,
  Signature,
} from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Selective } from "../../contracts/src/Selective";

const state = {
  Selective: null as null | typeof Selective,
  zkapp: null as null | Selective,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  loadSnarkyJS: async (args: {}) => {
    await isReady;
  },
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.BerkeleyQANet(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { Selective } = await import(
      "../../contracts/build/src/Selective.js"
    );
    state.Selective = Selective;
  },
  compileContract: async (args: {}) => {
    await state.Selective!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.Selective!(publicKey);
  },

  createPresentTransaction: async (args: ZkAppSelectivePresentPropsJSON) => {
    const credentialHolderPrivateKey = PrivateKey.fromJSON(
      args.credentialHolderPrivateKeyJSON
    );
    const credentialSubjectId = PublicKey.fromJSON(
      args.credentialSubjectIdJSON
    );
    const credentialSubjectData1 = Field.fromJSON(
      args.credentialSubjectData1JSON
    );
    const credentialSubjectData2 = Field.fromJSON(
      args.credentialSubjectData2JSON
    );
    const credentialSubjectSigned = Signature.fromJSON(
      args.credentialSubjectSignedJSON
    );

    const issuerPublicKey = PublicKey.fromBase58(
      "B62qnx57d2gX2wHxR7zmsUM2cvFprDyqFEu1FXtGgvorpYXNhVbbMLs"
    );

    console.log(
      credentialSubjectId.toJSON(),
      credentialSubjectData1.toJSON(),
      credentialSubjectData2.toJSON()
    );
    console.log(
      "verify",
      credentialSubjectSigned
        .verify(issuerPublicKey, [
          ...credentialSubjectId.toFields(),
          ...[credentialSubjectData1, credentialSubjectData2],
        ])
        .toBoolean()
    );

    const transaction = await Mina.transaction(() => {
      state.zkapp!.present(
        credentialHolderPrivateKey,
        credentialSubjectId,
        credentialSubjectData1,
        credentialSubjectData2,
        credentialSubjectSigned
      );
    });
    state.transaction = transaction;
  },
  provePresentTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export interface ZkAppSelectivePresentProps {
  credentialHolderPrivateKey: PrivateKey;
  credentialSubjectId: PublicKey;
  credentialSubjectData1: Field;
  credentialSubjectData2: Field;
  credentialSubjectSigned: Signature;
}

export interface ZkAppSelectivePresentPropsJSON {
  credentialHolderPrivateKeyJSON: any;
  credentialSubjectIdJSON: any;
  credentialSubjectData1JSON: any;
  credentialSubjectData2JSON: any;
  credentialSubjectSignedJSON: any;
}

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};
if (process.browser) {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}
