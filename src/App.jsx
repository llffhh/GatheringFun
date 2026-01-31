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
    const id = session?.id || (mode === 'waiting' || mode === 'swiping' ? joinId : null)

    if (id) {
      unsubscribe = onSnapshot(doc(db, 'sessions', id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSession({ id: snapshot.id, ...data })

          const myUid = auth.currentUser?.uid;
          const hasSubmittedPrefs = data.participantPreferences?.[myUid];

          // Phase Control Logic
          if (hasSubmittedPrefs && mode !== 'swiping' && mode !== 'created' && mode !== 'waiting_amidakuji' && mode !== 'amidakuji' && mode !== 'waiting_result' && mode !== 'finished') {
            loadRestaurants({ id: snapshot.id, ...data });
            setMode('swiping');
          }

          if (data.status === 'amidakuji' && mode !== 'amidakuji' && mode !== 'waiting_result') {
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
    let finalRestaurantId = null;
    const phase3Votes = {};
    Object.values(currentSession.restaurantVotes || {}).forEach(likes => {
      likes.forEach(rid => {
        phase3Votes[rid] = (phase3Votes[rid] || 0) + 1;
      });
    });
    const phase3Ranking = Object.keys(phase3Votes)
      .sort((a, b) => phase3Votes[b] - phase3Votes[a])
      .map(rid => ({
        id: rid,
        votes: phase3Votes[rid],
        name: restaurants.find(r => r.id === rid)?.name
      }));

    const amidakujiResults = currentSession.amidakujiResults || {};
    const amidakujiVotes = {};
    const finishedUsers = Object.keys(amidakujiResults);

    if (finishedUsers.length > 0) {
      Object.values(amidakujiResults).forEach(rid => {
        amidakujiVotes[rid] = (amidakujiVotes[rid] || 0) + 1;
      });
      finalRestaurantId = Object.keys(amidakujiVotes).sort((a, b) => amidakujiVotes[b] - amidakujiVotes[a])[0];
    } else {
      finalRestaurantId = phase3Ranking[0]?.id || restaurants[0]?.id;
    }

    const finalChoice = restaurants.find(r => r.id === finalRestaurantId) || restaurants[0];
    if (finalChoice) {
      await updateDoc(doc(db, 'sessions', currentSession.id), {
        status: 'finished',
        finalChoice: finalChoice,
        finalRanking: phase3Ranking
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

      const docRefUpdate = doc(db, 'sessions', docRef.id);
      await updateDoc(docRefUpdate, {
        participantPreferences: {
          [auth.currentUser.uid]: { nickname: data.nickname, submittedAt: serverTimestamp() }
        }
      });
      setMode('created')
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Error creating session: ' + error.message)
    } finally { setLoading(false) }
  }

  const handleStartAmidakuji = async () => {
    if (!session?.id || !session?.restaurantVotes) return;
    setLoading(true);
    try {
      const voteCounts = {};
      Object.values(session.restaurantVotes).forEach(likes => {
        likes.forEach(rid => { voteCounts[rid] = (voteCounts[rid] || 0) + 1; });
      });
      const sortedRids = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
      const finalTop5Rids = sortedRids.slice(0, 5);
      while (finalTop5Rids.length < 5 && restaurants.length > finalTop5Rids.length) {
        const fallback = restaurants.find(r => !finalTop5Rids.includes(r.id));
        if (fallback) finalTop5Rids.push(fallback.id); else break;
      }

      const ranking = finalTop5Rids.map(rid => ({
        id: rid,
        name: restaurants.find(r => r.id === rid)?.name || 'Unknown',
        votes: voteCounts[rid] || 0
      }));

      const generateRandomRungs = (numLanes = 5, numRungs = 15) => {
        const rungs = [];
        for (let i = 0; i < numRungs; i++) {
          rungs.push({ lane: Math.floor(Math.random() * (numLanes - 1)), y: 150 + Math.random() * 400 });
        }
        return rungs.sort((a, b) => a.y - b.y);
      }

      await updateDoc(doc(db, 'sessions', session.id), {
        status: 'amidakuji',
        amidakuji: { results: finalTop5Rids, initialRungs: generateRandomRungs(), ranking: ranking }
      });
    } catch (error) { console.error('Error starting amidakuji:', error); }
    finally { setLoading(false); }
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
        <RestaurantWaitingRoom session={session} timeLeft={timeLeft} currentUser={auth.currentUser} handleStartAmidakuji={handleStartAmidakuji} loading={loading} />
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
