# routes/auth.py
from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from bson.objectid import ObjectId

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"msg": "username, email and password are required"}), 400

    users_col = mongo.db.users

    # Check if email or username already exists
    if users_col.find_one({"email": email}):
        return jsonify({"msg": "email already registered"}), 400
    if users_col.find_one({"username": username}):
        return jsonify({"msg": "username already taken"}), 400

    # Hash password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user_doc = {
        "username": username,
        "email": email,
        "password": hashed.decode("utf-8"),
        "created_at": mongo.db.command("serverStatus")["localTime"] if hasattr(mongo, "db") else None,
    }

    res = users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)

    return jsonify({"msg": "user created", "user": {"id": user_id, "username": username, "email": email}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"msg": "email and password required"}), 400

    users_col = mongo.db.users
    user = users_col.find_one({"email": email})
    if not user:
        return jsonify({"msg": "invalid credentials"}), 401

    stored_hash = user.get("password", "").encode("utf-8")
    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
        return jsonify({"msg": "invalid credentials"}), 401

    # Create JWT (identity is the user's ObjectId string)
    access_token = create_access_token(identity=str(user["_id"]))

    return (
        jsonify(
            {
                "access_token": access_token,
                "user": {"id": str(user["_id"]), "username": user.get("username"), "email": user.get("email")},
            }
        ),
        200,
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    users_col = mongo.db.users
    user = users_col.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"msg": "user not found"}), 404

    user["id"] = str(user["_id"])
    user.pop("_id", None)
    return jsonify({"user": user}), 200