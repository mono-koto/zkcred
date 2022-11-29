import Link from "next/link";

export default function Index() {
  return (
    <div>
      <ul className="list-decimal list-inside">
        <li className="mb-2">
          <Link href="/issue">Issuance</Link>
          <p className="text-sm">
            As an issuer, create a credential for a Mina wallet
          </p>
        </li>
        <li>
          <Link href="/presentation">Present</Link>
          <p className="text-sm">
            As a Mina wallet, present a selectively present the credential
          </p>
        </li>
      </ul>
    </div>
  );
}
