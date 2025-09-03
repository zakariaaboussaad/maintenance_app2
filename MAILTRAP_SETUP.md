# Mailtrap.io Setup Guide

## Step 1: Create Mailtrap Account
1. Go to https://mailtrap.io
2. Click "Sign Up" (free account)
3. Use your email to register
4. Verify your email address

## Step 2: Create Inbox
1. After login, you'll see the dashboard
2. Click "Add Inbox" or use the default "My Inbox"
3. Name it "Password Reset Testing"

## Step 3: Get SMTP Credentials
1. Click on your inbox
2. Go to "SMTP Settings" tab
3. Select "Laravel 9+" from dropdown
4. Copy the credentials shown

## Step 4: Update .env File
Replace your mail settings with these values from Mailtrap:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@maintenance.com"
MAIL_FROM_NAME="Maintenance System"
```

## Step 5: Clear Config Cache
```bash
php artisan config:clear
```

## Step 6: Test Password Reset
1. Create user with any email (doesn't need to be real)
2. Request password reset
3. Admin approves reset
4. Check Mailtrap inbox - you'll see the email with new password!

## Benefits of Mailtrap:
- ✅ See actual email content and formatting
- ✅ Test without sending real emails
- ✅ No need for real email credentials
- ✅ Free for testing (up to 100 emails/month)
- ✅ Works with any email address in your app

## Example Mailtrap Credentials:
```
Host: sandbox.smtp.mailtrap.io
Port: 2525
Username: 1a2b3c4d5e6f7g
Password: 9h8i7j6k5l4m3n
```

Your emails will appear in the Mailtrap web interface instead of real inboxes.
