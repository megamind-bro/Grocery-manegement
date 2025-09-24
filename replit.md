# FreshMart - E-commerce Grocery Application

## Overview

FreshMart is a full-stack e-commerce grocery application built with modern web technologies. The application provides a complete online shopping experience for fresh groceries, featuring product browsing, cart management, checkout process, and administrative dashboard capabilities. It's designed as a single-page application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and supporting M-Pesa payment integration for Kenyan customers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript, utilizing a component-based architecture. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. State management is handled through React Context API for cart functionality and React Query (TanStack Query) for server state management and caching. The UI is built with shadcn/ui components, which are based on Radix UI primitives and styled with Tailwind CSS.

The frontend follows a page-based routing structure with dedicated pages for home, cart, checkout, dashboard, and account management. Components are organized into reusable UI components and feature-specific components. The application implements responsive design principles and includes accessibility features through proper ARIA labels and semantic HTML.

### Backend Architecture
The server-side uses Express.js with TypeScript in a REST API architecture. The application follows a modular structure with separate files for routing, storage abstraction, and server configuration. The storage layer implements an interface-based design allowing for both in-memory storage (for development) and database storage through the same API.

The server implements middleware for request logging, JSON parsing, and error handling. Routes are organized by resource type (products, categories, orders, analytics) with clear separation of concerns. The application uses Vite for development server setup and hot module replacement.

### Data Storage Architecture
The application uses Drizzle ORM with PostgreSQL as the primary database solution. Database schemas are defined using Drizzle's type-safe schema definition, providing strong typing throughout the application. The schema includes tables for users, categories, products, orders, and analytics with proper relationships and constraints.

Database migrations are managed through Drizzle Kit, and the application supports connection to Neon Database (a serverless PostgreSQL service). The storage layer abstracts database operations through a clean interface, making it easy to switch between different storage implementations.

### Authentication and Authorization
The application includes a basic user authentication system with username/password login. Session management is implemented using PostgreSQL session storage through connect-pg-simple. The system distinguishes between regular users and administrative access for dashboard functionality.

### Payment Integration
The application integrates with M-Pesa (Safaricom's mobile payment platform) for processing payments in Kenya. The system includes utilities for phone number formatting and STK push request handling. Payment status tracking is implemented with order status updates based on M-Pesa callbacks.

### UI Component System
The frontend uses a comprehensive design system built on shadcn/ui components. This includes form controls, navigation elements, data display components, and feedback mechanisms. The component library is fully typed and follows consistent design patterns with CSS custom properties for theming.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework for building user interfaces
- **Express.js**: Backend web application framework
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Build tool and development server

### Database and ORM
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **connect-pg-simple**: PostgreSQL session store for Express

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
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **TSX**: TypeScript execution for development

### Routing and Navigation
- **Wouter**: Lightweight client-side routing library

### Payment Processing
- **Axios**: HTTP client for M-Pesa API integration
- **M-Pesa API**: Mobile payment processing for Kenyan market

### Utilities and Helpers
- **clsx**: Conditional class name utility
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation