# Book Club Website - Complete Setup Guide

Welcome! This guide will walk you through setting up your complete book club website with Google Sheets backend and GitHub Pages hosting.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Google Sheets & Apps Script Setup](#part-1-google-sheets--apps-script-setup)
3. [Part 2: Google Calendar Setup](#part-2-google-calendar-setup)
4. [Part 3: Google OAuth Setup](#part-3-google-oauth-setup)
5. [Part 4: GitHub Pages Deployment](#part-4-github-pages-deployment)
6. [Part 5: First Admin Setup](#part-5-first-admin-setup)
7. [Usage Guide](#usage-guide)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- A Google account
- A GitHub account (you already have this!)
- Basic familiarity with Google Sheets and GitHub

---

## Part 1: Google Sheets & Apps Script Setup

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it **"Book Club Data"**
4. **Important:** Copy the Spreadsheet ID from the URL
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the `SPREADSHEET_ID_HERE` part

### Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of the file `Code.gs` from your repository
4. Paste it into the Apps Script editor
5. **Update Line 10:** Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID

### Step 3: Initialize the Sheets

1. In the Apps Script editor, find the function dropdown at the top (shows "Select function")
2. Select **`initializeSheets`**
3. Click the **Run** button (▶️)
4. You'll be prompted to authorize the script:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
5. Wait for the execution to complete (check the "Execution log" at the bottom)
6. Go back to your Google Sheet - you should now see 7 tabs created:
   - Members
   - Books
   - Nominations
   - Ratings
   - Votes
   - VotingSessions
   - Settings

### Step 4: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description:** "Book Club API v1"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. **Important:** Copy the **Web app URL** that appears - you'll need this!
   - It looks like: `https://script.google.com/macros/s/XXXXX/exec`
7. Click **Done**

### Step 5: Update Your Website Configuration

1. Open the file `app.js` in your repository
2. Find **Line 2** where it says:
   ```javascript
   apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the Web app URL you just copied
4. Make sure to keep the quotes!

Example:
```javascript
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec'
};
```

---

## Part 2: Google Calendar Setup

### Step 1: Create a Book Club Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. On the left side, next to "Other calendars", click the **+** button
3. Select **Create new calendar**
4. Fill in:
   - **Name:** "Book Club Events"
   - **Description:** "Book club meetings and events"
   - Click **Create calendar**

### Step 2: Make Calendar Public

1. Find your new calendar in the left sidebar under "My calendars"
2. Hover over it and click the three dots **⋮**
3. Click **Settings and sharing**
4. Scroll to **Access permissions for events**
5. Check ✅ **"Make available to public"**
6. Scroll to **Integrate calendar**
7. Copy the **Embed code** (it's a long `<iframe>` tag)

### Step 3: Add First Meeting

1. Go back to your calendar
2. Click on a date to create an event
3. Fill in:
   - **Title:** "Book Club Meeting"
   - **Date and time:** Choose your next meeting date
   - Click **Save**

### Step 4: Configure in Website (After Deployment)

You'll configure the calendar URL in your website after you're logged in as an admin. We'll cover this in Part 5.

---

## Part 3: Google OAuth Setup (for Google Sign-In)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** at the top → **New Project**
3. Name it **"Book Club Website"**
4. Click **Create**

### Step 2: Enable Google+ API

1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and then click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, click **Configure Consent Screen**:
   - Choose **External**
   - Fill in:
     - **App name:** "Book Club"
     - **User support email:** Your email
     - **Developer contact email:** Your email
   - Click **Save and Continue** through all steps
4. Back to creating OAuth client ID:
   - **Application type:** Web application
   - **Name:** "Book Club Web"
   - **Authorized JavaScript origins:**
     - `https://smithbp.github.io`
   - **Authorized redirect URIs:**
     - `https://smithbp.github.io/cheese-and-crackers/`
     - `https://smithbp.github.io/cheese-and-crackers/login.html`
   - Click **Create**
5. **Copy the Client ID** that appears

### Step 4: Update Login Page

1. Open `login.html` in your repository
2. Find **Line 18** where it says:
   ```html
   data-client_id="YOUR_GOOGLE_CLIENT_ID"
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

---

## Part 4: GitHub Pages Deployment

### Step 1: Commit Your Changes

Since you've updated several files (`app.js` and `login.html`), let's commit them:

```bash
git add .
git commit -m "Configure API URL and Google Client ID"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/smithbp/cheese-and-crackers`
2. Click **Settings** (top right)
3. In the left sidebar, click **Pages**
4. Under **Source**, select:
   - **Branch:** main
   - **Folder:** / (root)
5. Click **Save**
6. Wait a few minutes, then your site will be available at:
   - `https://smithbp.github.io/cheese-and-crackers/`

### Step 3: Update Email URLs in Apps Script

1. Go back to your Apps Script editor
2. Find the `sendWelcomeEmail` function (around line 388)
3. Update **Line 390** to your actual GitHub Pages URL:
   ```javascript
   const websiteUrl = 'https://smithbp.github.io/cheese-and-crackers/';
   ```
4. Do the same for `sendCredentialsResetEmail` function (around line 411)
5. Click **Save** (💾 icon)
6. Click **Deploy** → **Manage deployments**
7. Click the pencil icon ✏️ next to your deployment
8. Change **Version:** to "New version"
9. Click **Deploy**

---

## Part 5: First Admin Setup

### Step 1: Add Yourself as First Admin

Since there are no users yet, you need to manually add yourself to the Google Sheet:

1. Open your "Book Club Data" Google Sheet
2. Go to the **Members** tab
3. In row 2, fill in:
   - **Column A (id):** Generate a random ID or use: `admin-001`
   - **Column B (name):** Your name
   - **Column C (email):** Your email
   - **Column D (googleId):** Leave blank for now
   - **Column E (username):** Choose a username (e.g., `admin`)
   - **Column F (password):** Choose a password (e.g., `changeme123`)
   - **Column G (isAdmin):** `TRUE`
   - **Column H (created):** Today's date
   - **Column I (token):** Leave blank

### Step 2: First Login

1. Go to your website: `https://smithbp.github.io/cheese-and-crackers/`
2. You should be redirected to the login page
3. Log in with your username and password
4. You're now logged in as an admin!

### Step 3: Configure Calendar

1. Click **Menu** → **Calendar**
2. Scroll down to "Calendar Settings (Admin Only)"
3. Paste the Google Calendar embed code you copied earlier
4. Set the next meeting date
5. Click **Save Settings**

### Step 4: Add Other Members

1. Click **Menu** → **Member List**
2. Click **➕ Add Member**
3. Fill in their name and email
4. Choose whether to:
   - ✅ Make them an admin
   - ✅ Google Sign-In only (if they'll only use Google to log in)
5. Click **Add Member**
6. They'll receive an email with login credentials!

---

## Usage Guide

### For Admins

#### Managing Members
- Add members via the Member List page
- Reset passwords if someone forgets
- Promote users to admin status
- Remove members if needed

#### Managing Books
1. Members nominate books on the Nominations page
2. When ready to vote:
   - Go to Voting page
   - Set votes per user (e.g., 3)
   - Click "Start Voting"
3. After everyone votes:
   - Click "Show Results & Next Round"
   - Select books to advance
   - Continue rounds until one book remains
4. Click "Select Final Book!" - it becomes the current book
5. After the book is discussed:
   - Go to your Google Sheet → Books tab
   - Find the book and change status from `current` to `completed`
   - Add the completion date
   - Members can now rate and review it!

#### Managing Calendar
- Update your Google Calendar with meeting dates
- The website automatically shows the next meeting and countdown

### For Members

#### Nominating Books
1. Go to Menu → Book Nominations
2. Scroll to bottom form
3. Fill in book details:
   - Title and Author (required)
   - Amazon link (optional)
   - Goodreads link (optional)
   - Upload cover image or paste URL
4. Click "Submit Nomination"

#### Voting
1. When voting is active, go to Voting page
2. Click on books to select them (up to the allowed number)
3. Click "Submit My Votes"
4. Wait for admin to move to next round

#### Rating Books
1. Go to Books Read page
2. Click on a completed book
3. Click "Rate This Book"
4. Give a rating (1-10) and optional review
5. Submit - your review is visible to all members!

---

## Troubleshooting

### "API not configured" Warning

**Problem:** Orange banner saying API not configured

**Solution:** Make sure you updated `app.js` with your Google Apps Script Web App URL

### Login Not Working

**Problem:** "Invalid username or password" but credentials are correct

**Solutions:**
1. Check that you entered the credentials exactly as shown in the Google Sheet
2. Make sure there are no extra spaces
3. Verify the Apps Script is deployed and the URL is correct in `app.js`

### Google Sign-In Not Working

**Solutions:**
1. Verify you added your GitHub Pages URL to the OAuth authorized origins
2. Make sure you updated `login.html` with your Google Client ID
3. Check that the user exists in the Members sheet with their email

### Calendar Not Showing

**Solutions:**
1. Make sure the calendar is set to "Public" in Google Calendar settings
2. Verify you pasted the embed code correctly in the Calendar settings
3. Try pasting just the `src` URL from the iframe instead of the full embed code

### Images Not Uploading

**Solutions:**
1. Check that the Apps Script has permission to create files in Google Drive
2. Try using an image URL instead of uploading
3. Make sure the image is under 5MB

### Changes Not Appearing

**Problem:** Made changes to code but website looks the same

**Solutions:**
1. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Wait a few minutes for GitHub Pages to rebuild
3. Check browser console for errors (F12 → Console tab)

### Apps Script Errors

**Problem:** Errors when running functions in Apps Script

**Solutions:**
1. Make sure you ran `initializeSheets` first
2. Check that all permissions were granted
3. Verify the Spreadsheet ID is correct
4. Check the Execution log for specific error messages

---

## Advanced Customization

### Changing Colors/Theme

Edit `styles.css` and change the CSS variables at the top:

```css
:root {
    --primary-color: #8B4513;     /* Main brown color */
    --secondary-color: #D2691E;   /* Lighter brown */
    --accent-color: #CD853F;      /* Accent color */
    /* ... etc ... */
}
```

### Adding More Quotes

Edit `index.html` around line 95 and add more quotes to the `quotes` array:

```javascript
const quotes = [
    { text: "Your quote here", author: "Author Name" },
    // ... add more ...
];
```

### Customizing Email Templates

Edit the `sendWelcomeEmail` and `sendCredentialsResetEmail` functions in `Code.gs` to customize the email content.

---

## Support & Questions

If you run into issues:

1. Check the Troubleshooting section above
2. Check the browser console for JavaScript errors (F12 → Console)
3. Check the Apps Script execution log for backend errors
4. Make sure all configuration steps were completed

---

## Features Summary

✅ User authentication (Google Sign-In + username/password)  
✅ Admin user management  
✅ Book nominations  
✅ Multi-round voting system  
✅ Book ratings and reviews  
✅ Calendar integration  
✅ Member management  
✅ Current book display with countdown  
✅ Random author quotes  
✅ Image uploads to Google Drive  
✅ Email notifications  
✅ Fully responsive design  

Enjoy your book club! 📚
