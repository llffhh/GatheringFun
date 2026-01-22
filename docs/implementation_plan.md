# EatWhenWhere (聚餐趣) Implementation Plan

Based on the project specification, we will build a gamified decision-making tool for group dining. The app will be built with React, Tailwind CSS, Framer Motion, and Firebase.

## Project Vision
To solve the "Where to eat?" and "When to meet?" pain points through gamified interaction (Tinder-style swiping and Amidakuji/Ghost Leg).

## Architecture Overview
- **Frontend**: React 18 (Vite), Tailwind CSS (v4), Framer Motion.
- **Backend/Real-time**: Firebase Firestore (Snapshot listeners for syncing).
- **Authentication**: Firebase Anonymous Auth.
- **Data Source**: Google Places API.
- **Deployment**: GitHub Pages.

## Proposed Implementation Phases

### Phase 1: Session Initialization (Host Flow)
- **Session Data**: Host creates a session by providing:
    - Meeting Name.
    - Date Range (including day of the week).
    - Country (Malaysia or Taiwan).
    - Pre-selected Cities/Districts (Multiple selection).
    - Pre-selected Cuisine categories (Multiple selection).
    - **Price Range**: Allow selection of a range (e.g., $$ to $$$) instead of a single value.
    - **Wait Deadline**: Define a waiting duration for participants to join and vote.
- **Persistence**: Save session configuration to Firestore.

### Phase 2: Preference Collection (Participant Flow)
- **Selection**: Participants select from host's pre-defined list (Dates, Locations, Cuisines).
- **Wait Logic**: Participants wait until the defined deadline or until everyone has completed their selection.

### Phase 3: Restaurant Discovery & Tinder Swiping
- **API Fetching**: Google Places API fetches restaurants (>4.0 rating) matching the price range and preferences.
- **Card UI**: 
    - Include **Google Maps Link** for each restaurant.
    - **Clear HUD**: Explicitly display "Swipe Right for Like" / "Swipe Left for Pass".
- **Finalists**: Top 5 restaurants selected based on votes.

### Phase 4: Amidakuji (Ghost Leg) Game
- **Interactive Board**:
    - Participants can add horizontal rungs.
    - **Starting Lane**: Participants choose which vertical lane to start from.
    - **Reset Button**: Host can reset the ladder configuration.
- **Path Simulation**: Animated "light point" follows the generated path to reveal the result.

### Phase 5: Finalization & Sync
- **Result Generation**: Reveal the final restaurant, date, and time after the wait period/game.
- **Calendar Integration**: "Add to Calendar" button (Google/ICS) to finalize the event.

---

## Technical Tasks

### [NEW] Firebase Service ([firebase.js](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/services/firebase.js))
Initialize Firebase with the provided secrets. 
> [!IMPORTANT]
> Anonymous Authentication must be enabled in the Firebase Console.

### [NEW] Swiper Component ([RestaurantCard.jsx](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/components/RestaurantCard.jsx))
Using `framer-motion` for swiping gestures.

### [NEW] Ghost Leg Game ([Amidakuji.jsx](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/components/Amidakuji.jsx))
Canvas or SVG based rendering with Firestore real-time updates.

---

## Verification Plan
- **Real-time Sync**: Verify that adding a "rung" on one browser tab appears on another instantly.
- **Swipe Logic**: Ensure voting actually influences the final selection.
- **Calendar Export**: Verify the generated .ics file contains correct restaurant and meeting details.
