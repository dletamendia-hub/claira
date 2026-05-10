window.Claira = window.Claira || {};

(() => {
  const { useState, useEffect, useMemo } = React;
  const { QUESTIONS, THERAPIES, THERAPISTS, getInsight, generateAIInsight } = window.Claira;
  const { MicButton, AppHeader, StatusBar, BackBtn } = window.Claira;

  function HomeScreen({ onStart }) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>
        <AppHeader />
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'20px 28px 36px' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div className="fade-up" style={{ animationDelay:'0.1s', marginBottom:20 }}>
              <h1 style={{ fontFamily:'DM Serif Display, serif', fontSize:42, color:'rgba(255,255,255,0.95)', fontWeight:400, lineHeight:1.15, letterSpacing:'-0.5px' }}>
                Tu n'as pas à tout<br/><em style={{ fontStyle:'italic', color:'rgba(160,200,255,0.95)' }}>porter seul·e.</em>
              </h1>
            </div>
            <p className="fade-up" style={{ animationDelay:'0.25s', fontSize:16, lineHeight:1.7, color:'rgba(255,255,255,0.78)', fontWeight:400, marginBottom:28, maxWidth:300, textWrap:'pretty', fontFamily:'Questrial, sans-serif' }}>
              En quelques minutes, Claira t'aide à mettre des mots sur ce que tu vis et à trouver le bon accompagnement.
            </p>
            <p className="fade-up" style={{ animationDelay:'0.38s', fontSize:13, color:'rgba(255,255,255,0.38)', fontFamily:'Questrial, sans-serif', letterSpacing:'0.04em' }}>Anonyme · 5 minutes</p>
          </div>
          <button className="fade-up" onClick={onStart} style={{ animationDelay:'0.55s', width:'100%', padding:'17px 24px', background:'rgba(255,255,255,0.11)', border:'1.5px solid rgba(255,255,255,0.20)', borderRadius:100, fontSize:17, color:'rgba(255,255,255,0.90)', fontFamily:'Questrial, sans-serif', cursor:'pointer', letterSpacing:'0.02em', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.30)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.11)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.20)'; }}>
            Je fais le premier pas →
          </button>
        </div>
      </div>
    );
  }

  function ChatScreen({ step, answers, onAnswer, onEditStep }) {
    const q = QUESTIONS[step];

    const tokens = useMemo(() => {
      const result = [];
      q.text.split('\n').forEach((line, li, arr) => {
        line.split(' ').filter(w=>w).forEach(w => result.push({ type:'word', text:w }));
        if (li < arr.length - 1) result.push({ type:'br' });
      });
      return result;
    }, [q.text]);
    const totalWords = tokens.filter(t=>t.type==='word').length;

    const [phase, setPhase]     = useState('writing');
    const [wordIdx, setWordIdx] = useState(0);
    const [chosen, setChosen]   = useState(null);
    const [inputVal, setInputVal] = useState('');
    const [listening, setListening] = useState(false);

    useEffect(() => {
      setPhase('writing'); setWordIdx(0); setChosen(null); setInputVal('');
    }, [step]);

    useEffect(() => {
      if (phase !== 'writing') return;
      if (wordIdx >= totalWords) {
        const t = setTimeout(() => setPhase('rising'), 140);
        return () => clearTimeout(t);
      }
      const delay = wordIdx === 0 ? 250 : 85;
      const t = setTimeout(() => setWordIdx(i => i + 1), delay);
      return () => clearTimeout(t);
    }, [phase, wordIdx, totalWords]);

    useEffect(() => {
      if (phase !== 'rising') return;
      const t = setTimeout(() => setPhase('options'), 90);
      return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
      if (phase !== 'chosen') return;
      const t = setTimeout(() => setPhase('exiting'), 320);
      return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
      if (phase !== 'exiting') return;
      const t = setTimeout(() => onAnswer(chosen), 480);
      return () => clearTimeout(t);
    }, [phase, chosen, onAnswer]);

    const handleChose = (val) => {
      if (phase !== 'options') return;
      setChosen(val); setPhase('chosen');
    };

    const handleText = (val) => { if(val.trim()) handleChose(val.trim()); };

    const questionUp      = phase === 'rising' || phase === 'options' || phase === 'chosen' || phase === 'exiting';
    const questionOpacity = phase === 'exiting' ? 0 : 1;
    const questionShift   = phase === 'exiting' ? '-40px' : '0px';

    let wCount = 0;
    const renderedText = tokens.map((tok, i) => {
      if (tok.type === 'br') return <br key={i}/>;
      const idx = wCount++;
      return (
        <span key={i} style={{
          display: 'inline',
          opacity: idx < wordIdx ? 1 : 0,
          transition: 'opacity 0.22s ease',
        }}>{tok.text}{' '}</span>
      );
    });

    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>
        <AppHeader onBack={step > 0 ? () => onEditStep(step - 1) : null} />

        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, padding:'0 0 14px', flexShrink:0 }}>
          {QUESTIONS.map((_,i) => (
            <div key={i} style={{ width:i===step?18:6, height:6, borderRadius:3, background:i===step?'rgba(255,255,255,0.55)':i<step?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.12)', transition:'all 0.35s cubic-bezier(.22,1,.36,1)' }}></div>
          ))}
        </div>

        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <div key={step} style={{
            position: 'absolute', left:28, right:28,
            top:      questionUp ? '12%' : '42%',
            transform: `translateY(${questionUp ? questionShift : '-50%'})`,
            opacity:   questionOpacity,
            transition: phase === 'writing' ? 'none' : 'top 0.62s cubic-bezier(.22,1,.36,1), transform 0.48s ease, opacity 0.38s ease',
          }}>
            <h2 style={{ fontFamily:'Questrial, sans-serif', fontSize:34, color:'rgba(255,255,255,0.95)', fontWeight:400, lineHeight:1.22, letterSpacing:'-0.2px' }}>
              {renderedText}
            </h2>
          </div>

          {(phase === 'options' || phase === 'chosen') && (
            <div style={{ position:'absolute', bottom:14, left:24, right:24 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {q.options.map((opt, i) => {
                  const isSel   = chosen === opt.l;
                  const isOther = chosen && !isSel;
                  return (
                    <button key={i} onClick={() => handleChose(opt.l)}
                      style={{
                        padding: '13px 22px',
                        background: isSel ? 'rgba(60,180,160,0.22)' : 'rgba(255,255,255,0.11)',
                        border: `1.5px solid ${isSel ? 'rgba(80,210,185,0.45)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: 100,
                        fontSize: 16,
                        color: isSel ? 'rgba(180,240,225,0.95)' : 'rgba(255,255,255,0.84)',
                        fontFamily: 'Questrial, sans-serif',
                        cursor: 'pointer',
                        opacity: isOther ? 0 : 1,
                        transform: isOther ? 'scale(0.92)' : 'scale(1)',
                        transition: 'opacity 0.22s ease, transform 0.22s ease, background 0.18s, border-color 0.18s',
                        animation: `chipIn 0.32s cubic-bezier(.22,1,.36,1) ${i*0.025}s both`,
                        pointerEvents: phase === 'chosen' ? 'none' : 'auto',
                      }}>
                      {opt.l}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'8px 16px 28px', flexShrink:0, display:'flex', gap:10, alignItems:'center', opacity: phase === 'options' ? 1 : 0, transition:'opacity 0.3s ease', pointerEvents: phase === 'options' ? 'auto' : 'none' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', background:'rgba(255,255,255,0.07)', borderRadius:24, border:'1px solid rgba(255,255,255,0.08)', padding:'0 16px', height:46 }}>
            <input value={inputVal} onChange={e=>setInputVal(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleText(inputVal); }}}
              placeholder="Ou écris ta réponse…"
              style={{ flex:1, background:'transparent', border:'none', fontSize:14, color:'rgba(255,255,255,0.82)', fontFamily:'Questrial, sans-serif' }}/>
            {inputVal.trim() && (
              <button onClick={() => handleText(inputVal)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
          <MicButton onResult={handleText} listening={listening} setListening={setListening}/>
        </div>
      </div>
    );
  }

  function InsightScreen({ answers, onContinue, onRestart }) {
    const [insight, setInsight] = useState(() => getInsight(answers));

    useEffect(() => {
      generateAIInsight(answers).then(setInsight);
    }, []);

    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>
        <AppHeader />
        <div style={{ flex:1, overflowY:'auto', padding:'8px 28px 36px' }}>
          <div className="fade-up" style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:500, marginBottom:12 }}>Ce que Claira a compris</div>
            <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:30, color:'rgba(255,255,255,0.94)', fontWeight:400, lineHeight:1.2, marginBottom:18 }}>{insight.label}</h2>
            <p style={{ fontSize:16, lineHeight:1.8, color:'rgba(255,255,255,0.72)', fontWeight:400, textWrap:'pretty' }}>{insight.text}</p>
          </div>
          <div className="fade-up" style={{ animationDelay:'0.18s', height:1, background:'rgba(255,255,255,0.07)', marginBottom:28 }}></div>
          <div className="fade-up" style={{ animationDelay:'0.22s', marginBottom:32 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:500, marginBottom:12 }}>Ce qui peut t'aider</div>
            <p style={{ fontSize:16, lineHeight:1.8, color:'rgba(255,255,255,0.72)', fontWeight:400, textWrap:'pretty' }}>{insight.process}</p>
          </div>
          <div className="fade-up" style={{ animationDelay:'0.34s', display:'flex', gap:6, flexWrap:'wrap', marginBottom:32 }}>
            {Object.values(answers).map((v,i) => (
              <div key={i} style={{ padding:'4px 10px', background:'rgba(255,255,255,0.05)', borderRadius:10, fontSize:11, color:'rgba(255,255,255,0.30)', border:'1px solid rgba(255,255,255,0.06)', letterSpacing:'0.02em' }}>{v}</div>
            ))}
          </div>
          <div className="fade-up" style={{ animationDelay:'0.44s', display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={onContinue} style={{ width:'100%', padding:'17px', background:'rgba(255,255,255,0.92)', color:'#09090f', border:'none', borderRadius:18, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.02em' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.92)'; e.currentTarget.style.transform='translateY(0)'; }}>
              Voir les approches adaptées →
            </button>
            <button onClick={onRestart} style={{ width:'100%', padding:'13px', background:'none', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:14, fontSize:13, fontFamily:'inherit', cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.02em' }}
              onMouseEnter={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.60)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}>
              Refaire le diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  function TherapiesScreen({ insight, onContinue, onBack }) {
    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState('l');
    const th = THERAPIES[idx];
    const isRec = th.id === insight.therapy;
    const goNext = () => { setDir('l'); setIdx(i=>Math.min(i+1,THERAPIES.length-1)); };
    const goPrev = () => { setDir('r'); setIdx(i=>Math.max(i-1,0)); };

    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>
        <AppHeader />
        <div style={{ padding:'0 24px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Approches</div>
            <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'rgba(255,255,255,0.90)', fontWeight:400 }}>Ce qui peut t'aider</h2>
          </div>
          <BackBtn onBack={onBack}/>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0 24px 20px' }}>
          <div key={idx} className={dir==='l'?'slide-l':'slide-r'} style={{ background:'rgba(255,255,255,0.05)', borderRadius:24, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:14 }}>
            <div style={{ background:`linear-gradient(135deg, hsl(${th.hue},60%,25%) 0%, hsl(${th.hue},50%,15%) 100%)`, padding:'24px 22px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {isRec && <div style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'3px 9px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.75)', letterSpacing:'0.08em', marginBottom:10 }}>RECOMMANDÉ</div>}
              <h3 style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'rgba(255,255,255,0.92)', fontWeight:400, lineHeight:1.2, whiteSpace:'pre-line', marginBottom:6 }}>{th.name}</h3>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{th.tagline}</div>
            </div>
            <div style={{ padding:'18px 22px' }}>
              <p style={{ fontSize:13, lineHeight:1.65, color:'rgba(255,255,255,0.55)', marginBottom:16, textWrap:'pretty' }}>{th.desc}</p>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:600, color:`hsl(${th.hue},70%,65%)`, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Points forts</div>
                {th.benefits.map((b,i)=><div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}><div style={{ width:4, height:4, borderRadius:'50%', background:`hsl(${th.hue},70%,65%)`, flexShrink:0, marginTop:7 }}></div><span style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>{b}</span></div>)}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>À savoir</div>
                {th.constraints.map((c,i)=><div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}><div style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.20)', flexShrink:0, marginTop:7 }}></div><span style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>{c}</span></div>)}
              </div>
              <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)', fontSize:12, color:'rgba(255,255,255,0.30)' }}>Durée estimée : <strong style={{ color:'rgba(255,255,255,0.55)' }}>{th.duration}</strong></div>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button onClick={goPrev} disabled={idx===0} style={{ padding:'9px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, fontSize:12, color:idx===0?'rgba(255,255,255,0.20)':'rgba(255,255,255,0.60)', cursor:idx===0?'default':'pointer', fontFamily:'inherit' }}>← Précédent</button>
            <div style={{ display:'flex', gap:5 }}>{THERAPIES.map((_,i)=><div key={i} style={{ width:i===idx?14:5, height:5, borderRadius:3, background:i===idx?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.15)', transition:'all 0.3s' }}></div>)}</div>
            <button onClick={idx===THERAPIES.length-1?onContinue:goNext} style={{ padding:'9px 16px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, fontSize:12, color:'rgba(255,255,255,0.85)', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
              {idx===THERAPIES.length-1?'Trouver un thérapeute →':'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function MatchingScreen({ onSelect, onBack }) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>
        <AppHeader />
        <div style={{ padding:'0 24px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Sélection personnalisée</div>
            <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'rgba(255,255,255,0.90)', fontWeight:400 }}>Thérapeutes pour toi</h2>
          </div>
          <BackBtn onBack={onBack}/>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'4px 24px 24px', display:'flex', flexDirection:'column', gap:10 }}>
          {THERAPISTS.map((th,i)=>(
            <button key={th.id} onClick={()=>onSelect(th)} className="fade-up" style={{ animationDelay:`${i*0.08}s`, width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:18, boxShadow:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`hsl(${th.hue},40%,18%)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid hsl(${th.hue},40%,28%)` }}>
                  <span style={{ fontFamily:'DM Serif Display, serif', fontSize:17, color:`hsl(${th.hue},70%,70%)`, fontStyle:'italic' }}>{th.initials}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.88)', marginBottom:2 }}>{th.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.40)' }}>{th.title}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.75)', flexShrink:0 }}>{th.price}€<span style={{ fontSize:10, fontWeight:400, color:'rgba(255,255,255,0.30)' }}>/séance</span></div>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginBottom:8 }}>{th.specialty}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:`hsl(${th.hue},70%,65%)` }}></div>
                <span style={{ fontSize:11, fontWeight:600, color:`hsl(${th.hue},70%,65%)` }}>{th.score}% compatible</span>
              </div>
              <div style={{ padding:'9px 12px', background:'rgba(255,255,255,0.04)', borderRadius:10 }}>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>{th.matchReason}</p>
              </div>
              {th.online && <div style={{ marginTop:8, display:'inline-block', padding:'3px 9px', background:'rgba(100,200,160,0.12)', borderRadius:8, fontSize:10, color:'rgba(100,200,160,0.8)', border:'1px solid rgba(100,200,160,0.15)' }}>En ligne</div>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function TherapistScreen({ therapist:th, onBook, onBack }) {
    const [tab, setTab] = useState('bio');
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1, overflow:'hidden' }}>
        <AppHeader />
        <div style={{ flex:1, overflowY:'auto' }}>
          <div style={{ padding:'0 24px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:16 }}><BackBtn onBack={onBack}/></div>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:18 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:`hsl(${th.hue},40%,18%)`, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid hsl(${th.hue},40%,28%)` }}>
                <span style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:`hsl(${th.hue},70%,70%)`, fontStyle:'italic' }}>{th.initials}</span>
              </div>
              <div>
                <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'rgba(255,255,255,0.90)', fontWeight:400, marginBottom:3 }}>{th.name}</h2>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.42)' }}>{th.title} · {th.years} ans</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[{l:'Tarif',v:`${th.price}€`},{l:'Distance',v:th.distance},{l:'Compatibilité',v:`${th.score}%`,hl:true}].map(({l,v,hl})=>(
                <div key={l} style={{ flex:1, background:hl?`hsl(${th.hue},40%,14%)`:'rgba(255,255,255,0.05)', borderRadius:12, padding:'10px 12px', border:`1px solid ${hl?`hsl(${th.hue},40%,24%)`:'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ fontSize:9, color:hl?`hsl(${th.hue},70%,65%)`:'rgba(255,255,255,0.28)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
                  <div style={{ fontSize:16, fontWeight:600, color:hl?`hsl(${th.hue},70%,70%)`:'rgba(255,255,255,0.75)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:4, marginBottom:18 }}>
              {[['bio','Profil'],['approach','Approche'],['reviews','Avis']].map(([id,label])=>(
                <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'9px', background:tab===id?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.05)', color:tab===id?'rgba(255,255,255,0.90)':'rgba(255,255,255,0.38)', border:`1px solid ${tab===id?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.06)'}`, borderRadius:10, fontSize:12, fontWeight:500, fontFamily:'inherit', cursor:'pointer', transition:'all 0.2s' }}>{label}</button>
              ))}
            </div>
            {tab==='bio' && <div className="fade-in">
              <p style={{ fontSize:14, lineHeight:1.7, color:'rgba(255,255,255,0.55)', marginBottom:16, textWrap:'pretty' }}>{th.bio}</p>
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Spécialités</div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.60)' }}>{th.specialty}</p>
              </div>
            </div>}
            {tab==='approach' && <div className="fade-in">
              <p style={{ fontSize:14, lineHeight:1.7, color:'rgba(255,255,255,0.55)', marginBottom:16, textWrap:'pretty' }}>{th.approach}</p>
              {th.session.map((s,i)=>(
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:`hsl(${th.hue},40%,16%)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid hsl(${th.hue},40%,26%)` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:`hsl(${th.hue},70%,65%)` }}>{i+1}</span>
                  </div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.58)', lineHeight:1.55, paddingTop:3 }}>{s}</p>
                </div>
              ))}
            </div>}
            {tab==='reviews' && <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {th.reviews.map((r,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.70)' }}>{r.author}</span>
                    <span style={{ fontSize:12, color:'rgba(200,160,80,0.8)' }}>{'★'.repeat(r.stars)}</span>
                  </div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{r.text}</p>
                </div>
              ))}
            </div>}
            <div style={{ height:90 }}></div>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 24px 28px', background:'linear-gradient(to top, #0b0b14 65%, transparent)' }}>
          <button onClick={onBook} style={{ width:'100%', padding:'17px', background:'rgba(255,255,255,0.92)', color:'#0b0b14', border:'none', borderRadius:18, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.92)'; e.currentTarget.style.transform='translateY(0)'; }}>
            Prendre rendez-vous
          </button>
        </div>
      </div>
    );
  }

  function BookingScreen({ therapist:th, onBack, onRestart }) {
    const [sel, setSel] = useState(null);
    const [done, setDone] = useState(false);
    const slots = ["Lun 28 avr — 10h00","Lun 28 avr — 14h30","Mar 29 avr — 9h00","Mar 29 avr — 16h00","Mer 30 avr — 11h30"];

    if (done) return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px 32px', textAlign:'center', position:'relative', zIndex:1 }}>
        <div className="fade-up" style={{ width:68, height:68, borderRadius:'50%', background:'rgba(100,200,150,0.12)', border:'1px solid rgba(100,200,150,0.25)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14.5l5 5L22 9" stroke="rgba(100,200,150,0.9)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="fade-up" style={{ fontFamily:'DM Serif Display, serif', fontSize:28, color:'rgba(255,255,255,0.90)', fontWeight:400, marginBottom:10, animationDelay:'0.1s' }}>C'est confirmé !</h2>
        <p className="fade-up" style={{ fontSize:15, color:'rgba(255,255,255,0.48)', lineHeight:1.65, marginBottom:6, animationDelay:'0.18s' }}>avec {th.name}</p>
        <p className="fade-up" style={{ fontSize:14, color:'rgba(140,110,255,0.85)', fontWeight:500, marginBottom:28, animationDelay:'0.22s' }}>{sel}</p>
        <div className="fade-up" style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 18px', marginBottom:28, width:'100%', border:'1px solid rgba(255,255,255,0.07)', animationDelay:'0.3s' }}>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.40)', lineHeight:1.65 }}>Un email de confirmation t'a été envoyé. Annulation possible jusqu'à 24h avant.</p>
        </div>
        <button onClick={onRestart} className="fade-up" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:14, padding:'12px 22px', fontSize:14, color:'rgba(255,255,255,0.55)', fontFamily:'inherit', cursor:'pointer', animationDelay:'0.38s' }}>Retour à l'accueil</button>
      </div>
    );

    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1, overflow:'hidden' }}>
        <AppHeader />
        <div style={{ padding:'0 24px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <h2 style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'rgba(255,255,255,0.90)', fontWeight:400 }}>Choisir un créneau</h2>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginTop:3 }}>avec {th.name}</p>
          </div>
          <BackBtn onBack={onBack}/>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 24px', display:'flex', flexDirection:'column', gap:8 }}>
          {slots.map((slot,i)=>(
            <button key={i} onClick={()=>setSel(slot)} style={{ padding:'15px 18px', background:sel===slot?'rgba(140,100,255,0.20)':'rgba(255,255,255,0.05)', border:`1px solid ${sel===slot?'rgba(140,100,255,0.40)':'rgba(255,255,255,0.08)'}`, borderRadius:14, fontSize:14, fontWeight:sel===slot?500:400, color:sel===slot?'rgba(200,170,255,0.95)':'rgba(255,255,255,0.65)', fontFamily:'inherit', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}>
              {slot}
            </button>
          ))}
        </div>
        <div style={{ padding:'16px 24px 32px', flexShrink:0 }}>
          <button onClick={()=>sel&&setDone(true)} style={{ width:'100%', padding:'17px', background:sel?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.07)', color:sel?'#0b0b14':'rgba(255,255,255,0.28)', border:'none', borderRadius:18, fontSize:16, fontWeight:600, fontFamily:'inherit', cursor:sel?'pointer':'default', transition:'all 0.3s' }}>
            Confirmer le rendez-vous
          </button>
        </div>
      </div>
    );
  }

  Object.assign(window.Claira, {
    HomeScreen,
    ChatScreen,
    InsightScreen,
    TherapiesScreen,
    MatchingScreen,
    TherapistScreen,
    BookingScreen,
  });
})();
