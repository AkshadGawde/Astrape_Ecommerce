from extensions import mongo

def get_cart_collection():
    return mongo.db.carts