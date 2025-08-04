import { Home, PlusCircle, LayoutGrid, Search, Shuffle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlusCircle, label: "Add", path: "/add" },
    { icon: LayoutGrid, label: "Metas", path: "/metas" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Shuffle, label: "Quiz", path: "/quiz" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate("/")}
          >
            GeoGuessr Meta Tracker
          </h1>
          
          <div className="flex items-center gap-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(path)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-200",
                  location.pathname === path && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};