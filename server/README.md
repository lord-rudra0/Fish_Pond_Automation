# AquaWatch Server

Backend API server for the AquaWatch Pond Monitoring System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Supabase)
- OpenWeather API key

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   # Database Configuration
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # JWT Secret
   JWT_SECRET=your-secret-key-here
   
   # OpenWeather API
   OPENWEATHER_API_KEY=your-openweather-api-key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. The server will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
server/
├── index.js          # Server entry point
├── routes.js         # API routes
├── storage.js        # Database operations
├── package.json
├── vercel.json
└── README.md
```

## 🌟 Features

- **RESTful API**: Complete CRUD operations for sensor data
- **User Authentication**: JWT-based authentication system
- **Database Integration**: PostgreSQL with Supabase
- **Weather API**: OpenWeather integration
- **Real-time Data**: Sensor readings and alerts
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Comprehensive error management

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production (no-op for Node.js)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Sensor Data
- `GET /api/sensor-data` - Get sensor readings
- `POST /api/sensor-data` - Create sensor reading
- `POST /api/sensor-data/dummy` - Add test data

### Thresholds
- `GET /api/thresholds` - Get user thresholds
- `POST /api/thresholds` - Create threshold
- `PUT /api/thresholds/:id` - Update threshold
- `DELETE /api/thresholds/:id` - Delete threshold

### Alerts
- `GET /api/alerts` - Get alerts
- `GET /api/alerts/unacknowledged` - Get unacknowledged alerts
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert

### Weather
- `GET /api/weather` - Get current weather

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password

## 🚀 Deployment on Vercel

### Automatic Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `OPENWEATHER_API_KEY`: Your OpenWeather API key

### Manual Deployment
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🗄️ Database Schema

The server expects the following tables:
- `users` - User accounts
- `sensor_readings` - Sensor data
- `thresholds` - Alert thresholds
- `alerts` - System alerts

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Request data validation
- **Error Handling**: Secure error responses

## 📊 API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🔗 Related Repositories

- **Client**: [aquawatch-client](https://github.com/your-username/aquawatch-client)
- **Database**: Supabase PostgreSQL

## 📄 License

MIT License - see LICENSE file for details 