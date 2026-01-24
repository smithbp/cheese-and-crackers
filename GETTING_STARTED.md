# 🚀 Getting Started - First 5 Minutes

**New here? Start with this quick guide!**

## What is this?

A complete, **FREE** book club website that lets you:
- 📚 Nominate and vote on books
- ⭐ Rate and review books you've read
- 👥 Manage members
- 📅 Track meetings
- 🗳️ Run multi-round voting

**No coding knowledge required!** Just follow the setup guide.

## Quick Start (5 Steps)

### 1. Read This First ⏱️ 2 minutes

Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) to understand what you're getting.

### 2. Follow Setup Guide ⏱️ 60-90 minutes

Open [SETUP.md](SETUP.md) and follow all 5 parts:

1. **Google Sheets & Apps Script** (30 min)
   - Create spreadsheet
   - Deploy backend code

2. **Google Calendar** (10 min)
   - Create and embed calendar

3. **Google OAuth** (15 min)
   - Set up Google Sign-In

4. **GitHub Pages** (10 min)
   - Deploy your website

5. **First Admin** (10 min)
   - Add yourself as admin
   - Configure settings

### 3. Use the Checklist ⏱️ Ongoing

Use [CHECKLIST.md](CHECKLIST.md) to track your progress. Check off each item as you complete it.

### 4. Test Everything ⏱️ 15 minutes

- Add a test member
- Nominate a test book
- Run a test vote
- Rate a test book

### 5. Invite Your Book Club! ⏱️ 5 min per person

Add members via the Members page and they'll receive email invitations!

## Files You Need to Configure

**Only 3 files need your configuration:**

1. **Code.gs** (Line 10)
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

2. **app.js** (Line 2)
   ```javascript
   apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   ```

3. **login.html** (Line 18)
   ```html
   data-client_id="YOUR_GOOGLE_CLIENT_ID"
   ```

See [CONFIGURATION.md](CONFIGURATION.md) for details.

## Document Guide

| Document | What It's For | When to Read |
|----------|---------------|--------------|
| **PROJECT_SUMMARY.md** | Overview of everything | First! |
| **SETUP.md** | Detailed setup instructions | During setup |
| **CHECKLIST.md** | Track setup progress | During setup |
| **README.md** | Project description | Anytime |
| **QUICK_REFERENCE.md** | Common tasks | After setup |
| **CONFIGURATION.md** | Config values | During setup |
| **GETTING_STARTED.md** | This file! | Right now! |

## Need Help?

### During Setup
→ Check [SETUP.md](SETUP.md) Troubleshooting section

### After Setup
→ Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks

### Technical Issues
- Check browser console (press F12)
- Check Apps Script execution log
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## What Happens After Setup?

1. **Your website will be live** at: `https://smithbp.github.io/cheese-and-crackers/`
2. **Members can log in** with Google or username/password
3. **You can manage everything** from the admin interface
4. **No server maintenance** - it's all handled by Google & GitHub!

## Cost: $0 💰

Everything uses free services:
- ✅ GitHub Pages (hosting)
- ✅ Google Sheets (database)
- ✅ Google Apps Script (backend)
- ✅ Google Drive (images)
- ✅ Gmail (emails)

## Time Commitment

- **Initial setup:** 1-2 hours (one time)
- **Adding a member:** 2 minutes
- **Starting a vote:** 5 minutes
- **Monthly maintenance:** ~0 minutes (it just works!)

## Common Questions

**Q: Do I need to know how to code?**
A: No! Just copy/paste the configuration values.

**Q: Can I customize the design?**
A: Yes! Edit `styles.css` to change colors and styling.

**Q: How many members can I have?**
A: Up to ~50 active members comfortably.

**Q: What if something breaks?**
A: Check the Troubleshooting section in SETUP.md. Most issues are solved with a hard refresh!

**Q: Can I use this for free forever?**
A: Yes! All the services used have generous free tiers.

**Q: Do I need a credit card?**
A: No! Everything is completely free.

## Ready to Start?

### Your Next Step:
👉 Open [SETUP.md](SETUP.md) and start with Part 1!

### Estimated Time to Launch:
⏰ 1-2 hours for complete setup

### What You'll Have:
🎉 A fully functional book club website!

---

**Let's get started! Open SETUP.md now →**
