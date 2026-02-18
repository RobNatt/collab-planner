# Collab Planner - Technology Stack

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2 | UI framework - component-based architecture with hooks |
| **React Router DOM** | 7.12 | Client-side routing (/, /login, /dashboard, /plan/:id, /profile, etc.) |
| **Vite** | 6.x | Build tool and dev server - fast HMR, ES module bundling |
| **ESLint** | 9.x | Code linting with React hooks and refresh plugins |

## Backend & Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Firebase Authentication** | 12.8 | Email/password auth, session management, user state |
| **Cloud Firestore** | 12.8 | NoSQL document database with real-time listeners |
| **Firebase Security Rules** | - | Server-side permission enforcement for all collections |

### Firestore Collections

| Collection | Description |
|-----------|-------------|
| `plans` | Trip plans with members, dates, invite codes, admin |
| `activities` | Tasks and activities linked to plans |
| `expenses` | Expense records with split calculations |
| `comments` | Per-item comment threads with @mentions |
| `activityLogs` | Activity feed entries for all plan events |
| `users` | User profiles (display name, avatar color, bio) |
| `userProfiles` | Tutorial completion tracking |

## UI Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **react-hot-toast** | 2.6 | Toast notification system |
| **qrcode.react** | 4.2 | QR code generation for invite links |

## Styling Approach

- **CSS-in-JS (inline styles)** - All component styling via React inline style objects
- **Theme system** - Custom `ThemeContext` with light/dark mode, 30+ color tokens
- **No CSS framework** - Pure custom styling for full design control
- **CSS animations** - Keyframe animations defined in `index.css` (fadeIn, scaleIn, spin, skeleton shimmer)
- **Responsive design** - Flexbox/Grid layouts with `minmax()` and `flexWrap` for mobile support

## Architecture Patterns

### State Management
- **React Context API** - Theme state (`ThemeContext`) with localStorage persistence
- **React Hooks** - `useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`
- **Custom hooks**:
  - `useUserProfile` / `useUserProfiles` - Firestore user data fetching
  - `useNotifications` - Browser Notification API with permission management
  - `useReminders` - Scheduled reminder checks for upcoming tasks/trips

### Real-Time Data
- **Firestore `onSnapshot`** listeners on plans, activities, and expenses
- Changes sync instantly across all connected clients
- Browser notifications sent for changes when tab is unfocused
- Activity feed powered by `activityLogs` collection with real-time listener

### Activity Logging
- Fire-and-forget pattern via `activityLogger.js` utility
- Silently fails to avoid breaking core functionality
- Logs: task CRUD, expense CRUD, member join/leave, comments, votes, scheduling

### Authentication Flow
```
Landing (/) --> Login (/login) --> Welcome (/welcome) --> Dashboard (/dashboard)
                                   (first-time users)
```
- `onAuthStateChanged` listener for auth state
- Redirect to Welcome page for new signups (tutorial)
- `UserProfileSetup` modal on Dashboard if no profile exists

### Comments & Mentions
- Mention format: `@[displayName](userId)` stored in `rawText`, `@displayName` displayed
- Regex-based mention parsing on input and display
- Dropdown member picker triggered by `@` character

## Export Capabilities

| Format | Method |
|--------|--------|
| **PDF** | Browser print dialog (Save as PDF) |
| **Print** | Formatted HTML opened in new window |
| **CSV** | Blob download for expense data |
| **iCal (.ics)** | Generated calendar file for Apple Calendar, Outlook |
| **Google Calendar** | Direct URL with pre-filled event parameters |

## Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting and automatic deployments |
| **GitHub** | Source control, triggers Vercel builds on push |
| **Firebase** | Backend services (auth, database) |

## Project Structure

```
src/
  components/       # Reusable UI components
    ActivityFeed    - Real-time activity log display
    Calendar        - Visual month/week calendar
    Comments        - Comment threads with @mentions
    CreatePlan      - Plan creation form
    DayDetailsModal - Calendar day popup
    ExportShare     - Export/sharing options (PDF, iCal, CSV)
    InviteSection   - Invite link management with QR codes
    ItineraryView   - Day-by-day trip timeline
    LoadingSpinner  - Reusable loading states
    MemberDirectory - Contact info for all members
    MembersList     - Member management (add/remove)
    PlansList       - Dashboard plan cards with filters
    Skeleton        - Loading skeleton placeholders
    ThemeToggle     - Dark/light mode switch
    UserProfileSetup - First-time profile creation modal
  config/
    firebase.js     # Firebase initialization
  contexts/
    ThemeContext.jsx # Light/dark theme with 30+ color tokens
  hooks/
    useUserProfile  # Single and batch user profile fetching
    useNotifications # Browser Notification API wrapper
    useReminders    # Scheduled reminder notifications
  pages/
    Landing         # Marketing page with CTA
    Login           # Auth (login + signup)
    Welcome         # 8-step onboarding tutorial
    Dashboard       # Plan list with search/filter
    PlanDetails     # Main plan view (9 tabs)
    JoinPlan        # Invite link handler
    Profile         # User profile with trip history
  utils/
    activityLogger  # Fire-and-forget activity logging
    icalExport      # iCal file generation
    userHelpers     # Display name resolution
```

## Browser APIs Used

- **Notification API** - Desktop notifications for real-time updates and reminders
- **Clipboard API** - Copy invite links and share URLs
- **LocalStorage** - Theme preference, notification settings
- **Print API** - window.print() for itinerary export
- **Blob API** - File downloads (CSV, iCal)
