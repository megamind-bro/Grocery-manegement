import random
from datetime import datetime, timedelta
from app import app
from db import SessionLocal, Order, User, Product
import json

def seed_forecast_data():
    with app.app_context():
        session = SessionLocal()
        
        # Get existing data for reference
        products = session.query(Product).all()
        if not products:
            print("No products found! Please run seed_products.py first.")
            return

        # Generate data for the last 90 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=90)
        
        orders_to_add = []
        
        print(f"Generating orders from {start_date.date()} to {end_date.date()}...")
        
        current_date = start_date
        while current_date <= end_date:
            # Random daily order count with some weekly seasonality (more on weekends)
            is_weekend = current_date.weekday() >= 5
            base_orders = random.randint(5, 15)
            if is_weekend:
                base_orders += random.randint(5, 10)
                
            # Add some random trend (sales increasing over time)
            days_passed = (current_date - start_date).days
            trend_factor = 1 + (days_passed / 180) # Up to 50% increase over 90 days
            
            num_orders = int(base_orders * trend_factor)
            
            for _ in range(num_orders):
                # Randomly select 1-5 products
                num_items = random.randint(1, 5)
                selected_products = random.choices(products, k=num_items)
                
                order_items = []
                subtotal = 0.0
                
                for p in selected_products:
                    # Quantity 1-3
                    quantity = random.randint(1, 3)
                    item_total = float(p.price) * quantity
                    subtotal += item_total
                    
                    order_items.append({
                        "id": p.id,
                        "name": p.name,
                        "price": p.price,
                        "quantity": quantity,
                        "image": p.image
                    })
                
                delivery_fee = 100.0  # Standard fee
                total = subtotal + delivery_fee
                
                # Create order
                order = Order(
                    customer_name=f"Customer {random.randint(1000, 9999)}",
                    customer_phone=f"07{random.randint(10000000, 99999999)}",
                    customer_email=f"customer{random.randint(1000, 9999)}@example.com",
                    delivery_address="123 Mock Street",
                    items=json.dumps(order_items),
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total=total,
                    payment_method="mpesa",
                    payment_status="paid",  # Mark as paid for analytics
                    order_status="completed",
                    created_at=current_date + timedelta(hours=random.randint(8, 20), minutes=random.randint(0, 59))
                )
                orders_to_add.append(order)
            
            current_date += timedelta(days=1)
            
        session.add_all(orders_to_add)
        session.commit()
        print(f"Successfully added {len(orders_to_add)} mock orders.")

if __name__ == "__main__":
    seed_forecast_data()
