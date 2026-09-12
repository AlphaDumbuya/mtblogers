# Maseray Temne Blogger Fund (MTB) 🌍

A **community mutual-support fund platform** — members pool contributions so that whenever anyone faces hardship, the fund can step in and help.

## Overview

The MTB Fund is a web-based platform designed to help the Temne community manage collective resources. Members make regular contributions, and when someone faces medical emergencies, funerals, education costs, or other hardships, the fund provides assistance.

### Key Features

- **Member Management**: Register and manage community members with unique codes
- **Contribution Tracking**: Record and track all fund contributions with multiple payment methods
- **Assistance Requests**: Members can submit requests for help with categorized needs
- **Payout Management**: Track all fund disbursements with approval workflows
- **Admin Dashboard**: Comprehensive admin interface for fund oversight
- **Public Site**: Information pages, news, events, and contributions transparency
- **Member Portal**: Members can view their history, requests, and notifications

---

## Tech Stack

- **Framework**: Next.js 16+ (React, TypeScript)
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom session-based auth
- **Email**: Brevo (Sendinblue)
- **Payments**: Monime (mobile money integration)
- **File Uploads**: UploadThing
- **Styling**: CSS-in-JS + custom admin CSS
- **ORM**: Prisma

---

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Neon account)
- Environment variables configured

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlphaDumbuya/mtblogers.git
   cd mtblogers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your database credentials, API keys, and other settings
   ```bash
   cp .env.example .env.local
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Create admin user** (if needed)
   ```bash
   npx prisma db seed  # if seed script exists
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your_secret_key_here

# Brevo (Email Service)
BREVO_API_KEY=your_api_key
BREVO_FROM_EMAIL=noreply@example.com
BREVO_FROM_NAME="Fund Name"

# Monime (Payments)
MONIME_API_KEY=your_api_key
MONIME_SPACE_ID=your_space_id
MONIME_WEBHOOK_SECRET=your_webhook_secret

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CHECKOUT_SUCCESS_URL=http://localhost:3000/success
CHECKOUT_CANCEL_URL=http://localhost:3000
```

See `.env.example` for all available options.

---

## Project Structure

```
mtblogers/
├── app/
│   ├── admin/              # Admin dashboard pages & components
│   │   ├── announcements/
│   │   ├── contributions/
│   │   ├── members/
│   │   ├── payouts/
│   │   ├── periods/
│   │   ├── posts/
│   │   ├── requests/
│   │   └── admin.css       # Admin styling
│   ├── (public)/            # Public site pages (about, news, events, etc.)
│   ├── (member)/            # Member portal (dashboard, history, notifications)
│   ├── api/                 # API routes (admin & member endpoints)
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Prisma client
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data (if exists)
├── public/
│   ├── logo.png
│   └── ...
├── .env.example            # Environment variables template
├── .env.local              # Local env (excluded from git)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development

### Running the development server
```bash
npm run dev
```

### Building for production
```bash
npm run build
npm start
```

### Database commands
```bash
# Sync schema with database
npx prisma db push

# Open Prisma Studio (visual DB editor)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

### Code quality
```bash
# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint
```

---

## Admin Panel Features

### Dashboard
- Overview of fund statistics
- Quick access to all major sections
- Recent activities and pending items

### Members
- Add and manage community members
- Assign unique member codes
- Track member status (ACTIVE, INACTIVE, SUSPENDED)
- View member contribution and request history

### Contributions
- Record fund contributions from members
- Track payment methods and status
- Search and filter contributions
- Export contribution data as CSV

### Assistance Requests
- Review member assistance requests
- Categorize requests (Medical, Funeral, Education, etc.)
- Track request status (SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → DISBURSED)
- Attach supporting documents

### Payouts
- Record fund disbursements
- Link payouts to assistance requests
- Track disbursement methods and dates

### News & Events
- Create and publish news articles and event announcements
- Schedule future posts
- Manage rich content

### Announcements
- Send urgent fund announcements to members
- Tag announcements (UPDATE, IMPORTANT, EVENT)
- Control publication status

### Periods
- Create monthly/quarterly contribution periods
- Set expected amounts and due dates
- Track collection progress

---

## Member Portal Features

### Dashboard
- Fund statistics and personal contribution summary
- Recent news and announcements
- Quick access to assistance requests

### Contribution History
- View all personal contributions
- Track payment history and status

### Assistance Requests
- Submit new assistance requests
- Upload supporting documents
- Track request status in real-time
- Receive updates on approvals/disbursements

### Notifications
- Real-time notifications for important updates
- Request status changes
- Fund announcements

---

## Public Site

### Pages
- **Home**: Fund overview and latest news
- **About**: Initiative background and mission
- **Members**: Community member directory
- **News**: Latest blog posts and updates
- **Events**: Upcoming community events
- **Contributions**: Public transparency on fund activities
- **Announcements**: Important fund announcements

---

## API Routes

### Admin Routes
- `POST /api/admin/login` — Admin authentication
- `POST /api/admin/members` — Create/manage members
- `POST /api/admin/contributions` — Record contributions
- `POST /api/admin/requests` — Submit assistance requests
- `POST /api/admin/payouts` — Record payouts
- `GET /api/admin/contributions/export` — Export contributions

### Member Routes
- `POST /api/member/login` — Member authentication
- `GET /api/member/notifications/read-all` — Mark notifications as read

### Webhooks
- `POST /api/webhooks/monime` — Payment webhook handler

---

## Security Considerations

### Environment Variables
- ✅ `.env.local` and `.env` are excluded from git (see `.gitignore`)
- ✅ All sensitive keys (database, API keys) are in environment variables only
- ✅ Never commit `.env.local` or any environment files

### Authentication
- Session-based authentication with secure cookies
- Admin and member authentication separated
- AUTH_SECRET should be a strong random string

### Database
- Prisma provides SQL injection protection via parameterized queries
- Use migrations for schema changes
- Never expose database URLs in code

### API Security
- Validate all user inputs
- Check authorization before operations
- Use HTTPS in production

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Platforms
- Ensure Node.js 18+ is available
- Set all environment variables
- Run `npm run build` before start
- Start with `npm start`

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## License

This project is proprietary and for use by the Maseray Temne Blogger Fund community.

---

## Support

For questions or issues, contact the fund administrators or open an issue in this repository.

---

## Credits

Built with ❤️ for the Temne community.

**Initiative**: Support the Temne community, together 🤝
