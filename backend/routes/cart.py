from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

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
    items_col = mongo.db.items
    result = []
    for c in cart_col.find({"user_id": user_id}):
        item_id = c.get("item_id")
        item_doc = None
        # Normalize to ObjectId if stored as string
        if isinstance(item_id, str):
            try:
                item_doc = items_col.find_one({"_id": ObjectId(item_id)})
            except Exception:
                item_doc = None
        elif isinstance(item_id, ObjectId):
            item_doc = items_col.find_one({"_id": item_id})

        merged = {
            "item_id": str(item_id) if isinstance(item_id, ObjectId) else item_id,
            "quantity": c.get("quantity", 1),
        }
        if item_doc:
            merged.update({
                "name": item_doc.get("name", ""),
                "price": item_doc.get("price", 0),
                "image": item_doc.get("image", ""),
                "stock": item_doc.get("stock", 0),
            })
        result.append(merged)
    return jsonify(result)

# -------- UPDATE CART ITEM --------
@cart_bp.route("/update", methods=["POST"])
@jwt_required()
def update_cart_item():
    cart_col = get_cart_col()
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get("item_id")
    quantity = data.get("quantity")
    if not item_id or quantity is None:
        return jsonify({"msg": "item_id and quantity required"}), 400
    cart_col.update_one({"user_id": user_id, "item_id": item_id}, {"$set": {"quantity": quantity}})
    return jsonify({"msg": "updated"})

# -------- REMOVE CART ITEM --------
@cart_bp.route("/remove", methods=["POST"])
@jwt_required()
def remove_cart_item():
    cart_col = get_cart_col()
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get("item_id")
    if not item_id:
        return jsonify({"msg": "item_id required"}), 400
    cart_col.delete_one({"user_id": user_id, "item_id": item_id})
    return jsonify({"msg": "removed"})

# -------- MERGE GUEST CART --------
@cart_bp.route("/merge", methods=["POST"])
@jwt_required()
def merge_cart():
    cart_col = get_cart_col()
    user_id = get_jwt_identity()
    data = request.get_json() or []
    # expected list of { item_id, quantity }
    for entry in data:
        item_id = entry.get("item_id") or entry.get("id")
        quantity = int(entry.get("quantity", 1))
        if not item_id:
            continue
        existing = cart_col.find_one({"user_id": user_id, "item_id": item_id})
        if existing:
            cart_col.update_one({"_id": existing["_id"]}, {"$inc": {"quantity": quantity}})
        else:
            cart_col.insert_one({"user_id": user_id, "item_id": item_id, "quantity": quantity})
    return jsonify({"msg": "merged"})