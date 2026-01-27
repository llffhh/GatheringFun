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
   - Country selection (Taiwan/Malaysia)
   - Multiple location selections (districts/areas)
   - Multiple cuisine preferences
   - Price range (min-max in TWD/MYR)
   - Wait duration (minutes for Phase 3 waiting period)

2. System creates a session in Firestore with:
   - Unique session ID
   - Host preferences as "available options"
   - Status: `recruiting`

3. Host receives shareable session ID/link

**Transition**: Host and participants join using the session ID → Phase 2

---

## Phase 2: Participant Preference Selection
**Who**: All participants (including host)

**Actions**:
1. Each participant sees a preference selection form with:
   - **Dates**: Multi-select from host's date range (display with day of week: "Mon, Jan 25", "Tue, Jan 26", etc.)
   - **Locations**: Multi-select from host's selected locations
   - **Cuisines**: Multi-select from host's selected cuisines

2. Each participant submits their preferences to Firestore:
   ```
   sessions/{sessionId}/participantPreferences/{userId}: {
     dates: [...],
     locations: [...],
     cuisines: [...]
   }
   ```

**Transition Trigger**: 
- **Immediate** - as soon as participant clicks "Submit Preferences"
- No waiting room, no timer

**Transition Logic**:
- Save participant's preferences to Firestore
- Immediately transition that participant to Phase 3 (swiping)
- Other participants can still be in Phase 2 (asynchronous)

---

## Phase 3: Restaurant Swiping (Tinder-style)
**Who**: All participants

**Actions**:
1. Each participant sees restaurant cards filtered by:
   - Their own selected preferences (dates, locations, cuisines)
   - Host's price range
   - **4 stars and above rating**

2. Restaurant cards show:
   - Restaurant name, image, address
   - Rating, price level, cuisine type
   - **Google Maps link** for further checking
   - Swipe right (like ✓) or left (dislike ✗)

3. Votes saved to Firestore:
   ```
   sessions/{sessionId}/restaurantVotes/{userId}: [restaurantId1, restaurantId2, ...]
   ```

4. Participants who finish swiping see "Waiting for others..." screen with countdown timer

**Transition Trigger**:
- **Timer expires** (wait duration from Phase 1) OR
- Host manually triggers "Start Amidakuji Battle" button

**Transition Logic**:
- Aggregate all votes
- Select Top 5 most-voted restaurants
- **Generate random initial rungs** for the Amidakuji ladder
- Initialize Amidakuji game → Phase 4

---

## Phase 4: Amidakuji (Ghost Leg) Game
**Who**: All participants (equal access, no host privileges)

**Setup**:
- 5 vertical lanes (one for each top restaurant)
- Bottom of each lane shows a restaurant name/icon
- **Random rungs pre-generated** at initialization

**Actions**:
1. **Initial State**:
   - System generates random rungs when Phase 4 starts
   - All participants see the same initial ladder configuration

2. **Individual Rung Placement** (NOT synced):
   - Each participant can add their own rungs locally
   - Rungs are **NOT synced** across participants
   - Each participant has their own version of the ladder

3. **Lane Selection**:
   - Each participant selects their starting lane (1-5)
   - Lane selection is personal (not visible to others)

4. **Start Battle**:
   - Each participant clicks their own "Start Battle!" button
   - Path animation shows their light point following their ladder
   - Calculates which restaurant they land on

5. **Result Display**:
   - Show the participant's winning restaurant
   - **Display ranking of all 5 restaurants** based on aggregated votes from Phase 3
   - Ranking syncs in real-time across all participants
   - Format: "1st: Restaurant A (15 votes), 2nd: Restaurant B (12 votes)..." etc.

**No Host Controls**: All participants have equal access, no special host buttons

**Transition**: Each participant sees their result → Phase 5

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
