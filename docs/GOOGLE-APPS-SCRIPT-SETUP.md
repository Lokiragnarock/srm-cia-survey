# Google Apps Script Setup Guide

This guide walks you through deploying the Google Apps Script backend for your survey form.

## 📋 What This Does

The Google Apps Script provides two API endpoints:
- **GET**: Reads survey configuration from `survey_config` tab
- **POST**: Saves user responses to `responses` tab

## Step 1: Open Apps Script Editor

1. Open your Google Sheet: [Your Survey Sheet](https://docs.google.com/spreadsheets/d/14m2BaVFEv1YWewCtwoTNZZaWE6uva-EBSTPiWzb6D5A/edit)

2. Click **Extensions → Apps Script**

   ![Apps Script Menu](https://via.placeholder.com/400x200/667eea/ffffff?text=Extensions+→+Apps+Script)

3. A new tab will open with the Apps Script editor

## Step 2: Replace Default Code

1. You'll see a default `myFunction()` - **delete all of it**

2. Open the file `google-apps-script.js` from your project folder

3. **Copy all the code** from `google-apps-script.js`

4. **Paste it** into the Apps Script editor

## Step 3: Verify Sheet ID

The script should automatically use your sheet, but let's verify:

1. Look for this line in the code (around line 5):
   ```javascript
   const SHEET_ID = '14m2BaVFEv1YWewCtwoTNZZaWE6uva-EBSTPiWzb6D5A';
   ```

2. Confirm the ID matches your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_SHEET_ID]/edit
   ```

3. If different, update the `SHEET_ID` constant

## Step 4: Save the Script

1. Click the **💾 Save** icon (or press `Ctrl+S` / `Cmd+S`)

2. Give your project a name, e.g., "Survey Form Backend"

## Step 5: Run Setup Function (Optional)

This will automatically create the tabs if they don't exist:

1. Select `setupSheets` from the function dropdown (top of editor)

2. Click **▶ Run**

3. You'll see an **Authorization Required** dialog:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**

4. Check the **Execution log** (bottom of editor) - you should see "Setup complete!"

## Step 6: Deploy as Web App

1. Click **Deploy → New deployment**

   ![Deploy Menu](https://via.placeholder.com/400x150/667eea/ffffff?text=Deploy+→+New+Deployment)

2. Click the **⚙️ Settings icon** next to "Select type"

3. Choose **Web app**

4. Configure the deployment:
   - **Description**: "Survey Form API v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**

   > ⚠️ Important: Set "Who has access" to "Anyone" so the form can submit responses

5. Click **Deploy**

6. You may need to authorize again - follow the same steps as before

7. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 7: Update Your Web App

1. Open `app.js` in your project folder

2. Find line 3:
   ```javascript
   APPS_SCRIPT_URL: '', // USER WILL UPDATE THIS AFTER DEPLOYING APPS SCRIPT
   ```

3. Paste your Web App URL:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
   ```

4. Change line 6:
   ```javascript
   USE_SAMPLE_DATA: false,
   ```

5. Save the file

## Step 8: Test the Integration

### Test 1: Get Config Endpoint

1. Open your Web App URL in a browser with `?action=getConfig`:
   ```
   https://script.google.com/macros/s/AKfycby.../exec?action=getConfig
   ```

2. You should see JSON data with your questions

### Test 2: Complete a Survey

1. Open `index.html` in your browser

2. Complete the survey

3. Check your Google Sheet's `responses` tab - you should see a new row!

## 🔧 Updating Your Script

If you need to make changes:

1. Edit the code in Apps Script editor

2. Click **💾 Save**

3. Click **Deploy → Manage deployments**

4. Click **✏️ Edit** (pencil icon)

5. Under "Version", select **New version**

6. Click **Deploy**

   > Note: The URL stays the same, no need to update `app.js` again

## 🧪 Testing Functions

You can test individual functions:

### Test Config Reading:
1. Select `testGetConfig` from function dropdown
2. Click **▶ Run**
3. Check **Execution log** for JSON output

### Test Response Saving:
1. Select `testSaveResponse` from function dropdown  
2. Click **▶ Run**
3. Check `responses` tab for new test row

## 🔒 Security & Permissions

**Q: Is it safe to set "Who has access" to "Anyone"?**  
A: Yes, for this use case. The script only:
- Reads your survey config (which is public anyway)
- Writes submitted responses (intended behavior)
- Does NOT expose other data or allow modifications

**Q: Can I restrict access?**  
A: If you set it to "Anyone with Google account", users must sign in. This adds friction but provides more control.

## 🐛 Troubleshooting

### Error: "Exception: survey_config tab not found"
**Solution**: Create the `survey_config` tab in your Google Sheet

### Error: "Authorization required"
**Solution**: Re-run the authorization flow in Step 5

### Error: "Script not found"
**Solution**: 
- Make sure you deployed (not just saved)
- Check that the URL is the deployment URL (ends with `/exec`)

### Responses not saving
**Solution**:
- Check deployment settings (Execute as "Me", Access "Anyone")
- Verify `SHEET_ID` is correct
- Check browser console for errors

### Changes not reflecting
**Solution**:
- Make sure you created a **New version** in deployment settings
- Clear browser cache and refresh

## 📚 Understanding the Code

### Key Functions:

- `doGet()`: Handles GET requests, returns survey config
- `doPost()`: Handles POST requests, saves responses
- `getSurveyConfig()`: Reads `survey_config` tab
- `saveResponse()`: Writes to `responses` tab
- `initializeResponsesTab()`: Auto-creates response headers

### Data Flow:

```
Web Form → doPost() → saveResponse() → responses tab
Web Form ← doGet() ← getSurveyConfig() ← survey_config tab
```

## 🎯 Next Steps

✅ Apps Script deployed  
✅ Web App URL copied to `app.js`  
✅ Test passed  

Now you're ready to:
1. [Deploy to Vercel](DEPLOYMENT.md)
2. Share the form with your team
3. Start collecting responses!

---

[← Back to Setup](SETUP.md) | [Next: Deployment Guide →](DEPLOYMENT.md)
