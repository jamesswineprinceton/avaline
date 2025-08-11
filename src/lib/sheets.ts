import { google } from 'googleapis';
import { PriceRow } from '@/types';

// Initialize Google Sheets API client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Lists all available sheets in the spreadsheet
 */
export async function listSheets(): Promise<string[]> {
  try {
    const sheetId = process.env.SHEET_ID;
    if (!sheetId) {
      throw new Error('SHEET_ID environment variable is required');
    }

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetNames = response.data.sheets?.map(sheet => sheet.properties?.title || '') || [];
    return sheetNames;
  } catch (error) {
    console.error('Error listing sheets:', error);
    throw error;
  }
}

/**
 * Fetches price rows from Google Sheets
 * Parses rows into PriceRow type, coerces numbers, and sorts by timestamp
 */
export async function fetchPriceRows(): Promise<PriceRow[]> {
  try {
    const sheetId = process.env.SHEET_ID;
    const range = process.env.SHEET_RANGE || 'OasisData!A:D';

    if (!sheetId) {
      throw new Error('SHEET_ID environment variable is required');
    }

    // First, let's list available sheets to debug
    const availableSheets = await listSheets();

    // Check if the target sheet exists
    const targetSheet = range.split('!')[0];
    if (!availableSheets.includes(targetSheet)) {
      throw new Error(`Sheet "${targetSheet}" not found. Available sheets: ${availableSheets.join(', ')}`);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Skip header row and parse data
    const dataRows = rows.slice(1);
    const parsedRows: PriceRow[] = [];

    for (const row of dataRows) {
      if (row.length < 4) continue;

      const [quantityStr, vendor, priceStr, timestamp] = row;
      
      // Coerce to numbers, skip if NaN
      const quantity = Number(quantityStr);
      const price = Number(priceStr);
      
      if (isNaN(quantity) || isNaN(price)) {
        continue;
      }

      parsedRows.push({
        vendor: String(vendor || ''),
        quantity,
        price,
        timestamp: String(timestamp || ''),
      });
    }

    // Sort by timestamp ascending (oldest first)
    return parsedRows.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching price rows:', error);
    throw new Error('Failed to fetch price data from Google Sheets');
  }
}

/**
 * Adds a subscriber email to Google Sheets
 */
export async function addSubscriber(email: string): Promise<void> {
  try {
    const sheetId = process.env.SHEET_ID;
    const subscriberRange = process.env.SUBSCRIBER_SHEET_RANGE || 'Emails!A:B';

    if (!sheetId) {
      throw new Error('SHEET_ID environment variable is required');
    }

    // Add the email and timestamp to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: subscriberRange,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[email, new Date().toISOString()]]
      }
    });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    throw new Error('Failed to add subscriber to Google Sheets');
  }
} 