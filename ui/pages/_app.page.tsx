import "../styles/globals.css";
import type { AppProps } from "next/app";

import "./reactCOIServiceWorker";
import { MinaProvider } from "../components/useMina";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MinaProvider>
      <Component {...pageProps} />
    </MinaProvider>
  );
}
