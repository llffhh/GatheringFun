import { useState, useEffect } from 'react'
import { db, auth } from './lib/firebase'
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'

// Modular Components
import HomeView from './components/HomeView'
import HostForm from './components/HostForm'
import JoinSession from './components/JoinSession'
import ParticipantPreferences from './components/ParticipantPreferences'
import TinderSwiper from './components/TinderSwiper'
import RestaurantWaitingRoom from './components/RestaurantWaitingRoom'
import Amidakuji from './components/Amidakuji'
import WaitingRoom from './components/WaitingRoom'
import FinalResult from './components/FinalResult'

import { fetchRestaurantsLive } from './services/restaurantService'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('home') // home, create, join, preferences, swiping, waiting_amidakuji, amidakuji, waiting_result, finished
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
    const id = session?.id || (joinId && !['home', 'create', 'join'].includes(mode) ? joinId : null)

    if (id) {
      unsubscribe = onSnapshot(doc(db, 'sessions', id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSession({ id: snapshot.id, ...data })

          const myUid = auth.currentUser?.uid;
          const hasSubmittedPrefs = data.participantPreferences?.[myUid];

          // Phase Control Logic
          // If the session is still recruiting, stay in the swiping flow
          if (data.status === 'recruiting') {
            if (hasSubmittedPrefs && mode !== 'swiping' && mode !== 'waiting_amidakuji') {
              loadRestaurants({ id: snapshot.id, ...data });
              setMode('swiping');
            }
          }

          if (data.status === 'amidakuji' && mode !== 'amidakuji' && mode !== 'waiting_result' && mode !== 'finished') {
            setMode('amidakuji')
          }
          if (data.status === 'finished' && mode !== 'finished') {
            setMode('finished')
          }

          // AUTO-FINISH: If everyone is finished the game, the host triggers the final result immediately
          const resultsCount = Object.keys(data.amidakujiResults || {}).length;
          const participantCount = (data.participants || []).length;
          if (data.status === 'amidakuji' && resultsCount >= participantCount && participantCount > 0) {
            if (data.hostId === myUid && restaurants.length > 0) {
              calculateFinalResult(data);
            }
          }

          // Ensure restaurants are loaded if we are in an active phase OR if we are the host in 'created' mode
          const isActiveMode = ['swiping', 'waiting_amidakuji', 'amidakuji', 'waiting_result'].includes(mode);
          const isHostCreating = (mode === 'created' && data.hostId === myUid);

          if ((isActiveMode || isHostCreating) && restaurants.length === 0) {
            loadRestaurants(data);
          }
        }
      })
    }
    return () => unsubscribe()
  }, [session?.id, joinId, mode])

  const loadRestaurants = async (sessionData) => {
    if (!sessionData) return;
    setLoading(true);
    const userId = auth.currentUser.uid;
    const participantPrefs = sessionData.participantPreferences?.[userId];

    // If no participant prefs (e.g. Host hasn't joined yet), use global session defaults
    const locations = (participantPrefs?.locations && participantPrefs.locations.length > 0)
      ? participantPrefs.locations
      : sessionData.locations;
    const cuisines = (participantPrefs?.cuisines && participantPrefs.cuisines.length > 0)
      ? participantPrefs.cuisines
      : sessionData.cuisines;

    const filterPrefs = {
      minPrice: Number(sessionData.minPrice),
      maxPrice: Number(sessionData.maxPrice),
      locations: locations || [],
      cuisines: cuisines || []
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

        // Timer reached 0: Transition based on current status
        if (session.hostId === auth.currentUser?.uid) {
          if (session.status === 'recruiting') {
            handleStartAmidakuji();
          } else if (session.status === 'amidakuji' || session.status === 'waiting_result') {
            // Only calculate if we have restaurants loaded
            if (restaurants.length > 0) {
              calculateFinalResult(session);
            } else {
              console.warn("Timer reached 0 but restaurants not loaded. Waiting for background sync...");
            }
          }
        }
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session, mode])

  const calculateFinalResult = async (currentSession) => {
    let finalRestaurantId = null;
    const phase3Votes = {};
    Object.values(currentSession.restaurantVotes || {}).forEach(likes => {
      likes.forEach(rid => {
        phase3Votes[rid] = (phase3Votes[rid] || 0) + 1;
      });
    });
    const phase3Ranking = Object.keys(phase3Votes)
      .sort((a, b) => phase3Votes[b] - phase3Votes[a])
      .map(rid => {
        const res = restaurants.find(r => r.id === rid);
        return {
          id: rid,
          votes: phase3Votes[rid],
          name: res?.name || 'Unknown Restaurant'
        };
      });

    const amidakujiResults = currentSession.amidakujiResults || {};
    const amidakujiVotes = {};
    const finishedUsers = Object.keys(amidakujiResults);

    if (finishedUsers.length > 0) {
      Object.values(amidakujiResults).forEach(rid => {
        amidakujiVotes[rid] = (amidakujiVotes[rid] || 0) + 1;
      });
      finalRestaurantId = Object.keys(amidakujiVotes).sort((a, b) => amidakujiVotes[b] - amidakujiVotes[a])[0];
    } else {
      finalRestaurantId = phase3Ranking[0]?.id || (restaurants.length > 0 ? restaurants[0].id : null);
    }

    if (!finalRestaurantId && restaurants.length > 0) finalRestaurantId = restaurants[0].id;

    const finalChoice = restaurants.find(r => r.id === finalRestaurantId) || (restaurants.length > 0 ? restaurants[0] : null);

    // Scheduling Matcher
    const dateCounts = {};
    const timeCounts = {};
    Object.values(currentSession.participantPreferences || {}).forEach(prefs => {
      (prefs.dates || []).forEach(d => { dateCounts[d] = (dateCounts[d] || 0) + 1; });
      (prefs.timePeriods || []).forEach(t => { timeCounts[t] = (timeCounts[t] || 0) + 1; });
    });

    const finalDate = Object.keys(dateCounts).sort((a, b) => dateCounts[b] - dateCounts[a])[0] || currentSession.startDate;
    const finalTime = Object.keys(timeCounts).sort((a, b) => timeCounts[b] - timeCounts[a])[0] || (currentSession.timePeriods?.[0] || 'TBD');

    if (finalChoice) {
      await updateDoc(doc(db, 'sessions', currentSession.id), {
        status: 'finished',
        finalChoice: finalChoice,
        finalRanking: phase3Ranking,
        finalDate: finalDate,
        finalTime: finalTime
      });
    } else {
      // Emergency fallback to ensure transition happens even if data is corrupted
      await updateDoc(doc(db, 'sessions', currentSession.id), {
        status: 'finished',
        finalDate: finalDate,
        finalTime: finalTime
      });
    }
  }

  const handleCreateSession = async (data) => {
    setLoading(true)
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const sessionData = {
        ...data,
        hostId: auth.currentUser?.uid,
        status: 'recruiting',
        createdAt: serverTimestamp(),
        participants: [auth.currentUser?.uid],
        waitDeadline: new Date(Date.now() + Number(data.waitMinutes) * 60000)
      }
      const docRef = await addDoc(collection(db, 'sessions'), sessionData)
      setSession({ id: docRef.id, ...sessionData })
      setJoinId(docRef.id) // Ensure joinId is set for the invitation screen transitions
      setMode('created')
    } catch (error) {
      console.error('Error creating session:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("🚨 DEPLOYMENT ERROR: This website is not authorized to use Firebase Authentication.\n\nPlease go to your Firebase Console -> Authentication -> Settings -> Authorized Domains and add 'llffhh.github.io' to the list.");
      } else {
        alert("Error creating session: " + error.message);
      }
    } finally { setLoading(false) }
  }

  const handleStartAmidakuji = async () => {
    if (!session?.id || session.status === 'amidakuji') return;
    setLoading(true);
    try {
      const voteCounts = {};
      if (session.restaurantVotes) {
        Object.values(session.restaurantVotes).forEach(likes => {
          likes.forEach(rid => { voteCounts[rid] = (voteCounts[rid] || 0) + 1; });
        });
      }
      const topVotedRids = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
      const finalTop5Rids = topVotedRids.slice(0, 5);

      // Fill gaps if fewer than 5 voted or if no votes cast
      while (finalTop5Rids.length < 5 && restaurants.length > finalTop5Rids.length) {
        const fallback = restaurants.find(r => !finalTop5Rids.includes(r.id));
        if (fallback) finalTop5Rids.push(fallback.id); else break;
      }

      // If still fewer than 5 (rare), use whatever we have or mock IDs if needed, but restaurants should have many.

      const ranking = finalTop5Rids.map(rid => ({
        id: rid,
        name: restaurants.find(r => r.id === rid)?.name || 'Unknown',
        votes: voteCounts[rid] || 0
      }));

      await updateDoc(doc(db, 'sessions', session.id), {
        status: 'amidakuji',
        amidakuji: { results: finalTop5Rids, ranking: ranking },
        waitDeadline: new Date(Date.now() + 180000) // Add 3 minutes for the game
      });
    } catch (error) { console.error('Error starting amidakuji:', error); }
    finally { setLoading(false); }
  }

  const handleEndVotingEarly = async () => {
    if (!session?.id || session.status !== 'recruiting') return;
    setLoading(true);
    try {
      // Set the deadline to now, which triggers the timer logic for everyone
      await updateDoc(doc(db, 'sessions', session.id), {
        waitDeadline: new Date()
      });
    } catch (error) {
      console.error('Error ending voting early:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">

      {mode === 'home' && (
        <HomeView setMode={setMode} joinId={joinId} setJoinId={setJoinId} />
      )}

      {mode === 'create' && (
        <div className="text-center">
          <button onClick={() => setMode('home')} className="mb-8 text-gray-500 hover:text-blue-500 mx-auto text-sm">← Back</button>
          <HostForm onSubmit={handleCreateSession} loading={loading} />
        </div>
      )}

      {mode === 'created' && (
        <HostForm session={session} setSession={setSession} setMode={setMode} timeLeft={timeLeft} />
      )}

      {mode === 'join' && (
        <div className="text-center">
          <button onClick={() => setMode('home')} className="mb-8 text-gray-500 hover:text-purple-500 mx-auto text-sm">← Back</button>
          <JoinSession sessionId={joinId} onJoined={(id) => setMode('waiting')} />
        </div>
      )}

      {mode === 'waiting' && <HostForm session={session} setSession={setSession} setMode={setMode} timeLeft={timeLeft} />}

      {mode === 'preferences' && (
        <ParticipantPreferences sessionData={session} onSubmit={async (p) => {
          await updateDoc(doc(db, 'sessions', session.id), { [`participantPreferences.${auth.currentUser.uid}`]: { ...p, submittedAt: serverTimestamp() } }, { merge: true });
          await loadRestaurants({ ...session, participantPreferences: { [auth.currentUser.uid]: p } });
          setMode('swiping');
        }} loading={loading} />
      )}

      {mode === 'swiping' && (
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12">Vote for Restaurants</h2>
          {loading ? <p className="animate-pulse">Loading menu...</p> : (
            <TinderSwiper restaurants={restaurants} onFinish={async (v) => {
              await updateDoc(doc(db, 'sessions', session.id), { [`restaurantVotes.${auth.currentUser.uid}`]: v.like }, { merge: true });
              setMode('waiting_amidakuji');
            }} />
          )}
        </div>
      )}

      {mode === 'waiting_amidakuji' && (
        <RestaurantWaitingRoom session={session} timeLeft={timeLeft} currentUser={auth.currentUser} handleEndVotingEarly={handleEndVotingEarly} loading={loading} />
      )}

      {mode === 'amidakuji' && (
        <Amidakuji sessionId={session.id} restaurants={restaurants} currentUser={auth.currentUser} sessionData={session} onFinish={async (r) => {
          await updateDoc(doc(db, 'sessions', session.id), { [`amidakujiResults.${auth.currentUser.uid}`]: r.id }, { merge: true });
          setMode('waiting_result');
        }} />
      )}

      {mode === 'waiting_result' && (
        <WaitingRoom session={session} timeLeft={timeLeft} restaurants={restaurants} currentUser={auth.currentUser} />
      )}

      {mode === 'finished' && session?.finalChoice && (
        <FinalResult session={session} setMode={setMode} />
      )}

    </div>
  )
}

export default App
