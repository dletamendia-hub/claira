window.Claira = window.Claira || {};

(() => {
  const { useState, useCallback } = React;
  const { ShaderCanvas, StatusBar } = window.Claira;
  const { HomeScreen, ChatScreen, InsightScreen, TherapiesScreen, MatchingScreen, TherapistScreen, BookingScreen } = window.Claira;
  const { QUESTIONS, getInsight } = window.Claira;

  function App() {
    const [screen, setScreen]   = useState('home');
    const [step, setStep]       = useState(0);
    const [answers, setAnswers] = useState({});
    const [therapist, setTh]    = useState(null);
    const [menuOpen, setMenu]   = useState(false);

    const insight = Object.keys(answers).length ? getInsight(answers) : null;

    const handleAnswer = useCallback((val) => {
      const q = QUESTIONS[step];
      const next = { ...answers, [q.id]: val };
      setAnswers(next);
      if (step < QUESTIONS.length - 1) setStep(s => s + 1);
      else setScreen('insight');
    }, [step, answers]);

    const handleEdit = useCallback((idx) => {
      const trimmed = {};
      QUESTIONS.slice(0, idx).forEach(q => { if (answers[q.id]) trimmed[q.id] = answers[q.id]; });
      setAnswers(trimmed); setStep(idx); setScreen('chat');
    }, [answers]);

    const restart = () => { setScreen('home'); setStep(0); setAnswers({}); setTh(null); };

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', position:'relative', background:'#0b0b14' }}>
        <ShaderCanvas />
        {screen !== 'home' && <StatusBar />}

        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, position:'relative' }}>
          {screen === 'home'       && <HomeScreen onStart={()=>setScreen('chat')} />}
          {screen === 'chat'       && <ChatScreen step={step} answers={answers} onAnswer={handleAnswer} onEditStep={handleEdit} />}
          {screen === 'insight'    && insight && <InsightScreen answers={answers} onContinue={()=>setScreen('therapies')} onRestart={()=>{ setStep(0); setAnswers({}); setScreen('chat'); }} />}
          {screen === 'therapies'  && insight && <TherapiesScreen insight={insight} onContinue={()=>setScreen('matching')} onBack={()=>setScreen('insight')} />}
          {screen === 'matching'   && <MatchingScreen onSelect={t=>{setTh(t);setScreen('therapist');}} onBack={()=>setScreen('therapies')} />}
          {screen === 'therapist'  && therapist && <TherapistScreen therapist={therapist} onBook={()=>setScreen('booking')} onBack={()=>setScreen('matching')} />}
          {screen === 'booking'    && therapist && <BookingScreen therapist={therapist} onBack={()=>setScreen('therapist')} onRestart={restart} />}
        </div>

        {menuOpen && (
          <div className="fade-in" onClick={()=>setMenu(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex' }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:260, height:'100%', background:'#13131e', padding:'60px 28px 40px', display:'flex', flexDirection:'column', gap:8, borderRight:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'rgba(255,255,255,0.85)', fontStyle:'italic', marginBottom:24 }}>claira</div>
              {['À propos','Confidentialité','Aide','Ressources d\'urgence'].map(l=>(
                <button key={l} style={{ background:'none', border:'none', textAlign:'left', padding:'12px 0', fontSize:14, color:'rgba(255,255,255,0.50)', fontFamily:'inherit', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>{l}</button>
              ))}
              <div style={{ marginTop:'auto', fontSize:11, color:'rgba(255,255,255,0.20)', lineHeight:1.6 }}>Claira n'est pas un service médical. En cas de détresse, contacte le 3114.</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  window.Claira.App = App;
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
