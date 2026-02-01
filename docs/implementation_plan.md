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

### Phase 1: Session Initialization (Host Flow) [COMPLETED]
- **Session Data**: Host creates a session by providing:
    - Meeting Name, Date Range, Country, Locations, Cuisines.
    - **Dual Mode Selection**: Host chooses between 'Preference Search' or 'Custom List'.
    - **Price Range & Wait Deadline**.
- **Persistence**: Save session configuration to Firestore.

### Phase 2: Preference Collection (Participant Flow) [COMPLETED]
- **Selection**: Participants select from host's pre-defined list (Dates, Locations, Cuisines).
- **Wait Logic**: Participants wait until the defined deadline or until everyone has completed their selection.

### Phase 3: Restaurant Discovery & Tinder Swiping [COMPLETED]
- **API Fetching**: Google Places API fetches restaurants (>4.0 rating) matching the price range and preferences.
- **Card UI**: 
    - Include **Google Maps Link** for each restaurant.
    - **Clear HUD**: Explicitly display "Swipe Right for Like" / "Swipe Left for Pass".
- **Finalists**: Top 5 restaurants selected based on votes.

### Phase 4: Amidakuji (Ghost Leg) Game [COMPLETED]
- **Interactive Board**:
    - **Dynamic Lanes**: Supports 2-10 lanes.
    - **Starting Lane**: Participants choose which vertical lane to start from.
- **Path Simulation**: Animated "light point" follows the generated path to reveal the result.

### Phase 5: Finalization & Sync [COMPLETED]
- **Result Generation**: Reveal the final restaurant, date, and time.
- **Metadata Resilience**: Store and retrieve full restaurant metadata (names, addresses, multiple images) to ensure consistency across all devices.
- **Calendar Integration**: "Add to Calendar" button (Google/ICS) to finalize the event.

---

## Technical Tasks

### [COMPLETED] Firebase Service ([firebase.js](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/services/firebase.js))
Initialize Firebase with the provided secrets. 

### [COMPLETED] Swiper Component ([RestaurantCard.jsx](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/components/RestaurantCard.jsx))
Using `framer-motion` for swiping gestures.

### [COMPLETED] Ghost Leg Game ([Amidakuji.jsx](file:///c:/Users/hebe1/Documents/Project/GatheringFun/GatheringFun/src/components/Amidakuji.jsx))
SVG-based rendering with Firestore real-time updates and dynamic lane support.

---

## Verification Plan
- **Real-time Sync**: Verify that adding a "rung" on one browser tab appears on another instantly.
- **Swipe Logic**: Ensure voting actually influences the final selection.
- **Calendar Export**: Verify the generated .ics file contains correct restaurant and meeting details.
