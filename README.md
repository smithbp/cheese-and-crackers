# 📚 Book Club Website

A complete, free book club website with Google Sheets backend and GitHub Pages hosting.

![Book Club](https://img.shields.io/badge/Book%20Club-Website-brown)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔐 **Dual Authentication**: Google Sign-In or username/password
- 👥 **Member Management**: Add, remove, and manage members with admin controls
- 📖 **Book Nominations**: Members can nominate books with cover images
- 🗳️ **Multi-Round Voting**: Flexible voting system with configurable votes per round
- ⭐ **Ratings & Reviews**: Rate books 1-10 and write reviews
- 📅 **Calendar Integration**: Embedded Google Calendar with countdown timer
- 🎯 **Current Book Display**: Shows the selected book prominently
- 💬 **Random Author Quotes**: Rotating inspirational quotes on every page load
- 📧 **Email Notifications**: Automatic welcome emails and password resets
- 📱 **Fully Responsive**: Works great on mobile, tablet, and desktop
- 💾 **Free Storage**: Uses Google Sheets (under 1GB needed)
- 🖼️ **Image Uploads**: Upload book covers to Google Drive

## 🚀 Quick Start

1. **Read the Setup Guide**: Check out [SETUP.md](SETUP.md) for complete instructions
2. **Set up Google Sheets**: Create a spreadsheet and deploy the Apps Script
3. **Configure OAuth**: Set up Google Sign-In
4. **Deploy to GitHub Pages**: Push your code and enable Pages
5. **Add yourself as admin**: Manual first user setup
6. **Start using it!**: Invite members and start reading

## 📁 Project Structure

```
├── index.html              # Home page with current book & countdown
├── login.html              # Login page (Google + username/password)
├── members.html            # Member management (admin)
├── calendar.html           # Embedded Google Calendar
├── books-read.html         # Past books with ratings
├── nominations.html        # Book nomination form
├── voting.html             # Multi-round voting system
├── styles.css              # Complete styling
├── app.js                  # Frontend JavaScript
├── Code.gs                 # Google Apps Script backend
├── SETUP.md               # Detailed setup instructions
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla - no frameworks!)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Storage**: Google Drive (for images)
- **Authentication**: Google OAuth + Custom
- **Hosting**: GitHub Pages (free!)
- **Email**: Gmail via Apps Script

## 📸 Screenshots

### Home Page
- Current book display
- Countdown to next meeting
- Random author quotes

### Voting System
- Select multiple books
- Multi-round elimination
- Admin controls for advancing rounds

### Book Ratings
- 1-10 rating scale
- Optional text reviews
- Average ratings display

## 🎯 Use Cases

Perfect for:
- Small book clubs (5-50 members)
- Reading groups
- Literature classes
- Online book communities
- Free, self-hosted solution needed

## 📋 Requirements

- Google account (for Sheets & Apps Script)
- GitHub account (for Pages hosting)
- Basic familiarity with web tools

## 🔧 Configuration

All configuration is done in:
1. `app.js` - Line 2: Apps Script Web App URL
2. `login.html` - Line 18: Google OAuth Client ID
3. `Code.gs` - Line 10: Google Spreadsheet ID

See [SETUP.md](SETUP.md) for detailed instructions!

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork it for your own book club
- Customize the design
- Add new features
- Share improvements

## 📝 License

MIT License - Feel free to use this for your own book club!

## 🙏 Acknowledgments

Built with ☕ and 📚 for book lovers everywhere.

---

**Questions?** Check [SETUP.md](SETUP.md) for comprehensive setup instructions and troubleshooting!
