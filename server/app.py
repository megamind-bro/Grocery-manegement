from __future__ import annotations

import os
import sys
from flask import Flask

from config import config
from db import Base, engine
from routes_products import bp_products
from routes_categories import bp_categories
from routes_orders import bp_orders
from routes_analytics import bp_analytics
from routes_auth import bp_auth
from routes_admin import bp_admin


def create_app() -> Flask:
    app = Flask(__name__)
    
    # Set a secret key for session management
    app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-key-123')  # In production, use a secure random key

    # Initialize DB schema
    Base.metadata.create_all(engine)

    # Register blueprints
    app.register_blueprint(bp_products)
    app.register_blueprint(bp_categories)
    app.register_blueprint(bp_orders)
    app.register_blueprint(bp_analytics)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_admin)

    return app


app = create_app()

# Run the app when executed directly or as a module
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.port, debug=True)
elif __name__ == "server.app" and "-m" in sys.argv:
    # Running as module: python -m server.app
    app.run(host="0.0.0.0", port=config.port, debug=True)
