import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", name: "All Categories", icon: "🛒" },
  { id: "fruits", name: "Fruits & Vegetables", icon: "🍎" },
  { id: "dairy", name: "Dairy & Eggs", icon: "🧀" },
  { id: "meat", name: "Meat & Seafood", icon: "🍖" },
  { id: "bakery", name: "Bakery", icon: "🍞" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "snacks", name: "Snacks", icon: "🍪" },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`text-center group cursor-pointer ${
                selectedCategory === category.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              } transition-opacity`}
              data-testid={`button-category-${category.id}`}
            >
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${
                selectedCategory === category.id 
                  ? 'bg-primary/20 ring-2 ring-primary' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
