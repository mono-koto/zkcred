// Simple react-query wrappers around common async Mina functions

import {
  useMutation,
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { useCallback, useEffect } from "react";
import {
  fetchAccount,
  isReady,
  PublicKey,
  setGraphqlEndpoint,
  // SmartContract,
} from "snarkyjs";
import { Mina } from "./MinaTypes";
import type { SmartContract } from "snarkyjs";

type Props = {
  children?: React.ReactNode;
};

/**
 * Provider for Mina queries and mutations.
 * @note This provider should be used at the top level of your app.
 */
export const MinaProvider = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/**
 * Query the currently connected Mina accounts, if any. Changes if the accounts change
 *
 * @returns object consisting of a connection function,
 * as well as fields indicating whether the user is loading or had an error,
 * plus the actual accounts if available
 */
export function useAccounts() {
  const [accounts, setAccounts] = React.useState<string[] | undefined>();
  const [connected, setConnected] = React.useState(false);

  const q = useQuery({
    queryKey: ["window.mina.requestAccounts"],
    queryFn: async () => {
      const a = await window.mina.requestAccounts();
      setAccounts(a);
      return a;
    },
    enabled: connected,
  });
  useEffect(() => {
    window.mina.on("accountsChanged", (accounts: string[]) => {
      setAccounts(accounts);
      q.refetch();
    });
    return () => {
      window.mina.on("accountsChanged", () => {});
    };
  }, [q]);

  const connect = useCallback(async () => {
    setConnected(true);
    q.refetch();
  }, [q]);

  return {
    connect,
    isConnected: !!accounts,
    accounts,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
  };
}

/**
 * Query the current Mina network. Changes when the user switches networks.
 *
 * @returns object consisting of the current network,
 * as well as fields indicating whether the network is loading or had an error
 */
export function useNetwork() {
  const [network, setNetwork] = React.useState<string | undefined>();

  const q = useQuery({
    queryKey: ["window.mina.requestNetwork"],
    queryFn: async () => {
      const n = await window.mina.requestNetwork();
      setNetwork(n);
      return n;
    },
    staleTime: 0,
  });

  useEffect(() => {
    window.mina.on("chainChanged", (v: string) => {
      setNetwork(v);
      q.refetch();
    });
  }, [q]);
  return {
    network,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
  };
}

/**
 * Send a transaction to the Mina network
 *
 * @returns object with mutation for sending a transaction,
 * plus state fields indicating status of the mutation.
 */
export function useSendTransaction() {
  return useMutation({
    mutationFn: async (args: Mina.SendTransactionArgs) =>
      window.mina.sendTransaction(args),
  });
}

/**
 * Sign a message with the Mina wallet
 * @param args the message to sign
 * @returns object with mutation for signing a message,
 * plus state fields indicating status of the mutation.
 */
export function useSignMessage(args: Mina.SignMessageArgs) {
  return useMutation({
    mutationFn: async () => window.mina.signMessage(args),
  });
}

/**
 * Verify a message with the Mina wallet.
 * @param args the message to verify
 * @returns object with mutation for verifying a message,
 * plus state fields indicating status of the mutation.
 */
export function useVerifyMessage() {
  return useMutation({
    mutationFn: async (args: Mina.VerifyMessageArgs) =>
      window.mina.verifyMessage(args),
  });
}

export function useZkApp<T>(
  address: string,
  contract: Promise<any>,
  name: string
) {
  const [zkApp, setZkApp] = React.useState<T | undefined>();
  const [error, setError] = React.useState<any | undefined>();

  useEffect(() => {
    isReady
      .then(async () => {
        const ContractModule = await contract;
        const ContractClass = ContractModule[name] as {
          new (publicKey: PublicKey): T;
          compile(): Promise<void>;
        };
        // await ContractClass.compile();
        console.log("ContractClass", ContractClass);
        const zkAppInstance = new ContractClass(
          PublicKey.fromBase58(address)
        ) as SmartContract;
        setGraphqlEndpoint("https://proxy.berkeley.minaexplorer.com/graphql");
        const account = await fetchAccount({
          publicKey: zkAppInstance.address,
        });
        setZkApp(zkAppInstance as T);
      })
      .catch((error: any) => {
        setError(error);
      });
  }, []);

  return {
    zkApp,
    isLoading: !error && !zkApp,
    error,
    isError: !!error,
  };
}
