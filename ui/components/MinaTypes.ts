export namespace Mina {
  export interface SendTransactionArgs {
    transaction: any;
    feePayer?: {
      fee?: number | string;
      memo?: string;
    };
  }
  export interface SignMessageArgs {
    message: string;
  }

  export interface SignedData {
    publicKey: string;
    payload: string;
    signature: {
      field: string;
      scalar: string;
    };
  }

  export interface VerifyMessageArgs {
    publicKey: string;
    payload: string;
    signature: {
      field: string;
      scalar: string;
    };
  }
}

export type Mina = {
  requestAccounts(): Promise<string[]>;
  sendTransaction(args: Mina.SendTransactionArgs): Promise<{ hash: string }>;
  signMessage(args: Mina.SignMessageArgs): Promise<Mina.SignedData>;
  verifyMessage(args: Mina.VerifyMessageArgs): Promise<boolean>;
  requestNetwork(): Promise<string>;
  on(event: string, handler: (...any: any[]) => void): void;
};
