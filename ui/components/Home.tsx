import ZkappWorkerClient from "./zkAppWorkerClient";

import { useEffect, useState } from "react";
import { Field, PublicKey } from "snarkyjs";
let transactionFee = 0.1;

export default function Home() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  // -------------------------------------------------------
  // Do Setup
  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        const zkappWorkerClient = new ZkappWorkerClient();
        console.log("Loading SnarkyJS...");
        await zkappWorkerClient.loadSnarkyJS();
        console.log("done");

        await zkappWorkerClient.setActiveInstanceToBerkeley();
        const mina = (window as any).mina;
        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }
        const accounts = await mina.requestAccounts();
        console.log(accounts);
        const publicKeyBase58: string = accounts[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);
        console.log("using key", publicKey.toBase58());
        console.log("checking if account exists...");
        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });

        const accountExists = res.error == null;
        await zkappWorkerClient.loadContract();
        console.log("compiling zkApp");
        await zkappWorkerClient.compileContract();
        console.log("zkApp compiled");
        // const zkappPublicKey = PublicKey.fromBase58(
        //   "B62qrBBEARoG78KLD1bmYZeEirUfpNXoMPYQboTwqmGLtfqAGLXdWpU"
        // );
        // my app
        // const zkappPublicKey = PublicKey.fromBase58(
        //   "B62qpRvmPpgUsRT4aTMTbGSapfP84pCP7sc4Ws8XBqvbHqTe6DtgB4r"
        // );
        const zkappPublicKey = PublicKey.fromBase58(
          "B62qrDe16LotjQhPRMwG12xZ8Yf5ES8ehNzZ25toJV28tE9FmeGq23A"
        );
        await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        console.log("getting zkApp state...");
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        const currentNum = await zkappWorkerClient.getNum();

        console.log("current state:", currentNum.toString());
        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          currentNum,
        });
      }
    })();
  }, []);
  // -------------------------------------------------------

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't
  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          console.log("checking if account exists...");
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);
  // -------------------------------------------------------

  // -------------------------------------------------------
  // Send a transaction
  const onSendTransaction = async () => {
    setState({ ...state, creatingTransaction: true });
    console.log("sending a transaction...");
    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });
    await state.zkappWorkerClient!.createUpdateTransaction();
    console.log("creating proof...");
    await state.zkappWorkerClient!.proveUpdateTransaction();
    console.log("getting Transaction JSON...");
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();
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

  // -------------------------------------------------------
  // Refresh the current state
  const onRefreshCurrentNum = async () => {
    console.log("getting zkApp state...");
    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.zkappPublicKey!,
    });
    const currentNum = await state.zkappWorkerClient!.getNum();
    console.log("current state:", currentNum.toString());
    setState({ ...state, currentNum });
  };
  // -------------------------------------------------------...

  // const [zkAppInstance, setZkZppInstance] = useState<Add | null>(null);

  // const zkAppInstance = useZkApp<Add>(
  //   "B62qpRvmPpgUsRT4aTMTbGSapfP84pCP7sc4Ws8XBqvbHqTe6DtgB4r",
  //   // "B62qqkb7hD1We6gEfrcqosKt9C398VLp1WXeTo1i9boPoqF7B1LxHg4",
  //   import("../../contracts/build/src"),
  //   "Add"
  // );
  // const sendTransaction = useSendTransaction();

  // console.log(zkAppInstance);
  // // console.log(zkAppInstance.zkApp?.num.get().toString());

  // const accountsQuery = useAccounts();
  // const networkQuery = useNetwork();

  // const onClick = async () => {
  //   if (!zkAppInstance.zkApp) {
  //     console.error("No zkapp loaded");
  //     return;
  //   }
  //   console.log(zkAppInstance.zkApp.num.get().toString());
  //   zkAppInstance.zkApp?.update();
  //   try {
  //     // This is the public key of the deployed zkapp you want to interact with.

  //     const tx = await Mina.transaction(() => {
  //       // const YourSmartContractInstance = new YourSmartContract(zkAppAddress);
  //       // YourSmartContractInstance.foo();
  //       zkAppInstance.zkApp?.update();
  //     });

  //     await tx.prove();
  //     sendTransaction.mutate({
  //       transaction: tx.toJSON(),
  //       feePayer: {
  //         fee: "",
  //         memo: "zk",
  //       },
  //     });
  //     // const { hash } = await window.mina.sendTransaction({
  //     //   transaction: tx.toJSON(),
  //     //   feePayer: {
  //     //     fee: "",
  //     //     memo: "zk",
  //     //   },
  //     // });

  //     // console.log(hash);
  //   } catch (err: any) {
  //     // You may want to show the error message in your UI to the user if the transaction fails.
  //     console.log(err.message);
  //   }
  // };

  // -------------------------------------------------------
  // Create UI elements
  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        {" "}
        [Link]{" "}
      </a>
    );
    hasWallet = (
      <div>
        {" "}
        Could not find a wallet. Install Auro wallet here: {auroLinkElem}
      </div>
    );
  }
  let setupText = state.hasBeenSetup
    ? "SnarkyJS Ready"
    : "Setting up SnarkyJS...";
  let setup = (
    <div>
      {" "}
      {setupText} {hasWallet}
    </div>
  );
  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      "https://faucet.minaprotocol.com/?address=" + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        Account does not exist. Please visit the faucet to fund this account
        <a href={faucetLink} target="_blank" rel="noreferrer">
          {" "}
          [Link]{" "}
        </a>
      </div>
    );
  }
  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div>
        <button
          onClick={onSendTransaction}
          disabled={state.creatingTransaction}
        >
          {" "}
          Send Transaction{" "}
        </button>
        <div> Current Number in zkApp: {state.currentNum!.toString()} </div>
        <button onClick={onRefreshCurrentNum}> Get Latest State </button>
      </div>
    );
  }
  return (
    <div>
      {setup}
      {accountDoesNotExist}
      {mainContent}
    </div>
  );
  // }

  // if (!accountsQuery.isConnected) {
  //   return (
  //     <div>
  //       <button onClick={accountsQuery.connect}>Connect</button>
  //     </div>
  //   );
  // }

  // if (accountsQuery.isLoading || networkQuery.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (!accountsQuery.accounts) {
  //   return <div>Please connect to Mina wallet</div>;
  // }

  // if (networkQuery.network !== "Berkeley-QA") {
  //   return <div>Please switch to Berkeley-QA network</div>;
  // }

  // return (
  //   <div className={styles.container}>
  //     <Head>
  //       <title>Create Next App</title>
  //       <meta name="description" content="Generated by create next app" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>

  //     <main className={styles.main}>
  //       <h1 className={styles.title}>ZKCred</h1>

  //       <p className={styles.description}>
  //         {zkAppInstance ? (
  //           <>
  //             <button onClick={onClick}>Add</button>
  //             {sendTransaction.isLoading ? "Sending..." : ""}
  //             {sendTransaction.isError ? sendTransaction.error : ""}
  //           </>
  //         ) : (
  //           "Loading..."
  //         )}
  //       </p>
  //     </main>

  //     <footer className={styles.footer}>
  //       Created by <a href="https://mono-koto.com/">Mono Koto</a>
  //     </footer>
  //   </div>
  // );
}
