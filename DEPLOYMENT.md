# 🚀 Deployment Guide - Ayos Surigao

This guide covers deploying your Ayos Surigao app to Vercel for web access.

## 🌐 Web Deployment (Vercel)

### Prerequisites

- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Your project pushed to GitHub

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**

   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Verify these files exist in your repo:**
   - `vercel.json` ✅
   - `.vercelignore` ✅
   - `package.json` with build scripts ✅

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "New Project"**

3. **Import your GitHub repository:**

   - Select your `ayos-surigao` repository
   - Click "Import"

4. **Configure the project:**

   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables (already configured in vercel.json):**

   - `EXPO_PUBLIC_SUPABASE_URL`: `https://fbnvzwinwapnjicvsvqu.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: `[your_anon_key]`

6. **Click "Deploy"**

### Step 3: Access Your Deployed App

- Vercel will provide a URL like: `https://ayos-surigao-xxx.vercel.app`
- Your app will be live and accessible worldwide!

### 🔐 Admin Panel Access

To test the Admin Panel functionality:

- **Email:** `admin@ayossurigao.com`
- **Password:** `Admin123!`

### 🧪 Testing Your Deployed App

1. **Public Features:**

   - Browse reports without login
   - Create new reports (as guest)
   - View map with report locations
   - Sign up for a new account

2. **Admin Features:**
   - Switch to Admin mode on the main screen
   - Login with the credentials above
   - Access dashboard with statistics
   - Manage reports and assignments
   - View analytics and performance metrics

## 📱 Mobile App Deployment (EAS Build)

For native mobile apps, use Expo's EAS service:

### Prerequisites

- Expo account
- EAS CLI: `npm install -g @expo/eas-cli`

### Build Commands

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all
```

## 🔧 Local Testing

Test your web build locally:

```bash
# Build the web version
npm run build:web

# Preview the build
npm run preview
```

## 📝 Notes

- **Web Limitations:** Some mobile features (camera, GPS) work differently on web
- **Responsive Design:** The app is optimized for mobile but works on desktop
- **Real-time Updates:** Vercel automatically redeploys when you push to GitHub
- **Custom Domain:** You can add a custom domain in Vercel dashboard

## 🆘 Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify `vercel.json` configuration
- Check Vercel build logs for specific errors

### App Not Loading

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure all required files are in the repository

### Mobile Features Not Working

- Some features require native mobile apps
- Use EAS Build for full mobile functionality
- Web version has limited camera/location access
