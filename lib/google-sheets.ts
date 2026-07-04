import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  "1SdKIPpEnjmcQCTDpd1cZCg_pg_Q1-h2ljlzmRF2esZI";

const KEY_FILE_NAME = "google-service-account.json";

export type Lead = {
  location: string;
  email: string;
  plan?: string;
  bhkType?: string;
  homeSize?: number | string;
  aesthetic?: string;
  timeline?: string;
  floorPlan?: string;
  budget?: number | string;
  fullName?: string;
  whatsapp?: string;
  addOns?: string[] | string;
  step?: number | string;
};

const HEADERS = [
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

function normalizeAddOns(value: Lead["addOns"]): string {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function buildRow(lead: Lead): (string | number)[] {
  return [
    new Date().toISOString(),
    lead.location ?? "",
    lead.email ?? "",
    lead.plan ?? "",
    lead.bhkType ?? "",
    lead.homeSize ?? "",
    lead.aesthetic ?? "",
    lead.timeline ?? "",
    lead.floorPlan ?? "",
    lead.budget ?? "",
    lead.fullName ?? "",
    lead.whatsapp ?? "",
    normalizeAddOns(lead.addOns),
    lead.step ?? "",
  ];
}

type ServiceAccount = { client_email: string; private_key: string };

function readKeyFile(): ServiceAccount | null {
  const keyPath = path.join(process.cwd(), KEY_FILE_NAME);
  if (!fs.existsSync(keyPath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    if (parsed.client_email && parsed.private_key) {
      return { client_email: parsed.client_email, private_key: parsed.private_key };
    }
  } catch {
    // fall through to env-based credentials
  }

  return null;
}

function getServiceAccount(): ServiceAccount | null {
  const fromFile = readKeyFile();
  if (fromFile) return fromFile;

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return { client_email: clientEmail, private_key: privateKey };
  }

  return null;
}

export function hasGoogleSheetsCredentials() {
  return getServiceAccount() !== null;
}

function getSheetsClient() {
  const account = getServiceAccount();
  if (!account) {
    throw new Error("Google Sheets credentials are not configured");
  }

  const auth = new google.auth.JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureHeaders(sheets: ReturnType<typeof getSheetsClient>) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A1:${String.fromCharCode(64 + HEADERS.length)}1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [HEADERS] },
  });
}

async function appendViaServiceAccount(lead: Lead) {
  const sheets = getSheetsClient();
  await ensureHeaders(sheets);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:N",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [buildRow(lead)] },
  });
}

async function appendViaAppsScript(lead: Lead) {
  const leadsSheetApi =
    process.env.LEADS_SHEET_API ?? process.env.NEXT_PUBLIC_LEADS_SHEET_API;

  if (!leadsSheetApi) {
    throw new Error("LEADS_SHEET_API is not configured");
  }

  const response = await fetch(leadsSheetApi, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(lead),
    redirect: "manual",
  });

  const redirect = response.headers.get("location") ?? "";
  if (redirect.includes("accounts.google.com")) {
    throw new Error("Google Apps Script rejected the request with status 401");
  }

  if (response.status === 302 || response.status === 200) {
    return;
  }

  throw new Error(
    `Google Apps Script rejected the request with status ${response.status}`
  );
}

export async function saveLead(lead: Lead) {
  if (hasGoogleSheetsCredentials()) {
    await appendViaServiceAccount(lead);
    return;
  }

  await appendViaAppsScript(lead);
}

/**
 * Reads a lead back out of the sheet by email (most recent submission wins).
 * Only works with the service-account credential path, since the Apps Script
 * fallback is write-only.
 */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
  if (!hasGoogleSheetsCredentials()) {
    throw new Error(
      "Reading leads from the sheet requires Google Sheets service-account credentials"
    );
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A:${String.fromCharCode(64 + HEADERS.length)}`,
  });

  const rows = res.data.values || [];
  const dataRows = rows.slice(1); // skip header row
  const target = email.trim().toLowerCase();

  const match = [...dataRows]
    .reverse()
    .find((row) => (row[2] || "").toLowerCase() === target);

  if (!match) return null;

  return {
    location: match[1] || "",
    email: match[2] || "",
    plan: match[3] || "",
    bhkType: match[4] || "",
    homeSize: match[5] || "",
    aesthetic: match[6] || "",
    timeline: match[7] || "",
    floorPlan: match[8] || "",
    budget: match[9] || "",
    fullName: match[10] || "",
    whatsapp: match[11] || "",
    addOns: match[12] || "",
    step: match[13] || "",
  };
}
