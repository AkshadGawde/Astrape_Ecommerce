from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import jwt_required

items_bp = Blueprint("items", __name__, url_prefix="/items")

def get_items_col():
    return mongo.db.items

# -------- CREATE ITEM --------
@items_bp.route("", methods=["POST"])
@jwt_required()
def create_item():
    items_col = get_items_col()
    data = request.get_json()
    result = items_col.insert_one(data)
    # Remove any _id field if present in input
    item = {k: v for k, v in data.items() if k != "_id"}
    item["id"] = str(result.inserted_id)
    return jsonify({"msg": "item created", "item": item}), 201

# -------- GET ALL ITEMS --------
@items_bp.route("", methods=["GET"])
def get_items():
    items_col = get_items_col()
    items = []
    for i in items_col.find():
        i["id"] = str(i["_id"])
        i.pop("_id")
        items.append(i)
    return jsonify(items)

# -------- GET ITEM BY ID --------
@items_bp.route("/<item_id>", methods=["GET"])
def get_item(item_id):
    from bson import ObjectId
    items_col = get_items_col()
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return jsonify({"msg": "Invalid item id"}), 400
    item = items_col.find_one({"_id": obj_id})
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    item["id"] = str(item["_id"])
    item.pop("_id")
    return jsonify(item)