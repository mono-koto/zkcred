import dynamic from "next/dynamic";
import { Suspense } from "react";
// import Issuance from "../components/Issuance";
const Issuance = dynamic(() => import("../components/Issuance"), {
  suspense: true,
  ssr: false,
});

export default function Issue() {
  return (
    <Suspense fallback={`Loading...`}>
      <Issuance />
    </Suspense>
  );
}
