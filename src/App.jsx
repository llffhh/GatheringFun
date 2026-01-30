import { useState, useEffect } from 'react'
import { db, auth } from './lib/firebase'
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import HostForm from './components/HostForm'
import JoinSession from './components/JoinSession'
import ParticipantPreferences from './components/ParticipantPreferences'
import TinderSwiper from './components/TinderSwiper'
import Amidakuji from './components/Amidakuji'
import { fetchRestaurantsLive } from './services/restaurantService'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('home') // home, create, join, preferences, swiping, waiting_amidakuji, amidakuji, finished
  const [joinId, setJoinId] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [restaurants, setRestaurants] = useState([])

  // Handle URL ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      setJoinId(id)
      setMode('join')
    }
  }, [])

  // Listen for session updates
  useEffect(() => {
    let unsubscribe = () => { }
    const id = session?.id || (mode === 'waiting' || mode === 'swiping' ? joinId : null)

    if (id) {
      unsubscribe = onSnapshot(doc(db, 'sessions', id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSession({ id: snapshot.id, ...data })

          const myUid = auth.currentUser?.uid;
          const hasSubmittedPrefs = data.participantPreferences?.[myUid];

          // IMMEDIATE TRANSITION: If I have submitted preferences, go to swiping immediately.
          // This allows asynchronous Phase 2 -> Phase 3 transition as per workflow.
          if (hasSubmittedPrefs && mode !== 'swiping' && mode !== 'waiting_amidakuji' && mode !== 'amidakuji' && mode !== 'finished') {
            loadRestaurants({ id: snapshot.id, ...data });
            setMode('swiping');
          }

          // Global phase transitions (only for phases after swiping)
          if (data.status === 'amidakuji' && mode !== 'amidakuji') {
            setMode('amidakuji')
          }
          if (data.status === 'finished' && mode !== 'finished') {
            setMode('finished')
          }
        }
      })
    }
    return () => unsubscribe()
  }, [session?.id, joinId, mode])

  const loadRestaurants = async (sessionData) => {
    setLoading(true);
    const userId = auth.currentUser.uid;
    const participantPrefs = sessionData.participantPreferences?.[userId];

    if (!participantPrefs) {
      console.warn('No participant preferences found, using session defaults');
    }

    const filterPrefs = {
      minPrice: Number(sessionData.minPrice),
      maxPrice: Number(sessionData.maxPrice),
      locations: participantPrefs?.locations || [],
      cuisines: participantPrefs?.cuisines || []
    };

    const data = await fetchRestaurantsLive(filterPrefs);
    setRestaurants(data);
    setLoading(false);
  }

  // Timer logic
  useEffect(() => {
    if (!session?.waitDeadline) return

    const interval = setInterval(() => {
      const deadline = session.waitDeadline.toDate ? session.waitDeadline.toDate() : new Date(session.waitDeadline)
      const now = new Date()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft('00:00')
        clearInterval(interval)

        // GLOBAL HARD STOP: Time is up. Force transition to finished.
        // If I am the host, I should probably calculate the result if it's not set.
        if (session.hostId === auth.currentUser?.uid && session.status !== 'finished') {
          calculateFinalResult(session);
        }
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.waitDeadline, session?.status])

  const calculateFinalResult = async (currentSession) => {
    // Logic:
    // 1. Check if Amidakuji results exist (session.amidakujiResults)
    // 2. Count votes from Amidakuji.
    // 3. Fallback to Phase 3 votes (session.restaurantVotes) if no Amidakuji results.
    // 4. Fallback to Random.

    console.log('Calculating Final Result...');
    let finalRestaurantId = null;
    let ranking = []; // For display

    // Phase 3 Votes Analysis (Needed for Ranking anyway)
    const phase3Votes = {};
    Object.values(currentSession.restaurantVotes || {}).forEach(likes => {
      likes.forEach(rid => {
        phase3Votes[rid] = (phase3Votes[rid] || 0) + 1;
      });
    });
    // Sort for Ranking List
    const phase3Ranking = Object.keys(phase3Votes)
      .sort((a, b) => phase3Votes[b] - phase3Votes[a])
      .map(rid => ({
        id: rid,
        votes: phase3Votes[rid],
        name: restaurants.find(r => r.id === rid)?.name
      }));

    // 1. Check Amidakuji Results
    const amidakujiResults = currentSession.amidakujiResults || {};
    const amidakujiVotes = {};
    const finishedUsers = Object.keys(amidakujiResults);

    if (finishedUsers.length > 0) {
      Object.values(amidakujiResults).forEach(rid => {
        amidakujiVotes[rid] = (amidakujiVotes[rid] || 0) + 1;
      });
      // Pick winner (highest votes)
      finalRestaurantId = Object.keys(amidakujiVotes).sort((a, b) => amidakujiVotes[b] - amidakujiVotes[a])[0];
    } else {
      // 2. Fallback to Phase 3 Winner
      if (phase3Ranking.length > 0) {
        finalRestaurantId = phase3Ranking[0].id;
      } else {
        // 3. Absolute Random Fallback
        if (restaurants.length > 0) {
          finalRestaurantId = restaurants[0].id; // Pick first avail
        }
      }
    }

    const finalChoice = restaurants.find(r => r.id === finalRestaurantId) || restaurants[0];

    if (finalChoice) {
      await updateDoc(doc(db, 'sessions', currentSession.id), {
        status: 'finished',
        finalChoice: finalChoice,
        finalRanking: phase3Ranking // Save for display
      });
    }
  }

  // Effect to handle sync for Waiting Result
  useEffect(() => {
    if (session?.status === 'finished' && mode !== 'finished') {
      // Final Sync
      setMode('finished');
    }
  }, [session?.status, mode]);


  const generateRandomRungs = (numLanes = 5, numRungs = 8) => {
    const rungs = [];
    const boardHeight = 320;
    const minSpacing = 30;

    for (let i = 0; i < numRungs; i++) {
      const lane = Math.floor(Math.random() * (numLanes - 1));
      const y = Math.random() * (boardHeight - 2 * minSpacing) + minSpacing;
      rungs.push({ lane, y: Math.round(y / 20) * 20 });
    }

    return rungs.sort((a, b) => a.y - b.y);
  }

  const handleSubmitPreferences = async (preferences) => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'sessions', session.id);

      const updates = {
        participantPreferences: {
          [auth.currentUser.uid]: {
            ...preferences,
            submittedAt: serverTimestamp()
          }
        }
      };

      // Auto-start swiping phase if I am the host
      if (session.hostId === auth.currentUser.uid) {
        updates.status = 'swiping';
      }

      await setDoc(docRef, updates, { merge: true });

      // OPTIMISTIC UPDATE: Use the preferences we just created to load restaurants immediately
      // This prevents waiting for the DB listener which might be slow
      const optimisticSession = {
        ...session,
        participantPreferences: {
          ...session.participantPreferences,
          [auth.currentUser.uid]: preferences
        }
      };

      await loadRestaurants(optimisticSession);
      setMode('swiping');
    } catch (error) {
      console.error('Error submitting preferences:', error);
      alert('Failed to submit preferences.');
    } finally {
      setLoading(false);
    }
  }

  const onJoined = async (id, participantPreferences = null) => {
    setJoinId(id)

    // OPTIMISTIC UPDATE: If we have preferences from the join form, load immediately
    if (participantPreferences && session) {
      const optimisticSession = {
        ...session,
        participantPreferences: {
          ...session.participantPreferences,
          [auth.currentUser.uid]: participantPreferences
        }
      };
      await loadRestaurants(optimisticSession);
      setMode('swiping');
    } else {
      setMode('waiting');
    }
  }


  const handleCreateSession = async (data) => {
    console.log('handleCreateSession called with:', data);
    setLoading(true)
    try {
      if (!auth.currentUser) {
        console.log('Signing in anonymously...');
        await signInAnonymously(auth);
        console.log('Signed in as:', auth.currentUser?.uid);
      }

      const sessionData = {
        ...data,
        hostId: auth.currentUser?.uid,
        status: 'recruiting',
        createdAt: serverTimestamp(),
        participants: [auth.currentUser?.uid],
        waitDeadline: new Date(Date.now() + Number(data.waitMinutes) * 60000)
      }
      console.log('Session Data to write:', sessionData);

      const docRef = await addDoc(collection(db, 'sessions'), sessionData)
      console.log('Session created! ID:', docRef.id);

      setSession({ id: docRef.id, ...sessionData })
      setMode('created')

    } catch (error) {
      console.error('Error creating session:', error)
      alert('Error creating session: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSwiping = async () => {
    if (!session?.id) return;
    // Host should also go through Phase 2 (preferences)
    setMode('preferences');
  }

  // ... (Rung Gen code unchanged) ...

  const handleStartAmidakuji = async () => {
    if (!session?.id || !session?.restaurantVotes) return;
    setLoading(true);
    try {
      // Aggregate votes
      const voteCounts = {};
      Object.values(session.restaurantVotes).forEach(likes => {
        likes.forEach(rid => {
          voteCounts[rid] = (voteCounts[rid] || 0) + 1;
        });
      });

      // Sort and pick top 5
      const sortedRids = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
      const top5Rids = sortedRids.slice(0, 5);

      // If fewer than 5, fill with others from the fetched restaurants
      const finalTop5Rids = [...top5Rids];
      if (finalTop5Rids.length < 5) {
        restaurants.forEach(r => {
          if (finalTop5Rids.length < 5 && !finalTop5Rids.includes(r.id)) {
            finalTop5Rids.push(r.id);
          }
        });
      }

      // Create ranking data
      const ranking = finalTop5Rids.map(rid => {
        const restaurant = restaurants.find(r => r.id === rid);
        return {
          id: rid,
          name: restaurant?.name || 'Unknown',
          votes: voteCounts[rid] || 0
        };
      });

      const docRef = doc(db, 'sessions', session.id);
      const updates = {
        status: 'amidakuji',
        amidakuji: {
          results: finalTop5Rids,
          initialRungs: generateRandomRungs(),
          ranking: ranking
        }
      };
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error('Error starting amidakuji phase:', error);
      alert('Failed to start Amidakuji phase.');
    } finally {
      setLoading(false);
    }
  }

  // ... (Prefs Submit code unchanged) ...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">

      {/* GLOBAL TIMER DISPLAY (Optional floating?) - Or just keep existing ones */}
      {/* Keeping existing flow */}

      {mode === 'home' && (
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 py-2">
            GatheringFun
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">
            Decide where and when to meet, the fun way!
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500" onClick={() => setMode('create')}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 dark:text-white">Create Gathering</h3>
              <p className="text-gray-500 dark:text-gray-400">Host a new meeting and invite friends.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Join Gathering</h3>
              <input
                type="text"
                placeholder="Enter Session ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 mb-4 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
              />
              <button
                onClick={() => joinId && setMode('join')}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="text-center">
          <button onClick={() => setMode('home')} className="mb-8 text-gray-500 hover:text-blue-500 flex items-center mx-auto text-sm">
            ← Cancel and Go Back
          </button>
          <HostForm onSubmit={handleCreateSession} loading={loading} />
        </div>
      )}

      {mode === 'join' && (
        <div className="text-center">
          <button onClick={() => setMode('home')} className="mb-8 text-gray-500 hover:text-purple-500 flex items-center mx-auto text-sm">
            ← Cancel and Go Back
          </button>
          <JoinSession sessionId={joinId} onJoined={onJoined} />
        </div>
      )}

      {mode === 'preferences' && session && (
        <div className="text-center">
          <div className="mb-6 mx-auto w-fit px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{timeLeft}</span>
          </div>
          <button onClick={() => { setSession(null); setMode('home'); }} className="mb-4 text-gray-500 hover:text-blue-500 flex items-center mx-auto text-sm">
            ← Cancel and Go Back
          </button>
          <ParticipantPreferences
            sessionData={session}
            onSubmit={handleSubmitPreferences}
            loading={loading}
          />
        </div>
      )}

      {(mode === 'created' || mode === 'waiting') && (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">You're in!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {mode === 'waiting' ? 'Preferences submitted. Waiting for Phase 2 to end...' : `"${session?.name}" is LIVE!`}
          </p>

          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Time Remaining</p>
            <p className="text-4xl font-mono font-black text-blue-700 dark:text-blue-300">{timeLeft || '--:--'}</p>
          </div>

          {(session || joinId) && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 mb-8">
              <p className="text-sm font-medium text-gray-500 mb-2">Session ID</p>
              <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                {session ? session.id : joinId}
              </code>
            </div>
          )}

          <button
            onClick={() => {
              const id = session ? session.id : joinId;
              navigator.clipboard.writeText(id);
              alert('ID copied!');
            }}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all mb-4"
          >
            Copy ID
          </button>

          {/* Host Only: Start Swiping Phase */}
          {session?.hostId === auth.currentUser?.uid && session?.status === 'recruiting' && (
            <button
              onClick={handleStartSwiping}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all mb-4"
            >
              {loading ? 'Starting...' : 'Start Swiping Phase →'}
            </button>
          )}

          <button onClick={() => { setSession(null); setMode('home'); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium">
            ← Exit Session
          </button>

          {/* Host Only: Start Amidakuji Phase */}
          {session?.hostId === auth.currentUser?.uid && session?.status === 'swiping' && (
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-4">Once everyone has voted, start the game!</p>
              <button
                onClick={handleStartAmidakuji}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
              >
                {loading ? 'Initializing...' : 'Start Amidakuji Battle! ⚔️'}
              </button>
            </div>
          )}
        </div>
      )}
      {mode === 'swiping' && (
        <div className="text-center">
          <div className="mb-6 mx-auto w-fit px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{timeLeft}</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12">Vote for Restaurants</h2>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-bold animate-pulse">Finding best spots for you...</p>
            </div>
          ) : (
            <TinderSwiper
              restaurants={restaurants}
              onFinish={async (votes) => {
                try {
                  console.log('Swiping finished, saving votes:', votes);
                  const docRef = doc(db, 'sessions', session.id);
                  await setDoc(docRef, {
                    restaurantVotes: {
                      [auth.currentUser.uid]: votes.like
                    }
                  }, { merge: true });
                  console.log('Votes saved, transitioning to waiting_amidakuji');
                  setMode('waiting_amidakuji');
                } catch (error) {
                  console.error('Error saving votes:', error);
                  alert('Error saving votes: ' + error.message);
                }
              }}
            />
          )}
        </div>
      )}

      {mode === 'waiting_amidakuji' && (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white">
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Time Remaining</p>
            <p className="text-4xl font-mono font-black text-blue-700 dark:text-blue-300">{timeLeft || '--:--'}</p>
          </div>
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Votes Cast!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Waiting for everyone to finish swiping. Next: The Amidakuji Game!</p>
          <div className="animate-pulse flex items-center justify-center gap-2 mb-8">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '200ms' }}></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '400ms' }}></span>
          </div>

          {/* Host Only: Start Amidakuji */}
          {session?.hostId === auth.currentUser?.uid && (
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-4">Once everyone has voted, start the game!</p>
              <button
                onClick={handleStartAmidakuji}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
              >
                {loading ? 'Initializing...' : 'Start Amidakuji Battle! ⚔️'}
              </button>
            </div>
          )}
        </div>
      )}
      {mode === 'amidakuji' && (
        <div className="text-center">
          <div className="mb-6 mx-auto w-fit px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{timeLeft}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 py-2">命運對決</h2>
          <p className="text-gray-500 mb-12">Add rungs to the ladder and select your starting lane!</p>
          <Amidakuji
            sessionId={session.id}
            restaurants={restaurants}
            currentUser={auth.currentUser}
            sessionData={session}
            onFinish={async (result) => {
              // DO NOT set 'status' to 'finished' immediately.
              // Just save MY result and wait.
              console.log("Amidakuji Finished locally. Result:", result);

              const docRef = doc(db, 'sessions', session.id);
              await setDoc(docRef, {
                amidakujiResults: {
                  [auth.currentUser.uid]: result.id
                }
              }, { merge: true });

              setMode('waiting_result');
            }}
          />
        </div>
      )}

      {mode === 'waiting_result' && (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white mt-12">
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Final Countdown</p>
            <p className="text-5xl font-mono font-black text-red-600 dark:text-red-400 animate-pulse">{timeLeft || '00:00'}</p>
          </div>
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Fate Decided!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Waiting for the timer to end for the Grand Reveal...</p>
        </div>
      )}

      {mode === 'finished' && session?.finalChoice && (
        <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl text-center border-4 border-yellow-400">
          <div className="mb-8">
            <span className="px-6 py-2 bg-yellow-400 text-yellow-900 text-sm font-black rounded-full uppercase tracking-tighter">Winner Winner Dinner!</span>
          </div>

          <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">{session.finalChoice.name}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">{session.finalChoice.address}</p>

          {/* 3 Images Grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {session.finalChoice.images && session.finalChoice.images.length > 0 ? (
              session.finalChoice.images.slice(0, 3).map((imgUrl, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-md">
                  <img src={imgUrl} alt="Food" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ))
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl mb-10 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-bold dark:text-gray-300">{session.startDate}</span>
            </div>
            {/* PRICE REMOVED AS REQUESTED */}
          </div>

          {/* RANKING LIST */}
          <div className="mb-10 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popularity Ranking (Phase 3 Votes)</h3>
            <div className="space-y-2">
              {session.finalRanking && session.finalRanking.map((rank, idx) => (
                <div key={rank.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium dark:text-white">{rank.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{rank.votes} votes</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                const query = encodeURIComponent(`${session.finalChoice.name} ${session.finalChoice.address}`);
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
                window.open(mapsUrl, '_blank');
              }}
              className="w-full py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
              View on Google Maps
            </button>

            <button
              onClick={() => {
                const title = encodeURIComponent(`Gathering: ${session.name}`);
                const query = `${session.finalChoice.name} ${session.finalChoice.address}`;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                const details = encodeURIComponent(`Restaurant: ${session.finalChoice.name}\nAddress: ${session.finalChoice.address}\nMap: ${mapsUrl}`);

                // Format dates for Google Calendar (YYYYMMDD/YYYYMMDD for all-day)
                // We default to the start date. 
                const start = session.startDate.replace(/-/g, '');
                // Calculate next day for end date (Google Calendar all-day events are exclusive of end date)
                const startDateObj = new Date(session.startDate);
                startDateObj.setDate(startDateObj.getDate() + 1);
                const end = startDateObj.toISOString().split('T')[0].replace(/-/g, '');

                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(session.finalChoice.address)}&dates=${start}/${end}`;
                window.open(url, '_blank');
              }}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" /></svg>
              Add to Google Calendar
            </button>

            <button
              onClick={() => setMode('home')}
              className="py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium"
            >
              Start New Gathering
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
