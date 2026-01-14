# 🔥 GigFlow - Modern Freelance Marketplace

A production-ready, full-stack freelance marketplace built with React.js, Node.js, Express.js, and MongoDB. Features real-time notifications, secure authentication, and a modern UI inspired by Internshala and Upwork.

## 🌟 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT and HttpOnly cookies
- **Gig Management**: Create, edit, and browse freelance gigs with search functionality
- **Bidding System**: Freelancers can submit bids on open gigs
- **Hiring Logic**: Gig owners can hire freelancers with MongoDB transactions
- **Real-time Notifications**: Socket.io-powered instant notifications for hiring events
- **Responsive Design**: Mobile-first design that works on all devices

### Technical Features
- **Secure Authentication**: Password hashing with bcrypt, JWT tokens in HttpOnly cookies
- **Database Transactions**: MongoDB sessions ensure data consistency during hiring
- **Real-time Communication**: WebSocket connections for instant notifications
- **Production Ready**: CORS configured, environment variables, error handling

## 🛠 Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router DOM** for routing
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time features
- **MongoDB Transactions** for data consistency

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gigflow
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env

   # Update .env with your MongoDB connection string
   # MONGODB_URI=mongodb+srv://your-connection-string

   # Start development server
   npm run dev
   ```
   Backend will run on: http://localhost:5000

3. **Frontend Setup**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env

   # Start development server
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-super-secure-jwt-secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Gigs
- `GET /api/gigs` - Get all gigs (with search & pagination)
- `GET /api/gigs/:id` - Get single gig
- `POST /api/gigs` - Create new gig
- `PUT /api/gigs/:id` - Update gig
- `DELETE /api/gigs/:id` - Delete gig
- `GET /api/gigs/user/me` - Get user's gigs

### Bids
- `GET /api/bids/:gigId` - Get bids for a gig
- `POST /api/bids` - Create new bid
- `PATCH /api/bids/:bidId/hire` - Hire freelancer
- `GET /api/bids/user/me` - Get user's bids

## 📊 Database Schema

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Gig
```javascript
{
  title: String (required),
  description: String (required),
  budget: Number (required),
  ownerId: ObjectId (ref: User),
  status: String (enum: ['open', 'assigned']),
  createdAt: Date,
  updatedAt: Date
}
```

### Bid
```javascript
{
  gigId: ObjectId (ref: Gig),
  freelancerId: ObjectId (ref: User),
  message: String (required),
  price: Number (required),
  status: String (enum: ['pending', 'hired', 'rejected']),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

**Live Backend URL:** https://gigflow-backend.onrender.com

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy!

**Live Frontend URL:** https://gigflow.vercel.app

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: HttpOnly cookies prevent XSS attacks
- **Input Validation**: Express-validator for all inputs
- **CORS Configuration**: Properly configured for production
- **Rate Limiting**: Basic protection against abuse
- **SQL Injection Protection**: MongoDB/Mongoose built-in protection

## 🎨 UI/UX Design

- **Modern Design**: Clean, professional interface
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized loading and smooth animations
- **User Experience**: Intuitive navigation and clear CTAs

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 📝 Development Guidelines

### Code Style
- Use ESLint and Prettier for consistent code formatting
- Follow React and Node.js best practices
- Use meaningful variable and function names
- Add comments for complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Messages
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for improvements
- `Remove:` for deletions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Internshala and Upwork
- Icons from Heroicons
- UI components built with Tailwind CSS
- Real-time features powered by Socket.io

## 📞 Support

For support, email support@gigflow.com or join our Discord community.

---

**Made with ❤️ by the GigFlow team**