# Debattle - The Chess.com of Debating

A modern, real-time debate platform built with React 19, TypeScript, and Vite. Challenge opponents worldwide, improve your argumentation skills, and climb the global leaderboard with our AI-powered judging system.

![Debattle](https://img.shields.io/badge/Debattle-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)

## 🚀 Features

### Core Functionality
- **Real-time Debate Matching** - Find opponents based on skill level and topic preferences
- **AI-Powered Judging** - Get instant feedback and scoring from Google Gemini AI
- **ELO Rating System** - Fair competitive ranking system with tier progression
- **Practice Mode** - Hone your skills against AI opponents with different personalities
- **Global Leaderboard** - Compete with debaters worldwide
- **Achievement System** - Unlock badges and track your progress

### User Experience
- **Modern UI/UX** - Beautiful, responsive design with dark/light mode
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Real-time Updates** - Live chat, typing indicators, and instant feedback
- **Mobile Responsive** - Optimized for all device sizes
- **Accessibility** - WCAG compliant with keyboard navigation

### Technical Features
- **TypeScript** - Full type safety and better developer experience
- **Firebase Integration** - Authentication, real-time database, and cloud functions
- **State Management** - Zustand for efficient state management
- **Performance Optimized** - Code splitting, lazy loading, and optimized bundles
- **SEO Ready** - Meta tags, structured data, and social sharing

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons

### Backend & Services
- **Firebase** - Authentication, Firestore, and hosting
- **Google Gemini AI** - AI judging and feedback
- **Zustand** - State management
- **React Router** - Client-side routing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vite** - Build tooling

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Google Gemini API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/debattle.git
   cd debattle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Google Gemini API
   VITE_GEMINI_API_KEY=your_gemini_api_key

   # App Configuration
   VITE_APP_TITLE=Debattle
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=development
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Google, Email/Password)
   - Create a Firestore database
   - Update the Firebase configuration in your `.env` file

5. **Google Gemini API**
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
debattle/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Common UI components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── debate/        # Debate interface components
│   │   ├── layout/        # Layout components
│   │   ├── leaderboard/   # Leaderboard components
│   │   ├── profile/       # Profile components
│   │   └── ui/            # Base UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── services/          # API and external services
│   ├── stores/            # Zustand state stores
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🎮 Usage

### Getting Started
1. **Sign Up/Login** - Use Google authentication or email/password
2. **Complete Profile** - Set your debate preferences and bio
3. **Find a Debate** - Browse topics and find opponents
4. **Start Debating** - Engage in real-time debates with AI judging
5. **Track Progress** - Monitor your rating, achievements, and statistics

### Features Overview

#### Dashboard
- View your current rating and tier
- See recent activity and statistics
- Quick access to find debates and practice mode

#### Find Debate
- Browse trending topics by category and difficulty
- Search for specific topics or opponents
- Join matchmaking queue or create custom debates

#### Practice Mode
- Practice against AI opponents with different personalities
- Choose from beginner to advanced difficulty levels
- Get instant feedback and tips for improvement

#### Leaderboard
- View global rankings by rating, games played, or win rate
- Filter by tier (Bronze to Diamond)
- Search for specific players

#### Profile & History
- View detailed debate history with results and ratings
- Manage account settings and preferences
- Track achievements and progress

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The app can be deployed to any static hosting platform:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Conventional commits for version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons

## 📞 Support

- **Documentation**: [docs.debattle.com](https://docs.debattle.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/debattle/issues)
- **Discord**: [Join our community](https://discord.gg/debattle)
- **Email**: support@debattle.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic debate interface
- ✅ User authentication
- ✅ Leaderboard system
- ✅ Practice mode

### Phase 2 (Next)
- 🔄 Real-time debate rooms
- 🔄 AI judging integration
- 🔄 Tournament system
- 🔄 Spectator mode

### Phase 3 (Future)
- 📋 Voice/video debates
- 📋 Advanced analytics
- 📋 Mobile app
- 📋 API for third-party integrations

---

**Made with ❤️ by the Debattle Team**
