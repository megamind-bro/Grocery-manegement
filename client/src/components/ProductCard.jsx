import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(!!data);
          setIsAdmin(data?.isAdmin || false);
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    })();
  }, []);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (isAdmin) {
      toast({
        title: "Admin Account",
        description: "Admin accounts cannot add items to cart. Please use a customer account.",
        variant: "destructive",
      });
      return;
    }

    if (!product.inStock || (product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0)) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        size: product.size || "",
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-green-600 text-lg">
                  KSh {product.price}
                </p>
                {product.size && (
                  <p className="text-sm text-gray-500">{product.size}</p>
                )}
              </div>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className={isLoggedIn && !isAdmin && product.inStock ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}
                disabled={!isLoggedIn || isAdmin || !product.inStock || (product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0)}
                title={
                  !isLoggedIn
                    ? "Login required to add to cart"
                    : isAdmin
                      ? "Admin accounts cannot add to cart"
                      : !product.inStock
                        ? "Out of stock"
                        : "Add to cart"
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                {!isLoggedIn ? "Login" : isAdmin ? "Admin" : !product.inStock ? "Out" : "Add"}
              </Button>
            </div>
            {product.stockQuantity !== undefined && (
              <div className="text-xs">
                {product.inStock && Number(product.stockQuantity) > 0 ? (
                  <span className="text-green-600 font-medium">
                    {product.stockQuantity} in stock
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of stock</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
