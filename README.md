# 🚀 Career Helper

> An AI-powered career development platform helping job seekers land their dream jobs through intelligent resume building, personalized career guidance, and adaptive interview practice.

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <img src="https://via.placeholder.com/800x400/1a1a1a/00D9FF?text=Career+Helper+App+Screenshot" alt="Career Helper Screenshot" />
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🤖 AI Career Assistant
- Real-time chat with AI for personalized career advice
- Interview preparation guidance and tips
- Career path recommendations based on goals
- Resume optimization suggestions
- Industry-specific insights

### 📄 Smart Resume Builder
- **Guided multi-section creation** with helpful tips
- **Auto-save functionality** using AsyncStorage
- **Guest mode support** - build without signing up
- **Seamless data transfer** to account upon sign-up
- Professional formatting and templates
- Export to PDF *(coming soon)*

### 🎯 Intelligent Interview Practice
- **60+ general interview questions** covering:
  - Behavioral questions
  - Situational scenarios
  - Technical concepts
- **Field-specific questions** for:
  - Software Engineering
  - Data Science
  - Marketing
  - Finance
  - Design
- **Smart question rotation** - no repeats until all questions are answered
- **Session resumption** - pick up exactly where you left off
- **Progress tracking** per user account
- **Timed practice** with 2-minute countdown
- **STAR method guidance** for behavioral interviews
- **Difficulty indicators** (Easy, Medium, Hard)

### 👥 Guest Mode System
- Full feature access without authentication
- LocalStorage persistence for guest data
- Strategic conversion prompts at key moments
- Automatic resume transfer to new accounts
- Zero data loss during conversion

### 📚 Interactive Tutorials
- Context-specific onboarding for each feature
- Always shows for guests (encourages exploration)
- One-time display for authenticated users
- STAR method explanation for interviews
- Resume building best practices

### 🔐 Security & Privacy
- Firebase Authentication (email/password)
- Comprehensive Firestore security rules
- Input sanitization on all user inputs
- Email validation with regex
- Rate limiting on authentication
- XSS prevention throughout

---

## 🎥 Demo

> **Demo Video:** [Watch on YouTube](#) *(Add your link)*

**Live Demo:** *(Coming soon - deployed on Expo)*

---

## 🛠️ Tech Stack

### **Frontend**
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **React Context API** - State management

### **Backend**
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage *(ready for implementation)*

### **Storage**
- **AsyncStorage** - Local data persistence
- **Guest resume storage** - Pre-authentication data
- **Interview progress tracking** - Per-user progress

### **AI/ML**
- AI-powered career assistant *(API integration)*
- Natural language processing for career guidance

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Git** - [Download](https://git-scm.com/)

**Optional:**
- **iOS Simulator** (Mac only) - Xcode
- **Android Emulator** - Android Studio

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/career-helper-app.git
cd career-helper-app
```

### 2. Install Dependencies

```bash
npm install
```

**OR**

```bash
yarn install
```

### 3. Install AsyncStorage

```bash
npm install @react-native-async-storage/async-storage
```

**OR** if using Expo:

```bash
npx expo install @react-native-async-storage/async-storage
```

### 4. Set Up Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Follow the setup wizard
4. Enable **Authentication** (Email/Password)
5. Create a **Firestore Database** (Start in production mode)

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register your app and copy the config

#### Create `firebase.ts`

Create a file named `firebase.ts` in your project root:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

⚠️ **IMPORTANT:** Never commit `firebase.ts` to Git! It's already in `.gitignore`.

### 5. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

If you don't have Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules
```

### 6. Start the Development Server

```bash
npx expo start
```

**OR**

```bash
npm start
```

### 7. Run on Device/Simulator

- **iOS:** Press `i` in terminal or scan QR with Camera app
- **Android:** Press `a` in terminal or scan QR with Expo Go app
- **Web:** Press `w` in terminal

---

## 💻 Usage

### First Time Setup

1. **Open the app** (as a guest or sign up)
2. **Explore features:**
   - Resume Builder - Create your professional resume
   - AI Assistant - Get career advice
   - Mock Interview - Practice with 60+ questions
   - Resources - Access career tips and guides

### As a Guest User

- ✅ Full access to all features
- ✅ Build complete resume
- ✅ Practice interview questions
- ✅ Chat with AI assistant
- ⚠️ Must sign up to view/download resume
- ✅ Data automatically transfers upon sign-up

### As an Authenticated User

- ✅ Everything guests can do
- ✅ View and download resume
- ✅ Progress saved across devices
- ✅ Resume stored in cloud
- ✅ Access from multiple devices

---

## 📁 Project Structure

```
career-helper-app/
│
├── app/                          # Main application screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── ResumeBuilder.tsx     # Resume creation interface
│   │   ├── MyAssistant.tsx       # AI chat assistant
│   │   ├── MyCareer.tsx          # Career planning tools
│   │   └── Resources.tsx         # Tips and guides
│   │
│   ├── _context/                 # React context providers
│   │   └── ResumeContext.tsx     # Resume state management
│   │
│   ├── _layout.tsx               # Root layout with navigation
│   ├── index.tsx                 # Landing/welcome screen
│   ├── SignIn.tsx                # Authentication screen
│   ├── MadeResume.tsx            # Resume preview/view
│   ├── MockInterview.tsx         # General interview practice
│   └── FieldSpecificInterview.tsx # Field-specific interviews
│
├── components/                   # Reusable UI components
│   ├── AssistantTutorial.tsx     # AI assistant onboarding
│   ├── ResumeTutorial.tsx        # Resume builder guide
│   ├── InterviewTutorial.tsx     # Interview practice guide
│   ├── OfflineIndicator.tsx      # Network status indicator
│   └── SimpleOfflineBanner.tsx   # Offline mode banner
│
├── utils/                        # Utility functions & managers
│   ├── GuestModeManager.ts       # Guest mode logic & conversion
│   ├── TutorialManager.ts        # Tutorial display logic
│   ├── InterviewProgressManager.ts # Question tracking & rotation
│   ├── InterviewQuestionBank.ts  # 60+ interview questions
│   ├── helpers.ts                # Input validation & sanitization
│   ├── responsive.ts             # Responsive design utilities
│   └── rateLimiter.ts            # Rate limiting for API calls
│
├── firebase.ts                   # Firebase configuration (NOT in repo)
├── firestore.rules               # Database security rules
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── app.json                      # Expo configuration
└── README.md                     # This file
```

---

## 🔑 Key Components

### InterviewProgressManager
Manages interview question tracking and rotation:

```typescript
// Get next 10 questions (never repeats until pool exhausted)
const { questions, progress } = await InterviewProgressManager.getNextQuestions('general');

// Mark question as answered
await InterviewProgressManager.markQuestionAnswered('general', questionId);

// Get statistics
const stats = await InterviewProgressManager.getStatistics('general');
// Returns: { totalQuestions: 60, askedQuestions: 15, percentageComplete: 25 }
```

### GuestModeManager
Handles guest mode and data transfer:

```typescript
// Check if user is in guest mode
const isGuest = await GuestModeManager.isGuestMode();

// Save guest resume
await GuestModeManager.saveGuestResume(resumeData);

// Transfer to authenticated account (called after sign-up)
await GuestModeManager.transferGuestResumeToUser();

// Show "sign up to view" prompt
GuestModeManager.showViewResumePrompt(() => {
  // Navigate to sign up
});
```

### TutorialManager
Controls tutorial display:

```typescript
// Check if user has seen tutorial
const hasSeen = await TutorialManager.hasSeen('resume');
// Returns false for guests (always show)
// Returns saved status for authenticated users

// Mark tutorial as seen
await TutorialManager.markTutorialAsSeen('resume');
// Saves for authenticated users only
```

---

## 🔐 Security

### Input Validation
All user inputs are sanitized and validated:

```typescript
// helpers.ts
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 10000); // Max length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Firestore Security Rules
Comprehensive rules protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only access their own data
    match /resumes/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // String length validation
    match /resumes/{userId} {
      allow write: if 
        request.resource.data.name.size() <= 100 &&
        request.resource.data.experiences.size() <= 5000;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Rate Limiting
Authentication attempts are rate-limited:

```typescript
// Client-side rate limiting
if (failedAttempts >= 5) {
  Alert.alert("Too Many Attempts", "Please wait before trying again.");
  return;
}
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Guest mode - Build resume without signing in
- [ ] Sign up - Create new account
- [ ] Resume transfer - Data moves to new account
- [ ] Interview practice - Questions load and track
- [ ] Session resumption - Exit and return mid-practice
- [ ] AI assistant - Send messages and receive responses
- [ ] Tutorials - Show for guests, once for authenticated
- [ ] Offline mode - App works without internet

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/career-helper-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Device/OS information

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow existing code structure
- Add comments for complex logic
- Update README if adding features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Expo](https://expo.dev/) - Development platform
- [React Native](https://reactnative.dev/) - Mobile framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- Community contributors and testers

---

## 📞 Contact

**Your Name** - [your.email@example.com](mailto:your.email@example.com)

**Project Link:** [https://github.com/yourusername/career-helper-app](https://github.com/yourusername/career-helper-app)

**LinkedIn:** [Your LinkedIn Profile](#)

**Twitter:** [@yourhandle](#)

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Resume Builder with guest mode
- ✅ AI Career Assistant
- ✅ 60+ Interview Questions
- ✅ Smart question rotation
- ✅ Progress tracking

### Version 1.1 (Coming Soon)
- [ ] PDF Resume Export
- [ ] ATS Optimization Scanner
- [ ] More question categories
- [ ] Dark mode support
- [ ] Interview recording & playback

### Version 2.0 (Future)
- [ ] Job board integration
- [ ] Company research tools
- [ ] Salary negotiation coach
- [ ] LinkedIn integration
- [ ] Application tracking
- [ ] Video interview practice with AI feedback
- [ ] Multi-language support

---

## 📊 Stats

![GitHub Stars](https://img.shields.io/github/stars/yourusername/career-helper-app?style=social)
![GitHub Forks](https://img.shields.io/github/forks/yourusername/career-helper-app?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/career-helper-app)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/yourusername/career-helper-app)

---

<p align="center">
  <strong>Built with ❤️ by [Your Name]</strong>
  <br>
  <sub>Helping job seekers land their dream jobs</sub>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Get Started</a> •
  <a href="#-contributing">Contribute</a> •
  <a href="#-license">License</a>
</p>

---

⭐ **Star this repo if you find it helpful!** ⭐
