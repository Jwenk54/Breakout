# Authentication Setup Guide

## Overview
Your Breakout Tracker now includes user authentication with Supabase! Users can create accounts, log in securely, and optionally try the app as a guest with temporary access.

## Features Added
- ✅ Email/password authentication
- ✅ User account creation (sign up)
- ✅ Secure login
- ✅ Guest mode for temporary access
- ✅ Persistent session (stays logged in)
- ✅ Logout functionality

## Supabase Setup Instructions

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or sign in if you already have an account
3. Create a new account or log in with GitHub/Google

### Step 2: Create a New Project
1. Click "New project" in your Supabase dashboard
2. Enter a project name (e.g., "breakout-tracker")
3. Enter a secure database password
4. Choose a region closest to you
5. Click "Create new project" and wait for it to initialize

### Step 3: Get Your API Keys
1. Go to **Settings → API** in your Supabase project
2. Under "Project API keys", copy:
   - **Project URL** (also called Supabase URL)
   - **anon public** key (this is your ANON_KEY)

### Step 4: Set Up Environment Variables
1. In your project root, create a `.env` file (or edit your existing one)
2. Add these variables:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   **Example:**
   ```
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Enable Email Authentication
1. In your Supabase project, go to **Authentication → Providers**
2. Find "Email" and make sure it's enabled (it should be by default)
3. Click on "Email" to view settings
4. The following options are recommended:
   - ✅ Enable email confirmations (optional but recommended)
   - ✅ Confirm email (if you want emails to be verified)

### Step 6: Restart Your Dev Server
```bash
npm run dev
```

## How It Works

### User Authentication Flow
1. **New Users**: Click "Sign Up" to create an account with email and password
2. **Existing Users**: Click "Log In" with email and password
3. **Guest Users**: Click "Try as Guest" to use the app without creating an account
   - Guest data is NOT saved to the database
   - Data disappears when you refresh the page or log out

### Database Access
- **Authenticated users**: Can save and load their watchlist from the database
- **Guest users**: Can use the app but data is only stored in memory
- All database operations are protected by Supabase Row Level Security

## Troubleshooting

### "Can't connect to Supabase"
- Check that your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure you restarted the dev server after adding environment variables
- Verify your project is active in Supabase dashboard

### "Email already exists"
- This means an account with that email is already registered
- Click "Log In" instead to access your existing account
- If you forgot your password, use the password reset feature (coming soon)

### "Authentication failed"
- Check that your email and password are correct
- Make sure email contains an "@" symbol
- Password must be at least 6 characters
- Check browser console for detailed error messages

### Guest mode not working
- Guest mode doesn't require any setup
- Just click "Try as Guest"
- Your data is stored locally and won't persist after refresh

## Security Notes
- Never commit your `.env` file to git (add it to `.gitignore`)
- Your API keys are public keys (anon), not secret keys - this is safe
- Supabase handles all password encryption and security automatically
- User sessions are secure and cryptographically signed

## Next Steps
1. Test user registration by creating a test account
2. Log in with your test account
3. Add some stocks to your watchlist
4. Verify that your data is saved when you log out and back in
5. Try guest mode to see the difference (data won't be saved)

## Example User Flow
1. Visit the app
2. See the login page
3. Click "Sign Up"
4. Enter email: `test@example.com`
5. Enter password: `securepassword123`
6. Account is created and you're logged in
7. Add some stocks to track
8. Refresh the page - your watchlist is still there! (from Supabase)
9. Log out and back in with the same email - your data is there!

## Additional Resources
- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
