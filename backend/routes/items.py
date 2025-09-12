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
    navbar_search = request.args.get("navbarSearch")
    filter_search = request.args.get("filterSearch")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    sort_by = request.args.get("sortBy", "name")  # default to name
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    if category:
        query["category"] = category
    
    # Handle both navbar search and filter panel search
    search_patterns = []
    
    if navbar_search:
        # Enhanced flexible search for navbar: split search terms and create multiple search patterns
        search_terms = navbar_search.lower().split()
        
        for term in search_terms:
            # Create flexible patterns for each term
            patterns = [
                {"name": {"$regex": term, "$options": "i"}},
                {"category": {"$regex": term, "$options": "i"}},
                {"description": {"$regex": term, "$options": "i"}},
                # Handle common variations and abbreviations
                {"name": {"$regex": term.replace("shirt", "t-shirt"), "$options": "i"}},
                {"name": {"$regex": term.replace("tshirt", "t-shirt"), "$options": "i"}},
                {"name": {"$regex": term.replace("t-shirt", "shirt"), "$options": "i"}},
                {"name": {"$regex": term.replace("laptop", "computer"), "$options": "i"}},
                {"name": {"$regex": term.replace("computer", "laptop"), "$options": "i"}},
                {"category": {"$regex": term.replace("shirt", "clothing"), "$options": "i"}},
                {"category": {"$regex": term.replace("tshirt", "clothing"), "$options": "i"}},
                {"category": {"$regex": term.replace("laptop", "electronics"), "$options": "i"}},
            ]
            search_patterns.extend(patterns)
    
    if filter_search:
        # Simple search for filter panel
        search_patterns.extend([
            {"name": {"$regex": filter_search, "$options": "i"}},
            {"category": {"$regex": filter_search, "$options": "i"}},
            {"description": {"$regex": filter_search, "$options": "i"}}
        ])
    
    # Use OR condition to match any of the patterns if there are search terms
    if search_patterns:
        query["$or"] = search_patterns
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

    # Handle sorting
    sort_direction = 1  # ascending by default
    sort_field = "name"  # default field
    
    if sort_by.startswith("-"):
        sort_direction = -1
        sort_field = sort_by[1:]  # remove the minus sign
    else:
        sort_field = sort_by
    
    # Map frontend sort options to database fields
    if sort_field == "price":
        sort_field = "price"
    elif sort_field == "rating":
        sort_field = "rating"
    elif sort_field == "stock":
        sort_field = "stock"
    else:
        sort_field = "name"  # default to name for any other value

    cursor = items_col.find(query).sort(sort_field, sort_direction).skip((page - 1) * page_size).limit(page_size)
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