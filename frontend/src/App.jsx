import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mode, setMode] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [coins, setCoins] = useState(0);
  const [frame, setFrame] = useState(0);

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

  const catImages = {
    idle:  ['/cat_wait_1.png', '/cat_wait_2.png'],
    work:  ['/cat_work_1.png', '/cat_work_2.png'],
    break: ['/cat_sleep_1.png', '/cat_sleep_2.png']
  };

  const potentialCoinsPerSet = selectedPreset.work;
  const totalPotentialCoins = potentialCoinsPerSet * setsTotal;

  useEffect(() => {
    fetch('http://localhost:8000/user/1')
      .then(res => res.json())
      .then(data => setCoins(data.coins))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const animInterval = setInterval(() => setFrame(prev => (prev === 0 ? 1 : 0)), 500);
    return () => clearInterval(animInterval);
  }, []);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerZero();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleTimerZero = () => {
    if (mode === 'work') {
      fetch('http://localhost:8000/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, duration_minutes: selectedPreset.work, earned_coins: potentialCoinsPerSet })
      }).then(() => {
        setCoins(prev => prev + potentialCoinsPerSet);
        if (currentSet >= setsTotal) {
          setIsActive(false);
          setMode('idle');
          alert(`Koniec! Zarabiasz ${totalPotentialCoins} monet! 🪙`);
        } else {
          setMode('break');
          setTimeLeft(selectedPreset.break * 60);
        }
      });
    } else if (mode === 'break') {
      setCurrentSet(prev => prev + 1);
      setMode('work');
      setTimeLeft(selectedPreset.work * 60);
    }
  };

  const startPomodoro = () => {
    setCurrentSet(1);
    setMode('work');
    setTimeLeft(selectedPreset.work * 60);
    setIsActive(true);
  };

  const stopPomodoro = () => {
    if (window.confirm("⚠️ Przerwać? Stracisz monety za tę sesję!")) {
      setIsActive(false);
      setMode('idle');
      setTimeLeft(0);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="app-container">
      <h1>Pomodoro Cat 🐾</h1>
      <div className="coin-display">
        🪙 Monety: {coins}
      </div>

      <div className="cat-container">
        <img src={catImages[mode][frame]} alt="Kotek" />
      </div>

      <div className="timer">
        {isActive ? formatTime(timeLeft) : "00:00"}
      </div>

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