# GatheringFun - Workflow Changes Summary

## [2025-02-01] Custom Restaurant Selection & Metadata Sync
**Goal**: Allow hosts to manually pick restaurants and skip swiping, while fixing missing images for participants.

### 1. Multi-Mode Flow
- **Selection Mode**: Introduced `selectionMode` ('preference' vs 'custom') in the Session document.
- **Dynamic Transition**: If 'custom', Phase 3 (swiping) is completely bypassed. Participants go from Phase 2 (availability) directly to the game waiting room.

### 2. Custom List Management
- **Implementation**: Integrated Google Places Autocomplete in the Host Form to allow manual selection of up to 10 specific restaurants.
- **Data Preservation**: Captured address and image arrays immediately during host selection to prevent re-fetching errors later.

### 3. Metadata Locking Strategy
- **Fix**: When the Game/Amidakuji starts, the system now "locks" the winning restaurant metadata (Name, Address, Photos) into the Firestore session data.
- **Consistency**: 100% visibility for participants, regardless of their local Google API search results.

---

## Critical Updates to Implementation Plan

### Phase 2 → Phase 3 Transition
**CHANGED**: ❌ No timer, no waiting room
- Participants submit preferences and **immediately** move to Phase 3
- No waiting room after preference submission
- Each participant proceeds independently (asynchronous)

### Phase 3 → Phase 4 Transition
**UNCHANGED**: ✅ Timer exists here
- Wait timer runs during Phase 3 (swiping)
- Timer from Phase 1 (waitMinutes) applies here
- Host can manually trigger "Start Amidakuji Battle"

### Phase 4: Amidakuji Game - Major Changes

#### 1. Initial Rungs
**NEW**: 🎲 Random rungs generated at start
- System automatically creates random rungs when Phase 4 begins
- All participants see the same initial configuration

#### 2. Rung Synchronization
**CHANGED**: ❌ No real-time sync
- Each participant adds rungs **locally only**
- Rungs are NOT synced across participants
- Each person has their own version of the ladder

#### 3. Host Controls
**REMOVED**: ❌ No special host privileges
- Remove "Reset Ladder" button
- Remove host-only controls
- All participants have equal access

#### 4. Restaurant Ranking Display
**NEW**: 📊 Show ranking at end
- After path animation, display ranking of all 5 restaurants
- Based on vote counts from Phase 3
- Format: "1st: Restaurant A (15 votes), 2nd: Restaurant B (12 votes)..."
- **Real-time sync** of this ranking display across all participants

#### 5. Individual Experience
**CHANGED**: Each participant:
- Adds their own rungs (not synced)
- Selects their own starting lane
- Clicks their own "Start Battle!" button
- Sees their own path animation
- Gets their own winning restaurant
- Sees the shared ranking display

---

## Implementation Priority

### High Priority (Core Flow)
1. ✅ Phase 1: Host Creation (Done)
2. ❌ Phase 2: Participant Preferences (Need to build)
3. ⚠️ Phase 3: Individual filtering + 4★ requirement
4. ⚠️ Phase 4: Random initial rungs + local-only rung placement
5. ⚠️ Phase 4: Restaurant ranking display with real-time sync

### Medium Priority (Enhancements)
- Date display with day of week
- Restaurant ranking vote counts
- Better visual feedback for individual ladder state

### Completed
- ✅ Google Maps links in swiper and final result
- ✅ Cuisine multi-select with visual feedback
- ✅ Price range inputs (changed to 100-1000)
