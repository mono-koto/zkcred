import { Mina } from "./components/MinaTypes";

declare global {
  interface Window {
    mina: Mina;
  }
}

export {};
