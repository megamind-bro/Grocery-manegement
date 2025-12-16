#!/usr/bin/env python3
"""
Seed script to add sample products with images to the database.
"""

from __future__ import annotations

from db import Base, SessionLocal, Product, engine

# Sample products with images
PRODUCTS = [
    {
        "name": "Fresh Bananas",
        "description": "Ripe and sweet bananas, perfect for breakfast or snacks",
        "price": 150.00,
        "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
        "category": "fruits",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 10.00,
        "in_stock": True,
    },
    {
        "name": "Fresh Tomatoes",
        "description": "Juicy red tomatoes, great for salads and cooking",
        "price": 200.00,
        "image": "https://images.unsplash.com/photo-1546095667-0c21ba5f0e0a?w=400",
        "category": "vegetables",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 15.00,
        "in_stock": True,
    },
    {
        "name": "Fresh Milk",
        "description": "Fresh whole milk, pasteurized and ready to drink",
        "price": 120.00,
        "image": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
        "category": "dairy",
        "size": "500ml",
        "delivery_price": 50.00,
        "discount": 5.00,
        "in_stock": True,
    },
    {
        "name": "Chicken Breast",
        "description": "Fresh boneless chicken breast, perfect for grilling",
        "price": 450.00,
        "image": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
        "category": "meat",
        "size": "500g",
        "delivery_price": 50.00,
        "discount": 20.00,
        "in_stock": True,
    },
    {
        "name": "White Rice",
        "description": "Premium quality white rice, long grain",
        "price": 180.00,
        "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
        "category": "grains",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 8.00,
        "in_stock": True,
    },
    {
        "name": "Orange Juice",
        "description": "Fresh squeezed orange juice, 100% natural",
        "price": 250.00,
        "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
        "category": "beverages",
        "size": "1L",
        "delivery_price": 50.00,
        "discount": 12.00,
        "in_stock": True,
    },
    {
        "name": "Fresh Carrots",
        "description": "Crisp and sweet carrots, rich in vitamins",
        "price": 150.00,
        "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
        "category": "vegetables",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 7.00,
        "in_stock": True,
    },
    {
        "name": "Fresh Apples",
        "description": "Crisp red apples, perfect for snacking",
        "price": 300.00,
        "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b27c42?w=400",
        "category": "fruits",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 18.00,
        "in_stock": True,
    },
    {
        "name": "Bread Loaf",
        "description": "Fresh white bread, baked daily",
        "price": 80.00,
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
        "category": "bakery",
        "size": "500g",
        "delivery_price": 50.00,
        "discount": 3.00,
        "in_stock": True,
    },
    {
        "name": "Eggs",
        "description": "Fresh farm eggs, free range",
        "price": 350.00,
        "image": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
        "category": "dairy",
        "size": "12 pieces",
        "delivery_price": 50.00,
        "discount": 25.00,
        "in_stock": True,
    },
    {
        "name": "Fresh Onions",
        "description": "Fresh red onions, great for cooking",
        "price": 100.00,
        "image": "https://images.unsplash.com/photo-1618512496249-5a8a6e3e4b8e?w=400",
        "category": "vegetables",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 5.00,
        "in_stock": True,
    },
    {
        "name": "Potatoes",
        "description": "Fresh potatoes, perfect for frying and boiling",
        "price": 120.00,
        "image": "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400",
        "category": "vegetables",
        "size": "1kg",
        "delivery_price": 50.00,
        "discount": 6.00,
        "in_stock": True,
    },
    {
        "name": "Cooking Oil",
        "description": "Premium vegetable cooking oil",
        "price": 280.00,
        "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
        "category": "pantry",
        "size": "1L",
        "delivery_price": 50.00,
        "discount": 14.00,
        "in_stock": True,
    },
    {
        "name": "sweet juicy watermelon",
        "price": 300.00,
        "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
        "category": "fruits",
        "size": "2kg",
        "delivery_price": 50.00,
        "discount": 16.00,
        "in_stock": True,
    },
    {
        "name": "Salt",
        "description": "Fine table salt",
        "price": 50.00,
        "image": "https://images.unsplash.com/photo-1608039829573-80364e3a1a52?w=400",
        "category": "pantry",
        "size": "500g",
        "delivery_price": 50.00,
        "discount": 2.00,
        "in_stock": True,
    },
]


def main() -> None:
    """Seed products into the database"""
    Base.metadata.create_all(engine)
    
    with SessionLocal() as session:
        # Check if products already exist
        existing_count = session.query(Product).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} products.")
            response = input("Do you want to add more products? (y/n): ").strip().lower()
            if response != "y":
                print("Skipping product seeding.")
                return
        
        added_count = 0
        for product_data in PRODUCTS:
            # Check if product with same name already exists
            existing = session.query(Product).filter(Product.name == product_data["name"]).first()
            if existing:
                print(f"Product '{product_data['name']}' already exists, skipping...")
                continue
            
            # Set default stock quantity if not provided
            if "stock_quantity" not in product_data:
                product_data["stock_quantity"] = 50
            
            product = Product(**product_data)
            session.add(product)
            added_count += 1
        
        session.commit()
        print(f"Successfully added {added_count} products to the database!")


if __name__ == "__main__":
    main()

