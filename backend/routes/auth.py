from flask import Blueprint, request, jsonify
from extensions import mongo
from flask_jwt_extended import create_access_token
import bcrypt

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def get_users_col():
    return mongo.db.users

# -------- SIGNUP --------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    users_col = get_users_col()
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username", "")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"msg": "Email already exists"}), 400

    from datetime import datetime
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_doc = {
        "email": email,
        "password": hashed_pw,
        "username": username,
        "created_at": datetime.utcnow()
    }
    user_id = str(users_col.insert_one(user_doc).inserted_id)
    return jsonify({"msg": "user created", "user": {"id": user_id, "email": email, "username": username, "created_at": user_doc["created_at"].isoformat()}}), 201

# -------- LOGIN --------
@auth_bp.route("/login", methods=["POST"])
def login():
    users_col = get_users_col()
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    user = users_col.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"msg": "Invalid credentials"}), 401

    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token, "user": {"id": user_id, "email": user["email"], "username": user.get("username", "")}})