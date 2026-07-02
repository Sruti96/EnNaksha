/**
 * EnNaksha Leads — Google Apps Script
 * Sheet: https://docs.google.com/spreadsheets/d/1SdKIPpEnjmcQCTDpd1cZCg_pg_Q1-h2ljlzmRF2esZI
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
 * 4. Copy the /exec URL into .env.local as LEADS_SHEET_API
 */

var SPREADSHEET_ID = "1SdKIPpEnjmcQCTDpd1cZCg_pg_Q1-h2ljlzmRF2esZI";

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
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
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

function buildRow_(p) {
  return [
    new Date(),
    p.location || "",
    p.email || "",
    p.plan || "",
    p.bhkType || "",
    p.homeSize || "",
    p.aesthetic || "",
    p.timeline || "",
    p.floorPlan || "",
    p.budget || "",
    p.fullName || "",
    p.whatsapp || "",
    normalizeAddOns_(p.addOns),
    p.step || "",
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
    sheet.appendRow(buildRow_(payload));
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) });
  }
}

function testSetup() {
  var sheet = getLeadsSheet_();
  ensureHeaders_(sheet);
  Logger.log("Leads sheet ready: " + sheet.getName());
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
