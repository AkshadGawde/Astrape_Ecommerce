from flask import Flask
from config import Config
from extensions import mongo, jwt
from routes import auth, items, cart

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    mongo.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth.auth_bp)
    app.register_blueprint(items.items_bp)
    app.register_blueprint(cart.cart_bp)

    @app.route("/")
    def home():
        return {"message": "E-commerce API with MongoDB running"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)