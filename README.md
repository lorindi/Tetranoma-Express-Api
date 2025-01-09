# Tetranoma Express API

## 🚀 Description
A REST API for a collectible figures e-commerce platform, built with Express.js and MongoDB. The API provides comprehensive functionality for user management, product handling, order processing, and administrative controls.

This project serves as a robust backend solution for an online store specializing in collectible figures, featuring advanced search capabilities, rating systems, and detailed analytics for business intelligence.

## 🛠️ Technologies
- **Node.js** & **Express.js** - for server-side implementation
- **MongoDB** with **Mongoose** - for database management
- **JWT** (JSON Web Tokens) - for authentication
- **Bcrypt** - for password hashing
- **Cookie Parser** - for cookie management
- **CORS** - for cross-origin requests
- **Dotenv** - for environment variable management

## 📦 Core Features

### 👤 Authentication & Authorization
- User registration with email verification
- Secure login system
- JWT-based authentication
- Role-based access control (user/admin)
- Password recovery system

### 🏪 Product Management
- Complete CRUD operations for figures
- Advanced filtering and sorting options
- Rating and review system
- Favorites functionality
- Stock management
- Image handling

### 🛒 Shopping Cart
- Add/remove products
- Quantity management
- Checkout process
- Multiple payment methods support
- Order tracking

### 📊 Admin Dashboard
- Comprehensive user management
- Order processing and tracking
- Analytics and reporting
- Product inventory management
- Sales statistics
- Customer insights

### 📈 Additional Features
- Real-time stock updates
- Advanced search functionality
- Order history tracking
- User activity monitoring
- Performance analytics
- Security features
- API rate limiting
- Error logging and monitoring

## 🚀 Getting Started

1. Clone the repository:
   git clone https://github.com/your-repo/tetranoma-express-api.git
2. Install dependencies:
   npm install
3. Set up environment variables:
   cp .env.example .env
   Fill in the necessary values
4. Set up MongoDB:
- Install MongoDB locally or use MongoDB Atlas
- Update connection string in .env file

5. Start the server:
   npm start


## 📝 API Documentation

### Authentication Endpoints
- POST /api/auth/create-account - Register new user
- POST /api/auth/sign-in - User login
- POST /api/auth/logout - User logout

### Product Endpoints
- GET /api/figures/list - List all figures
- POST /api/figures/create - Create new figure
- PUT /api/figures/update/:id - Update figure
- DELETE /api/figures/delete/:id - Delete figure

### Cart Endpoints
- POST /api/cart/add - Add to cart
- GET /api/cart - Get cart contents
- DELETE /api/cart/remove/:itemId - Remove from cart
- POST /api/cart/checkout - Process checkout

### Admin Endpoints
- GET /api/admin/users-with-activity - Get user activity
- PUT /api/admin/users/role - Update user roles
- GET /api/admin/orders - Manage orders
- GET /api/admin/dashboard-stats - View statistics

## 🔒 Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Request rate limiting
- Input validation
- XSS protection
- CORS configuration

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License.
