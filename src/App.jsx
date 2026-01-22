import { useState, useEffect } from 'react'
import { db, auth } from './lib/firebase'
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import HostForm from './components/HostForm'
import JoinSession from './components/JoinSession'
import TinderSwiper from './components/TinderSwiper'
import Amidakuji from './components/Amidakuji'
import { fetchRestaurantsMock } from './services/restaurantService'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('home') // home, create, join, waiting, swiping, amidakuji
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

          // Auto-transition to swiping if status changes
          if (data.status === 'swiping' && mode !== 'swiping') {
            loadRestaurants(data);
            setMode('swiping')
          }
        }
      })
    }
    return () => unsubscribe()
  }, [session?.id, joinId, mode])

  const loadRestaurants = async (sessionData) => {
    const data = await fetchRestaurantsMock(sessionData);
    setRestaurants(data);
  }

  // Timer logic
  useEffect(() => {
    if (!session?.waitDeadline) return

    const interval = setInterval(() => {
      const deadline = session.waitDeadline.toDate ? session.waitDeadline.toDate() : new Date(session.waitDeadline)
      const now = new Date()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft('Time is up! Transitioning...')
        clearInterval(interval)
        // In a real app, a Cloud Function or the host would trigger the transition
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.waitDeadline])

  const handleCreateSession = async (data) => {
    setLoading(true)
    try {
      if (!auth.currentUser) await signInAnonymously(auth)

      const sessionData = {
        ...data,
        hostId: auth.currentUser.uid,
        status: 'recruiting',
        createdAt: serverTimestamp(),
        participants: [auth.currentUser.uid],
        waitDeadline: new Date(Date.now() + data.waitMinutes * 60000)
      }

      const docRef = await addDoc(collection(db, 'sessions'), sessionData)
      setSession({ id: docRef.id, ...sessionData })
      setMode('created')

    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Check your Firebase config.')
    } finally {
      setLoading(false)
    }
  }

  const onJoined = (id) => {
    setMode('waiting')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
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

          <button onClick={() => { setSession(null); setMode('home'); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium">
            ← Exit Session
          </button>
        </div>
      )}
      {mode === 'swiping' && (
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12">Vote for Restaurants</h2>
          <TinderSwiper
            restaurants={restaurants}
            onFinish={async (votes) => {
              const docRef = doc(db, 'sessions', session.id);
              await updateDoc(docRef, {
                [`restaurantVotes.${auth.currentUser.uid}`]: votes.like
              });
              setMode('waiting_amidakuji');
            }}
          />
        </div>
      )}

      {mode === 'waiting_amidakuji' && (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Votes Cast!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Waiting for everyone to finish swiping. Next: The Amidakuji Game!</p>
          <div className="animate-pulse flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '200ms' }}></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '400ms' }}></span>
          </div>
        </div>
      )}
      {mode === 'amidakuji' && (
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 py-2">命運對決</h2>
          <p className="text-gray-500 mb-12">Add rungs to the ladder and select your starting lane!</p>
          <Amidakuji
            sessionId={session.id}
            restaurants={restaurants}
            currentUser={auth.currentUser}
            sessionData={session}
            onFinish={(result) => {
              setSession(prev => ({ ...prev, finalChoice: result, status: 'finished' }));
              setMode('finished');
            }}
          />
        </div>
      )}

      {mode === 'finished' && session?.finalChoice && (
        <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl text-center border-4 border-yellow-400">
          <div className="mb-8">
            <span className="px-6 py-2 bg-yellow-400 text-yellow-900 text-sm font-black rounded-full uppercase tracking-tighter">Winner Winner Dinner!</span>
          </div>

          <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">{session.finalChoice.name}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">{session.finalChoice.address}</p>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl mb-10 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-bold dark:text-gray-300">{session.startDate}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Price Range</span>
              <span className="font-bold text-green-600">
                {'$'.repeat(session.minPrice)} - {'$'.repeat(session.maxPrice)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                const title = encodeURIComponent(`Gathering: ${session.name}`);
                const details = encodeURIComponent(`Restaurant: ${session.finalChoice.name}\nAddress: ${session.finalChoice.address}`);
                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(session.finalChoice.address)}`;
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
