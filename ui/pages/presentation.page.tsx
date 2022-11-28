import dynamic from "next/dynamic";
import { Suspense } from "react";
const Presentation = dynamic(() => import("../components/Presentation"), {
  ssr: false,
});

export default function Present() {
  return <Presentation />;
}
