# GatheringFun - Complete Workflow Plan

## Overview
A collaborative restaurant decision-making app with 5 phases, using gamification to help groups decide where to eat.

---

## Phase 1: Host Creation
**Who**: Host only

**Actions**:
1. Host fills out the gathering form:
   - Gathering name
   - Date range (start date to end date)
   - **Selection Mode**:
     - **Preference Search**: (Default) Filters by Location, Cuisine, and Price.
     - **Custom List**: Host manually searches and adds specific restaurants.
   - Wait duration (minutes for Phase 3 waiting period)

2. System creates a session in Firestore with:
   - Unique session ID
   - `selectionMode`: `'preference'` or `'custom'`
   - `customRestaurants`: (If custom mode) [{id, name, address, photoUrl, images}]
   - Status: `recruiting`

3. Host receives shareable session ID/link

**Transition**: Host and participants join using the session ID → Phase 2

---

## Phase 2: Participant Preference Selection
**Who**: All participants (including host)

**Actions**:
1. Each participant sees a preference selection form with:
   - **Dates**: Multi-select from host's date range.
   - **Locations**: (Preference Mode only) Multi-select from host's selected locations.
   - **Cuisines**: Multi-select or choose from a default list.

2. Each participant submits their preferences to Firestore.

**Transition Logic**:
- **Preference Mode**: Immediately transition that participant to Phase 3 (swiping).
- **Custom Mode**: Immediately transition that participant to the Waiting Room (skips swiping).

---

## Phase 3: Restaurant Swiping (Preference Mode Only)
**Who**: All participants

**Actions**:
1. Card-based swiping using Google Places API results.
2. Votes saved to Firestore.

**Transition Trigger**:
- Host manually triggers "Start Game" or Timer expires.

---

## Phase 4: Amidakuji (Ghost Leg) Game
**Who**: All participants

**Setup**:
- **Dynamic Lanes**: 2 to 10 lanes based on the number of finalists (Top 5 in Preference mode, or all selected in Custom mode).
- **Shared Metadata**: Metadata (names/photos) is pulled from Firestore to ensure consistency.

**Actions**:
1. **Interactive Path**: Participants pick their starting lane.
2. **Deterministic Fairness**: The system generates a fair ladder for everyone.
3. **Real-time Sync**: Winner and ranking are shared across all devices.

---

## Phase 5: Final Result & Calendar Integration
**Who**: All participants

**Display**:
1. "Winner Winner Dinner!" celebration screen
2. Show winning restaurant details:
   - Name, address, rating
   - Selected date
   - Price range
   - **Google Maps link** to view location

3. **Actions**:
   - "View on Google Maps" button (opens in new tab)
   - "Add to Google Calendar" button
     - Pre-fills event with restaurant name, address, date
   - "Start New Gathering" button (returns to home)

---

## Technical Implementation Notes

### Firestore Schema
```
sessions/{sessionId}:
  - name: string
  - hostId: string
  - status: 'recruiting' | 'preferences' | 'swiping' | 'amidakuji' | 'finished'
  - hostPreferences: { dates, locations, cuisines, minPrice, maxPrice }
  - waitDeadline: timestamp
  - participants: [userId1, userId2, ...]
  - participantPreferences: { userId: { dates, locations, cuisines } }
  - restaurantVotes: { userId: [restaurantIds] }
  - amidakuji: {
      results: [restaurantId1, ...restaurantId5],
      initialRungs: [{ lane, y }, ...],  // Random rungs generated at start
      restaurantRanking: [{ id, name, votes }, ...]  // Synced ranking display
    }
  - finalChoice: { restaurantId, name, address, ... }
```

### Key Features to Implement
- [ ] Phase 2: Participant preference selection UI
- [ ] Phase 2: Date display with day of week (Mon, Tue, etc.)
- [ ] Phase 2: No timer - immediate transition after submission
- [ ] Phase 3: Filter restaurants by 4+ stars AND individual participant preferences
- [ ] Phase 3: Wait timer before Phase 4 (only between Phase 3 and 4)
- [ ] Phase 4: Generate random initial rungs when phase starts
- [ ] Phase 4: Individual (non-synced) rung placement per participant
- [ ] Phase 4: Display restaurant ranking at end based on Phase 3 votes
- [ ] Phase 4: Real-time sync of restaurant ranking display
- [ ] Phase 4: Remove all host-specific controls (equal access for all)
- [ ] Phase 5: Google Calendar integration with correct date/restaurant
- [ ] Phase 5: Google Maps link for winning restaurant

### Restaurant Filtering Logic
```javascript
// Each participant gets restaurants based on THEIR preferences
const participantPrefs = participantPreferences[userId];

const restaurants = fetchRestaurants({
  dates: participantPrefs.dates,
  locations: participantPrefs.locations,
  cuisines: participantPrefs.cuisines,
  minPrice: hostPreferences.minPrice,
  maxPrice: hostPreferences.maxPrice,
  minRating: 4.0  // 4 stars and above
});
```

### Random Rung Generation (Phase 4)
```javascript
function generateRandomRungs(numLanes = 5, numRungs = 8) {
  const rungs = [];
  const boardHeight = 320;
  const minSpacing = 30;
  
  for (let i = 0; i < numRungs; i++) {
    const lane = Math.floor(Math.random() * (numLanes - 1));
    const y = Math.random() * (boardHeight - 2 * minSpacing) + minSpacing;
    rungs.push({ lane, y: Math.round(y / 20) * 20 });
  }
  
  return rungs;
}
```

---

## Next Steps
1. Implement Phase 2 participant preference selection
2. Add day-of-week display for dates
3. Update restaurant filtering to include 4+ star requirement
4. Implement random rung generation for Phase 4
5. Add restaurant ranking display with real-time sync
6. Remove host controls from Phase 4
7. Test end-to-end flow with multiple participants
