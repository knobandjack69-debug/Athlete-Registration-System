
/**
 * BACKEND FOR ATHLETE REGISTRATION SYSTEM
 * Spreadsheet ID: 1S5hYDsz8fHOHPe0MmpC7G2bFRSHu3VKkW1WPVhZ2WH0
 * Folder ID: 1Y6h7stTh1MZOxmoQGdRUtXB0tLtLBMhb
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
  return HtmlService.createHtmlOutput('<h1>Service is running</h1>');
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
      result = deleteAthlete(requestData.id); // รองรับการลบผ่าน POST
    }

    return createJsonResponse(result);
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
  const rows = sheet.getDataRange().getValues();
  const targetId = id.toString().trim();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === targetId) {
      let photoUrl = data.photoUrl;
      if (photoUrl && photoUrl.startsWith('data:')) {
        photoUrl = saveImageToDrive(photoUrl, data.firstName);
      }
      sheet.getRange(i + 1, 3, 1, 5).setValues([[data.firstName, data.lastName, data.level, data.number, photoUrl]]);
      return { success: true };
    }
  }
  return { success: false, error: 'ไม่พบ ID: ' + targetId };
}

function deleteAthlete(id) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const targetId = id.toString().trim();
  
  for (let i = 1; i < rows.length; i++) {
    // ใช้ trim() เพื่อให้แน่ใจว่าไม่มีช่องว่างมาทำให้การเปรียบเทียบผิดพลาด
    if (rows[i][0].toString().trim() === targetId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบข้อมูล ID ' + targetId + ' สำเร็จ' };
    }
  }
  return { success: false, error: 'ไม่พบข้อมูล ID: ' + targetId + ' ในระบบ' };
}

function saveImageToDrive(base64Data, name) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = base64Data.split(';')[0].split(':')[1];
    const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
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
  values.shift(); 
  return values.map(r => ({
    id: r[0].toString(),
    firstName: r[2],
    lastName: r[3],
    level: r[4],
    number: r[5],
    photoUrl: r[6]
  })).reverse();
}
