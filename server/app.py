from __future__ import annotations

import os
from flask import Flask

from .config import config
from .db import Base, engine
from .routes_products import bp_products
from .routes_categories import bp_categories
from .routes_orders import bp_orders
from .routes_analytics import bp_analytics


def create_app() -> Flask:
    app = Flask(__name__)

    # Initialize DB schema
    Base.metadata.create_all(engine)

    # Register blueprints
    app.register_blueprint(bp_products)
    app.register_blueprint(bp_categories)
    app.register_blueprint(bp_orders)
    app.register_blueprint(bp_analytics)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.port, debug=True)
