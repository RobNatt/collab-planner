# Collab Planner

A collaborative planning application built with React, Firebase, and Vite. Create shared plans for vacations, events, or projects, and manage tasks collaboratively with your team.

## 🚀 Features

### Current Features
- **User Authentication** - Secure sign up, login, and logout with Firebase Auth
- **Plan Management** - Create and organize plans with dates and descriptions
- **Task Lists** - Add, complete, and delete tasks for each plan
- **Real-time Data** - All data synced with Firebase Firestore
- **Responsive Design** - Clean, intuitive interface

### Coming Soon
- Invite system (share plans via email/link)
- Real-time collaboration (see updates from other members instantly)
- Voting system for group decisions
- Activity scheduling with time slots
- Mobile app version

## 🛠️ Tech Stack

- **Frontend:** React 19, React Router
- **Backend:** Firebase (Authentication, Firestore Database)
- **Build Tool:** Vite
- **Styling:** Inline CSS (easily replaceable with Tailwind/Material-UI)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/RobNatt/collab-planner.git
cd collab-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

4. Set up your Firebase config:
   - Create a web app in your Firebase project
   - Copy your Firebase config
   - Replace the config in `src/config/firebase.js`

5. Enable Firebase services:
   - **Authentication:** Enable Email/Password sign-in
   - **Firestore Database:** Create database in test mode

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎯 Usage

1. **Sign Up** - Create an account with email and password
2. **Create a Plan** - Add a new plan with name, description, and dates
3. **Add Tasks** - Click on a plan to add tasks/activities
4. **Manage Tasks** - Check off completed tasks or delete them
5. **Collaborate** - (Coming soon) Invite others to join your plans

## 📁 Project Structure
```
collab-planner/
├── src/
│   ├── components/
│   │   ├── CreatePlan.jsx      # Form to create new plans
│   │   └── PlansList.jsx       # Display all user's plans
│   ├── config/
│   │   └── firebase.js         # Firebase configuration
│   ├── pages/
│   │   ├── Login.jsx           # Authentication page
│   │   ├── Dashboard.jsx       # Main dashboard view
│   │   └── PlanDetails.jsx     # Individual plan with tasks
│   ├── App.jsx                 # Main app component with routing
│   └── main.jsx                # App entry point
├── package.json
└── README.md
```

## 🔐 Security Notes

- Firebase API keys are currently committed (safe for client-side apps)
- Firestore security rules should be updated before production
- Consider moving to environment variables for production deployment

## 🚧 Roadmap

- [ ] Invite system with shareable links
- [ ] Real-time updates using Firestore listeners
- [ ] Voting mechanism for group decisions
- [ ] Calendar view for scheduled activities
- [ ] Mobile responsive improvements
- [ ] User profiles and avatars
- [ ] Push notifications
- [ ] Export plans to PDF/Calendar apps

## 🤝 Contributing

This is a learning project, but suggestions and feedback are welcome!

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Rob Natt**
- GitHub: [@RobNatt](https://github.com/RobNatt)

---

Built as a portfolio project to demonstrate React, Firebase, and full-stack development skills.