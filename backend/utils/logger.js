import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log file path: backend/error.log (up one level from utils)
const LOG_FILE = path.join(__dirname, '..', 'error.log');

/**
 * Log error to file
 * @param {string} context - Where the error occurred (e.g., "[Route] /bulk")
 * @param {Error|any} error - The error object or message
 */
export const logError = (context, error) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  // Extract SQL-specific fields if available (Postgres error fields)
  let sqlDetails = '';
  if (error && typeof error === 'object') {
     const fields = ['code', 'detail', 'hint', 'schema', 'table', 'column', 'constraint'];
     const validFields = fields.filter(f => error[f]);
     if (validFields.length > 0) {
       sqlDetails = '\nSQL Details:\n' + validFields.map(f => `  ${f}: ${error[f]}`).join('\n');
     }
  }

  const logEntry = `\n[${timestamp}] ${context}\nMessage: ${errorMessage}${sqlDetails}\nStack: ${stack}\n----------------------------------------`;
  
  // Console output as well
  console.error(`${context}:`, error);

  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (fsError) {
    console.error('Failed to write to log file:', fsError);
  }
};
