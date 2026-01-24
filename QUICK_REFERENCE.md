# Quick Reference Guide

## Common Admin Tasks

### Adding a New Member

1. Go to **Menu** → **Member List**
2. Click **➕ Add Member**
3. Enter name and email
4. Check boxes if needed:
   - ✅ **Make this user an admin** - Gives admin privileges
   - ✅ **Google Sign-In only** - No username/password created
5. Click **Add Member**
6. They receive an automatic email with credentials

### Starting a Voting Session

1. Make sure members have nominated books
2. Go to **Menu** → **Voting**
3. Set **Votes per user** (e.g., 3)
4. Click **Start Voting**
5. Notify members to vote!

### Advancing Voting Rounds

1. After members vote, click **Show Results & Next Round**
2. Check the boxes next to books that should advance
3. Set votes for next round (usually fewer, like 2 or 1)
4. Click **Advance Selected Books**
5. Repeat until one book remains

### Selecting the Final Book

1. After final round of voting
2. Check the single winning book
3. Click **Select Final Book!**
4. Book appears on home page as "Current Book"

### Marking a Book as Completed

1. Open your Google Sheet: **Book Club Data**
2. Go to **Books** tab
3. Find the current book (status = "current")
4. Change **Column H** from `current` to `completed`
5. Add completion date in **Column J**
6. Members can now rate and review it!

### Resetting Someone's Password

1. Go to **Menu** → **Member List**
2. Find the member
3. Click **Reset Password**
4. Confirm
5. New credentials automatically emailed to them

### Setting Up Calendar

1. Create a Google Calendar
2. Make it public
3. Go to **Menu** → **Calendar**
4. Scroll to admin section
5. Paste embed code or calendar URL
6. Set next meeting date
7. Click **Save Settings**

## Common Member Tasks

### Nominating a Book

1. **Menu** → **Book Nominations**
2. Scroll to bottom form
3. Fill in:
   - **Book Title** (required)
   - **Author** (required)
   - **Amazon Link** (optional)
   - **Goodreads Link** (optional)
   - **Image**: Upload or paste URL
4. Click **Submit Nomination**

### Voting

1. When admin starts voting, go to **Voting** page
2. Click books to select (they turn green)
3. Can select up to the allowed number
4. Click **Submit My Votes**
5. Wait for next round or results

### Rating a Book

1. **Menu** → **Books Read**
2. Click on a book card
3. Click **Rate This Book**
4. Enter:
   - **Rating**: 1-10 (10 = best)
   - **Review**: Optional text
5. Click **Submit Rating**

### Changing Your Password

Currently, passwords can only be reset by admins. To change yours:
1. Ask an admin to reset your password
2. You'll receive an email with new credentials
3. Log in with new credentials

## Google Sheet Column Reference

### Members Sheet
- **A**: ID (auto)
- **B**: Name
- **C**: Email
- **D**: Google ID (auto)
- **E**: Username
- **F**: Password
- **G**: Is Admin (TRUE/FALSE)
- **H**: Created date
- **I**: Token (auto)

### Books Sheet
- **A**: ID
- **B**: Title
- **C**: Author
- **D**: Amazon Link
- **E**: Goodreads Link
- **F**: Image URL
- **G**: Nominated By
- **H**: Status (current/completed)
- **I**: Date Selected
- **J**: Date Completed

### Nominations Sheet
- **A**: ID
- **B**: Title
- **C**: Author
- **D**: Amazon Link
- **E**: Goodreads Link
- **F**: Image URL
- **G**: User ID
- **H**: User Name
- **I**: Date Nominated
- **J**: Status (active/voting_1/voting_2/selected/eliminated)

### Settings Sheet
- **A**: Key
- **B**: Value

Common keys:
- `calendarUrl`: Google Calendar embed code
- `nextMeetingDate`: ISO date string
- `imageFolderId`: Google Drive folder ID

## URLs to Bookmark

- **Website**: https://smithbp.github.io/cheese-and-crackers/
- **Google Sheet**: [Your spreadsheet URL]
- **Apps Script**: [Your Apps Script project URL]
- **Google Calendar**: [Your calendar URL]

## Troubleshooting Quick Fixes

### Login Issues
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Check credentials in Google Sheet exactly

### Calendar Not Showing
- Make calendar public in Google Calendar settings
- Paste full embed code in calendar settings
- Hard refresh page

### Voting Not Working
- Make sure admin has started voting
- Check you haven't already voted
- Try logging out and back in

### Images Not Loading
- Check image URL is public
- Try re-uploading
- Use image URL instead of upload

## Email Template Locations

If you want to customize emails:

1. Open **Apps Script** editor
2. Find functions:
   - `sendWelcomeEmail` (around line 388)
   - `sendCredentialsResetEmail` (around line 411)
3. Edit the `body` variable
4. Save and redeploy

## Backup Your Data

To backup your book club data:

1. Open your Google Sheet
2. **File** → **Download** → **Microsoft Excel (.xlsx)**
3. Save to your computer
4. Do this monthly or before major changes!

## Need More Help?

Check the full **SETUP.md** guide for detailed instructions!
