
/**
 * BACKEND FOR FLOWER ORDERING SYSTEM (Unified Version)
 * How to setup:
 * 1. Open your Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Copy-Paste this code.
 * 4. Update SPREADSHEET_ID and FOLDER_ID below.
 * 5. Deploy > New Deployment > Web App > Access: "Anyone".
 */

const SPREADSHEET_ID = '1EaonkTI2K0Q1TS9vOZr3emVz2IRlwvRsG1PC_6tQLm0'; 
const FOLDER_ID = '1Y6h7stTh1MZOxmoQGdRUtXB0tLtLBMhb'; 
const SHEET_NAME = 'FlowerOrders';

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getOrders') {
      return createJsonResponse(getOrders());
    }
    return HtmlService.createHtmlOutput('<h1>Flower Ordering API is active</h1>');
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    let result;

    if (action === 'createOrder') {
      result = createOrder(requestData.data);
    } else if (action === 'updateOrder') {
      result = updateOrder(requestData.id, requestData.data);
    } else if (action === 'deleteOrder') {
      result = deleteOrder(requestData.id);
    }

    return createJsonResponse(result || { success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
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
    sheet.appendRow(['OrderID', 'Timestamp', 'RecipientName', 'Phone', 'Details', 'CardMessage', 'Address', 'DeliveryTime', 'PhotoURL']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#db2777').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function createOrder(data) {
  const sheet = getOrCreateSheet();
  let photoUrl = "";
  if (data.photoUrl && data.photoUrl.startsWith('data:')) {
    photoUrl = saveImageToDrive(data.photoUrl, data.recipientName);
  } else {
    photoUrl = data.photoUrl || "";
  }
  
  const id = 'ORD-' + Utilities.getUuid().split('-')[0].toUpperCase();
  const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
  
  sheet.appendRow([
    id, 
    timestamp, 
    data.recipientName, 
    data.phone, 
    data.details, 
    data.cardMessage, 
    data.address, 
    data.deliveryTime, 
    photoUrl
  ]);
  
  return { success: true, id: id, photoUrl: photoUrl };
}

function updateOrder(id, data) {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const targetId = String(id).trim();
  const rowIndex = values.findIndex(row => String(row[0]).trim() === targetId);
  
  if (rowIndex !== -1) {
    let photoUrl = data.photoUrl;
    if (photoUrl && photoUrl.startsWith('data:')) {
      photoUrl = saveImageToDrive(photoUrl, data.recipientName);
    }
    
    sheet.getRange(rowIndex + 1, 3, 1, 7).setValues([[
      data.recipientName, 
      data.phone, 
      data.details, 
      data.cardMessage, 
      data.address, 
      data.deliveryTime, 
      photoUrl
    ]]);
    return { success: true, photoUrl: photoUrl };
  }
  return { success: false, error: 'Order not found' };
}

function deleteOrder(id) {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const targetId = String(id).trim();
  const rowIndex = values.findIndex(row => String(row[0]).trim() === targetId);
  
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex + 1);
    return { success: true };
  }
  return { success: false, error: 'Order not found' };
}

function saveImageToDrive(base64Data, name) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const parts = base64Data.split(',');
    const contentType = parts[0].split(';')[0].split(':')[1];
    const bytes = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(bytes, contentType, `flower_${name}_${Date.now()}.jpg`);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return `https://lh3.googleusercontent.com/d/${file.getId()}`;
  } catch (e) {
    return "";
  }
}

function getOrders() {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  return values.slice(1).map(r => ({
    id: String(r[0]),
    timestamp: String(r[1]),
    recipientName: String(r[2]),
    phone: String(r[3]),
    details: String(r[4]),
    cardMessage: String(r[5]),
    address: String(r[6]),
    deliveryTime: String(r[7]),
    photoUrl: String(r[8])
  })).reverse();
}
