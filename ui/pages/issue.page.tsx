import dynamic from "next/dynamic";
import Main from "../components/Main";
// const Main = dynamic(() => import("../components/Main"), {
//   ssr: false,
// });

export default function Index() {
  return <Main />;
}
