/**
 * BACKEND FOR ATHLETE REGISTRATION SYSTEM
 * Optimized v5.1 - Bug Fix: Precision ID Matching
 */

const SPREADSHEET_ID = '1S5hYDsz8fHOHPe0MmpC7G2bFRSHu3VKkW1WPVhZ2WH0'; 
const FOLDER_ID = '1Y6h7stTh1MZOxmoQGdRUtXB0tLtLBMhb'; 
const SHEET_NAME = 'Athletes';

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getAthletes') {
      return createJsonResponse(getAthletes());
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
  return HtmlService.createHtmlOutput('<h1>Service is running (v5.1 Optimized)</h1>');
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    let result;

    if (action === 'registerAthlete') {
      result = registerAthlete(requestData.data);
    } else if (action === 'updateAthlete') {
      result = updateAthlete(requestData.id, requestData.data);
    } else if (action === 'deleteAthlete') {
      result = deleteAthlete(requestData.id);
    }

    return createJsonResponse(result || { success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: 'Post Error: ' + err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID', 'วันที่ลงทะเบียน', 'ชื่อ', 'นามสกุล', 'ระดับชั้น', 'เลขที่', 'URL รูปภาพ']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E2E8F0');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function registerAthlete(data) {
  const sheet = getOrCreateSheet();
  let photoUrl = data.photoUrl;
  
  if (photoUrl && photoUrl.startsWith('data:')) {
    photoUrl = saveImageToDrive(photoUrl, data.firstName + '_' + data.lastName);
  }
  
  const id = Utilities.getUuid().split('-')[0];
  const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
  
  sheet.appendRow([id, timestamp, data.firstName, data.lastName, data.level, data.number, photoUrl]);
  return { success: true, id: id };
}

function updateAthlete(id, data) {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const targetId = String(id).trim();
  
  const rowIndex = values.findIndex(row => String(row[0]).trim() === targetId);
  
  if (rowIndex !== -1) {
    let photoUrl = data.photoUrl;
    if (photoUrl && photoUrl.startsWith('data:')) {
      photoUrl = saveImageToDrive(photoUrl, data.firstName);
    }
    
    sheet.getRange(rowIndex + 1, 3, 1, 5).setValues([[
      data.firstName, 
      data.lastName, 
      data.level, 
      data.number, 
      photoUrl
    ]]);
    return { success: true };
  }
  
  return { success: false, error: 'ไม่พบ ID: ' + targetId };
}

function deleteAthlete(id) {
  if (!id) return { success: false, error: 'ID is missing' };
  
  const sheet = getOrCreateSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const targetId = String(id).trim();
  
  console.log('Attempting to delete ID: ' + targetId);
  
  // ปรับปรุงการเปรียบเทียบให้รองรับ ID ที่เป็นตัวเลขใน Sheet
  const rowIndex = values.findIndex((row, idx) => {
    const rowId = String(row[0]).trim();
    if (rowId === targetId) {
      console.log('Found ID ' + targetId + ' at Row ' + (idx + 1));
      return true;
    }
    return false;
  });
  
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex + 1);
    console.log('Successfully deleted row ' + (rowIndex + 1));
    return { success: true, message: 'ลบข้อมูลสำเร็จ' };
  }
  
  console.log('ID ' + targetId + ' not found in sheet.');
  return { success: false, error: 'ไม่พบข้อมูลในระบบ (ID: ' + targetId + ')' };
}

function saveImageToDrive(base64Data, name) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const parts = base64Data.split(',');
    const contentType = parts[0].split(';')[0].split(':')[1];
    const bytes = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(bytes, contentType, `athlete_${name}_${Date.now()}.jpg`);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
  } catch (e) {
    return "";
  }
}

function getAthletes() {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const data = values.slice(1).map(r => ({
    id: String(r[0]), // บังคับเป็น String
    firstName: r[2],
    lastName: r[3],
    level: r[4],
    number: r[5],
    photoUrl: r[6]
  }));
  
  return data.reverse();
}