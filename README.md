# SeekCa - Professional Services Platform

A comprehensive platform connecting technical professionals with clients who need their expertise.

## Features

- **User Management**: Role-based authentication for professionals and hirers
- **Job Management**: Post jobs, browse opportunities, apply to positions
- **Professional Profiles**: Showcase skills, licenses, portfolio, and reviews
- **Messaging System**: Real-time communication with file sharing
- **Project Management**: Track milestones, time, and payments
- **Reviews & Ratings**: Comprehensive review system with detailed feedback
- **Advanced Search**: Filter and find exactly what you're looking for

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be fully provisioned

2. **Get Your Supabase Credentials**
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key
   - Copy your service role key (keep this secret)

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Run Database Migrations**
   - The migration files are already created in `supabase/migrations/`
   - Apply them through the Supabase Dashboard:
     - Go to SQL Editor in your Supabase dashboard
     - Run each migration file in order (they're numbered)
   
   Or use the Supabase CLI:
   ```bash
   npx supabase db push
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Schema

The platform includes comprehensive database schema with:

- **User Management**: Profiles, roles, authentication
- **Job System**: Jobs, applications, categories
- **Messaging**: Conversations, messages, file attachments
- **Reviews**: Reviews, responses, helpful votes
- **Portfolio**: Professional portfolio items
- **Project Management**: Projects, milestones, time tracking
- **Search & Analytics**: Saved searches, job alerts, search analytics
- **Notifications**: Real-time notifications and preferences

### Key Features

#### For Professionals
- Create detailed profiles with skills and licenses
- Browse and apply to jobs
- Showcase work in portfolio
- Manage projects and track time
- Receive and respond to reviews

#### For Hirers
- Post job opportunities
- Browse professional profiles
- Manage applications and hire talent
- Track project progress
- Leave reviews for completed work

#### For Both
- Real-time messaging with file sharing
- Advanced search and filtering
- Notification system
- Secure payment processing (coming soon)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-specific dashboards
│   ├── jobs/              # Job-related pages
│   └── ...
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── database.ts       # Database queries
│   ├── supabase.ts       # Supabase client
│   └── ...
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.