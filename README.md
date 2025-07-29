# Fish Pond Monitoring System

A full-stack web application for monitoring fish pond water quality parameters. Built with React frontend, Express backend, and PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Neon database)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

3. Set up the database:
   ```bash
   npm run db:push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and go to `http://localhost:5000`

## 🔧 Recent Changes

### TypeScript to JavaScript Conversion
The project has been converted from TypeScript to JavaScript:

- **Server**: All `.ts` files converted to `.js` with ES modules
- **Client**: All `.tsx` files converted to `.jsx`
- **Configuration**: Updated Vite config and package.json for JavaScript
- **Dependencies**: Removed TypeScript-related dependencies

### Key Changes Made:
- ✅ Converted `server/index.ts` → `server/index.js`
- ✅ Converted `server/vite.ts` → `server/vite.js`
- ✅ Converted `server/routes.ts` → `server/routes.js`
- ✅ Converted `server/storage.ts` → `server/storage.js`
- ✅ Converted `client/src/main.tsx` → `client/src/main.jsx`
- ✅ Converted `client/src/App.tsx` → `client/src/App.jsx`
- ✅ Converted all utility files and hooks
- ✅ Updated all imports to use `.js` extensions
- ✅ Removed TypeScript configuration files
- ✅ Updated package.json scripts and dependencies

## 🏗️ Project Structure

```
ish_pond_auto_test/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and services
│   │   └── main.jsx       # Entry point
│   └── index.html
├── server/                # Express backend
│   ├── index.js          # Server entry point
│   ├── routes.js         # API routes
│   ├── storage.js        # Database operations
│   └── vite.js           # Vite integration
├── shared/               # Shared code
│   └── schema.js         # Database schema
└── package.json
```

## 🌟 Features

- **User Authentication**: Secure login/signup system
- **Real-time Monitoring**: Live sensor data display
- **Custom Alerts**: Set thresholds for each sensor parameter
- **Historical Data**: View trends and past readings
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes

## 🔌 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/sensor-data` - Get sensor readings
- `POST /api/sensor-data` - Create sensor reading
- `GET /api/thresholds` - Get user thresholds
- `POST /api/thresholds` - Create threshold
- `GET /api/alerts` - Get alerts

## 🎯 Next Steps

1. Set up your PostgreSQL database
2. Configure the `DATABASE_URL` environment variable
3. Run `npm run db:push` to create the database schema
4. Start the development server with `npm run dev`

The application is now fully converted to JavaScript and ready to run! 🎉 