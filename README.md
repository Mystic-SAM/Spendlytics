# 💰 Spendlytics

A full-stack, modern Expense Tracker application designed to help you manage your finances smoothly. Track your income, expenses, and investments with an intuitive interface, detailed charts, and smart capabilities. 🚀

## ✨ Features

- 📊 **Dashboard & Analytics**: Visualize your financial data with responsive charts for Income, Expenses, and Investments.
- 💳 **Transaction Management**: Easily add, edit, and delete transactions. Includes support for parsing and importing CSV data.
- 🔒 **Authentication**: Secure login, registration, and logout flows with JWT and HttpOnly cookies for refresh tokens.
- 🌓 **Dark Mode Support**: Seamless toggle between light, dark, and system themes.
- 📱 **Responsive Layout**: Designed to work gracefully on both desktop and mobile devices.
- 🗂️ **Summary Cards**: At-a-glance view of your financial status, including savings and investments.
- ⚙️ **Account Settings**: Update user preferences directly from the app interface.

## 🛠️ Technologies Used

### 🖥️ Frontend
- **React 19 & Vite** ⚡: Fast and modern UI development.
- **Tailwind CSS v4 & Shadcn UI** 🎨: Beautiful, accessible, and customizable component styling.
- **Redux Toolkit** 📦: Efficient state management and persistence (`redux-persist`).
- **React Router v7** 🛣️: Declarative routing for single-page applications.
- **Recharts** 📈: Composable charting library for React.
- **TanStack React Table** 🗄️: Headless UI for building powerful data grids.
- **React Hook Form & Zod** ✅: Schema-based form validation.

### ⚙️ Backend
- **Node.js & Express** 🚊: High-performance backend routing and logic.
- **Mongoose / MongoDB (via Typescript)** 🍃: Robust NoSQL database schema creation and querying.
- **JSON Web Tokens (JWT) & bcrypt** 🔑: Secure authentication and password hashing.
- **Google GenAI** 🧠: Integrated for intelligent data analysis and smart categorization.
- **Node Cron** ⏰: For scheduling automated backend tasks.

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18 or higher recommended) 🟢
- MongoDB instance (local or MongoDB Atlas) 🗃️

### 💻 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mystic-SAM/Spendlytics.git
   cd "Spendlytics"
   ```

2. **Setup the Backend:** ⚙️
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=your_jwt_expires_in
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_REFRESH_EXPIRES_IN=your_refresh_token_expires_in
   GEMINI_API_KEY=your_google_genai_api_key
   CRON_SECRET=your_cron_secret
   ```
   *Note: Add any other necessary environment variables your backend requires.*

3. **Setup the Frontend:** 🖥️
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### 🏃‍♂️ Running the Application

**Run Backend (Development)** ⚙️
```bash
cd backend
npm run dev
```
The backend will typically start on `http://localhost:5000`.

**Run Frontend (Development)** 🖥️
```bash
cd client
npm run dev
```
The frontend will open in your default browser at `http://localhost:5173`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
