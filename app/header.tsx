import Menu from "@/components/menu";
import Theme from "@/components/theme";
import User from "@/components/user";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-12 bg-[#ffffff] backdrop-blur-xl dark:bg-[#212b36]">
      <div className="mx-auto flex h-full max-w-[1700px] items-center justify-between px-6">
        <Menu />

        <div className="flex items-center gap-6 text-white">
          <Theme />
          <User />
        </div>
      </div>
    </header>
  );
}
