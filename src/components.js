window.Claira = window.Claira || {};

(() => {
  const { useState, useEffect, useRef } = React;

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const FRAG = `
precision mediump float;
uniform float u_t;
uniform vec2  u_res;

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;

  /* base dark */
  vec3 bg = vec3(0.043, 0.043, 0.078);

  /* multi-layer wave */
  float w = sin(uv.x * 3.8 + u_t * 0.38) * 0.055
           + sin(uv.x * 6.2 - u_t * 0.27 + 1.3) * 0.030
           + cos(uv.x * 2.1 + u_t * 0.52 + 2.1) * 0.045;
  float cx = 0.52 + w;

  float d = abs(uv.y - cx);
  float g = exp(-d * 13.5) * 0.92
           + exp(-d * 4.8)  * 0.30
           + exp(-d * 1.8)  * 0.10;

  /* colour gradient along x + time animation */
  float x  = uv.x + sin(u_t * 0.18 + uv.y * 2.0) * 0.12;
  float ts = sin(u_t * 0.14) * 0.5 + 0.5;

  vec3 c1 = vec3(0.02, 0.14, 0.52);   /* deep blue      */
  vec3 c2 = vec3(0.02, 0.28, 0.40);   /* dark teal      */
  vec3 c3 = vec3(0.01, 0.34, 0.30);   /* deep green-teal*/
  vec3 c4 = vec3(0.03, 0.20, 0.55);   /* blue-teal      */

  vec3 col = mix(c1, c2, smoothstep(0.0, 0.45, x));
  col = mix(col, c3, smoothstep(0.40, 0.80, x) * (0.5 + ts * 0.5));
  col = mix(col, c4, ts * 0.35);

  vec3 final = bg + col * g * 1.5;

  /* vignette */
  float vig = 1.0 - length((uv - 0.5) * vec2(1.1, 1.6));
  final *= clamp(0.45 + vig * 0.55, 0.0, 1.0);

  gl_FragColor = vec4(clamp(final, 0.0, 1.0), 1.0);
}`;

  function ShaderCanvas() {
    const ref = useRef(null);
    useEffect(() => {
      const canvas = ref.current;
      if (!canvas) return;
      const gl = canvas.getContext('webgl');
      if (!gl) return;

      const resize = () => {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();

      const mkShader = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VERT));
      gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const ap = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(ap);
      gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

      const uT   = gl.getUniformLocation(prog, 'u_t');
      const uRes = gl.getUniformLocation(prog, 'u_res');

      let raf;
      const draw = (ts) => {
        gl.uniform1f(uT,   ts / 1000);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, []);
    return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>;
  }

  function MicButton({ onResult, listening, setListening, voiceMode, setVoiceMode, autoStart = false }) {
    const recRef = useRef(null);
    const audioStreamRef = useRef(null);
    const startingRef = useRef(false);
    const listeningRef = useRef(listening);
    const voiceModeRef = useRef(voiceMode);
    const autoStartRef = useRef(autoStart);
    const restartTimerRef = useRef(null);

    const clearRestartTimer = () => {
      if (!restartTimerRef.current) return;
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    };

    const scheduleRestart = (delay = 700) => {
      clearRestartTimer();
      if (!voiceModeRef.current || !autoStartRef.current) return;
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        start();
      }, delay);
    };

    const ensureMicPermission = async () => {
      if (!navigator.permissions?.query) return true;
      try {
        const status = await navigator.permissions.query({ name: 'microphone' });
        if (status.state === 'denied') {
          voiceModeRef.current = false;
          setVoiceMode?.(false);
          setListening(false);
          alert("Autorisation du micro nécessaire pour utiliser la saisie vocale.");
          return false;
        }
      } catch (err) {}
      return true;
    };

    const stopMicStream = () => {
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    };

    const start = async () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { alert("Reconnaissance vocale non disponible sur ce navigateur."); return; }
      if (startingRef.current || listeningRef.current) return;
      startingRef.current = true;
      const hasPermission = await ensureMicPermission();
      startingRef.current = false;
      if (!hasPermission) return;
      voiceModeRef.current = true;
      setVoiceMode?.(true);
      const rec = new SR(); rec.lang='fr-FR'; rec.interimResults=false;
      rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); listeningRef.current = false; };
      rec.onend = () => { setListening(false); listeningRef.current = false; scheduleRestart(); };
      rec.onerror = e => {
        setListening(false);
        listeningRef.current = false;
        if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) {
          clearRestartTimer();
          voiceModeRef.current = false;
          setVoiceMode?.(false);
          return;
        }
        scheduleRestart(900);
      };
      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
        listeningRef.current = true;
      } catch (err) {
        setListening(false);
        listeningRef.current = false;
        scheduleRestart(900);
      }
    };

    const stop = () => {
      clearRestartTimer();
      voiceModeRef.current = false;
      setVoiceMode?.(false);
      stopMicStream();
      recRef.current?.stop();
      setListening(false);
      listeningRef.current = false;
    };

    const toggle = () => {
      if (listening) stop();
      else start();
    };

    useEffect(() => {
      if (!autoStart || !voiceMode || listening) return;
      scheduleRestart(260);
    }, [autoStart, voiceMode, listening]);

    useEffect(() => {
      listeningRef.current = listening;
    }, [listening]);

    useEffect(() => {
      voiceModeRef.current = voiceMode;
      if (!voiceMode) clearRestartTimer();
    }, [voiceMode]);

    useEffect(() => {
      autoStartRef.current = autoStart;
      if (!autoStart) clearRestartTimer();
    }, [autoStart]);

    useEffect(() => () => {
      clearRestartTimer();
      recRef.current?.stop();
      stopMicStream();
    }, []);

    return (
      <button onClick={toggle} style={{ width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer', background: listening ? 'rgba(120,80,255,0.8)' : voiceMode ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', animation: (listening || (voiceMode && autoStart)) ? 'micRing 1s ease-out infinite' : 'none' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="6" y="1" width="6" height="10" rx="3" fill="white" opacity={listening ? 1 : 0.75}/>
          <path d="M3 9a6 6 0 0 0 12 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity={listening ? 1 : 0.75}/>
          <line x1="9" y1="15" x2="9" y2="17" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity={listening ? 1 : 0.75}/>
        </svg>
      </button>
    );
  }

  function AppHeader({ onBack }) {
    return (
      <div style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', flexShrink:0, position:'relative', zIndex:10 }}>
        {onBack ? (
          <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <div style={{ width:36 }}></div>
        )}
        <div style={{ fontFamily:'Abhaya Libre, serif', fontSize:22, color:'rgba(255,255,255,0.92)', letterSpacing:'0.04em', fontWeight:600 }}>Claira</div>
        <button style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.55)' }}>?</span>
        </button>
      </div>
    );
  }

  function StatusBar() {
    const [t, setT] = useState(() => { const d=new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; });
    return (
      <div style={{ height:44, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0, position:'relative', zIndex:10 }}>
        <span style={{ fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{t}</span>
        <div style={{ display:'flex', gap:5, alignItems:'center', opacity:0.6 }}>
          <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="3" width="2" height="8" rx="1"/><rect x="3.5" y="2" width="2" height="9" rx="1"/><rect x="7" y="0" width="2" height="11" rx="1"/><rect x="10.5" y="0" width="2" height="11" rx="1"/></svg>
          <div style={{ width:20, height:10, borderRadius:3, border:'1.5px solid white', display:'flex', alignItems:'center', padding:'1.5px' }}><div style={{ flex:1, height:'100%', background:'white', borderRadius:1.5 }}></div></div>
        </div>
      </div>
    );
  }

  function BackBtn({ onBack }) {
    return (
      <button onClick={onBack} style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.55)', fontSize:13, fontFamily:'inherit', padding:'7px 12px', flexShrink:0, transition:'background 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Retour
      </button>
    );
  }

  Object.assign(window.Claira, {
    ShaderCanvas,
    MicButton,
    AppHeader,
    StatusBar,
    BackBtn,
  });
})();
