# Dynamic Survey Form

A Typeform-style dynamic survey form with branching logic, powered by Google Sheets configuration and response storage.

## 🚀 Features

- ✨ **Typeform-style UI**: Beautiful, one-question-per-page interface
- 🌳 **Branching Logic**: Conditional question flows based on responses
- 📊 **Google Sheets Integration**: Questions configured in spreadsheet, responses auto-saved
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Premium Design**: Smooth animations, gradients, glassmorphism effects

## 📁 Project Structure

```
SRM CIA/
├── index.html              # Main survey page
├── style.css               # Typeform-style CSS
├── app.js                  # Survey logic & branch parser
├── sample-data.json        # Sample 12-question survey
├── google-apps-script.js   # Backend API for Google Sheets
├── README.md               # This file
└── docs/
    ├── SETUP.md            # Setup instructions
    └── DEPLOYMENT.md       # Deployment guide
```

## 🎯 How It Works

### 1. Configuration in Google Sheets

Questions, options, and branching logic are stored in a Google Sheet tab called `survey_config`:

| q_id | section | type | question_text | options | image_url | branch_logic |
|------|---------|------|---------------|---------|-----------|--------------|
| q_role | Screener | radio | What is your role? | Manager \| Team Lead \| IC | | default: q_next |
| q_checkpoint1 | Screener | radio | Are you in tech? | Yes \| No | | Yes: q_tech1 \| No: q_non_tech1 |

### 2. Branch Logic Syntax

- **Linear**: `default: q_next_id` - Always go to next question
- **Conditional**: `Manager: q_path_a | IC: q_path_b` - Route based on answer
- **Random**: `random: q_option_a | q_option_b` - A/B testing

### 3. Response Collection

Responses are automatically saved to the `responses` tab with:
- Timestamp
- All question responses
- Path taken through the survey

## 🛠️ Setup Instructions

### Step 1: Prepare Google Sheet

1. Open your Google Sheet: [Your Sheet Link](https://docs.google.com/spreadsheets/d/14m2BaVFEv1YWewCtwoTNZZaWE6uva-EBSTPiWzb6D5A/edit)

2. Create a new tab called `survey_config`

3. Add these column headers:
   - `q_id`
   - `section`
   - `type`
   - `question_text`
   - `options`
   - `image_url`
   - `branch_logic`

4. Copy the sample data from `sample-data.json` or create your own questions

5. Create another tab called `responses` (leave empty - it will auto-populate)

### Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**

2. Delete the default code and paste the content from `google-apps-script.js`

3. Click **Deploy → New Deployment**

4. Choose **Web App**:
   - **Execute as**: Me
   - **Who has access**: Anyone

5. Click **Deploy** and copy the Web App URL

6. Update `app.js` line 3:
   ```javascript
   APPS_SCRIPT_URL: 'YOUR_COPIED_URL_HERE'
   ```

7. Set `USE_SAMPLE_DATA: false` in `app.js` line 6

### Step 3: Test Locally

1. Open `index.html` in a web browser
2. Complete the survey
3. Check that responses appear in the `responses` tab

### Step 4: Deploy to Vercel

1. Create a GitHub repository and push your code

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Deploy with default settings

4. Share the Vercel URL with your team!

## 📝 Customization Guide

### Editing Questions

Simply edit the `survey_config` tab in Google Sheets. Changes appear immediately (no code changes needed).

### Changing Colors/Theme

Edit the CSS variables in `style.css`:

```css
:root {
    --primary: #6366f1;        /* Main color */
    --secondary: #ec4899;      /* Accent color */
    --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Adding Images

1. Upload your image to a hosting service (Imgur, Google Drive, etc.)
2. Get the direct image URL
3. Paste it in the `image_url` column for that question

## 🧪 Demo Mode

The app includes a demo mode with sample data:

- Set `USE_SAMPLE_DATA: true` in `app.js`
- Uses `sample-data.json` instead of Google Sheets
- Perfect for testing before deployment

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment
- [Branching Logic Examples](docs/BRANCHING.md) - Advanced routing patterns

## 🐛 Troubleshooting

**Survey won't load:**
- Check browser console for errors
- Verify Apps Script URL is correct
- Ensure Google Sheet is accessible

**Responses not saving:**
- Check Apps Script permissions
- Verify deployment settings (Anyone can access)
- Check `responses` tab exists

**Branching not working:**
- Verify branch_logic syntax matches examples
- Check for typos in option text matching
- Review browser console for warnings

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Support

For questions or issues, contact your development team.

---

**Built with ❤️ by the SRM CIA Team**
