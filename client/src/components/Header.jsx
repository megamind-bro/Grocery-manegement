import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, User, BarChart3, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location, navigate] = useLocation();
  const { state, refreshCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setMe(data);
      } catch { }
    })();
  }, [location]); // Refresh when location changes (e.g., after login)

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">GrocerySync</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === "/"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <i className="fas fa-home"></i>
              <span>Landing</span>
            </Link>

            {!me?.isAdmin && (
              <Link
                href="/cart"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground relative"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Link>
            )}

            {me?.isAdmin && (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {me && (
              <Link
                href="/account"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4" />
                <span>Account</span>
              </Link>
            )}

            {me ? (
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  setMe(null);
                  refreshCart();
                  navigate("/");
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
