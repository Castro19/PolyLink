import useIsMobile from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";
import { environment } from "@/helpers/getEnvironmentVars";

const SplashHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (path: string) => {
    if (environment === "dev") {
      console.log("clicked", path);
    }
    navigate(path);
    setIsMenuOpen(false);
  };

  const mobileMenuStyles =
    "text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100 font-bold tracking-wide drop-shadow-[0_1.2px_1.2px_rgba(0,204,255,0.3)] transition-all duration-300 hover:drop-shadow-[0_1.2px_1.2px_rgba(0,204,255,0.5)]";
  const menuStyles =
    "text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100 font-bold tracking-wide drop-shadow-[0_1.2px_1.2px_rgba(0,204,255,0.3)] transition-all duration-300 hover:drop-shadow-[0_1.2px_1.2px_rgba(0,204,255,0.5)]";

  return (
    <header className="sticky top-0 bg-slate-900 text-white p-4 z-50 border-b-2 border-zinc-800 dark:border-x-gray-500 shadow-md">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-3xl hover:text-gray-300 font-bold leading-tight"
        >
          PolyLink
        </button>

        {isMobile ? (
          <>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-4xl hover:text-gray-300"
            >
              <RxHamburgerMenu />
            </button>

            {/* Mobile Menu Overlay */}
            <div
              className={`absolute top-full left-0 right-0 bg-slate-900 border-b-2 border-zinc-800 transform transition-all duration-300 ease-in-out ${
                isMenuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="flex flex-col p-4 space-y-4 ">
                <button
                  onClick={() => handleLinkClick("/coming-soon")}
                  className={mobileMenuStyles}
                >
                  Engineering
                </button>
                <button
                  onClick={() => handleLinkClick("/coming-soon")}
                  className={mobileMenuStyles}
                >
                  About
                </button>
                <button
                  onClick={() => handleLinkClick("/coming-soon")}
                  className={mobileMenuStyles}
                >
                  FAQ
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-12 mr-6">
            <button
              onClick={() => handleLinkClick("/coming-soon")}
              className={menuStyles}
            >
              Engineering
            </button>
            <button
              onClick={() => handleLinkClick("/coming-soon")}
              className={menuStyles}
            >
              About
            </button>
            <button className={menuStyles}>FAQ</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default SplashHeader;
