# 🏛️ Ayos Surigao

A community reporting mobile application for Surigao City residents to report issues and connect with local government operations center.

## 📱 Features

- **Community Reporting** - Report infrastructure, safety, and environmental issues
- **Real-time Dashboard** - View community statistics and recent reports
- **Map Integration** - Visualize reports geographically across 40 barangays
- **Dual Access Modes** - Public app for residents, Admin panel for operations staff
- **Anonymous Reporting** - Submit reports without revealing identity
- **Image Attachments** - Upload photos as evidence
- **Status Tracking** - Monitor report progress from submission to resolution

## 🚀 Tech Stack

- **React Native 0.81** with **Expo SDK 54**
- **TypeScript** for type safety
- **Supabase** - Backend, database, authentication, and file storage
- **React Native Maps** - Geographic visualization
- **Expo Location** - GPS and location services

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd my-supabase-app
npm install
```

### 2. Configure Environment

1. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

2. **The app is pre-configured with working Supabase credentials:**

   ```env
   # Supabase Configuration
   # These are my actual credentials to directly use my supabase project

   EXPO_PUBLIC_SUPABASE_URL=https://fbnvzwinwapnjicvsvqu.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnZ6d2lud2FwbmppY3ZzdnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzkwNzAsImV4cCI6MjA3NDUxNTA3MH0.HZIz3kFH4KJNbzHgCAbwDe4L6Pt-xuCh6NNA-R_UOPQ
   ```

   _Note: These credentials are safe to share publicly as they only allow read access to public data and are protected by Row Level Security policies._

### 3. Run the Application

```bash
npm start
```

### 4. Test on Device

1. **Install Expo Go** on your mobile device:

   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. **Connect to the app:**

   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

## 📁 Project Structure

```
├── App.tsx                    # Main app with mode selection
├── contexts/                  # React contexts for state management
│   ├── AuthContext.tsx       # User authentication
│   ├── AdminAuthContext.tsx  # Admin authentication
│   └── AppModeContext.tsx    # Mode switching
├── screens/                   # Application screens
│   ├── auth/                 # Login and signup
│   ├── main/                 # Home and guest screens
│   ├── reports/              # Report creation and listing
│   ├── map/                  # Map visualization
│   ├── profile/              # User profiles
│   └── admin/                # Admin panel screens
├── components/                # Reusable UI components
├── lib/                      # Service layer and utilities
│   ├── supabase.ts          # Supabase client
│   ├── operations-service.ts # Business logic
│   └── admin-service.ts     # Admin operations
├── database/                 # SQL schemas and migrations
├── types/                    # TypeScript type definitions
└── navigation/               # Navigation components
```

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run web version

## 👥 User Roles

### Public Users

- **Residents** - Registered users who can create and track reports
- **Guests** - Anonymous users with limited access

### Admin Users

- **Operations Manager** - Overall coordination and management
- **Field Coordinator** - Geographic coverage and field operations
- **Data Analyst** - Reports and analytics
- **Super Admin** - Full system access

### 🔐 Admin Panel Access

To access the Admin Panel, use these credentials:

- **Email:** `admin@ayossurigao.com`
- **Password:** `Admin123!`

## 🗺️ Geographic Coverage

The app covers **40 barangays** in Surigao City:

- 30 Urban barangays
- 10 Rural barangays
- GPS boundary validation
- Location-based reporting

## 📊 Report Categories

- 🛣️ Roads & Infrastructure
- ⚡ Power & Utilities
- 💧 Water & Sanitation
- 🗑️ Waste Management
- 🚨 Public Safety
- 💡 Street Lighting
- 🌊 Drainage & Flooding
- 🏛️ Public Facilities
- 🌱 Environmental Issues

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control
- Anonymous reporting with contact verification
- Data encryption in transit and at rest

## 🆘 Troubleshooting

### Common Issues

1. **Metro bundler issues:**

   ```bash
   npx expo start --clear
   ```

2. **App connection errors:**

   - Verify your `.env` file exists and has the correct credentials
   - Check your internet connection
   - Restart the Expo development server

3. **Image upload issues:**

   - Check your internet connection
   - Ensure you have granted camera/photo library permissions
   - Try uploading a smaller image file

4. **Location services not working:**

   - Grant location permissions in device settings
   - Ensure GPS is enabled

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)
- Open an issue in this repository

## 📝 License

This project is licensed under the MIT License.

## 🚀 Deployment

### Web Version (Vercel)

The app is also available as a web deployment via Vercel.
👉 [Ayos Surigao Web App](https://ayos-surigao-app.vercel.app/)

⚠️ **Note:** For the best experience, it is recommended to run the app on **Expo Go (mobile)**.
The web version currently lacks certain features (e.g., map functionality) and the UI is not fully optimized for web display.

### Mobile App (APK)

You can download the APK build of the app using the link below.
_(Please note that this version has only been tested on the **POCO X6 Pro 5G (Android)**, and functionality may vary on other devices.)_

⚠️ **Known Issue:** When accessing the **Map Feature** page, the app may close unexpectedly.
This is a temporary bug and will be fixed in a future update.

```bash
https://expo.dev/accounts/kite.bish10/projects/ayos-surigao/builds/932c2d40-93be-4799-9e05-5f7a0c5b51ec
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for Surigao City**
