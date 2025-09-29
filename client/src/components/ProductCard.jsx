import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductCard({ product }) {
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
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
