import Footer from "./Footer";
import Navbar from "./Navbar";
import Menu from "@/components/menu";

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <div>
        <Navbar />
        <Menu />
        {children}
        <Footer />
    </div>
  );
}
