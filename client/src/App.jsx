import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Profiles from "@/pages/profiles";
import Login from "@/pages/login";
import Account from "@/pages/account";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CookiePolicy from "@/pages/cookie-policy";
import Header from "@/components/Header";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/login" component={Login} />
        <Route path="/account" component={Account} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-leaf text-white text-lg"></i>
                </div>
                <span className="text-xl font-bold">GrocerySync</span>
              </div>
              <p className="text-gray-400">Your trusted partner for fresh groceries delivered to your doorstep.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">About Us</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">Contact</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">Careers</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/account" className="hover:text-white transition-colors cursor-pointer">Help Center</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors cursor-pointer">Track Your Order</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors cursor-pointer">Returns</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors cursor-pointer">Shipping Info</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2024 GrocerySync. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Terms of Service</Link>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Cookie Policy</Link>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
