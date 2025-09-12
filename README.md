# E-Commerce Application

Full-stack e-commerce app with JWT authentication, product filtering, and persistent shopping cart.

## ✅ Requirements Met

**Backend:**
- JWT Authentication (signup/login)
- Items CRUD with filters (price, category, search)
- Cart APIs (add/update/remove/persist)

**Frontend:**
- Signup & Login pages
- Product listing with filters & search
- Shopping cart with persistence after logout

## � Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://akshad:1234567$@cluster0.au9cfhm.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET_KEY=supersecretkey123
```

```bash
python app.py
```
Backend runs on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

## 🧪 Testing Guide

1. **Authentication**: Visit `/signup` → create account → login
2. **Products**: Visit `/items` → test search, filters, sorting
3. **Cart**: Add items as guest → login → verify cart merge → test cart page
4. **Persistence**: Logout → verify cart items remain

### API Testing
```bash
# Signup
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get items with filters
curl "http://localhost:5000/items?category=Electronics&minPrice=100&navbarSearch=laptop"
```

## 🛠️ Tech Stack

- **Backend**: Flask, MongoDB Atlas, JWT
- **Frontend**: Next.js, TypeScript, Tailwind CSS, React Query

## 📁 Key Files

```
backend/
├── app.py              # Main Flask app
├── routes/auth.py      # Authentication
├── routes/items.py     # Product CRUD + filters
└── routes/cart.py      # Cart management

frontend/
├── app/login/          # Login page
├── app/signup/         # Signup page
├── app/items/          # Product listing
├── app/cart/           # Shopping cart
└── components/         # Reusable components
```

## � API Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /items` - Get items with filters (`?category=X&minPrice=Y&maxPrice=Z&navbarSearch=text`)
- `POST /cart/add` - Add to cart
- `GET /cart` - Get user cart
- `POST /cart/update` - Update quantity
- `POST /cart/remove` - Remove item
- `POST /cart/merge` - Merge guest cart

**Database**: Pre-configured MongoDB Atlas - no setup required!

---

**Ready to test**: Just follow the Quick Start guide above. All credentials are provided.
