# GatheringFun - Manual Testing Guide

## Quick Start Testing

Your dev server is running at: http://localhost:3000/GatheringFun/

Follow these steps to test the complete flow:

---

## Test Scenario: Single User Complete Flow

### Step 1: Create Gathering (Phase 1)
1. Open http://localhost:3000/GatheringFun/
2. Click **"Create Gathering"**
3. Fill in the form:
   - **Name**: "Weekend Dinner"
   - **Start Date**: Today's date
   - **End Date**: Today's date
   - **Country**: Taiwan (default)
   - **Locations**: Click "Taipei - Xinyi District" and "Taipei - Da-an District"
   - **Cuisines**: Click "Japanese" and "Korean"
   - **Min Price**: 100 (default)
   - **Max Price**: 1000 (default)
   - **Wait Duration**: 1 minute
4. Click **"Create Gathering Link"**
5. ✅ **Expected**: See session created screen with session ID

### Step 2: Submit Preferences (Phase 2)
1. Click **"Start Swiping Phase"** (as host)
2. ✅ **Expected**: See ParticipantPreferences form
3. Select preferences:
   - **Dates**: Click the date shown (should show day of week like "Sat, Jan 25")
   - **Locations**: Click "Taipei - Xinyi District"
   - **Cuisines**: Click "Japanese"
4. ✅ **Check**: Verify counter badges show "1 selected", "1 selected", "1 selected"
5. ✅ **Check**: Verify checkmarks (✓) appear on selected items
6. Click **"Submit Preferences & Start Swiping →"**
7. ✅ **Expected**: Immediately transition to restaurant swiping (no waiting room)

### Step 3: Swipe Restaurants (Phase 3)
1. ✅ **Check**: Verify you see restaurants that match your preferences
2. ✅ **Check**: Verify all restaurants have 4+ star rating
3. ✅ **Check**: Verify restaurants are Japanese cuisine in Xinyi District
4. For each restaurant:
   - Click the **Google Maps** button to verify it opens
   - Click the **green checkmark** to like (or red X to pass)
5. ✅ **Check**: Verify progress indicator updates (e.g., "1 / 5")
6. Complete all restaurants
7. ✅ **Expected**: See "Votes Cast! Waiting for everyone..." screen

### Step 4: Start Amidakuji (Phase 4 Setup)
1. As host, you should see **"Start Amidakuji Battle! ⚔️"** button
2. Click the button
3. ✅ **Expected**: Transition to Amidakuji game screen

### Step 5: Play Amidakuji Game (Phase 4)
1. ✅ **Check**: Verify you see 5 vertical lanes with horizontal rungs already placed (random initial rungs)
2. ✅ **Check**: Verify restaurant names appear at the bottom of each lane
3. **Add More Rungs** (optional):
   - Click between any two vertical lanes
   - ✅ **Check**: A horizontal rung appears where you clicked
4. **Select Starting Lane**:
   - Click one of the numbered buttons (1-5) at the top
   - ✅ **Check**: Selected button turns blue with shadow
5. Click **"Start Battle! 🚀"**
6. ✅ **Check**: Watch the yellow animated point drop down the ladder
7. ✅ **Check**: Point follows the rungs (switches lanes when hitting a rung)
8. ✅ **Expected**: Animation completes and shows your winning restaurant

### Step 6: View Rankings (Phase 4 Result)
1. ✅ **Check**: Restaurant ranking display appears below the ladder
2. ✅ **Check**: Shows all 5 restaurants with vote counts
3. ✅ **Check**: Your selected restaurant has "YOUR PICK" badge
4. ✅ **Check**: Restaurants are numbered #1, #2, #3, #4, #5
5. ✅ **Check**: Top 3 have gold/silver/bronze styling

### Step 7: Final Result (Phase 5)
1. ✅ **Expected**: See "Winner Winner Dinner!" celebration screen
2. ✅ **Check**: Restaurant name and address displayed
3. ✅ **Check**: Date and price range shown
4. Click **"View on Google Maps"**
   - ✅ **Check**: Opens in new tab
5. Click **"Add to Google Calendar"**
   - ✅ **Check**: Opens Google Calendar with pre-filled event
6. Click **"Start New Gathering"**
   - ✅ **Check**: Returns to home screen

---

## Test Scenario: Multi-User Flow

### Setup
1. Open the app in **two different browser windows** (or use incognito mode)
2. Window 1 = Host
3. Window 2 = Participant

### Host (Window 1)
1. Create a gathering (follow Step 1 above)
2. Copy the session ID from the URL or screen
3. Click "Start Swiping Phase"
4. Submit preferences (follow Step 2 above)
5. Swipe through restaurants (follow Step 3 above)
6. **Wait** for participant to finish swiping
7. Click "Start Amidakuji Battle! ⚔️"

### Participant (Window 2)
1. Paste the session ID in the URL: `http://localhost:3000/GatheringFun/?id=SESSION_ID`
2. Click "Join Session"
3. ✅ **Check**: See ParticipantPreferences form
4. Select **different** preferences than host:
   - Different date (if available)
   - Different location
   - Different cuisine
5. Submit preferences
6. ✅ **Check**: See different restaurants than host (based on your preferences)
7. Swipe through all restaurants
8. Wait for host to start Amidakuji

### Both Users (Amidakuji Phase)
1. ✅ **Check**: Both see the same initial random rungs
2. Each user adds their own rungs
3. ✅ **Check**: Rungs added by one user do NOT appear for the other user
4. Each user selects their own starting lane
5. Each user clicks "Start Battle! 🚀" independently
6. ✅ **Check**: Each user sees their own path animation
7. ✅ **Check**: Both users see the SAME ranking display
8. ✅ **Check**: Ranking updates in real-time for both users

---

## Common Issues & Debugging

### Issue: No restaurants appear after swiping
**Cause**: Filters too restrictive
**Solution**: 
- Check that restaurants match your selected location AND cuisine
- Try selecting broader preferences (multiple locations/cuisines)
- Check browser console for errors

### Issue: "Start Amidakuji Battle" button doesn't appear
**Cause**: Not all participants have finished swiping
**Solution**: 
- Complete swiping in all browser windows
- Check that votes are saved (check browser console)

### Issue: Ranking doesn't show
**Cause**: Missing ranking data in Firestore
**Solution**:
- Check browser console for errors
- Verify `amidakuji.ranking` exists in Firestore

### Issue: Animation doesn't follow rungs correctly
**Cause**: Path calculation logic issue
**Solution**:
- Check that rungs have correct `lane` and `y` values
- Verify rungs are sorted by Y coordinate

---

## What to Look For

### Visual Feedback
- ✅ Checkmarks (✓) on selected items
- ✅ Counter badges showing selection counts
- ✅ Blue/green/purple highlights on selected buttons
- ✅ Smooth animations with Framer Motion
- ✅ Dark mode support (if enabled)

### Data Flow
- ✅ Preferences saved to Firestore immediately
- ✅ Restaurants filtered by participant preferences
- ✅ Votes tracked per user
- ✅ Rankings calculated from vote counts
- ✅ Real-time updates across multiple users

### User Experience
- ✅ No waiting room after Phase 2
- ✅ Immediate transitions
- ✅ Individual ladder experience
- ✅ Clear visual hierarchy
- ✅ Responsive button states

---

## Success Criteria

✅ All 5 phases complete without errors
✅ Preferences correctly filter restaurants
✅ 4+ star rating filter works
✅ Amidakuji game plays smoothly
✅ Rankings display correctly
✅ Google Maps/Calendar integration works
✅ Multi-user experience is synchronized

---

## Next Steps After Testing

1. **Document any bugs** found during testing
2. **Take screenshots** of each phase for documentation
3. **Test edge cases** (no restaurants match, only 1 participant, etc.)
4. **Performance testing** with larger datasets
5. **Deployment preparation** for GitHub Pages
