# Deployment Guide - MTB Fund Platform

## ⚠️ Important: GitHub Pages Won't Work

**Your application is a full-stack Next.js app** with:
- ✅ Server-side API routes (`/api/*`)
- ✅ Database queries (Prisma + PostgreSQL)
- ✅ Authentication & sessions
- ✅ Dynamic server-side rendering

**GitHub Pages only hosts static HTML sites**, so it cannot run this application.

---

## ✅ Recommended: Deploy to Vercel

Vercel is the official Next.js hosting platform and makes deployment effortless.

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git status
git push origin main
```

### Step 2: Connect to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** and choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Click **"New Project"**
5. Find and select the **`mtblogers`** repository
6. Click **"Import"**

### Step 3: Configure Environment Variables

Vercel will show a screen to add environment variables. Add all of these:

```
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-XXXXX-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-XXXXX.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

AUTH_SECRET=your-secret-key-here (use a strong random string)

BREVO_API_KEY=xkeysib-XXXXX...

BREVO_FROM_EMAIL=noreply@maseraytemne.org

BREVO_FROM_NAME=Maseray Temne Blogger Fund

MONIME_API_KEY=your-monime-api-key

MONIME_SPACE_ID=your-monime-space-id

MONIME_WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app (update after deployment)

CHECKOUT_SUCCESS_URL=https://your-app.vercel.app/success

CHECKOUT_CANCEL_URL=https://your-app.vercel.app
```

⚠️ **Keep these secret!** Never commit these to GitHub.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://mtblogers.vercel.app`

### Step 5: Update Environment Variables

After deployment, update the URL variables:

1. Go to your **Vercel Project Dashboard**
2. Click **"Settings"** → **"Environment Variables"**
3. Update `NEXT_PUBLIC_BASE_URL` to your actual Vercel domain
4. Update `CHECKOUT_SUCCESS_URL` and `CHECKOUT_CANCEL_URL`
5. Redeploy: Click **"Deployments"** → **"Redeploy"**

---

## Alternative Platforms

### **Railway.app**

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Add environment variables
5. Railway auto-detects Next.js and deploys

### **Render.com**

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

### **AWS Amplify**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New App"** → **"Host Web App"**
3. Select GitHub
4. Authorize and select your repository
5. Configure build settings (auto-detected for Next.js)
6. Add environment variables
7. Deploy

---

## Post-Deployment Setup

### 1. Update Your Domain

If using a custom domain (e.g., `mtbfund.com`):

**On Vercel:**
1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration steps

### 2. Create Admin User

Once deployed, create your first admin account:

```bash
npm run create-admin
# Follow prompts to create admin credentials
```

Or use Prisma Studio:
```bash
npx prisma studio
# Navigate to the Admin table and add a record manually
```

### 3. Test the Application

- **Admin Panel**: `https://your-domain.com/admin/login`
- **Public Site**: `https://your-domain.com`
- **Member Portal**: `https://your-domain.com/member/login`

### 4. Configure Payment Webhook

For Monime payments to work:

1. Go to your Monime dashboard
2. Find **Webhook Settings**
3. Set webhook URL to: `https://your-domain.com/api/webhooks/monime`
4. Set webhook secret (add to `.env` as `MONIME_WEBHOOK_SECRET`)

---

## Troubleshooting

### Build Fails on Vercel

Check the build logs:
1. Go to **Deployments** → **Failed Deployment**
2. Click **"View Build Logs"**
3. Look for errors related to:
   - Missing environment variables
   - Database connection issues
   - Missing dependencies

### Database Connection Issues

Verify your database URL:
```bash
# Test connection locally
DIRECT_DATABASE_URL=your_url npx prisma db push
```

### "Module not found" errors

Ensure `prisma generate` runs:
```bash
npm run build
# Should run: prisma generate && next build
```

---

## Security Checklist

- ✅ Environment variables are set in Vercel (not in `.env.local`)
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `AUTH_SECRET` is a strong random string
- ✅ Database credentials are secure
- ✅ API keys are not exposed in logs
- ✅ HTTPS is enabled (automatic on Vercel)

---

## Monitoring

### View Logs

**On Vercel:**
1. Go to **Deployments** → **Recent Deployment**
2. Click **"Logs"** or **"Runtime Logs"**

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable deployment failure alerts
3. Add your email

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Pooler connection (runtime) | `postgresql://...?sslmode=require` |
| `DIRECT_DATABASE_URL` | Direct connection (Prisma CLI) | `postgresql://...?sslmode=require` |
| `AUTH_SECRET` | Session encryption key | Random 32+ char string |
| `BREVO_API_KEY` | Email service API | From Brevo dashboard |
| `BREVO_FROM_EMAIL` | Sender email address | `noreply@domain.com` |
| `BREVO_FROM_NAME` | Sender display name | `Fund Name` |
| `MONIME_API_KEY` | Payment processor API | From Monime |
| `MONIME_SPACE_ID` | Monime space identifier | From Monime |
| `MONIME_WEBHOOK_SECRET` | Webhook signature key | Set in Monime dashboard |
| `NEXT_PUBLIC_BASE_URL` | App base URL (public) | `https://your-domain.com` |
| `CHECKOUT_SUCCESS_URL` | Payment success redirect | `https://your-domain.com/success` |
| `CHECKOUT_CANCEL_URL` | Payment cancel redirect | `https://your-domain.com` |

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs/frameworks/nextjs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma**: https://www.prisma.io/docs/deploy/

---

**Your app is ready to deploy! Choose Vercel for the easiest experience.** 🚀
