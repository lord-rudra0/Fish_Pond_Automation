# AquaWatch Client

Frontend React application for the AquaWatch Pond Monitoring System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=https://your-server-url.vercel.app
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/     # UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and services
│   └── main.jsx       # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🌟 Features

- **User Authentication**: Secure login/signup system
- **Real-time Monitoring**: Live sensor data display
- **Custom Alerts**: Set thresholds for each sensor parameter
- **Historical Data**: View trends and past readings
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Weather Integration**: OpenWeather API integration

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment on Vercel

### Automatic Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your server URL
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Vercel

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 UI Components

Built with:
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icons
- **Recharts** - Charts and graphs

## 🔗 Related Repositories

- **Server**: [aquawatch-server](https://github.com/your-username/aqunot showing properly in dark theme 
⚠️
Error Loading Data

Unexpected token 'A', "API Server Running" is not valid JSON



filter button and previous 1 2 3 and next button is not showing properly in dark theme 
⚠️
Error Loading Data

Unexpected token 'A', "API Server Running" is not valid JSON