# Deployment Guide

This guide covers deploying your survey form to the web using Vercel (free hosting).

## 🌐 Deployment Options

You have several options for hosting:

1. **Vercel** (Recommended) - Free, fast, automatic deployments
2. **GitHub Pages** - Free, simple, good for static sites
3. **Netlify** - Free, similar to Vercel
4. **Your own server** - Full control

This guide focuses on **Vercel** (easiest and most professional).

---

## 🚀 Deploying to Vercel

### Prerequisites

- [ ] Google Apps Script deployed (see [GOOGLE-APPS-SCRIPT-SETUP.md](GOOGLE-APPS-SCRIPT-SETUP.md))
- [ ] Apps Script URL added to `app.js`
- [ ] Survey config populated in Google Sheets
- [ ] GitHub account (free)

### Step 1: Prepare Your Code for Production

1. Open `app.js` and verify:
   ```javascript
   const CONFIG = {
       APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_URL/exec',
       USE_SAMPLE_DATA: false,  // ← Must be false for production
   };
   ```

2. Test locally one more time:
   - Open `index.html` in browser
   - Complete survey
   - Verify response appears in Google Sheets

### Step 2: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in

2. Click **New repository** (green button)

3. Fill in details:
   - **Name**: `srm-cia-survey` (or your choice)
   - **Description**: "Dynamic survey form with branching logic"
   - **Visibility**: Public or Private (your choice)
   - **Don't** initialize with README (we already have files)

4. Click **Create repository**

### Step 3: Push Your Code to GitHub

#### Option A: Using GitHub Desktop (Easier)

1. Download [GitHub Desktop](https://desktop.github.com/)

2. Click **File → Add Local Repository**

3. Browse to `G:\My Drive\SRM CIA\`

4. Click **Publish repository**

#### Option B: Using Command Line

1. Open PowerShell in your project folder:
   ```powershell
   cd "G:\My Drive\SRM CIA"
   ```

2. Initialize git:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Dynamic survey form"
   ```

3. Connect to GitHub:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/srm-cia-survey.git
   git branch -M main
   git push -u origin main
   ```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)

2. Click **Sign Up** → **Continue with GitHub**

3. Authorize Vercel to access your GitHub

4. Click **Import Project**

5. Find your repository (`srm-cia-survey`) and click **Import**

6. Configure project:
   - **Project Name**: `srm-cia-survey` (or custom)
   - **Framework Preset**: Other (default)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

7. Click **Deploy**

8. Wait ~30 seconds while Vercel deploys...

9. 🎉 **Success!** You'll see a confetti animation and your live URL:
   ```
   https://srm-cia-survey.vercel.app
   ```

### Step 5: Test Production Deployment

1. Click **Visit** to open your live survey

2. Complete a test submission

3. Verify the response appears in your Google Sheets `responses` tab

4. Share the URL with your team!

---

## 🔧 Vercel Configuration (Advanced)

### Custom Domain

Want a custom domain like `survey.yourcompany.com`?

1. In Vercel dashboard, go to your project

2. Click **Settings → Domains**

3. Add your domain and follow DNS instructions

### Environment Variables

If you want to keep the Apps Script URL private:

1. In `app.js`, change:
   ```javascript
   APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL || '',
   ```

2. In Vercel dashboard → **Settings → Environment Variables**

3. Add:
   - **Key**: `APPS_SCRIPT_URL`
   - **Value**: Your Apps Script URL

### Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

This ensures proper routing and caching.

---

## 📄 Alternative: GitHub Pages

### Quick Deploy to GitHub Pages

1. Push your code to GitHub (see Step 3 above)

2. Go to your repository on GitHub

3. Click **Settings → Pages**

4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`

5. Click **Save**

6. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/srm-cia-survey/
   ```

**Note**: GitHub Pages may take 5-10 minutes for the first deployment.

---

## 🌍 Alternative: Netlify

1. Go to [netlify.com](https://www.netlify.com)

2. Click **Sign up → GitHub**

3. Click **Add new site → Import from Git**

4. Select your repository

5. Click **Deploy**

6. Your site will be live at:
   ```
   https://random-name-123.netlify.app
   ```

You can customize the subdomain in **Site settings → Domain management**.

---

## 📊 Updating Your Survey

### To Update Questions:

1. Edit the `survey_config` tab in Google Sheets
2. Changes appear immediately (no redeployment needed!)

### To Update Code (HTML/CSS/JS):

1. Make changes locally

2. Push to GitHub:
   ```powershell
   git add .
   git commit -m "Update survey UI"
   git push
   ```

3. Vercel auto-deploys in ~30 seconds

---

## 🔐 Security Best Practices

### For Public Surveys:

- ✅ Use the default setup (works fine)
- ✅ Monitor responses for spam
- ✅ Add rate limiting if needed (via Vercel/Netlify)

### For Internal/Sensitive Surveys:

1. **Password Protection** (Vercel):
   - Go to **Settings → Deployment Protection**
   - Enable **Vercel Authentication**
   - Only users you invite can access

2. **Google Sign-In**:
   - Update Google Apps Script deployment to "Anyone with Google account"
   - Users must sign in to submit

3. **Custom Auth**:
   - Add authentication layer to `app.js`
   - Store credentials in environment variables

---

## 📈 Monitoring & Analytics

### View Response Data:

- Open Google Sheets `responses` tab
- Responses appear in real-time
- Download as CSV: **File → Download → CSV**

### Vercel Analytics:

1. In Vercel dashboard, go to **Analytics**
2. See visitor count, page views, performance metrics

### Google Analytics (Optional):

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace `GA_MEASUREMENT_ID` with your actual ID.

---

## 🐛 Troubleshooting Deployment

### Vercel deployment failed
**Solution**: Check build logs in Vercel dashboard for specific error

### Form loads but doesn't submit
**Solution**: 
- Verify Apps Script URL in `app.js`
- Check browser console (F12) for errors
- Ensure `USE_SAMPLE_DATA` is `false`

### "Mixed Content" error (HTTP/HTTPS)
**Solution**: Ensure Apps Script URL uses `https://`

### Slow loading
**Solution**: 
- Optimize images (compress, use CDN)
- Check Google Sheets response time
- Consider caching survey config

---

## ✅ Post-Deployment Checklist

- [ ] Live URL works
- [ ] Test submission creates row in Google Sheets
- [ ] All question branches work correctly
- [ ] Mobile responsive (test on phone)
- [ ] Share URL with team
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (optional)
- [ ] Enable password protection if needed

---

## 🎯 Next Steps

Your survey is now live! 🎉

1. **Share the URL** with your respondents
2. **Monitor responses** in Google Sheets
3. **Update questions** as needed (just edit the sheet!)
4. **Export data** for analysis when ready

---

[← Back to Apps Script Setup](GOOGLE-APPS-SCRIPT-SETUP.md) | [Back to README](../README.md)
