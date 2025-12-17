from __future__ import annotations

import os
from flask import Flask
import os

from config import config
from db import Base, engine
from routes_products import bp_products
from routes_categories import bp_categories
from routes_orders import bp_orders
from routes_analytics import bp_analytics
from routes_admin import bp_admin
from routes_auth import bp_auth
from routes_profile import bp_profile
from routes_cart import bp_cart
from routes_notifications import bp_notifications


def create_app() -> Flask:
    app = Flask(__name__)

    # Initialize DB schema
    Base.metadata.create_all(engine)

    # Flask session secret
    app.secret_key = os.getenv("SECRET_KEY", "dev-secret")

    # Register blueprints
    app.register_blueprint(bp_products)
    app.register_blueprint(bp_categories)
    app.register_blueprint(bp_orders)
    app.register_blueprint(bp_analytics)
    app.register_blueprint(bp_admin)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_profile)
    app.register_blueprint(bp_cart)
    app.register_blueprint(bp_notifications)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.port, debug=True)
