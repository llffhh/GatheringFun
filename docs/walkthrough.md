# GatheringFun Feature Walkthrough

I have completed the core implementation of the **GatheringFun** project, incorporating all your detailed requirements for gamified dining decisions. The application is now stable across all 5 phases.

## Completed Phases

### 1. Session Setup (Host Flow)
- **High-Aesthetic Form**: Hosts can create a session with a custom name, date range, country (Taiwan/Malaysia), and specific region/cuisine preferences.
- **Dual Selection Modes**: 
    - **Preference Search (AI)**: Automatically finds restaurants based on group filters.
    - **Custom List**: Host manually searches and picks up to 10 specific restaurants using Google Places.
- **Filters**: Added **Price Range** (min/max) and **Waiting Duration** to control the flow.
- **Firebase Sync**: Sessions are saved in Firestore with unique IDs.

### 2. Participant Preference Collection
- **Join via ID/Link**: Participants can join a session and select their preferred dates, locations, and cuisines.
- **Context-Aware Flow**: If the host chose **Custom List**, the app automatically skips the swiping phase for all participants after they submit their availability.
- **Optimized Transition**: Fixed issue where participants would get stuck; system now intelligently filters data to ensure valid matches.

### 3. Tinder-Style Swiping (Preference Mode Only)
- **Restaurant Candidates**: Automatically fetched based on the group's collective preferences (Price, Location, Cuisine).
- **Smooth Swiping**: Framer Motion integration for "Left/Pass" and "Right/Like" gestures.
- **Google Maps Integration**: Direct links to view restaurant details.

### 4. Amidakuji (Ghost Leg) Game
- **SVG-Based Engine**: Custom-built using SVG for perfect responsiveness and precision.
- **Dynamic Lane Support**: Automatically adjusts the ladder from 2 to 10 lanes based on the number of restaurants.
- **Network Metadata Sync**: Ensures all participants see the same restaurant names and photos, even if their local Google search results differ.
- **Precision Animation**: The "light point" traces the path exactly along the lines to the winner.

### 5. Final Result & Sync
- **Winning Reveal**: Grand reveal of the final restaurant, date, and time.
- **Metadata Persistence**: The winner's full image gallery, address, and Google Maps link are preserved for all users.
- **Calendar Integration**: A one-click button to add the gathering to Google Calendar with all details.

## Recent Fixes & Improvements

1.  **Phase 4 Overhaul**: Moved from Div-based layout to SVG for better game mechanics and responsiveness. Added independent rung generation.
2.  **Restaurant Data**: Expanded mock database to cover all Malaysian/Taiwanese regions to prevent "No Results" errors.
3.  **Phase 2 Sync**: Fixed logic preventing participants from entering the Swiping phase.

## Technical Setup Reminder

To run the application with real database connectivity, please ensure you have a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### How to Test
1. Create a `.env` file based on `.env.example`.
2. Run `npm install` and `npm run dev`.
3. Open `http://localhost:3000/GatheringFun/`.
4. Create a session as a Host.
5. Open the link in an Incognito window to join as a Participant.
6. Progress through all 5 phases.
