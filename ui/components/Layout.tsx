import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
      <Footer />
    </>
  );
}
