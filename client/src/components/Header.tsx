import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, User, BarChart3, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location, navigate] = useLocation();
  const { state } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
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
              <span className="text-xl font-bold text-foreground">FreshMart</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Account */}
            <Link href="/account" data-testid="link-account">
              <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Account</span>
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart" data-testid="link-cart">
              <button className="relative flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce"
                    data-testid="text-cart-count"
                  >
                    {state.itemCount}
                  </span>
                )}
                <span className="hidden sm:inline">Cart</span>
              </button>
            </Link>

            {/* Manager Dashboard */}
            <Link href="/dashboard" data-testid="link-dashboard">
              <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                <BarChart3 className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
