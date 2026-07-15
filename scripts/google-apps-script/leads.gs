/**
 * EnNaksha Leads — Google Apps Script
 * Sheet: https://docs.google.com/spreadsheets/d/1SdKIPpEnjmcQCTDpd1cZCg_pg_Q1-h2ljlzmRF2esZI
 * Drive folder: https://drive.google.com/drive/folders/1R0DcMRSlNQ4tYLK3CVeP8oai5BitWlL_
 *
 * IMPORTANT — after changing this code you MUST redeploy:
 *   Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
 * (the /exec URL stays the same, but the change only goes live after redeploy)
 *
 * First-time deploy:
 * 1. Extensions → Apps Script → paste this code → Save
 * 2. Run `testSetup` once and approve permissions
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the /exec URL — paste it in the website code
 */

var SPREADSHEET_ID = "1SdKIPpEnjmcQCTDpd1cZCg_pg_Q1-h2ljlzmRF2esZI";
var DRIVE_FOLDER_ID = "1R0DcMRSlNQ4tYLK3CVeP8oai5BitWlL_";

var HEADERS = [
  "Timestamp",
  "Location",
  "Email",
  "Plan",
  "BHK Type",
  "Home Size",
  "Aesthetic",
  "Timeline",
  "Floor Plan",
  "Budget",
  "Full Name",
  "WhatsApp",
  "Add-ons",
  "Step",
];

function getLeadsSheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
}

function ensureHeaders_(sheet) {
  var first = sheet.getRange(1, 1).getValue();
  if (first !== "Timestamp") {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return (e && e.parameter) || {};
}

function normalizeAddOns_(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

// Upload base64 file to Google Drive, return shareable link
function uploadToDrive_(base64Data, fileName, mimeType) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType || "image/jpeg", fileName || "floor-plan.jpg");
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Upload failed: " + String(err);
  }
}

function buildRow_(p, driveLink) {
  return [
    new Date().toLocaleString("en-IN"),
    p.location    || "",
    p.email       || "",
    p.plan        || "",
    p.bhkType     || "",
    p.homeSize    || "",
    p.aesthetic   || "",
    p.timeline    || "",
    driveLink     || "",
    p.budget      || "",
    p.fullName    || "",
    p.whatsapp    || "",
    normalizeAddOns_(p.addOns),
    p.step        || "",
  ];
}

function doGet() {
  return jsonResponse({ status: "ok", message: "EnNaksha Leads API is running" });
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var sheet = getLeadsSheet_();
    ensureHeaders_(sheet);

    // Upload floor plan photo to Drive if provided
    var driveLink = "";
    if (payload.floorPlanBase64 && payload.floorPlanBase64.length > 0) {
      var fileName = (payload.fullName || "lead").replace(/\s+/g, "-") + "-floor-plan-" + Date.now() + "." + (payload.floorPlanExt || "jpg");
      driveLink = uploadToDrive_(payload.floorPlanBase64, fileName, payload.floorPlanMime || "image/jpeg");
    }

    sheet.appendRow(buildRow_(payload, driveLink));
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) });
  }
}

function testSetup() {
  var sheet = getLeadsSheet_();
  ensureHeaders_(sheet);
  Logger.log("Sheet ready: " + sheet.getName());
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  Logger.log("Drive folder ready: " + folder.getName());
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
