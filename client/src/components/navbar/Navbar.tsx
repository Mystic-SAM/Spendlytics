import { useState } from "react";
import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import UserNav from "./UserNav";
import LogoutDialog from "./LogoutDialog";
import { useTypedSelector } from "@/app/hook";
import { useTheme } from "@/context/ThemeProvider";
import Logo from "../ui/Logo/Logo";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useTypedSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const routes = [
    {
      href: PROTECTED_ROUTES.DASHBOARD,
      label: "Dashboard",
    },
    {
      href: PROTECTED_ROUTES.TRANSACTIONS,
      label: "Transactions",
    },
    {
      href: PROTECTED_ROUTES.REPORTS,
      label: "Reports",
    },
    {
      href: PROTECTED_ROUTES.SETTINGS,
      label: "Settings",
    },
  ];

  return (
    <>
      <header
        className={cn(
          "w-full px-4 py-3 pb-3 lg:px-14 bg-[var(--secondary-dark-color)] text-white ",
          pathname === PROTECTED_ROUTES.DASHBOARD && "!pb-3"
        )}
      >
        <div className="w-full flex h-14 max-w-[var(--max-width)] items-center mx-auto">
          <div className="w-full flex items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex md:hidden !cursor-pointer
               !bg-white/10 !text-white hover:bg-white/10"
                onClick={() => setIsOpen(true)}
                aria-label="Toggle Navigation Links Drawer"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Logo />
            </div>

            {/* Navigation*/}
            <nav className="hidden md:flex items-center gap-x-2">
              {routes?.map((route) => (
                <Button
                  key={route.href}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    `font-normal py-4.5
                     hover:text-white border-none
                     text-white/60 focus:bg-white/30
                     transtion !bg-transparent !text-[14.5px]
                     `,
                    pathname === route.href && "text-white"
                  )}
                  asChild
                >
                  <NavLink to={route.href}>
                    {route.label}
                  </NavLink>
                </Button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetContent side="left" className="sm480:w-1/2">
                <SheetHeader>
                  <SheetTitle>Spendlytics</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation Links
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-y-2">
                  {routes?.map((route) => (
                    <Button
                      key={route.href}
                      size="sm"
                      variant="ghost"
                      className={cn(
                        `w-full font-normal py-4.5
                       hover:bg-secondary hover:text-foreground border-none
                       text-muted-foreground focus:bg-secondary
                       transition !bg-transparent justify-start`,
                        pathname === route.href && "text-foreground !bg-secondary"
                      )}
                      asChild
                    >
                      <NavLink key={route.href} to={route.href}>
                        {route.label}
                      </NavLink>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="!bg-white/10 !text-white hover:!bg-white/20 !cursor-pointer"
                onClick={() =>
                  setTheme(
                    theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
                  )
                }
                title={capitalizeFirstLetter(theme)}
                aria-label="Toggle theme"
                aria-describedby="active-theme"
              >
                {theme === "light" && <Sun className="h-5 w-5" />}
                {theme === "dark" && <Moon className="h-5 w-5" />}
                {theme === "system" && <Monitor className="h-5 w-5" />}
                <span id="active-theme" className="sr-only">Active Theme is {capitalizeFirstLetter(theme)}</span>
              </Button>

              <UserNav
                userName={user?.name || ""}
                profilePicture={user?.profilePicture || ""}
                onLogout={() => setIsLogoutDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        setIsOpen={setIsLogoutDialogOpen}
      />
    </>
  );
};

export default Navbar;