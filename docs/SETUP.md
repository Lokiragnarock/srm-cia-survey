# Google Sheets Setup Guide

This guide will walk you through setting up your Google Sheet for the dynamic survey form.

## 📋 Prerequisites

- Access to the Google Sheet: [Your Survey Sheet](https://docs.google.com/spreadsheets/d/14m2BaVFEv1YWewCtwoTNZZaWE6uva-EBSTPiWzb6D5A/edit)
- Edit permissions on the sheet

## Step 1: Create the `survey_config` Tab

1. Open your Google Sheet
2. Click the **+** button at the bottom to create a new tab
3. Rename it to exactly: `survey_config`

## Step 2: Add Column Headers

In the first row of the `survey_config` tab, add these headers (in order):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| q_id | section | type | question_text | options | image_url | branch_logic |

**Column Descriptions:**

- **q_id**: Unique identifier (e.g., `q_role`, `q_checkpoint1`)
- **section**: Grouping category (e.g., `Screener`, `Tech_Path`)
- **type**: Input type (currently only `radio` is supported, `image` for image questions)
- **question_text**: The question shown to users
- **options**: Answer choices separated by ` | ` (e.g., `Yes | No`)
- **image_url**: URL to image (optional, leave blank if no image)
- **branch_logic**: Navigation rules (see below)

## Step 3: Understand Branch Logic Syntax

### Linear Questions (Default)
Most questions just go to the next question:

```
default: q_next_question_id
```

**Example:**
```
default: q_tenure
```

### Checkpoint Questions (Conditional Branching)
These questions route users to different paths based on their answer:

```
Answer Text: q_destination_id | Another Answer: q_other_destination_id
```

**Example:**
```
Yes: q_tech_path1 | No: q_non_tech_path1
```

**Important Rules:**
- The text MUST match the option text exactly
- Use ` | ` (space-pipe-space) to separate rules
- Answer text is case-sensitive

### Random Split (A/B Testing)
For randomized surveys:

```
random: q_option_a | q_option_b
```

### Submit (End of Survey)
The last question should have:

```
submit
```

## Step 4: Add Your Questions

Here's a complete example of 3 questions:

| q_id | section | type | question_text | options | image_url | branch_logic |
|------|---------|------|---------------|---------|-----------|--------------|
| q_role | Screener | radio | What is your role? | Manager \| Team Lead \| IC | | default: q_tech |
| q_tech | Checkpoint | radio | Are you in tech? | Yes \| No | | Yes: q_tech1 \| No: q_non_tech1 |
| q_tech1 | Tech | radio | What's your stack? | Frontend \| Backend | | submit |
| q_non_tech1 | NonTech | radio | Which department? | Sales \| Marketing | | submit |

### Tips for Creating Questions:

1. **Start Simple**: Begin with 3-4 questions to test, then expand
2. **Unique IDs**: Make `q_id` descriptive (e.g., `q_work_location` not `q3`)
3. **Test Logic**: Trace the path on paper before adding to sheet
4. **Image URLs**: Use direct image links (Imgur, Google Drive, etc.)

## Step 5: Copy Sample Data (Optional)

You can copy the sample survey from `sample-data.json`:

1. Open `sample-data.json` in a text editor
2. Convert JSON to rows and paste into your sheet
3. OR manually type in your own questions

## Step 6: Create the `responses` Tab

1. Click the **+** button to create another new tab
2. Rename it to exactly: `responses`
3. **Leave it empty** - headers will be auto-generated when the first response is submitted

## Step 7: Format Your Sheet (Optional)

Make it easier to read:

1. **Freeze the header row**:
   - Select row 1
   - Click **View → Freeze → 1 row**

2. **Color the headers**:
   - Select the header row
   - Click the fill color icon
   - Choose a color (e.g., purple)

3. **Adjust column widths**:
   - Double-click column borders to auto-fit

## 🧪 Testing Your Configuration

### Quick Validation Checklist:

- [ ] All `q_id` values are unique
- [ ] First question's `q_id` appears in the dataset
- [ ] All questions in `branch_logic` exist as `q_id` somewhere
- [ ] Options are separated by ` | `
- [ ] Branch logic uses exact option text
- [ ] Last question(s) lead to `submit`

### Common Mistakes:

❌ **Wrong**: `Yes:q_tech1` (no space after colon)  
✅ **Correct**: `Yes: q_tech1`

❌ **Wrong**: `yes: q_tech1` (case mismatch)  
✅ **Correct**: `Yes: q_tech1` (if option is "Yes")

❌ **Wrong**: `default:q_next` (no space)  
✅ **Correct**: `default: q_next`

## 📝 Example: Complete Survey Config

Here's a minimal working survey:

```
q_id          | section   | type  | question_text              | options           | image_url | branch_logic
q_start       | Intro     | radio | Ready to begin?            | Yes | No          |           | default: q_role
q_role        | Screener  | radio | What is your role?         | Manager | IC       |           | Manager: q_mgr1 | IC: q_ic1
q_mgr1        | Manager   | radio | How many reports?          | 1-5 | 6+         |           | submit
q_ic1         | IC        | radio | Years of experience?       | <2 | 2-5 | 5+   |           | submit
```

## 🎯 Next Steps

Once your `survey_config` is ready:

1. ✅ Set up Google Apps Script (see `GOOGLE-APPS-SCRIPT-SETUP.md`)
2. ✅ Test locally with sample data
3. ✅ Deploy to production

## 🆘 Need Help?

**Issue**: "My branching isn't working"  
**Solution**: Check that option text in `branch_logic` exactly matches the text in `options`

**Issue**: "Survey shows blank question"  
**Solution**: Make sure the `q_id` in `branch_logic` exists in your sheet

**Issue**: "Can't find responses"  
**Solution**: Ensure the `responses` tab exists (create it if missing)

---

[← Back to README](../README.md) | [Next: Apps Script Setup →](GOOGLE-APPS-SCRIPT-SETUP.md)
