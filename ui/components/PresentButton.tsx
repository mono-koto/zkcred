import { MouseEventHandler, useEffect, useState } from "react";
import zkAppSelectiveWorkerClient from "./zkAppSelectiveWorkerClient";
import { PublicKey, PrivateKey, Field, Signature } from "snarkyjs";
import { sendTransaction } from "snarkyjs/dist/node/lib/mina";
import { ZkAppSelectivePresentProps } from "./zkAppSelectiveWorker";
let transactionFee = 0.1;

export default function PresentButton(
  props: Partial<ZkAppSelectivePresentProps>
) {
  let [state, setState] = useState({
    zkAppWorkerClient: null as null | zkAppSelectiveWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkAppPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  // -------------------------------------------------------
  // Do Setup
  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        const zkAppWorkerClient = new zkAppSelectiveWorkerClient();
        console.log("Loading SnarkyJS...");
        await zkAppWorkerClient.loadSnarkyJS();
        console.log("done");

        await zkAppWorkerClient.setActiveInstanceToBerkeley();
        const mina = (window as any).mina;
        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }
        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);
        console.log("using key", publicKey.toBase58());
        console.log("checking if account exists...");
        const res = await zkAppWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });

        const accountExists = res.error == null;
        await zkAppWorkerClient.loadContract();
        console.log("compiling zkApp");
        await zkAppWorkerClient.compileContract();
        console.log("zkApp compiled");
        const zkAppPublicKey = PublicKey.fromBase58(
          "B62qpFP6zq6YSPGGE1qqbxmeVvhCxm47sWCbkb1PNMyjTSWgSdSs4Bg"
        );
        await zkAppWorkerClient.initZkappInstance(zkAppPublicKey);
        console.log("fetching zkApp account...");
        await zkAppWorkerClient.fetchAccount({ publicKey: zkAppPublicKey });
        console.log("fetched");
        // // const currentNum = await zkAppWorkerClient.getNum();
        // // console.log("current state:", currentNum.toString());
        setState({
          ...state,
          zkAppWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkAppPublicKey,
          accountExists,
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't
  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          console.log("checking if account exists...");
          const res = await state.zkAppWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);
  // -------------------------------------------------------

  // -------------------------------------------------------
  // Send a transaction
  const onSendTransaction = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setState({ ...state, creatingTransaction: true });
    console.log("sending a transaction...");
    await state.zkAppWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });
    await state.zkAppWorkerClient!.createPresentTransaction({
      credentialHolderPrivateKey: PrivateKey.fromBase58(
        "EKEnFP8BP7tAgxwGFuGSq1XjhmVMXhP1CkZfmWWkaz98boET8bwG"
      ),

      credentialSubjectId: props.credentialSubjectId!,
      credentialSubjectData1: props.credentialSubjectData1!,
      credentialSubjectData2: props.credentialSubjectData2!,
      credentialSubjectSigned: props.credentialSubjectSigned!,
    });
    console.log("creating proof...");
    await state.zkAppWorkerClient!.provePresentTransaction();
    console.log("getting Transaction JSON...");
    const transactionJSON = await state.zkAppWorkerClient!.getTransactionJSON();
    console.log("requesting send transaction...");
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });
    console.log(
      "See transaction at https://berkeley.minaexplorer.com/transaction/" + hash
    );
    setState({ ...state, creatingTransaction: false });
  };
  // -------------------------------------------------------

  const enabled =
    props.credentialSubjectId &&
    props.credentialSubjectData1 &&
    props.credentialSubjectData2 &&
    props.credentialSubjectSigned &&
    state.hasBeenSetup;
  console.log(
    enabled,
    props.credentialSubjectId,
    props.credentialSubjectData1,
    props.credentialSubjectData2,
    props.credentialSubjectSigned,
    state.hasBeenSetup
  );

  return (
    <button
      onClick={onSendTransaction}
      className="bg-blue-500 active:bg-yellow-500 text-white p-2 rounded text-xl disabled:opacity-50"
      disabled={!enabled}
    >
      Present
    </button>
  );
}
