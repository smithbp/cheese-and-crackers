# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                    (GitHub Pages Website)                        │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Home    │  │ Members  │  │   Books  │  │  Voting  │        │
│  │  Page    │  │   Page   │  │   Page   │  │   Page   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │           Frontend JavaScript (app.js)              │        │
│  │    • Authentication                                 │        │
│  │    • API calls                                      │        │
│  │    • UI updates                                     │        │
│  └─────────────────────────────────────────────────────┘        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE APPS SCRIPT                             │
│                      (Code.gs - Backend)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Auth     │  │    Members   │  │    Voting    │          │
│  │   Handler    │  │  Management  │  │    System    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Books     │  │   Ratings    │  │    Email     │          │
│  │  Management  │  │    System    │  │   Sender     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────┬───────────────────┬───────────────────┬─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    GOOGLE    │    │    GOOGLE    │    │    GMAIL     │
│    SHEETS    │    │    DRIVE     │    │    (Email)   │
│  (Database)  │    │   (Images)   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Data Flow Examples

### Example 1: User Login

```
1. User enters credentials
   ↓
2. app.js sends POST to Apps Script
   ↓
3. Code.gs checks Members sheet
   ↓
4. If valid, generate token
   ↓
5. Return user data + token
   ↓
6. app.js stores in localStorage
   ↓
7. Redirect to home page
```

### Example 2: Book Nomination

```
1. User fills nomination form
   ↓
2. User uploads image
   ↓
3. app.js converts to base64
   ↓
4. POST to /uploadImage endpoint
   ↓
5. Code.gs saves to Google Drive
   ↓
6. Returns image URL
   ↓
7. POST to /addNomination with all data
   ↓
8. Code.gs adds row to Nominations sheet
   ↓
9. Returns success
   ↓
10. UI updates to show new nomination
```

### Example 3: Voting Process

```
1. Admin clicks "Start Voting"
   ↓
2. Code.gs updates Nominations status
   ↓
3. Creates VotingSession record
   ↓
4. Members see voting page
   ↓
5. Members select books
   ↓
6. Click "Submit Votes"
   ↓
7. Code.gs saves to Votes sheet
   ↓
8. Admin clicks "Show Results"
   ↓
9. Code.gs counts votes
   ↓
10. Displays results to all users
    ↓
11. Admin selects books for next round
    ↓
12. Repeat until one book wins
    ↓
13. Admin clicks "Book Selected!"
    ↓
14. Code.gs adds to Books sheet (status: current)
    ↓
15. Book appears on home page
```

## Database Schema (Google Sheets)

### Members Sheet
```
┌─────┬────────┬─────────┬──────────┬──────────┬──────────┬─────────┬─────────┬───────┐
│ id  │  name  │  email  │ googleId │ username │ password │ isAdmin │ created │ token │
├─────┼────────┼─────────┼──────────┼──────────┼──────────┼─────────┼─────────┼───────┤
│ uuid│ string │ string  │  string  │  string  │  string  │ boolean │  date   │string │
└─────┴────────┴─────────┴──────────┴──────────┴──────────┴─────────┴─────────┴───────┘
```

### Books Sheet
```
┌─────┬───────┬────────┬────────────┬──────────────┬──────────┬──────────────┬────────┬──────────────┬───────────────┐
│ id  │ title │ author │ amazonLink │ goodreadsLink│ imageUrl │ nominatedBy  │ status │ dateSelected │ dateCompleted │
├─────┼───────┼────────┼────────────┼──────────────┼──────────┼──────────────┼────────┼──────────────┼───────────────┤
│ uuid│string │ string │   string   │    string    │  string  │    string    │ string │    date      │     date      │
└─────┴───────┴────────┴────────────┴──────────────┴──────────┴──────────────┴────────┴──────────────┴───────────────┘

Status values: 'current' | 'completed'
```

### Nominations Sheet
```
┌─────┬───────┬────────┬────────────┬──────────────┬──────────┬───────────┬───────────────┬──────────────┬────────┐
│ id  │ title │ author │ amazonLink │ goodreadsLink│ imageUrl │nominatedBy│nominatedByName│dateNominated │ status │
├─────┼───────┼────────┼────────────┼──────────────┼──────────┼───────────┼───────────────┼──────────────┼────────┤
│ uuid│string │ string │   string   │    string    │  string  │   uuid    │    string     │     date     │ string │
└─────┴───────┴────────┴────────────┴──────────────┴──────────┴───────────┴───────────────┴──────────────┴────────┘

Status values: 'active' | 'voting_1' | 'voting_2' | ... | 'selected' | 'eliminated'
```

### Ratings Sheet
```
┌─────┬────────┬────────┬────────────┬────────┬────────┬───────────┐
│ id  │ bookId │ userId │ memberName │ rating │ review │ dateRated │
├─────┼────────┼────────┼────────────┼────────┼────────┼───────────┤
│ uuid│  uuid  │  uuid  │   string   │ 1-10   │ string │   date    │
└─────┴────────┴────────┴────────────┴────────┴────────┴───────────┘
```

### Votes Sheet
```
┌─────┬──────────────────┬────────┬────────┬───────┬───────────┐
│ id  │ votingSessionId  │ bookId │ userId │ round │ dateVoted │
├─────┼──────────────────┼────────┼────────┼───────┼───────────┤
│ uuid│       uuid       │  uuid  │  uuid  │  int  │   date    │
└─────┴──────────────────┴────────┴────────┴───────┴───────────┘
```

### VotingSessions Sheet
```
┌─────┬─────────┬──────────────┬──────────────┬───────────┬─────────┐
│ id  │ status  │ currentRound │ votesPerUser │ startDate │ endDate │
├─────┼─────────┼──────────────┼──────────────┼───────────┼─────────┤
│ uuid│ string  │     int      │     int      │   date    │  date   │
└─────┴─────────┴──────────────┴──────────────┴───────────┴─────────┘

Status values: 'voting' | 'results' | 'completed'
```

### Settings Sheet
```
┌────────────┬────────┐
│    key     │ value  │
├────────────┼────────┤
│   string   │ string │
└────────────┴────────┘

Common keys:
- calendarUrl
- nextMeetingDate
- imageFolderId
```

## API Endpoints

### Public Endpoints (No Auth Required)
- `POST /login` - Username/password login
- `POST /googleLogin` - Google OAuth login

### Protected Endpoints (Auth Required)
- `POST /verifyToken` - Verify user session
- `POST /getCurrentBook` - Get current book
- `POST /getNextMeeting` - Get next meeting date
- `POST /getMembers` - List all members
- `POST /getBooksRead` - List completed books
- `POST /getBookDetails` - Get book with ratings
- `POST /addRating` - Add/update book rating
- `POST /getNominations` - List active nominations
- `POST /addNomination` - Submit new nomination
- `POST /uploadImage` - Upload image to Drive
- `POST /getVotingStatus` - Get current voting session
- `POST /getVotingBooks` - Get books for voting
- `POST /submitVotes` - Submit user votes
- `POST /getVotingResults` - Get vote tallies
- `POST /getCalendarUrl` - Get calendar embed URL

### Admin Only Endpoints
- `POST /addMember` - Add new member
- `POST /removeMember` - Remove member
- `POST /resetCredentials` - Reset user password
- `POST /saveCalendarSettings` - Update calendar config
- `POST /startVoting` - Start voting session
- `POST /showResults` - Display vote results
- `POST /nextRound` - Advance to next round
- `POST /selectFinalBook` - Select winning book

## Security Model

```
┌──────────────────────────────────────────┐
│         User Authentication              │
├──────────────────────────────────────────┤
│  Google Sign-In OR Username/Password     │
│              ↓                           │
│        Generate Token (UUID)             │
│              ↓                           │
│      Store in localStorage               │
│              ↓                           │
│   Send with every API request            │
│              ↓                           │
│  Backend validates token in Members      │
│              ↓                           │
│    Check isAdmin for admin endpoints     │
└──────────────────────────────────────────┘
```

## File Size Summary

- **HTML Files**: ~2,500 lines
- **CSS File**: ~900 lines
- **JavaScript**: ~150 lines
- **Apps Script**: ~800 lines
- **Documentation**: ~1,800 lines
- **Total**: ~5,150 lines of code + docs

## Technology Stack

```
Frontend:
├── HTML5
├── CSS3 (with CSS Variables)
├── Vanilla JavaScript (ES6+)
└── Google Sign-In SDK

Backend:
├── Google Apps Script (JavaScript)
└── Google Services:
    ├── Sheets API
    ├── Drive API
    ├── Gmail API
    └── OAuth2

Hosting:
└── GitHub Pages (Static)

Development:
├── Git (Version Control)
└── VS Code (Recommended Editor)
```

## Deployment Architecture

```
Developer → Git Push → GitHub Repository → GitHub Pages → Users

Developer → Apps Script Editor → Deploy as Web App → Google Servers
```

## Performance Characteristics

- **Page Load**: < 2 seconds
- **API Response**: < 1 second (typically 200-500ms)
- **Image Upload**: 2-5 seconds (depends on image size)
- **Concurrent Users**: ~50 simultaneous users supported
- **Data Limit**: 5 million cells in Google Sheets
- **Storage**: 15 GB in Google Drive (free tier)

## Scalability

Current implementation supports:
- Members: ~1,000
- Books: ~5,000
- Nominations: ~10,000
- Votes: ~50,000
- Ratings: ~50,000

To scale beyond:
- Consider migrating to a dedicated database
- Implement caching
- Add rate limiting
- Use CDN for images

---

This architecture is designed for simplicity, reliability, and zero cost!
