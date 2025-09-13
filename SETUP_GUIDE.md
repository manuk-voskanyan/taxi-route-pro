# TaxiRoute Pro - Setup Guide

## 🚨 Fix "Internal server error" on Sign Up

The error occurs because Sanity environment variables are not configured. Follow these steps:

### Step 1: Configure Your Sanity Project

1. **Go to your Sanity dashboard**: https://www.sanity.io/manage
2. **Get your Project ID**:
   - You should see your project ID in the URL or project settings
   - It looks like: `abc12def`

3. **Create a Write Token**:
   - Go to your project settings
   - Navigate to "API" tab
   - Click "Add API Token"
   - Name: `taxi-route-pro-write`
   - Permissions: `Editor` (or `Maintainer`)
   - Copy the generated token (you'll only see it once!)

### Step 2: Update Environment Variables

Edit your `.env.local` file in the project root:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Sanity Configuration - REPLACE THESE VALUES
NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-13
SANITY_API_WRITE_TOKEN=your-actual-write-token-here

# Email Configuration (for password reset, etc.)
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_FROM=
```

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Setup

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Try creating a driver account with car images

---

## 🎯 Quick Test Without Images

If you want to test basic functionality first:

1. Create a "Passenger" account (no images required)
2. Then create a "Driver" account (skip image upload for now)

---

## 📋 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- [ ] `NEXT_PUBLIC_SANITY_DATASET` - Usually "production" 
- [ ] `SANITY_API_WRITE_TOKEN` - API token with write permissions
- [ ] `NEXTAUTH_SECRET` - Any random string for production

---

## 🔧 Troubleshooting

### "Missing Sanity environment variables" warning
- Check that your `.env.local` file is in the project root
- Verify the variable names are exactly as shown above
- Restart the dev server after changes

### Still getting internal server error?
- Check the terminal for detailed error messages
- Verify your Sanity project exists and is accessible
- Ensure the write token has correct permissions

### Car images not uploading?
- This is normal if `SANITY_API_WRITE_TOKEN` is missing
- Basic registration will work, but images will be skipped
- Add the token to enable image uploads

---

## 🚀 Next Steps

Once environment variables are configured, you'll be able to:
- ✅ Create driver and passenger accounts
- ✅ Upload car images (drivers)
- ✅ Create trips (drivers) 
- ✅ Browse and search trips (passengers)
- ✅ View car photos in trip listings

Need help? The setup should work immediately after adding the correct Sanity credentials!
