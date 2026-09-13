# Admin Login Credentials

## Primary Admin Account

**Email**: `maseraytemneblog@gmail.com`  
**Password**: `Admin2026@`  
**Role**: `superadmin`

---

## How to Login

1. Navigate to: `https://yourapp.vercel.app/admin/login` (or `http://localhost:3000/admin/login` locally)
2. Enter email: `maseraytemneblog@gmail.com`
3. Enter password: `Admin2026@`
4. Click "Sign In"

---

## What You Can Do

As a superadmin, you have full access to:

### Content Management
- ✅ Create, edit, delete news articles
- ✅ Create, edit, delete events (with cover images)
- ✅ Publish/unpublish announcements
- ✅ Send member notifications

### Member Management
- ✅ Add, edit, view member profiles
- ✅ Upload member profile photos
- ✅ Manage member status (ACTIVE, INACTIVE, SUSPENDED)
- ✅ Reset member PINs
- ✅ View member contribution history

### Assistance Requests
- ✅ Review assistance requests from members
- ✅ Update request status (SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED)
- ✅ View supporting documents and images
- ✅ Add decision notes and approvals
- ✅ Send approval/rejection emails

### Financial Management
- ✅ Record payouts and disbursements
- ✅ Upload payment proof images
- ✅ View contribution history
- ✅ Export contribution reports
- ✅ Manage contribution periods

### Site Configuration
- ✅ Update founder profile and photo
- ✅ Configure site settings
- ✅ View audit logs

---

## Security Notes

- ✅ Credentials are hashed and stored securely in PostgreSQL
- ✅ Do not share login credentials with untrusted parties
- ✅ Login sessions are protected with JWT tokens
- ✅ All admin actions are logged in audit trail
- ✅ Password change available in admin settings

---

## First Time Setup

1. Log in with provided credentials
2. Go to `/admin` dashboard
3. Navigate to Site Settings (`/admin/site`)
4. Update founder information if needed
5. Create your first news article or event
6. Add some members to the system

---

## Password Change

To change password in the future:
```bash
# Run from project directory
npm run create-admin -- "maseraytemneblog@gmail.com" "YourNewPassword123@" "Maseray Admin"
```

Replace `YourNewPassword123@` with your new password.

---

## Support

For issues with admin access:
1. Verify email and password are correct
2. Check that DATABASE_URL environment variables are set
3. Ensure authentication cookies are enabled in browser
4. Try clearing browser cache and cookies
5. Check Vercel logs for detailed error messages

---

## Related Documentation

- [README.md](./README.md) - Project overview
- [UPLOADTHING_SETUP.md](./UPLOADTHING_SETUP.md) - Image upload setup
- [IMAGE_DISPLAY_GUIDE.md](./IMAGE_DISPLAY_GUIDE.md) - Image display locations
