from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint("cart", __name__, url_prefix="/cart")

def get_cart_col():
    return mongo.db.cart

# -------- ADD TO CART --------
@cart_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    cart_col = get_cart_col()
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get("item_id")
    quantity = data.get("quantity", 1)

    existing = cart_col.find_one({"user_id": user_id, "item_id": item_id})
    if existing:
        cart_col.update_one({"_id": existing["_id"]}, {"$inc": {"quantity": quantity}})
        cart_item_id = str(existing["_id"])
    else:
        result = cart_col.insert_one({"user_id": user_id, "item_id": item_id, "quantity": quantity})
        cart_item_id = str(result.inserted_id)

    return jsonify({"msg": "item added to cart", "cart_item_id": cart_item_id})

# -------- GET USER CART --------
@cart_bp.route("", methods=["GET"])
@jwt_required()
def get_cart():
    cart_col = get_cart_col()
    user_id = get_jwt_identity()
    items = []
    for i in cart_col.find({"user_id": user_id}):
        i["id"] = str(i["_id"])
        i.pop("_id")
        items.append(i)
    return jsonify(items)