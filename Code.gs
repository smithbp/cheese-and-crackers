// Google Apps Script Backend for Book Club Website
// This file should be deployed as a Web App in Google Apps Script

// ============================================
// CONFIGURATION
// ============================================

// Spreadsheet configuration - You'll need to update this with your spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet names
const SHEETS = {
  MEMBERS: 'Members',
  BOOKS: 'Books',
  NOMINATIONS: 'Nominations',
  RATINGS: 'Ratings',
  VOTES: 'Votes',
  VOTING_SESSIONS: 'VotingSessions',
  SETTINGS: 'Settings'
};

// Google Drive folder for image uploads
let IMAGE_FOLDER_ID = null; // Will be created automatically

// ============================================
// INITIALIZATION
// ============================================

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create sheets if they don't exist
  createSheetIfNotExists(ss, SHEETS.MEMBERS, [
    'id', 'name', 'email', 'googleId', 'username', 'password', 'isAdmin', 'created', 'token'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.BOOKS, [
    'id', 'title', 'author', 'amazonLink', 'goodreadsLink', 'imageUrl', 
    'nominatedBy', 'status', 'dateSelected', 'dateCompleted'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.NOMINATIONS, [
    'id', 'title', 'author', 'amazonLink', 'goodreadsLink', 'imageUrl', 
    'nominatedBy', 'nominatedByName', 'dateNominated', 'status'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.RATINGS, [
    'id', 'bookId', 'userId', 'memberName', 'rating', 'review', 'dateRated'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.VOTES, [
    'id', 'votingSessionId', 'bookId', 'userId', 'round', 'dateVoted'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.VOTING_SESSIONS, [
    'id', 'status', 'currentRound', 'votesPerUser', 'startDate', 'endDate'
  ]);
  
  createSheetIfNotExists(ss, SHEETS.SETTINGS, [
    'key', 'value'
  ]);
  
  // Create image folder if it doesn't exist
  createImageFolder();
  
  return 'Sheets initialized successfully';
}

function createSheetIfNotExists(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function createImageFolder() {
  const folders = DriveApp.getFoldersByName('BookClub-Images');
  if (folders.hasNext()) {
    IMAGE_FOLDER_ID = folders.next().getId();
  } else {
    const folder = DriveApp.createFolder('BookClub-Images');
    IMAGE_FOLDER_ID = folder.getId();
  }
  setSetting('imageFolderId', IMAGE_FOLDER_ID);
}

// ============================================
// WEB APP ENTRY POINT
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'unknown';
    
    // Route the request
    const response = routeRequest(action, data);
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function doGet(e) {
  // Handle CORS preflight and GET requests
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Book Club API is running'
  })).setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ============================================
// ROUTING
// ============================================

function routeRequest(action, data) {
  // Public endpoints (no authentication required)
  if (action === 'login') return handleLogin(data);
  if (action === 'googleLogin') return handleGoogleLogin(data);
  
  // All other endpoints require authentication
  const user = verifyToken(data.token);
  if (!user) {
    return { success: false, error: 'UNAUTHORIZED', message: 'Please log in' };
  }
  
  // Authenticated endpoints
  switch (action) {
    case 'verifyToken':
      return { success: true, user: user };
      
    case 'getCurrentBook':
      return getCurrentBook();
      
    case 'getNextMeeting':
      return getNextMeeting();
      
    case 'getMembers':
      return getMembers();
      
    case 'addMember':
      return addMember(data, user);
      
    case 'removeMember':
      return removeMember(data, user);
      
    case 'resetCredentials':
      return resetCredentials(data, user);
      
    case 'getCalendarUrl':
      return getCalendarUrl(user);
      
    case 'getCalendarSettings':
      return getCalendarSettings(user);
      
    case 'saveCalendarSettings':
      return saveCalendarSettings(data, user);
      
    case 'getBooksRead':
      return getBooksRead();
      
    case 'getBookDetails':
      return getBookDetails(data);
      
    case 'addRating':
      return addRating(data, user);
      
    case 'getNominations':
      return getNominations();
      
    case 'addNomination':
      return addNomination(data, user);
      
    case 'uploadImage':
      return uploadImage(data);
      
    case 'getVotingStatus':
      return getVotingStatus();
      
    case 'getVotingBooks':
      return getVotingBooks(user);
      
    case 'startVoting':
      return startVoting(data, user);
      
    case 'submitVotes':
      return submitVotes(data, user);
      
    case 'showResults':
      return showResults(user);
      
    case 'getVotingResults':
      return getVotingResults();
      
    case 'nextRound':
      return nextRound(data, user);
      
    case 'selectFinalBook':
      return selectFinalBook(data, user);
      
    default:
      return { success: false, message: 'Unknown endpoint: ' + action };
  }
}

// ============================================
// AUTHENTICATION
// ============================================

function handleLogin(data) {
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheet.getDataRange().getValues();
  
  for (let i = 1; i < members.length; i++) {
    if (members[i][4] === data.username && members[i][5] === data.password) {
      // Generate token
      const token = generateToken();
      
      // Update token in sheet
      sheet.getRange(i + 1, 9).setValue(token);
      
      return {
        success: true,
        user: {
          id: members[i][0],
          name: members[i][1],
          email: members[i][2],
          isAdmin: members[i][6],
          token: token
        }
      };
    }
  }
  
  return { success: false, message: 'Invalid username or password' };
}

function handleGoogleLogin(data) {
  // Verify Google token
  const ticket = verifyGoogleToken(data.credential);
  if (!ticket) {
    return { success: false, message: 'Invalid Google token' };
  }
  
  const payload = ticket.getPayload();
  const googleId = payload['sub'];
  const email = payload['email'];
  
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheet.getDataRange().getValues();
  
  // Find member by googleId or email
  for (let i = 1; i < members.length; i++) {
    if (members[i][3] === googleId || members[i][2] === email) {
      // Update googleId if not set
      if (!members[i][3]) {
        sheet.getRange(i + 1, 4).setValue(googleId);
      }
      
      // Generate token
      const token = generateToken();
      sheet.getRange(i + 1, 9).setValue(token);
      
      return {
        success: true,
        user: {
          id: members[i][0],
          name: members[i][1],
          email: members[i][2],
          isAdmin: members[i][6],
          token: token
        }
      };
    }
  }
  
  return { success: false, message: 'User not found. Please contact an administrator.' };
}

function verifyGoogleToken(credential) {
  // Note: In production, you should verify the Google token server-side
  // For now, we'll trust the client-side verification
  // You can use OAuth2 library for proper verification
  return { getPayload: () => ({ sub: '', email: credential }) };
}

function verifyToken(token) {
  if (!token) return null;
  
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheet.getDataRange().getValues();
  
  for (let i = 1; i < members.length; i++) {
    if (members[i][8] === token) {
      return {
        id: members[i][0],
        name: members[i][1],
        email: members[i][2],
        isAdmin: members[i][6]
      };
    }
  }
  
  return null;
}

function generateToken() {
  return Utilities.getUuid();
}

function requireAdmin(user) {
  if (!user || !user.isAdmin) {
    throw new Error('Admin access required');
  }
}

// ============================================
// MEMBERS
// ============================================

function getMembers() {
  const sheet = getSheet(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();
  const members = [];
  
  for (let i = 1; i < data.length; i++) {
    members.push({
      id: data[i][0],
      name: data[i][1],
      email: data[i][2],
      isAdmin: data[i][6]
    });
  }
  
  return { success: true, members: members };
}

function addMember(data, user) {
  requireAdmin(user);
  
  const sheet = getSheet(SHEETS.MEMBERS);
  const id = Utilities.getUuid();
  const created = new Date().toISOString();
  
  let username = '';
  let password = '';
  
  if (!data.googleOnly) {
    // Generate username and password
    username = data.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    password = generateRandomPassword();
  }
  
  const token = '';
  
  sheet.appendRow([
    id,
    data.name,
    data.email,
    '', // googleId
    username,
    password,
    data.isAdmin || false,
    created,
    token
  ]);
  
  // Send welcome email
  sendWelcomeEmail(data.email, data.name, username, password, data.googleOnly);
  
  return { success: true, message: 'Member added successfully' };
}

function removeMember(data, user) {
  requireAdmin(user);
  
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheet.getDataRange().getValues();
  
  for (let i = 1; i < members.length; i++) {
    if (members[i][0] === data.memberId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Member removed successfully' };
    }
  }
  
  return { success: false, message: 'Member not found' };
}

function resetCredentials(data, user) {
  requireAdmin(user);
  
  const sheet = getSheet(SHEETS.MEMBERS);
  const members = sheet.getDataRange().getValues();
  
  for (let i = 1; i < members.length; i++) {
    if (members[i][0] === data.memberId) {
      const newPassword = generateRandomPassword();
      const newUsername = members[i][1].replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      sheet.getRange(i + 1, 5).setValue(newUsername);
      sheet.getRange(i + 1, 6).setValue(newPassword);
      sheet.getRange(i + 1, 9).setValue(''); // Clear token
      
      // Send email with new credentials
      sendCredentialsResetEmail(members[i][2], members[i][1], newUsername, newPassword);
      
      return { success: true, message: 'Credentials reset successfully' };
    }
  }
  
  return { success: false, message: 'Member not found' };
}

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

function sendWelcomeEmail(email, name, username, password, googleOnly) {
  const websiteUrl = 'https://smithbp.github.io/cheese-and-crackers/'; // Update this with your actual URL
  
  let subject = 'Welcome to the Book Club!';
  let body = `Dear ${name},\n\n`;
  body += `Welcome to our book club! We're excited to have you join us.\n\n`;
  body += `Website: ${websiteUrl}\n\n`;
  
  if (googleOnly) {
    body += `You can log in using your Google account (${email}).\n\n`;
  } else {
    body += `Your login credentials:\n`;
    body += `Username: ${username}\n`;
    body += `Password: ${password}\n\n`;
    body += `You can also log in using your Google account.\n\n`;
    body += `You can change your password after logging in.\n\n`;
  }
  
  body += `Happy reading!\n\n`;
  body += `Best regards,\nThe Book Club Team`;
  
  MailApp.sendEmail(email, subject, body);
}

function sendCredentialsResetEmail(email, name, username, password) {
  const websiteUrl = 'https://smithbp.github.io/cheese-and-crackers/'; // Update this with your actual URL
  
  let subject = 'Book Club - Password Reset';
  let body = `Dear ${name},\n\n`;
  body += `Your login credentials have been reset.\n\n`;
  body += `New credentials:\n`;
  body += `Username: ${username}\n`;
  body += `Password: ${password}\n\n`;
  body += `Website: ${websiteUrl}\n\n`;
  body += `Please log in and change your password.\n\n`;
  body += `Best regards,\nThe Book Club Team`;
  
  MailApp.sendEmail(email, subject, body);
}

// ============================================
// BOOKS
// ============================================

function getCurrentBook() {
  const sheet = getSheet(SHEETS.BOOKS);
  const books = sheet.getDataRange().getValues();
  
  for (let i = 1; i < books.length; i++) {
    if (books[i][7] === 'current') {
      return {
        success: true,
        book: {
          id: books[i][0],
          title: books[i][1],
          author: books[i][2],
          amazonLink: books[i][3],
          goodreadsLink: books[i][4],
          imageUrl: books[i][5],
          nominatedBy: books[i][6],
          dateSelected: books[i][8]
        }
      };
    }
  }
  
  return { success: true, book: null };
}

function getBooksRead() {
  const sheet = getSheet(SHEETS.BOOKS);
  const ratingsSheet = getSheet(SHEETS.RATINGS);
  
  const books = sheet.getDataRange().getValues();
  const ratings = ratingsSheet.getDataRange().getValues();
  
  const completedBooks = [];
  
  for (let i = 1; i < books.length; i++) {
    if (books[i][7] === 'completed') {
      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;
      
      for (let j = 1; j < ratings.length; j++) {
        if (ratings[j][1] === books[i][0]) {
          totalRating += ratings[j][4];
          ratingCount++;
        }
      }
      
      const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      
      completedBooks.push({
        id: books[i][0],
        title: books[i][1],
        author: books[i][2],
        amazonLink: books[i][3],
        goodreadsLink: books[i][4],
        imageUrl: books[i][5],
        nominatedBy: books[i][6],
        dateCompleted: books[i][9],
        avgRating: avgRating,
        ratingCount: ratingCount
      });
    }
  }
  
  // Sort by date completed (most recent first)
  completedBooks.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted));
  
  return { success: true, books: completedBooks };
}

function getBookDetails(data) {
  const sheet = getSheet(SHEETS.BOOKS);
  const ratingsSheet = getSheet(SHEETS.RATINGS);
  
  const books = sheet.getDataRange().getValues();
  const allRatings = ratingsSheet.getDataRange().getValues();
  
  for (let i = 1; i < books.length; i++) {
    if (books[i][0] === data.bookId) {
      // Get ratings for this book
      const bookRatings = [];
      let totalRating = 0;
      
      for (let j = 1; j < allRatings.length; j++) {
        if (allRatings[j][1] === data.bookId) {
          bookRatings.push({
            userId: allRatings[j][2],
            memberName: allRatings[j][3],
            rating: allRatings[j][4],
            review: allRatings[j][5],
            dateRated: allRatings[j][6]
          });
          totalRating += allRatings[j][4];
        }
      }
      
      const avgRating = bookRatings.length > 0 ? totalRating / bookRatings.length : 0;
      
      return {
        success: true,
        book: {
          id: books[i][0],
          title: books[i][1],
          author: books[i][2],
          amazonLink: books[i][3],
          goodreadsLink: books[i][4],
          imageUrl: books[i][5],
          nominatedBy: books[i][6],
          dateCompleted: books[i][9],
          avgRating: avgRating,
          ratingCount: bookRatings.length
        },
        ratings: bookRatings
      };
    }
  }
  
  return { success: false, message: 'Book not found' };
}

function addRating(data, user) {
  const sheet = getSheet(SHEETS.RATINGS);
  const ratings = sheet.getDataRange().getValues();
  
  // Check if user already rated this book
  for (let i = 1; i < ratings.length; i++) {
    if (ratings[i][1] === data.bookId && ratings[i][2] === user.id) {
      // Update existing rating
      sheet.getRange(i + 1, 5).setValue(data.rating);
      sheet.getRange(i + 1, 6).setValue(data.review || '');
      sheet.getRange(i + 1, 7).setValue(new Date().toISOString());
      return { success: true, message: 'Rating updated successfully' };
    }
  }
  
  // Add new rating
  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    data.bookId,
    user.id,
    user.name,
    data.rating,
    data.review || '',
    new Date().toISOString()
  ]);
  
  return { success: true, message: 'Rating added successfully' };
}

// ============================================
// NOMINATIONS
// ============================================

function getNominations() {
  const sheet = getSheet(SHEETS.NOMINATIONS);
  const data = sheet.getDataRange().getValues();
  const nominations = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][9] === 'active') {
      nominations.push({
        id: data[i][0],
        title: data[i][1],
        author: data[i][2],
        amazonLink: data[i][3],
        goodreadsLink: data[i][4],
        imageUrl: data[i][5],
        nominatedBy: data[i][7],
        dateNominated: data[i][8]
      });
    }
  }
  
  // Sort by date nominated (most recent first)
  nominations.sort((a, b) => new Date(b.dateNominated) - new Date(a.dateNominated));
  
  return { success: true, nominations: nominations };
}

function addNomination(data, user) {
  const sheet = getSheet(SHEETS.NOMINATIONS);
  const id = Utilities.getUuid();
  
  sheet.appendRow([
    id,
    data.title,
    data.author,
    data.amazonLink || '',
    data.goodreadsLink || '',
    data.imageUrl || '',
    user.id,
    user.name,
    new Date().toISOString(),
    'active'
  ]);
  
  return { success: true, message: 'Book nominated successfully' };
}

// ============================================
// IMAGE UPLOAD
// ============================================

function uploadImage(data) {
  try {
    const folderId = getSetting('imageFolderId') || IMAGE_FOLDER_ID;
    const folder = DriveApp.getFolderById(folderId);
    
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.data),
      data.mimeType,
      data.fileName
    );
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const url = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    return { success: true, url: url };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ============================================
// VOTING
// ============================================

function getVotingStatus() {
  const sheet = getSheet(SHEETS.VOTING_SESSIONS);
  const sessions = sheet.getDataRange().getValues();
  
  // Find active or results session
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][1] === 'voting' || sessions[i][1] === 'results') {
      return {
        success: true,
        session: {
          id: sessions[i][0],
          status: sessions[i][1],
          currentRound: sessions[i][2],
          votesPerUser: sessions[i][3]
        }
      };
    }
  }
  
  return { success: true, session: null };
}

function getVotingBooks(user) {
  const statusResponse = getVotingStatus();
  if (!statusResponse.session) {
    return { success: false, message: 'No active voting session' };
  }
  
  const session = statusResponse.session;
  const nominationsSheet = getSheet(SHEETS.NOMINATIONS);
  const votesSheet = getSheet(SHEETS.VOTES);
  
  const nominations = nominationsSheet.getDataRange().getValues();
  const votes = votesSheet.getDataRange().getValues();
  
  const books = [];
  const userVotes = [];
  
  // Get books for this round
  for (let i = 1; i < nominations.length; i++) {
    if (nominations[i][9] === 'voting_' + session.currentRound) {
      books.push({
        id: nominations[i][0],
        title: nominations[i][1],
        author: nominations[i][2],
        amazonLink: nominations[i][3],
        goodreadsLink: nominations[i][4],
        imageUrl: nominations[i][5],
        nominatedBy: nominations[i][7]
      });
    }
  }
  
  // Get user's votes for this session and round
  for (let i = 1; i < votes.length; i++) {
    if (votes[i][1] === session.id && votes[i][3] === user.id && votes[i][4] === session.currentRound) {
      userVotes.push(votes[i][2]);
    }
  }
  
  return { success: true, books: books, userVotes: userVotes };
}

function startVoting(data, user) {
  requireAdmin(user);
  
  // Get all active nominations
  const nominationsSheet = getSheet(SHEETS.NOMINATIONS);
  const nominations = nominationsSheet.getDataRange().getValues();
  
  // Mark active nominations as voting_1
  for (let i = 1; i < nominations.length; i++) {
    if (nominations[i][9] === 'active') {
      nominationsSheet.getRange(i + 1, 10).setValue('voting_1');
    }
  }
  
  // Create voting session
  const sessionsSheet = getSheet(SHEETS.VOTING_SESSIONS);
  const id = Utilities.getUuid();
  
  sessionsSheet.appendRow([
    id,
    'voting',
    1, // round
    data.votesPerUser,
    new Date().toISOString(),
    ''
  ]);
  
  return { success: true, message: 'Voting started' };
}

function submitVotes(data, user) {
  const statusResponse = getVotingStatus();
  if (!statusResponse.session || statusResponse.session.status !== 'voting') {
    return { success: false, message: 'No active voting session' };
  }
  
  const session = statusResponse.session;
  const votesSheet = getSheet(SHEETS.VOTES);
  const votes = votesSheet.getDataRange().getValues();
  
  // Delete existing votes for this user in this round
  for (let i = votes.length - 1; i >= 1; i--) {
    if (votes[i][1] === session.id && votes[i][3] === user.id && votes[i][4] === session.currentRound) {
      votesSheet.deleteRow(i + 1);
    }
  }
  
  // Add new votes
  for (let bookId of data.bookIds) {
    const id = Utilities.getUuid();
    votesSheet.appendRow([
      id,
      session.id,
      bookId,
      user.id,
      session.currentRound,
      new Date().toISOString()
    ]);
  }
  
  return { success: true, message: 'Votes submitted' };
}

function showResults(user) {
  requireAdmin(user);
  
  const sessionsSheet = getSheet(SHEETS.VOTING_SESSIONS);
  const sessions = sessionsSheet.getDataRange().getValues();
  
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][1] === 'voting') {
      sessionsSheet.getRange(i + 1, 2).setValue('results');
      return { success: true, message: 'Results displayed' };
    }
  }
  
  return { success: false, message: 'No active voting session' };
}

function getVotingResults() {
  const statusResponse = getVotingStatus();
  if (!statusResponse.session) {
    return { success: false, message: 'No voting session' };
  }
  
  const session = statusResponse.session;
  const nominationsSheet = getSheet(SHEETS.NOMINATIONS);
  const votesSheet = getSheet(SHEETS.VOTES);
  
  const nominations = nominationsSheet.getDataRange().getValues();
  const votes = votesSheet.getDataRange().getValues();
  
  const results = [];
  
  // Get books for this round
  for (let i = 1; i < nominations.length; i++) {
    if (nominations[i][9] === 'voting_' + session.currentRound) {
      const bookId = nominations[i][0];
      
      // Count votes for this book
      let voteCount = 0;
      for (let j = 1; j < votes.length; j++) {
        if (votes[j][1] === session.id && votes[j][2] === bookId && votes[j][4] === session.currentRound) {
          voteCount++;
        }
      }
      
      results.push({
        id: bookId,
        title: nominations[i][1],
        author: nominations[i][2],
        amazonLink: nominations[i][3],
        goodreadsLink: nominations[i][4],
        imageUrl: nominations[i][5],
        nominatedBy: nominations[i][7],
        votes: voteCount
      });
    }
  }
  
  // Sort by votes (descending)
  results.sort((a, b) => b.votes - a.votes);
  
  return { success: true, results: results };
}

function nextRound(data, user) {
  requireAdmin(user);
  
  const nominationsSheet = getSheet(SHEETS.NOMINATIONS);
  const sessionsSheet = getSheet(SHEETS.VOTING_SESSIONS);
  
  const nominations = nominationsSheet.getDataRange().getValues();
  const sessions = sessionsSheet.getDataRange().getValues();
  
  // Find current session
  let sessionRow = -1;
  let currentRound = 1;
  
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][1] === 'results') {
      sessionRow = i + 1;
      currentRound = sessions[i][2];
      break;
    }
  }
  
  if (sessionRow === -1) {
    return { success: false, message: 'No results session found' };
  }
  
  const nextRound = currentRound + 1;
  
  // Mark selected books for next round
  for (let i = 1; i < nominations.length; i++) {
    if (data.bookIds.includes(nominations[i][0])) {
      nominationsSheet.getRange(i + 1, 10).setValue('voting_' + nextRound);
    } else if (nominations[i][9] === 'voting_' + currentRound) {
      nominationsSheet.getRange(i + 1, 10).setValue('eliminated');
    }
  }
  
  // Update session
  sessionsSheet.getRange(sessionRow, 2).setValue('voting');
  sessionsSheet.getRange(sessionRow, 3).setValue(nextRound);
  sessionsSheet.getRange(sessionRow, 4).setValue(data.votesPerUser);
  
  return { success: true, message: 'Next round started' };
}

function selectFinalBook(data, user) {
  requireAdmin(user);
  
  const nominationsSheet = getSheet(SHEETS.NOMINATIONS);
  const booksSheet = getSheet(SHEETS.BOOKS);
  const sessionsSheet = getSheet(SHEETS.VOTING_SESSIONS);
  
  const nominations = nominationsSheet.getDataRange().getValues();
  const sessions = sessionsSheet.getDataRange().getValues();
  
  // Find the selected nomination
  let selectedNomination = null;
  let nominationRow = -1;
  
  for (let i = 1; i < nominations.length; i++) {
    if (nominations[i][0] === data.bookId) {
      selectedNomination = nominations[i];
      nominationRow = i + 1;
      break;
    }
  }
  
  if (!selectedNomination) {
    return { success: false, message: 'Book not found' };
  }
  
  // Add to Books as current
  const bookId = Utilities.getUuid();
  booksSheet.appendRow([
    bookId,
    selectedNomination[1], // title
    selectedNomination[2], // author
    selectedNomination[3], // amazonLink
    selectedNomination[4], // goodreadsLink
    selectedNomination[5], // imageUrl
    selectedNomination[7], // nominatedBy
    'current',
    new Date().toISOString(),
    ''
  ]);
  
  // Mark nomination as selected
  nominationsSheet.getRange(nominationRow, 10).setValue('selected');
  
  // End voting session
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i][1] === 'results' || sessions[i][1] === 'voting') {
      sessionsSheet.getRange(i + 1, 2).setValue('completed');
      sessionsSheet.getRange(i + 1, 6).setValue(new Date().toISOString());
    }
  }
  
  return { success: true, message: 'Book selected as current book' };
}

// ============================================
// SETTINGS
// ============================================

function getSetting(key) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const settings = sheet.getDataRange().getValues();
  
  for (let i = 1; i < settings.length; i++) {
    if (settings[i][0] === key) {
      return settings[i][1];
    }
  }
  
  return null;
}

function setSetting(key, value) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const settings = sheet.getDataRange().getValues();
  
  for (let i = 1; i < settings.length; i++) {
    if (settings[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  
  // Add new setting
  sheet.appendRow([key, value]);
}

function getNextMeeting() {
  const dateStr = getSetting('nextMeetingDate');
  return {
    success: true,
    date: dateStr
  };
}

function getCalendarUrl(user) {
  const url = getSetting('calendarUrl');
  return {
    success: true,
    calendarUrl: url,
    isAdmin: user.isAdmin
  };
}

function getCalendarSettings(user) {
  requireAdmin(user);
  
  return {
    success: true,
    calendarUrl: getSetting('calendarUrl'),
    nextMeetingDate: getSetting('nextMeetingDate')
  };
}

function saveCalendarSettings(data, user) {
  requireAdmin(user);
  
  if (data.calendarUrl) {
    setSetting('calendarUrl', data.calendarUrl);
  }
  
  if (data.nextMeetingDate) {
    setSetting('nextMeetingDate', data.nextMeetingDate);
  }
  
  return { success: true, message: 'Settings saved' };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}
