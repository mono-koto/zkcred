import { useEffect, useState } from "react";

await window.mina.requestAccounts();

export function ConnectButton() {
  const [accounts, setAccounts] = useState<string[] | undefined>();

  useEffect(() => {
    (async () => {
      setAccounts(await window.mina.requestAccounts());
    })();
  }, []);

  return <button>{accounts}</button>;
}
