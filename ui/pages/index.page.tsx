import Link from "next/link";

export default function Index() {
  return (
    <div>
      <ul>
        <li>
          <Link href="/issue">Issuance</Link>
        </li>
        <li>
          <Link href="/presentation">Present</Link>
        </li>
      </ul>
    </div>
  );
}
