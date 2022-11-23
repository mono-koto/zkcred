import React, { useCallback, useEffect, useState } from "react";

interface MinaWalletContext {
  accounts?: string[];
}

const Context = React.createContext<MinaWalletContext>({});

interface Props {
  children: React.ReactNode;
  id?: string;
}

export function MinaWalletProvider({ children, id }: Props) {
  const [accounts, setAccounts] = useState<string[] | undefined>();

  const updateAccounts = useCallback(async () => {
    if (!accounts) {
      setAccounts(await window.mina.requestAccounts());
    }
  }, [accounts]);

  useEffect(() => {
    updateAccounts();
  }, []);

  return (
    <Context.Provider
      value={{
        accounts,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAccounts() {
  const context = React.useContext(Context);
  return context.accounts;
}

interface SignedData {
  publicKey: string;
  payload: string;
  signature: {
    field: string;
    scalar: string;
  };
}

export function useSignMessage() {
  const accounts = useAccounts();
  const [isSuccess, setSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [signedData, setSignedData] = useState<SignedData | undefined>();

  const sign = useCallback(
    async (message: string) => {
      setSignedData(undefined);
      setError(undefined);
      setLoading(true);
      setSuccess(false);

      if (!!accounts) {
        setLoading(true);
        return;
      }
      try {
        let signResult = await window.mina.signMessage({
          message: "some message...",
        });
        setSuccess(true);
        setSignedData(signResult);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [accounts]
  );
  return {
    sign,
    isSuccess,
    isLoading,
    error,
    isError: !!error,
    signedData,
  };
}
