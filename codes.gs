/**
 * BACKEND FOR ATHLETE REGISTRATION SYSTEM
 * Instructions:
 * 1. Create a Google Sheet and copy its ID to SPREADSHEET_ID.
 * 2. Create a Google Drive Folder for images and copy its ID to FOLDER_ID.
 * 3. Deploy as Web App.
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // เปลี่ยนเป็น ID ของ Google Sheet
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';           // เปลี่ยนเป็น ID ของโฟลเดอร์ใน Drive
const SHEET_NAME = 'Athletes';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบลงทะเบียนนักกีฬา')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Register a new athlete
 * @param {Object} data - { firstName, lastName, level, number, photoUrl (base64) }
 */
function registerAthlete(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['ID', 'Timestamp', 'FirstName', 'LastName', 'Level', 'Number', 'PhotoURL']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f3f3f3');
    }

    // 1. Upload Photo to Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = data.photoUrl.split(';')[0].split(':')[1];
    const base64Data = data.photoUrl.split(',')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, `athlete_${data.firstName}_${Date.now()}.jpg`);
    const file = folder.createFile(blob);
    
    // ตั้งค่าให้ใครที่มีลิงก์สามารถดูรูปได้ (สำหรับแสดงผลในตาราง)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // สร้าง Direct Link สำหรับแสดงผลรูปภาพ
    const driveUrl = `https://drive.google.com/uc?export=view&id=${file.getId()}`;

    // 2. Append Data to Sheet
    const id = Utilities.getUuid().split('-')[0]; // Short UUID
    const timestamp = new Date();
    sheet.appendRow([
      id, 
      timestamp, 
      data.firstName, 
      data.lastName, 
      data.level, 
      data.number, 
      driveUrl
    ]);

    return { success: true, id: id, photoUrl: driveUrl };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Fetch all athletes from sheet
 */
function getAthletes() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    values.shift(); // Remove headers
    
    return values.map(row => ({
      id: row[0].toString(),
      createdAt: row[1],
      firstName: row[2],
      lastName: row[3],
      level: row[4],
      number: row[5],
      photoUrl: row[6]
    })).reverse(); // เรียงจากใหม่ไปเก่า
  } catch (e) {
    return [];
  }
}

/**
 * Delete athlete by ID
 */
function deleteAthlete(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return { success: false };
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}