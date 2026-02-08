# How to Upload Files to GitHub - Step by Step

## 📋 Repository Information

**Repository URL**: https://github.com/wandermate123/tryb_studio.git

---

## ✅ Step 1: Verify Everything is Ready

Your files are already committed and ready to push. The repository is configured correctly.

---

## 🔐 Step 2: Get Your Personal Access Token

You need a token from the **wandermate123** GitHub account:

1. **Go to**: https://github.com/settings/tokens
   - Make sure you're logged in as **wandermate123**

2. **Click**: "Generate new token (classic)"

3. **Configure the token**:
   - **Note**: `tryb-studio-deploy` (or any name you like)
   - **Expiration**: Choose 90 days or "No expiration"
   - **Select scopes**: Check **`repo`** (this gives full repository access)

4. **Click**: "Generate token" at the bottom

5. **IMPORTANT**: Copy the token immediately (it starts with `ghp_`)
   - You won't be able to see it again!
   - It looks like: `ghp_AbCdEf1234567890...`

---

## 🚀 Step 3: Push Your Files

Open Terminal and run:

```bash
cd "/Users/ayushsingh/Desktop/Trybs page 1 "
git push -u origin main
```

---

## 📝 Step 4: Enter Credentials

When Git prompts you:

### First Prompt:
```
Username for 'https://github.com': 
```
**Type**: `wandermate123`  
**Press**: Enter

### Second Prompt:
```
Password for 'https://wandermate123@github.com': 
```
**Paste**: Your Personal Access Token (the `ghp_...` token)  
**Press**: Enter

**Note**: The password field won't show anything as you type - this is normal for security!

---

## ✅ Step 5: Verify Upload

After successful push, you'll see:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/wandermate123/tryb_studio.git
 * [new branch]      main -> main
```

**Then check**: https://github.com/wandermate123/tryb_studio
- You should see all your files (index.html, styles.css, script.js, images/, videos/, etc.)

---

## 🆘 Troubleshooting

### "Authentication failed"
- Make sure you're using the **token**, not your GitHub password
- Verify the token has `repo` scope
- Check you're using username: `wandermate123`

### "Repository not found"
- Make sure the repository exists: https://github.com/wandermate123/tryb_studio
- Verify you have write access to the repository
- Check the repository name is correct: `tryb_studio` (with underscore)

### "Permission denied"
- Verify the token has `repo` permissions
- Make sure you're logged in as `wandermate123` when creating the token

### "Could not read Username"
- Make sure you're in the correct directory
- Try running the command again

---

## 📊 What Will Be Uploaded

- ✅ `index.html` - Main website file
- ✅ `styles.css` - Stylesheet
- ✅ `script.js` - JavaScript
- ✅ `vercel.json` - Vercel configuration
- ✅ `images/` folder - All photography images
- ✅ `videos/` folder - All video files
- ✅ `fonts/` folder - Font files

**Total**: All essential files for your portfolio website

---

## 🎯 Quick Summary

1. Get token from: https://github.com/settings/tokens (wandermate123 account)
2. Run: `git push -u origin main`
3. Username: `wandermate123`
4. Password: `[paste your token]`
5. Done! Check: https://github.com/wandermate123/tryb_studio

---

## 🚀 After Upload

Once your files are on GitHub, you can:
1. **Deploy to Vercel** - Connect the GitHub repository
2. **Enable GitHub Pages** - Settings > Pages
3. **Share your repository** - Others can see your code

Your portfolio will be ready to deploy! 🎉
