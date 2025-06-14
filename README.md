# Collaborative Form Editor

A full-stack application built with Next.js and Supabase that allows users to create and fill out forms. The application includes user authentication, admin dashboard, and a collaborative form editor.

## Features

- User authentication (sign up and login)
- Admin and user roles
- Admin dashboard for form management
- Form editor with various field types
- Form submission and data collection
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-form-editor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Supabase project and set up the following tables:

### profiles table
```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  is_admin boolean default false,
  primary key (id)
);
```

### forms table
```sql
create table forms (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fields jsonb default '[]'::jsonb
);
```

### form_submissions table
```sql
create table form_submissions (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references forms not null,
  user_id uuid references auth.users not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

4. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Sign up for a new account
2. To make a user an admin, update their `is_admin` field to `true` in the Supabase dashboard
3. Admin users can:
   - Create new forms
   - Add form fields with different types
   - View and manage existing forms
4. Regular users can:
   - View available forms
   - Fill out and submit forms

## Technologies Used

- Next.js 14
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS
- React Hook Form 