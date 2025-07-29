# Fish Pond Monitoring System

## Overview

This is a full-stack web application for monitoring fish pond water quality parameters. The system allows users to track sensor readings (pH, water level, temperature, NH3, turbidity), set custom thresholds for each parameter, and receive alerts when values exceed safe ranges. Built with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React SPA with TypeScript, using Vite for build tooling
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Authentication**: JWT-based authentication with bcrypt for password hashing

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users**: Basic user authentication with email/password
- **Sensor Data**: Stores readings for 5 parameters (pH, waterLevel, temperature, nh3, turbidity)
- **Thresholds**: User-configurable min/max values for each sensor type with alert toggles
- **Alerts**: Generated when sensor readings exceed thresholds, with severity levels

### Authentication System
- JWT token-based authentication
- Session management with localStorage
- Password hashing using bcrypt
- Protected routes with middleware

### API Structure (`server/routes.ts`)
- RESTful endpoints for CRUD operations
- Authentication endpoints (`/api/auth/login`, `/api/auth/register`)
- Sensor data endpoints for readings and historical data
- Threshold management for user preferences
- Alert system with automatic threshold checking

### Frontend Architecture
- Component-based React architecture with TypeScript
- Routing handled by Wouter (lightweight React router)
- Form handling with React Hook Form
- UI components from Shadcn/ui design system
- Responsive design with Tailwind CSS

## Data Flow

1. **Sensor Data Ingestion**: API endpoints receive sensor readings and store them in the database
2. **Threshold Monitoring**: Automatic checking of readings against user-defined thresholds
3. **Alert Generation**: System creates alerts when readings exceed safe ranges
4. **Real-time Updates**: Frontend polls for new data and alerts using React Query
5. **User Management**: Authentication flow manages user sessions and data access

## External Dependencies

### Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web framework for REST API
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing for security

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing for React
- **react-hook-form**: Form state management

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety across the application
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development Environment
- Uses Vite dev server for frontend with HMR
- Express server runs with tsx for TypeScript execution
- Database connection via environment variable `DATABASE_URL`
- Replit-specific plugins for development experience

### Production Build
- Frontend builds to `dist/public` directory
- Backend bundles with esbuild to `dist/index.js`
- Static file serving handled by Express in production
- Environment-based configuration for database and JWT secrets

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definition in `shared/schema.ts` for type sharing
- PostgreSQL dialect with connection pooling via Neon

The application is designed for easy deployment on platforms like Replit, with automatic database provisioning and environment variable configuration.