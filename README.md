# My Supabase App

A React Native app built with Expo, TypeScript, and Supabase.

## 🚀 Tech Stack

- **Expo SDK 54** - React Native framework
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service
- **React Native 0.81** - Mobile framework

## 📋 Prerequisites

- Node.js (v18 or later)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

## 🛠️ Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Copy `.env.example` to `.env`
   - Replace the placeholder values with your actual Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

## 📁 Project Structure

```
├── App.tsx              # Main app component
├── index.ts             # Entry point
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── assets/              # Images and icons
├── app.json             # Expo configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android
- `npm run ios` - Start on iOS
- `npm run web` - Start web version

## 📝 Notes

- Make sure to configure your Supabase project URL and anon key in the `.env` file
- The app includes a connection test to verify Supabase setup
- TypeScript strict mode is enabled for better type safety

## 🆘 Troubleshooting

If you encounter issues:
1. Make sure all dependencies are installed (`npm install`)
2. Verify your Supabase credentials are correct
3. Check that your Supabase project is active
4. Clear Expo cache: `expo start --clear`
