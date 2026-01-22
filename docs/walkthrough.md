# GatheringFun Feature Walkthrough

I have completed the core implementation of the **GatheringFun** project, incorporating all your detailed requirements for gamified dining decisions.

## Completed Phases

### 1. Session Setup (Host Flow)
- **High-Aesthetic Form**: Hosts can create a session with a custom name, date range, country (Taiwan/Malaysia), and specific region/cuisine preferences.
- **Filters**: Added **Price Range** selection and **Waiting Duration** (timeout) to control the flow.
- **Firebase Sync**: Sessions are saved in Firestore with unique IDs.

### 2. Participant Preference Collection
- **Join via ID/Link**: Participants can join a session and select their preferred dates, locations, and cuisines from the host's shortlist.
- **Real-time Countdown**: A live timer shows participants how much time remains before Phase 3 starts.

### 3. Tinder-Style Swiping
- **Framer Motion Integration**: Smooth gesture-based swiping for restaurant candidates.
- **HUD Propts**: Explicit hints for "Swipe Left to Pass" and "Swipe Right to Like".
- **Google Maps Integration**: Each restaurant card includes a direct link to view details on Google Maps.

### 4. Amidakuji (Ghost Leg) Game
- **Interactive Board**: Real-time synchronized ladder where participants can add horizontal rungs.
- **Lane Selection**: Participants choose their own starting lane.
- **Host Controls**: A reset button for the host to clear the ladder.
- **Path Simulation**: Animated "light point" that follows the path to reveal the final chosen restaurant.

### 5. Final Result & Sync
- **Winning Reveal**: Grand reveal of the final restaurant and date.
- **Calendar Integration**: A one-click button to add the gathering to Google Calendar with all details.

## New Feature: Dual Price Range Selector

Instead of a single dropdown, hosts can now select a budget **range** (e.g., $$ to $$$). 
- **Interactive UI**: Click the budget levels to define the minimum and maximum.
- **Improved Filtering**: Restaurant candidates will respect the full selected range.

## Troubleshooting: Invitation Link Failure

If the "Create Gathering Link" button does not progress or you see an `auth/configuration-not-found` error in the console:

1.  **Enable Anonymous Auth**: Go to your [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Authentication** > **Sign-in method**.
3.  Add the **Anonymous** provider and set it to **Enabled**.

## Technical Setup Reminder

To run the application with real database connectivity, please ensure you have a `.env` file in the root directory with the following variables (see `.env.example` for details):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Troubleshooting: White Screen / Auth Error

If you see a blank screen or a `Firebase: Error (auth/invalid-api-key)` in the console, it is because the environment variables above are missing or incorrect. Vite requires these to be present at build/dev time.

## How to Test
1. Create a `.env` file based on `.env.example`.
2. Run `npm install` and `npm run dev`.
3. Open `http://localhost:3000/GatheringFun/`.
4. Create a session as a Host.
5. Open the same link in a private tab with `?id={session_id}` to test the Participant flow.
