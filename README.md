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
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

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

> **Demo Video:** *Coming soon*

**Screenshots:**

<p align="center">
  <img src="https://via.placeholder.com/250x500/1a1a1a/00D9FF?text=Resume+Builder" alt="Resume Builder" />
  <img src="https://via.placeholder.com/250x500/1a1a1a/00D9FF?text=AI+Assistant" alt="AI Assistant" />
  <img src="https://via.placeholder.com/250x500/1a1a1a/00D9FF?text=Interview+Practice" alt="Interview Practice" />
</p>

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
- AI-powered career assistant *(Gemini API)*
- Natural language processing for career guidance

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

**Key Features:**
- Smart question rotation algorithm
- Session resumption support
- Per-user progress tracking
- Automatic pool reset after all questions answered

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

**Key Features:**
- Seamless guest-to-user conversion
- Automatic data transfer to Firestore
- Zero data loss during conversion
- Strategic conversion prompts

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

**Key Features:**
- Guest-aware tutorial system
- Always shows for guests
- One-time display for authenticated users
- Per-feature tutorial tracking

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

### Security Features
- ✅ Input sanitization on all user inputs
- ✅ Email validation with regex
- ✅ Firestore security rules prevent unauthorized access
- ✅ XSS prevention throughout
- ✅ Rate limiting on authentication
- ✅ Firebase credentials never committed to repository

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Resume Builder with guest mode
- ✅ AI Career Assistant
- ✅ 60+ Interview Questions
- ✅ Smart question rotation
- ✅ Progress tracking
- ✅ Session resumption
- ✅ Tutorial system

### Version 1.1 (Coming Soon)
- [ ] PDF Resume Export
- [ ] ATS Optimization Scanner
- [ ] More question categories (100+ questions)
- [ ] Dark mode support
- [ ] Interview recording & playback
- [ ] Enhanced AI responses

### Version 2.0 (Future)
- [ ] Job board integration
- [ ] Company research tools
- [ ] Salary negotiation coach
- [ ] LinkedIn integration
- [ ] Application tracking system
- [ ] Video interview practice with AI feedback
- [ ] Multi-language support
- [ ] Networking tools
- [ ] Skills assessment quizzes
- [ ] Learning path recommendations

### Long-term Vision
- [ ] Employer dashboard for job postings
- [ ] Community features (connect with job seekers)
- [ ] Advanced analytics dashboard
- [ ] Mobile app optimization
- [ ] Web version
- [ ] Chrome extension for job applications

---

## 💡 Key Innovations

### 1. Guest Mode with Seamless Conversion
Unlike traditional apps that gate features behind authentication, Career Helper allows full exploration in guest mode. When users are ready to save their work, their data seamlessly transfers to their new account with zero loss.

### 2. Smart Interview Question Rotation
The app tracks which questions each user has answered and ensures no repeats until all 60 questions have been practiced. Once the pool is exhausted, it resets automatically - providing endless practice without monotony.

### 3. Adaptive Tutorial System
Tutorials intelligently adapt based on user type:
- **Guests:** See tutorials every time (encourages exploration)
- **Authenticated users:** See tutorials once (respects experience)

### 4. Session Resumption
Users can exit interview practice mid-session and return later to continue exactly where they left off. No progress is lost.

### 5. Offline-First Architecture
Built with AsyncStorage, the app functions fully offline. Data syncs to Firebase when connection is restored.

---

## 🏆 Technical Achievements

- **Type-Safe Codebase:** 100% TypeScript for reliability
- **Comprehensive Security:** Input validation, Firestore rules, rate limiting
- **Smart Algorithms:** Question rotation, progress tracking, session management
- **Seamless UX:** Guest mode, auto-save, smooth animations
- **Production-Ready:** Error handling, loading states, edge cases covered
- **Scalable Architecture:** Easy to add features, questions, and user types
- **Clean Code:** Well-documented, organized, maintainable

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Career Helper

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
- Open source community for inspiration and support

---

## 📊 Project Statistics

- **Lines of Code:** ~15,000+
- **Components:** 20+
- **Interview Questions:** 60+ (general) + 50+ (field-specific)
- **Languages:** TypeScript, JavaScript
- **Development Time:** Several weeks
- **Features:** 5 major features fully implemented

---

<p align="center">
  <strong>Built with ❤️ for job seekers worldwide</strong>
  <br>
  <sub>Empowering careers through technology</sub>
</p>

---

⭐ **If this project helps you, consider giving it a star!** ⭐
