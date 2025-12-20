// ==================== GOOGLE APPS SCRIPT ====================
// This script provides API endpoints for the survey form
// Deploy this as a Web App from Google Apps Script editor

// CONFIGURATION
// No hardcoded ID needed - automatically uses the sheet this script is attached to
const CONFIG_TAB = 'survey_config';
const RESPONSES_TAB = 'responses';

// ==================== GET REQUEST HANDLER ====================
/**
 * Handles GET requests - returns survey configuration
 */
function doGet(e) {
    try {
        const action = e.parameter.action || 'getConfig';

        if (action === 'getConfig') {
            return getSurveyConfig();
        } else if (action === 'getResponses') {
            return getSurveyResponses();
        }

        return createJsonResponse({ error: 'Invalid action' }, 400);
    } catch (error) {
        Logger.log('GET Error: ' + error);
        return createJsonResponse({ error: error.toString() }, 500);
    }
}

// ==================== GET SURVEY RESPONSES ====================
/**
 * Reads the responses tab and returns as JSON array
 * Useful for external analysis agents
 */
function getSurveyResponses() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const responsesTab = sheet.getSheetByName(RESPONSES_TAB);

    if (!responsesTab) {
        return createJsonResponse([]);
    }

    const data = responsesTab.getDataRange().getValues();

    if (data.length <= 1) {
        return createJsonResponse([]);
    }

    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);

    // Convert to array of objects
    const responses = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            // Format dates nicely
            if (row[index] instanceof Date) {
                obj[header] = row[index].toISOString();
            } else {
                obj[header] = row[index].toString();
            }
        });
        return obj;
    });

    return createJsonResponse(responses);
}

// ==================== POST REQUEST HANDLER ====================
/**
 * Handles POST requests - saves survey responses
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        saveResponse(data);
        return createJsonResponse({ success: true, message: 'Response saved' });
    } catch (error) {
        Logger.log('POST Error: ' + error);
        return createJsonResponse({ error: error.toString() }, 500);
    }
}

// ==================== GET SURVEY CONFIGURATION ====================
/**
 * Reads the survey_config tab and returns as JSON array
 */
function getSurveyConfig() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configTab = sheet.getSheetByName(CONFIG_TAB);

    if (!configTab) {
        throw new Error('survey_config tab not found. Please create it first.');
    }

    const data = configTab.getDataRange().getValues();

    if (data.length === 0) {
        throw new Error('No data found in survey_config tab');
    }

    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);

    // Convert to array of objects
    const config = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined && row[index] !== null ? row[index].toString() : '';
        });
        return obj;
    });

    return createJsonResponse(config);
}

// ==================== SAVE SURVEY RESPONSE ====================
/**
 * Saves a survey response to the responses tab
 * @param {Object} data - Response data with timestamp, responses, and pathTaken
 */
function saveResponse(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    let responsesTab = sheet.getSheetByName(RESPONSES_TAB);

    // Create responses tab if it doesn't exist
    if (!responsesTab) {
        responsesTab = sheet.insertSheet(RESPONSES_TAB);
        initializeResponsesTab(responsesTab);
    }

    // Get headers
    const headers = responsesTab.getRange(1, 1, 1, responsesTab.getLastColumn()).getValues()[0];

    // Build row data
    const rowData = [];

    headers.forEach(header => {
        if (header === 'Timestamp') {
            rowData.push(new Date(data.timestamp));
        } else if (header === 'Path_Taken') {
            rowData.push(data.pathTaken || '');
        } else if (data.responses && data.responses[header]) {
            rowData.push(data.responses[header]);
        } else {
            rowData.push(''); // Empty if question not answered (due to branching)
        }
    });

    // Append row
    responsesTab.appendRow(rowData);

    Logger.log('Response saved successfully');
}

// ==================== INITIALIZE RESPONSES TAB ====================
/**
 * Sets up the responses tab with appropriate headers
 * @param {Sheet} responsesTab - The responses sheet object
 */
function initializeResponsesTab(responsesTab) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const configTab = sheet.getSheetByName(CONFIG_TAB);

    if (!configTab) {
        throw new Error('survey_config tab must exist before creating responses tab');
    }

    // Get all question IDs from config
    const configData = configTab.getDataRange().getValues();
    const headers = ['Timestamp'];

    // Add a column for each question (q_id)
    for (let i = 1; i < configData.length; i++) {
        const qId = configData[i][0]; // First column is q_id
        if (qId && qId !== '') {
            headers.push(qId.toString());
        }
    }

    // Add path tracking column
    headers.push('Path_Taken');

    // Set headers
    responsesTab.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format headers
    responsesTab.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#667eea')
        .setFontColor('#ffffff');

    // Freeze header row
    responsesTab.setFrozenRows(1);

    Logger.log('Responses tab initialized with headers:', headers);
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Creates a JSON response with CORS headers
 */
function createJsonResponse(data, statusCode = 200) {
    const output = JSON.stringify(data);

    return ContentService
        .createTextOutput(output)
        .setMimeType(ContentService.MimeType.JSON);
}

// ==================== SETUP FUNCTION ====================
/**
 * Run this function once to set up the sheets automatically
 * This is optional - you can also set up manually
 */
function setupSheets() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();

    // Create survey_config tab if it doesn't exist
    let configTab = sheet.getSheetByName(CONFIG_TAB);
    if (!configTab) {
        configTab = sheet.insertSheet(CONFIG_TAB);

        // Add headers
        const headers = ['q_id', 'section', 'type', 'question_text', 'options', 'image_url', 'branch_logic'];
        configTab.getRange(1, 1, 1, headers.length).setValues([headers]);

        // Format headers
        configTab.getRange(1, 1, 1, headers.length)
            .setFontWeight('bold')
            .setBackground('#667eea')
            .setFontColor('#ffffff');

        configTab.setFrozenRows(1);

        Logger.log('survey_config tab created');
    }

    // Create responses tab
    let responsesTab = sheet.getSheetByName(RESPONSES_TAB);
    if (!responsesTab) {
        responsesTab = sheet.insertSheet(RESPONSES_TAB);
        Logger.log('responses tab created (will be initialized on first response)');
    }

    Logger.log('Setup complete! Now add your questions to the survey_config tab.');
}

// ==================== TEST FUNCTIONS ====================
/**
 * Test the getConfig endpoint
 */
function testGetConfig() {
    const result = getSurveyConfig();
    Logger.log(result.getContent());
}

/**
 * Test the saveResponse endpoint
 */
function testSaveResponse() {
    const sampleData = {
        timestamp: new Date().toISOString(),
        responses: {
            'q_role': 'Manager',
            'q_tenure': '1-3 years',
            'q_checkpoint1': 'Yes',
            'q_tech_path1': 'Frontend'
        },
        pathTaken: 'q_role: Manager → q_tenure: 1-3 years → q_checkpoint1: Yes → q_tech_path1: Frontend'
    };

    saveResponse(sampleData);
    Logger.log('Test response saved successfully');
}
