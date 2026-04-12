import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // keeping track of what the cat is doing and how much time is left
  const [mode, setMode] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [coins, setCoins] = useState(0);
  const [frame, setFrame] = useState(0);

  // our cheat sheet for work and break times
  const presets = [
    { label: '50m praca / 10m przerwa', work: 50, break: 10 },
    { label: '40m praca / 10m przerwa', work: 40, break: 10 },
    { label: '30m praca / 10m przerwa', work: 30, break: 10 },
    { label: '30m praca / 5m przerwa', work: 30, break: 5 },
    { label: '25m praca / 5m przerwa', work: 25, break: 5 }
  ];
  
  const [selectedPreset, setSelectedPreset] = useState(presets[4]);
  const [setsTotal, setSetsTotal] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);

  // mapping the cat's mood to actual image files from the public folder
  const catImages = {
    idle:  ['/cat_idle_1.jpg', '/cat_idle_2.jpg'],
    work:  ['/cat_work_1.jpg', '/cat_work_2.jpg'],
    break: ['/cat_sleep_1.jpg', '/cat_sleep_2.jpg']
  };

  // figure out how rich we're gonna get
  const potentialCoinsPerSet = selectedPreset.work;
  const totalPotentialCoins = potentialCoinsPerSet * setsTotal;

  // grabbing the initial coin balance from the server on startup
  useEffect(() => {
    fetch('http://localhost:8000/user/1')
      .then(res => res.json())
      .then(data => setCoins(data.coins))
      .catch(err => console.error(err));
  }, []);

  // a simple loop to make the cat 'breathe' or 'type' every half second
  useEffect(() => {
    const animInterval = setInterval(() => setFrame(prev => (prev === 0 ? 1 : 0)), 500);
    return () => clearInterval(animInterval);
  }, []);

  // the main clock tick, counts down every second if the timer is active
  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerZero(); // time's up!
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // figuring out what to do when the clock hits zero
  const handleTimerZero = () => {
    if (mode === 'work') {
      // telling the server we did a good job and want our coins
      fetch('http://localhost:8000/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, duration_minutes: selectedPreset.work, earned_coins: potentialCoinsPerSet })
      }).then(() => {
        // update local state so we see the money instantly
        setCoins(prev => prev + potentialCoinsPerSet);
        
        // checking if we're completely done for the day
        if (currentSet >= setsTotal) {
          setIsActive(false);
          setMode('idle');
          alert(`Koniec! Zarabiasz ${totalPotentialCoins} monet! 🪙`);
        } else {
          // not done yet, time for a quick nap
          setMode('break');
          setTimeLeft(selectedPreset.break * 60);
        }
      });
    } else if (mode === 'break') {
      // nap is over, back to the grind
      setCurrentSet(prev => prev + 1);
      setMode('work');
      setTimeLeft(selectedPreset.work * 60);
    }
  };

  // kicking off a fresh work session from scratch
  const startPomodoro = () => {
    setCurrentSet(1);
    setMode('work');
    setTimeLeft(selectedPreset.work * 60);
    setIsActive(true);
  };

  // rage quitting the current session, with a warning of course
  const stopPomodoro = () => {
    if (window.confirm("⚠️ Przerwać? Stracisz monety za tę sesję!")) {
      setIsActive(false);
      setMode('idle');
      setTimeLeft(0);
    }
  };

  // turning raw seconds into a pretty 00:00 string
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // drawing the actual ui on the screen
  return (
    <div className="app-container">
      <h1>Pomodoro Cat 🐾</h1>
      
      {/* showing off the wealth */}
      <div className="coin-display">
        🪙 Monety: {coins}
      </div>

      {/* the star of the show */}
      <div className="cat-container">
        <img src={catImages[mode][frame]} alt="Kotek" />
      </div>

      {/* big numbers */}
      <div className="timer">
        {isActive ? formatTime(timeLeft) : "00:00"}
      </div>

      {/* conditionally rendering the menu if we're chilling, or the stop button if we're working */}
      {!isActive ? (
        <div className="menu-panel">
          <div className="mini-settings">
            <div className="setting-pill">
              <span>⏱️ Czas:</span>
              <select 
                value={JSON.stringify(selectedPreset)} 
                onChange={(e) => setSelectedPreset(JSON.parse(e.target.value))}
              >
                {presets.map((p, idx) => (
                  <option key={idx} value={JSON.stringify(p)}>{p.label}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-pill">
              <span>🔄 Powtórzenia:</span>
              <input 
                type="number" min="1" max="10" 
                value={setsTotal} 
                onChange={(e) => setSetsTotal(parseInt(e.target.value) || 1)}
                style={{ width: '40px' }}
              />
            </div>
          </div>

          <div className="estimation">
            Zdobędziesz: <b>+{totalPotentialCoins} monet</b>
          </div>

          <button className="start-btn" onClick={startPomodoro}>START</button>
        </div>
      ) : (
        <div className="active-panel">
          <div className="active-status">
            Sesja {currentSet} z {setsTotal}
          </div>
          <button className="stop-btn" onClick={stopPomodoro}>Zatrzymaj</button>
        </div>
      )}
    </div>
  );
}

export default App;