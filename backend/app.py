from flask import Flask
from extensions import mongo, jwt, cors
from config import Config
from routes.auth import auth_bp
from routes.items import items_bp
from routes.cart import cart_bp

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
mongo.init_app(app)
jwt.init_app(app)
cors.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(items_bp)
app.register_blueprint(cart_bp)

if __name__ == "__main__":
    app.run(debug=True)