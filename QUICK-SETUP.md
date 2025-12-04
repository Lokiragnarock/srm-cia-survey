# Quick Setup Guide - CSV Import Method

## ⚡ 1-Minute Google Sheets Setup

Instead of manually creating tabs and typing data, simply **import the pre-made CSV file**:

### Step 1: Open Your Google Sheet

Go to: https://docs.google.com/spreadsheets/d/14m2BaVFEv1YWewCtwoTNZZaWE6uva-EBSTPiWzb6D5A/edit

### Step 2: Import the Survey Configuration

1. In your Google Sheet, click the **+** button at the bottom to create a new tab

2. Rename it to: `survey_config`

3. Click **File → Import**

4. Click **Upload** tab

5. Drag and drop (or browse to select): `survey-config-import.csv` from your project folder:
   ```
   G:\My Drive\SRM CIA\survey-config-import.csv
   ```

6. In the import dialog:
   - **Import location**: Select "Replace current sheet"
   - **Separator type**: Comma
   - Click **Import data**

7. ✅ Done! Your `survey_config` tab now has all 12 sample questions with branching logic!

### Step 3: Create Responses Tab

1. Click the **+** button again to create another tab

2. Rename it to: `responses`

3. Leave it empty (it will auto-populate when submissions come in)

### Step 4: Format (Optional but Recommended)

1. Go back to the `survey_config` tab

2. Select row 1 (the header row)

3. Make it bold: Click **B** (bold) button

4. Add color: Click fill color → Choose purple or blue

5. Freeze it: Click **View → Freeze → 1 row**

---

## 🎨 What You'll See

After importing, your `survey_config` tab will have:

**12 Questions** across **3 checkpoint branches**:

```
Screener Path (All users):
└─ q_role → q_tenure → q_checkpoint1

Branch 1: Tech Path
└─ q_tech_path1 → q_tech_path2 → q_checkpoint2

Branch 2: Non-Tech Path
└─ q_non_tech_path1 → q_non_tech_path2 → q_checkpoint2

Branch 3: Work Location Split
├─ Remote: q_remote1 → q_final
├─ Hybrid: q_hybrid1 → q_final
└─ Office: q_office1 → q_final
```

---

## ✏️ Customizing Questions

Once imported, you can edit directly in Google Sheets:

- **Change question text**: Just click the cell and type
- **Modify options**: Edit the options column (keep the ` | ` separator)
- **Add new questions**: Insert a new row, fill in all columns
- **Update branching**: Edit the `branch_logic` column

**Pro Tip**: Don't change `q_id` values after deployment - responses are keyed to these IDs!

---

## 🧪 Testing Your Setup

### Quick Validation:

1. ✅ `survey_config` tab exists
2. ✅ Header row has: q_id, section, type, question_text, options, image_url, branch_logic
3. ✅ 12 data rows (plus header = 13 total rows)
4. ✅ `responses` tab exists (empty is fine)

### Test the Form Locally:

1. Open `index.html` in your browser

2. The survey should load with the question: "What is your role?"

3. Complete the survey following different paths:
   - Try selecting "Yes" on "Are you in a technical role?" → See tech questions
   - Try selecting "No" → See non-tech questions

4. Responses will show in the browser console (F12) since we're in demo mode

---

## 🚀 Next Step: Deploy Google Apps Script

Once your Google Sheet is set up:

1. Follow the guide: [GOOGLE-APPS-SCRIPT-SETUP.md](docs/GOOGLE-APPS-SCRIPT-SETUP.md)

2. This takes ~5 minutes and connects your form to the sheet

3. Then deploy to Vercel using: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📝 Sample Questions Included

The CSV includes a complete working example:

- **Q1-3**: Screener questions (role, tenure, tech/non-tech)
- **Checkpoint 1**: Splits into Tech vs Non-Tech paths
- **Q4-7**: Path-specific questions
- **Checkpoint 2**: Splits by work arrangement (Remote/Hybrid/Office)
- **Q8-11**: Work arrangement specific questions
- **Q12**: Final question (everyone sees this)

**Feel free to replace these with your own questions!** The structure is just a template.

---

Need help? Check the [main README](README.md) or detailed [SETUP guide](docs/SETUP.md).
