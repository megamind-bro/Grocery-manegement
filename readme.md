# grocerysync - E-commerce Grocery Application

## Overview

grocerysync is a full-stack e-commerce grocery application built with modern web technologies. The application provides a complete online shopping experience for fresh groceries, featuring product browsing, cart management, checkout process, and administrative dashboard capabilities. It's designed as a single-page application with a React frontend and a Python Flask backend, utilizing SQLite for data persistence with Firebase for authentication and backups, and supporting M-Pesa payment integration for Kenyan customers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture Layers
- **Client Layer**: Browser-based UI (HTML, Tailwind CSS, JavaScript) for staff and managers.
- **Application Layer**: Flask server (Python) handling inventory, billing, purchasing, MIS reports, and loyalty logic.
- **AI Layer**: Retrieval Augmented Generation for chatbot  and forecasting (Statsmodels). ARIMA recommended because of its ability of time series forecasting on limited datasets, suitable for daily trends on small stores sales.
- **Data Layer**: SQLite for product, transaction, and loyalty data; Firebase for authentication and backups.
- **Security**: Firebase Authentication, data encryption, and SQLite audit logging.

### Frontend Architecture
The client-side is built using React with tailwindcss, utilizing a component-based architecture. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. State management is handled through React Context API for cart functionality and React Query (TanStack Query) for server state management and caching. The UI is built with shadcn/ui components, which are based on Radix UI primitives and styled with Tailwind CSS.

The frontend follows a page-based routing structure with dedicated pages for home, cart, checkout, dashboard, and account management. Components are organized into reusable UI components and feature-specific components. The application implements responsive design principles and includes accessibility features through proper ARIA labels and semantic HTML.

### Backend Architecture
The server-side uses Python with Flask in a REST API architecture. The application follows a modular structure with Blueprints for resources (products, categories, orders, analytics), service-layer abstractions, and centralized configuration. Data access is implemented via a repository pattern over SQLAlchemy models to keep business logic decoupled from persistence.

The server includes middleware for request logging, CORS, and error handling. Request/response validation can be handled with Pydantic or Marshmallow. The backend runs with the Flask development server locally and Gunicorn for production WSGI serving.

### Data Storage Architecture
The application uses SQLite as the primary database solution. ORM models map to tables for users, categories, products, orders, and analytics with proper relationships and constraints. Pydantic/Marshmallow schemas mirror the models for typed I/O at the API layer.

Database migrations are managed through Alembic. Firebase is used for authentication and periodic backups of critical data. The storage layer abstracts database operations through a clean interface, making it easy to switch between different storage implementations.

### Authentication and Authorization
Authentication is handled via Firebase Authentication. The backend verifies Firebase ID tokens using the Firebase Admin SDK to authorize protected routes. Optional server-side session features (e.g., rate limiting, CSRF for form posts) can be added. The system distinguishes between regular users and administrative access for dashboard functionality.

### Payment Integration
The application integrates with M-Pesa (Safaricom's mobile payment platform) for processing payments. The backend uses Python (`httpx`/`requests`) for API calls, includes utilities for phone number formatting and STK push request handling, and updates order status based on M-Pesa callbacks.

### UI Component System
The frontend uses a comprehensive design system built on tailwindcss/ui components. This includes form controls, navigation elements, data display components, and feedback mechanisms. The component library is fully typed and follows consistent design patterns with CSS custom properties for theming.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework for building user interfaces
- **Flask**: Python web framework for APIs and server-side logic
- **Python 3.11+**: Backend runtime
- **JavaScript**: Frontend runtime

### Database and ORM
- **SQLAlchemy**: ORM
- **Alembic**: Database migrations
- **SQLite**: Embedded relational database

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI component primitives
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development and Build Tools
- **ESBuild**: Frontend JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **Gunicorn**: Production WSGI server for Flask

### AI and Data Science
- **Statsmodels**: Time series forecasting (ARIMA)
- **RAG stack**: For chatbot retrieval augmentation (e.g., embeddings + vector store)

### Auth and Cloud
- **firebase-admin**: Firebase Admin SDK for token verification and backups

### Routing and Navigation
- **Wouter**: Lightweight client-side routing library

### Payment Processing
- **Axios** (frontend): HTTP client for API calls
- **httpx** or **requests** (backend): HTTP client for M-Pesa integration
- **M-Pesa API**: Mobile payment processing for Kenyan market

### Utilities and Helpers
- **clsx**: Conditional class name utility
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (3.11 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Grocerysyc
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=5000
DATABASE_URL=sqlite:///./grocerysync.db

# Firebase Configuration (Optional)
FIREBASE_CREDENTIALS_JSON=/path/to/your/firebase-service-account.json

# M-Pesa Configuration (Optional - for payment processing)
MPESA_BASE=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
BASE_URL=http://localhost:5000
```

### 4. Run the Application

#### Development Mode (Recommended)
```bash
# This will start both frontend and backend concurrently
npm run dev
```

#### Manual Setup (Alternative)
```bash
# Terminal 1 - Start Flask Backend
npm run dev:server

# Terminal 2 - Start React Frontend
npm run dev:client
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## Production Deployment

### Build for Production

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure the following environment variables are set:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:///./grocerysync.db
FIREBASE_CREDENTIALS_JSON=/path/to/firebase-service-account.json
MPESA_BASE=https://api.safaricom.co.ke  # Production M-Pesa endpoint
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
BASE_URL=https://yourdomain.com
```

## API Endpoints

The Flask backend provides the following REST API endpoints:

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/categories` - List all categories

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (requires Firebase auth)

### Analytics
- `GET /api/analytics` - Get sales analytics

### M-Pesa Integration
- `POST /api/mpesa/callback` - M-Pesa payment callback

## Database Setup

The application uses SQLite by default. The database will be automatically created on first run.

### Manual Database Operations

```bash
# Access the database
sqlite3 grocerysync.db

# View tables
.tables

# View schema
.schema
```

## Firebase Setup (Optional)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication
3. Download service account key JSON file
4. Set `FIREBASE_CREDENTIALS_JSON` environment variable

## M-Pesa Setup (Optional)

1. Register for M-Pesa API at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Get your consumer key, consumer secret, and passkey
3. Update environment variables with your credentials

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev
```

#### Python Dependencies Issues
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r server/requirements.txt
```

#### Node Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Logs and Debugging

- **Backend logs**: Check terminal running Flask server
- **Frontend logs**: Check browser console
- **Database logs**: SQLite logs are in the database file

## Development

### Project Structure

```
GroceryGenius/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Flask backend
│   ├── app.py            # Main Flask application
│   ├── db.py             # Database models
│   ├── auth.py           # Authentication
│   ├── mpesa.py          # M-Pesa integration
│   └── routes_*.py       # API route blueprints
├── shared/                # Shared schemas
└── package.json          # Node.js dependencies
```

### Adding New Features

1. **Backend**: Add new routes in `server/routes_*.py`
2. **Frontend**: Add new components in `client/src/components/`
3. **Database**: Update models in `server/db.py`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.