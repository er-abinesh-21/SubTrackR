# SubTrackR 💳✨

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.10-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.15-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</div>

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7a31ff2c-af73-48a1-ba97-cef2b8f6c15a" />

<div align="center">
  <h3>🚀 Track, Manage, and Optimize Your Subscriptions</h3>
  <p>A modern web application to help you stay on top of your recurring subscriptions and manage your spending effectively.</p>
</div>

---

## ✨ Features

### 📊 **Dashboard Analytics**
- **Real-time spending overview** with total monthly and yearly costs
- **Category-wise breakdown** with interactive charts
- **Upcoming renewals** notification system
- **Active subscriptions counter** with quick stats

### 💼 **Subscription Management**
- ✅ Add, edit, and delete subscriptions
- ✅ Support for multiple billing cycles (Monthly/Yearly/One-time)
- ✅ Categorize subscriptions (Entertainment, Productivity, Cloud Storage, etc.)
- ✅ Track next payment dates with calendar integration
- ✅ Search and filter subscriptions
- ✅ Currency support for multiple regions

### 🔔 **Smart Notifications**
- Automated email reminders 7 days before renewal
- Supabase Edge Functions for serverless notifications
- Customizable reminder preferences

### 🎨 **Modern UI/UX**
- Dark theme with neon pink accents
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Glassmorphism effects
- Intuitive navigation

### 🔐 **Security & Authentication**
- Secure authentication via Supabase Auth
- Email/password login
- Protected routes and session management
- Row-level security for data protection

## 🛠️ Tech Stack

<table>
<tr>
<td>

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation

</td>
<td>

### Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Headless components
- **Lucide React** - Icons
- **Recharts** - Data visualization

</td>
</tr>
<tr>
<td>

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge Functions
- **Deno** - Edge function runtime

</td>
<td>

### DevOps
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **GitHub Workflows** - Automated tasks

</td>
</tr>
</table>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/SubTrackR.git
cd SubTrackR
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

Create a new Supabase project and run the following SQL to create the subscriptions table:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  next_due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:8080` to see the app running!

## 📁 Project Structure

```
SubTrackR/
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Feature components
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   ├── lib/             # Utility functions
│   ├── pages/           # Route pages
│   ├── types/           # TypeScript types
│   └── App.tsx          # Main app component
├── supabase/
│   └── functions/       # Edge functions
└── package.json
```

## 🔧 Configuration

### GitHub Secrets Required

For GitHub Actions workflows to work, add these secrets:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For Edge Functions (optional)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🌟 Key Components

### Login & Sign Up Page

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/309826f2-2f45-4a57-9160-d806c9373eb3" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/57fa8ff2-41a3-48e9-8f51-d9db931b98fe" />

### Dashboard
- Central hub showing all subscription metrics
- Interactive charts for spending analysis
- Quick actions for subscription management

### Subscription Form
- Intuitive form with validation
- Date picker for renewal dates
- Category selection with icons
- Multi-currency support

### Protected Routes
- Secure authentication flow
- Automatic redirects based on auth state
- Session persistence

## 🚢 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

3. Set up environment variables on your hosting platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the icon set

## 📧 Contact

Your Name - [Abinesh.B](https://github.com/er-abinesh-21)
Project Link: [https://github.com//SubTrackR](https://github.com/er-abinesh-21/SubTrackR)

---

<div align="center">
  <p>Built with ❤️ using React, TypeScript, and Supabase</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

