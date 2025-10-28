# Portfolio CMS

A modern, feature-rich Content Management System (CMS) built specifically for managing and showcasing portfolios. Built with Nuxt.js, Vue 3, and Supabase.

## 🚀 Features

- **User Authentication**: Secure sign-up and sign-in functionality
- **Dashboard Interface**: Clean and intuitive dashboard for content management
- **Portfolio Sections Management**:
  - Projects
  - Experiences
  - Skills
  - Quick Links
  - Custom Blocks
- **Analytics**: Built-in tracking and analytics for portfolio views
- **Theme Support**: Light/Dark mode switching
- **Responsive Design**: Built with Tailwind CSS for full responsiveness
- **Security**: Implemented rate limiting and security headers
- **File Upload**: Integrated file management system

## 🛠️ Tech Stack

- **Frontend**:
  - Nuxt.js 4
  - Vue.js 3
  - Tailwind CSS
  - shadcn-nuxt components
- **Backend**:
  - Supabase
  - Nuxt Server Routes
- **Authentication**: Supabase Auth
- **Styling**:
  - Tailwind CSS
  - class-variance-authority
  - tailwind-merge

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/Kicksbld/cms-portfolio.git
cd cms-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Start the development server:

```bash
npm run dev
```

## 🏗️ Project Structure

```
├── app/                  # Application source
│   ├── assets/          # Static assets
│   ├── components/      # Vue components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Page layouts
│   ├── pages/          # Application pages
│   ├── plugins/        # Nuxt plugins
│   ├── stores/         # Pinia stores
│   └── types/          # TypeScript types
├── server/              # Server-side code
│   ├── api/            # API routes
│   ├── middleware/     # Server middleware
│   └── utils/          # Server utilities
└── public/             # Public static files
```

## 🔒 Security

This project implements several security measures:

- Authentication guards
- Input validation

For more details about security implementations, check `docs/SECURITY_COMPLETE.md`.

## 📊 Analytics

The platform includes built-in analytics features for tracking:

- Portfolio views
- Visitor interactions

For more information about analytics features, see `docs/PORTFOLIO_ANALYTICS.md`.


