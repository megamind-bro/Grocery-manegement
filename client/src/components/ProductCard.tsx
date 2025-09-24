import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
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
  };

  return (
    <Card className="hover:shadow-md transition-shadow group" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
          data-testid={`img-product-${product.id}`}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        {product.size && (
          <p className="text-sm text-gray-600 mb-2" data-testid={`text-product-size-${product.id}`}>
            {product.size}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            KSh {product.price}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary text-white hover:bg-primary/90"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
