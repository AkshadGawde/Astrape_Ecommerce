from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import jwt_required
from bson import ObjectId

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

# -------- GET ALL ITEMS WITH FILTERS & PAGINATION --------
@items_bp.route("", methods=["GET"])
def get_items():
    items_col = get_items_col()
    query = {}

    category = request.args.get("category")
    search = request.args.get("search")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    if category:
        query["category"] = category
    if search:
        # basic case-insensitive regex search on name
        query["name"] = {"$regex": search, "$options": "i"}
    price_filter = {}
    try:
        if min_price is not None:
            price_filter["$gte"] = float(min_price)
        if max_price is not None:
            price_filter["$lte"] = float(max_price)
    except ValueError:
        pass
    if price_filter:
        query["price"] = price_filter

    cursor = items_col.find(query).skip((page - 1) * page_size).limit(page_size)
    items = []
    for i in cursor:
        i["id"] = str(i["_id"])
        i.pop("_id")
        items.append(i)
    return jsonify(items)

# -------- GET ITEM BY ID --------
@items_bp.route("/<item_id>", methods=["GET"])
def get_item(item_id):
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

# -------- UPDATE ITEM --------
@items_bp.route("/<item_id>", methods=["PUT"])
@jwt_required()
def update_item(item_id):
    items_col = get_items_col()
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return jsonify({"msg": "Invalid item id"}), 400
    data = request.get_json() or {}
    if "_id" in data:
        data.pop("_id")
    items_col.update_one({"_id": obj_id}, {"$set": data})
    updated = items_col.find_one({"_id": obj_id})
    if not updated:
        return jsonify({"msg": "Item not found"}), 404
    updated["id"] = str(updated["_id"])
    updated.pop("_id")
    return jsonify({"msg": "updated", "item": updated})

# -------- DELETE ITEM --------
@items_bp.route("/<item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    items_col = get_items_col()
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return jsonify({"msg": "Invalid item id"}), 400
    res = items_col.delete_one({"_id": obj_id})
    if res.deleted_count == 0:
        return jsonify({"msg": "Item not found"}), 404
    return jsonify({"msg": "deleted"})

# -------- GET DISTINCT CATEGORIES --------
@items_bp.route("/categories", methods=["GET"])
def get_categories():
    items_col = get_items_col()
    cats = items_col.distinct("category")
    # filter out empty or None
    cats = [c for c in cats if c]
    return jsonify(cats)