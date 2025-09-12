# E-Commerce Web App

A simple single-page e-commerce application built with:
	•	Backend: Flask + MongoDB (Render)
	•	Frontend: Next.js + TypeScript + TailwindCSS (Vercel)
	•	Database: MongoDB Atlas
	•	Auth: JWT Authentication

⸻

✨ Features
	•	User authentication (signup, login) with JWT
	•	Item listing with filters (category, price)
	•	Add to Cart / Remove from Cart
	•	Persistent Cart (saved in DB, available after logout/login)
	•	Protected Cart Route (only logged-in users can access)
	•	Responsive UI with TailwindCSS

⸻

⚙️ Backend Setup (Flask + MongoDB)

1. Clone repo & move to backend

git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

2. Environment Variables (backend)

Your current working config (.env):

MONGO_URI=mongodb+srv://akshad:1234567$@cluster0.au9cfhm.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET_KEY=supersecretkey123
BACKEND_URL=https://astrape-ecommerce-y090.onrender.com

3. Install dependencies

pip install -r requirements.txt

4. Run locally

python app.py

5. Deploy (Render)
	•	Root Directory: backend/
	•	Build Command: pip install -r requirements.txt
	•	Start Command: gunicorn app:app
	•	Add same env vars in Render Dashboard

⸻

🎨 Frontend Setup (Next.js + TailwindCSS)

1. Move to frontend

cd ../frontend

2. Environment Variables (frontend) 

Your current working config (.env.local):

NEXT_PUBLIC_API_URL=https://astrape-ecommerce-y090.onrender.com

3. Install dependencies

npm install

4. Run locally

npm run dev

App runs at → http://localhost:3000

5. Deploy (Vercel)
	•	Root Directory: frontend/
	•	Add env var NEXT_PUBLIC_API_URL pointing to your Render backend URL

⸻

🔑 Auth Flow
	1.	Signup → user registers with email/password/username
	2.	Login → user receives JWT token
	3.	Protected Routes → /cart requires token, /items is public
	4.	Cart Persistence → cart saved per user in MongoDB

⸻

🧪 API Testing

Use Postman or curl:

Signup:
curl -X POST https://astrape-ecommerce-y090.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'

Login:
curl -X POST https://astrape-ecommerce-y090.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'

Use returned token in requests:
Authorization: Bearer <your_token>

⸻

Tech Stack 
	•	Frontend: Next.js 14, TypeScript, TailwindCSS
	•	Backend: Flask, Flask-JWT-Extended, Flask-PyMongo
	•	Database: MongoDB Atlas
	•	Deployment: Render (backend), Vercel (frontend)

⸻

👨‍💻 Author
Built by Akshad Gawde for internship assignment.
