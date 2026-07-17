import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Heart, Music, Menu, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import flower1 from './assets/flower1.png';
import flower2 from './assets/flower2.png';
import flower3 from './assets/flower3.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/* Magnetic Button Component */
const MagneticButton = ({ children, href, className, style }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 900);
  }, []);

  const handleMouse = (e) => {
    if (isMobile) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      style={style}
    >
      {children}
    </motion.a>
  );
};

/* Staggered Text Reveal Component */
const AnimatedText = ({ text, className, delay = 0, style }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
    hidden: { opacity: 0, y: 50 },
  };

  return (
    <motion.div style={{ overflow: "hidden", display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em", ...style }} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className={className}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

/* Custom Cursor */
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 900) {
      setIsMobile(true);
      return;
    }
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.closest('a') !== null) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        animate={{ x: mousePosition.x - 4, y: mousePosition.y - 4, scale: isHovering ? 0 : 1 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      <motion.div
        className="cursor-outline"
        animate={{ x: mousePosition.x - 20, y: mousePosition.y - 20, scale: isHovering ? 1.5 : 1, backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.1)' : 'transparent' }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      />
    </>
  );
};

/* Countdown Timer */
const CountdownTimer = ({ targetDate }) => {
  const calcTime = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [time, setTime] = useState(calcTime);

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(timer);
  }, [calcTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1, duration: 0.8 }}
      style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px, 3vw, 25px)', marginBottom: '25px' }}
    >
      {[
        { label: 'Days', value: time.days },
        { label: 'Hours', value: time.hours },
        { label: 'Minutes', value: time.minutes },
        { label: 'Seconds', value: time.seconds },
      ].map((item) => (
        <div key={item.label} style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
            {String(item.value).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.7rem)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-light)', marginTop: '5px' }}>
            {item.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

/* Scroll to Top */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '30px', right: '30px', zIndex: 999,
            width: '50px', height: '50px', borderRadius: '50%',
            background: 'var(--primary)', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '1.3rem',
          }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* Auto Scroll (paused by default — click to toggle) */
const AutoScroll = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef(null);
  const speedRef = useRef(0.5);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const scroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      if (current >= maxScroll) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      window.scrollBy(0, speedRef.current);
      rafRef.current = requestAnimationFrame(scroll);
    };
    rafRef.current = requestAnimationFrame(scroll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleClick = () => setIsPlaying(p => !p);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return null;
};

/* Splash Loader */
const SplashLoader = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const flowers = useMemo(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return Array.from({ length: 12 }, (_, i) => {
      const depth = Math.random();
      const numPoints = 20;
      const swayAmp = (30 + depth * 90) * (0.5 + depth * 0.5);
      const phase = Math.random() * Math.PI * 2;
      const drift = (Math.random() - 0.5) * 120;
      const startY = -(60 + Math.random() * (h * 0.5));
      return {
        id: i,
        src: [flower1, flower2, flower3][i % 3],
        left: Math.random() * w,
        startY,
        size: 12 + depth * 40,
        dur: 8 + depth * 12,
        delay: Math.random() * 5,
        yKf: Array.from({ length: numPoints }, (_, j) => {
          const t = j / (numPoints - 1);
          return startY + Math.pow(t, 1.1) * (h + 250);
        }),
        xKf: Array.from({ length: numPoints }, (_, j) => {
          const t = j / (numPoints - 1);
          return Math.sin(t * Math.PI * 3 + phase) * swayAmp
            + Math.sin(t * Math.PI * 1.2 + phase * 1.7) * swayAmp * 0.4
            + drift * t;
        }),
        rotateDur: 3 + depth * 5,
        startRot: Math.random() * 360,
        opacity: 0.2 + depth * 0.55,
        blur: depth > 0.7 ? 0 : 0.5 + depth * 0.8,
        scalePulse: 0.85 + Math.random() * 0.3,
      };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {flowers.map((f) => (
        <motion.img
          key={f.id}
          src={f.src}
          style={{
            position: 'absolute',
            top: 0,
            left: f.left,
            width: f.size,
            height: f.size,
            zIndex: 1,
            opacity: f.opacity,
            pointerEvents: 'none',
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
          }}
          animate={{
            y: f.yKf,
            x: f.xKf,
            rotate: [f.startRot, f.startRot + 360],
            scale: [1, f.scalePulse, 1, 1.05, 1],
          }}
          transition={{
            y: { duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: f.rotateDur, delay: f.delay, repeat: Infinity, ease: 'linear' },
            scale: { duration: f.dur * 0.6, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ textAlign: 'center', zIndex: 2 }}
      >
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="serif gold-text-gradient"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '10px' }}
        >
          ✦
        </motion.p>
        <h1 className="serif gold-text-gradient" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', marginBottom: '10px', letterSpacing: '3px' }}>
          Omar & Layla
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'circOut' }}
          style={{ height: '1px', width: 'clamp(80px, 15vw, 200px)', background: 'var(--primary)', margin: '15px auto', transformOrigin: 'center' }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{ color: 'var(--text-light)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', letterSpacing: '4px', textTransform: 'uppercase' }}
        >
          Wedding Invitation
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        style={{ position: 'absolute', bottom: '40px', zIndex: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--primary), transparent)' }}
        />
      </motion.div>
    </motion.div>
  );
};

/* Single falling flower with hold-at-bottom + scroll-up + fall-back */
const FallingFlower = ({ f, scrollY }) => {
  const y = useMotionValue(0);
  const state = useRef('falling');
  const scrollAtHold = useRef(0);
  const bottomY = useMemo(() => window.innerHeight - f.startY - f.size, []);
  const timerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    state.current = 'falling';
    animRef.current = animate(y, bottomY, {
      duration: f.dur,
      ease: 'linear',
      onComplete: () => { state.current = 'holding'; },
    });
    return () => animRef.current?.stop();
  }, []);

  useEffect(() => {
    const onScroll = (latest) => {
      clearTimeout(timerRef.current);

      if (state.current === 'holding' || state.current === 'falling') {
        if (animRef.current) animRef.current.stop();
        state.current = 'rising';
        scrollAtHold.current = latest;
      }

      if (state.current === 'rising') {
        const newY = Math.max(0, bottomY - (latest - scrollAtHold.current) * 0.25);
        y.set(newY);

        timerRef.current = setTimeout(() => {
          if (state.current === 'rising') {
            const currentY = y.get();
            const remaining = 1 - currentY / bottomY;
            if (remaining < 0.05) {
              state.current = 'holding';
            } else {
              state.current = 'falling';
              animRef.current = animate(y, bottomY, {
                duration: f.dur * Math.max(0.2, remaining),
                ease: 'linear',
                onComplete: () => { state.current = 'holding'; },
              });
            }
          }
        }, 250);
      }
    };

    const unsubscribe = scrollY.on('change', onScroll);
    return () => {
      clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, [scrollY]);

  return (
    <motion.img
      src={f.src}
      style={{
        position: 'absolute',
        top: f.startY,
        left: f.left,
        width: f.size,
        height: f.size,
        opacity: f.opacity,
        y,
      }}
      animate={{
        x: Array.from({ length: 12 }, (_, j) =>
          Math.sin((j / 11) * Math.PI * 3 + f.phase) * f.sway
          + Math.sin((j / 11) * Math.PI * 1.5 + f.phase * 1.7) * f.sway * 0.35
          + f.drift * (j / 11)
        ),
        rotate: [f.startRot, f.startRot + 360],
      }}
      transition={{
        x: { duration: f.dur, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: f.rotateDur, repeat: Infinity, ease: 'linear' },
      }}
    />
  );
};

/* Floating Flowers for main page */
const FloatingFlowers = ({ count = 5 }) => {
  const { scrollY } = useScroll();
  const flowers = useMemo(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return Array.from({ length: count }, (_, i) => {
      const startY = -(80 + Math.random() * Math.min(window.innerHeight * 0.25, 120));
      return {
        id: i,
        src: [flower1, flower2, flower3][i % 3],
        left: Math.random() * w,
        startY,
        size: 26 + Math.random() * 30,
        dur: 18 + Math.random() * 10,
        sway: 25 + Math.random() * 50,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 80,
        startRot: Math.random() * 360,
        rotateDur: 5 + Math.random() * 5,
        opacity: 0.5 + Math.random() * 0.4,
      };
    });
  }, [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998 }}>
      {flowers.map((f) => (
        <FallingFlower key={f.id} f={f} scrollY={scrollY} />
      ))}
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPersonalizeModalOpen, setIsPersonalizeModalOpen] = useState(false);
  const [personalizeInput, setPersonalizeInput] = useState('');

  const handlePersonalizeSubmit = (e) => {
    e.preventDefault();
    if (personalizeInput.trim()) {
      window.location.assign(`?guest=${encodeURIComponent(personalizeInput.trim())}`);
    }
  };

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('guest') || params.get('name') || params.get('to');
    if (nameParam) {
      setGuestName(nameParam.replace(/-/g, ' '));
    }
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const { scrollY } = useScroll();
  
  // Parallax values
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.1]);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="app" style={{ position: 'relative' }}>
      <AnimatePresence>
        {showSplash && <SplashLoader onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && <FloatingFlowers count={4} />}
      <CustomCursor />
      <ScrollToTop />
      <AutoScroll />
      
      {/* Personalize Modal */}
      <AnimatePresence>
        {isPersonalizeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass"
              style={{ background: 'rgba(253, 252, 248, 0.95)', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              <button 
                onClick={() => setIsPersonalizeModalOpen(false)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                <X size={24} />
              </button>
              
              <h3 className="serif gold-text-gradient" style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Personalize</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px', fontSize: '0.9rem' }}>Enter the name of the guest to create a unique link.</p>
              
              <form onSubmit={handlePersonalizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input 
                  type="text" 
                  value={personalizeInput}
                  onChange={(e) => setPersonalizeInput(e.target.value)}
                  placeholder="Guest Name (e.g., John Doe)" 
                  autoFocus
                  style={{ width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', outline: 'none', fontFamily: 'Outfit' }}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                  GENERATE INVITATION
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="progress-bar" 
        style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'var(--primary)', transformOrigin: '0%', zIndex: 1000 }} 
      />

      {/* Navigation */}
      <nav className="glass nav-glass" style={{ position: 'fixed', width: '90%', top: 20, zIndex: 100, left: '50%', transform: 'translateX(-50%)', maxWidth: '1200px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', maxWidth: '100%' }}>
          <div className="serif gold-text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            O & L
          </div>
          <div className="desktop-menu" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {['Home', 'Our Story', 'Events', 'Venue'].map((item, i) => (
              <a key={i} href={`#${item.split(' ')[item.split(' ').length - 1].toLowerCase()}`} className="nav-link">
                {item}
              </a>
            ))}
            {isAdmin && (
              <button 
                className="nav-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setIsPersonalizeModalOpen(true)}
              >
                PERSONALIZE
              </button>
            )}
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass"
            style={{ position: 'fixed', top: '100px', left: '5%', right: '5%', zIndex: 99, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {['Home', 'Our Story', 'Events', 'Venue'].map((item, i) => (
              <a key={i} href={`#${item.split(' ')[item.split(' ').length - 1].toLowerCase()}`} className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
                {item}
              </a>
            ))}
            {isAdmin && (
              <button 
                className="nav-link-mobile" 
                style={{ background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
                onClick={() => {
                   setIsMenuOpen(false);
                   setTimeout(() => setIsPersonalizeModalOpen(true), 300);
                }}
              >
                PERSONALIZE
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 20px' }}>
        <motion.div 
          style={{ 
            position: 'absolute', inset: -50, zIndex: 0,
            backgroundImage: 'url(/assets/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center',
            y: heroY, scale: heroScale
          }} 
        />
        <div className="arabesque-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
        
        <div className="container" style={{ textAlign: 'center', zIndex: 2, position: 'relative', marginTop: '50px', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="glass hero-glass"
            style={{ borderRadius: '40px', display: 'inline-block', background: 'rgba(253, 252, 248, 0.75)', border: '1px solid rgba(255,255,255,0.5)', width: '100%', maxWidth: '800px' }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
              className="arabic serif gold-text-gradient responsive-arabic">
               بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ 
            </motion.div>
            
            <AnimatePresence>
              {guestName && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
                  style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: 'var(--primary)', fontStyle: 'italic', marginBottom: '15px', fontWeight: '500', textTransform: 'capitalize' }}
                  className="serif"
                >
                  Dear {guestName},
                </motion.p>
              )}
            </AnimatePresence>
            
            <motion.p 
              initial={{ opacity: 0, letterSpacing: '0px' }} animate={{ opacity: 1, letterSpacing: '4px' }} transition={{ delay: 0.8, duration: 1.5 }}
              style={{ textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', color: 'var(--text-dark)', marginBottom: '15px', fontWeight: '800' }}>
              {guestName ? "You are warmly invited to the wedding of" : "The Wedding Of"}
            </motion.p>
            
            <h1 style={{ marginBottom: '10px' }}>
              <AnimatedText text="Omar & Layla" className="serif gold-text-gradient" delay={0.15} style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', lineHeight: 1.1 }} />
            </h1>
            
            <motion.div 
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '20px 0', transformOrigin: 'center' }}>
              <div style={{ height: '1px', width: 'clamp(40px, 10vw, 80px)', background: 'var(--primary)' }} />
              <Heart fill="var(--primary)" color="var(--primary)" size={18} />
              <div style={{ height: '1px', width: 'clamp(40px, 10vw, 80px)', background: 'var(--primary)' }} />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.8 }}
              className="serif" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '10px', color: 'var(--text-dark)', letterSpacing: '2px' }}>
              22 • AUGUST • 2026
            </motion.p>
            
            <CountdownTimer targetDate="August 22, 2026 16:00:00" />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6, duration: 0.8 }}>
              <MagneticButton href="#events" className="btn-primary" style={{ padding: '12px 30px' }}>
                EXPLORE ITINERARY
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
          animate={{ y: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <div style={{ width: '1px', height: '50px', background: 'linear-gradient(to bottom, var(--primary), transparent)' }} />
        </motion.div>
      </section>

      {/* Story Section */}
      <section id="story">
        <div className="container">
          <div className="grid responsive-grid" style={{ display: 'grid', gap: '50px', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h2 style={{ marginBottom: '30px' }}>
                <AnimatedText text="Our Journey" className="serif gold-text-gradient" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}/>
              </h2>
              <p className="text-light" style={{ marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: 1.8 }}>
                They say love is written in the stars, but for us, it was written in every shared laughter, 
                every silent prayer, and every quiet moment under the desert sky. 
              </p>
              <p className="text-light" style={{ marginBottom: '30px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: 1.8 }}>
                We invite you to join us as we embark on this sacred journey, starting with 
                our "Nikah" following our traditional heritage and values.
              </p>
              <div className="arabic serif gold-text-gradient" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
                "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا"
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-light)', marginTop: '10px', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
                "And we created you in pairs." - Surah An-Naba
              </p>
            </motion.div>
            
            <motion.div 
              className="reveal-image-container"
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
              whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              viewport={{ once: true, margin: "-50px" }}
              style={{ position: 'relative' }}
            >
              <div className="glass" style={{ padding: '15px', borderRadius: '30px', transform: 'rotate(2deg)' }}>
                <img src="/assets/couple.png" alt="Couple" style={{ width: '100%', borderRadius: '20px', filter: 'contrast(1.05) brightness(1.02)' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Events Section */}
      <section id="events" style={{ background: '#F8F5F0', position: 'relative', padding: '100px 0' }}>
         <div className="arabesque-overlay" style={{ position: 'absolute', inset: 0 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2><AnimatedText text="Wedding Itinerary" className="serif gold-text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}/></h2>
            <p style={{ color: 'var(--text-light)', marginTop: '10px', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>We eagerly await your presence to grace these moments.</p>
          </div>
          
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Nikah Ceremony', time: '4:00 PM', date: 'August 22, 2026', icon: <Heart size={28} strokeWidth={1.5}/>, desc: 'The binding contract ceremony in the presence of close family and friends.' },
              { title: 'Grand Reception', time: '8:00 PM', date: 'August 22, 2026', icon: <Music size={28} strokeWidth={1.5}/>, desc: 'A spectacular night of celebration, traditional dinner, and joy.' },
              { title: 'Farewell Brunch', time: '10:00 AM', date: 'August 23, 2026', icon: <Calendar size={28} strokeWidth={1.5}/>, desc: 'Join us for a morning prayer and brunch as we start our first day.' }
            ].map((event, i) => (
              <motion.div 
                key={i}
                className="event-card glass"
                style={{ padding: '40px 30px', borderRadius: '30px', textAlign: 'center', cursor: 'pointer' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={window.innerWidth > 900 ? { y: -10, boxShadow: '0 15px 30px rgba(212, 175, 55, 0.15)' } : {}}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                  {event.icon}
                </div>
                <h3 className="serif gold-text-gradient" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '15px' }}>{event.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-light)', marginBottom: '20px', fontWeight: '500', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Clock size={16} color="var(--primary)"/> {event.time}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Calendar size={16} color="var(--primary)"/> {event.date}</div>
                </div>
                <p style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: '0.95rem' }}>{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="grid responsive-grid" style={{ display: 'grid', gap: '50px', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <h2 className="serif gold-text-gradient" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '20px', lineHeight: 1.2 }}>The Majesty <br/>Of The Venue</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 'clamp(1rem, 3vw, 1.2rem)', marginBottom: '30px', lineHeight: 1.8, maxWidth: '500px' }}>
                Set against the breathtaking skyline, the Grand Pearl Palace offers an ethereal ambiance blending modern luxury with traditional Arabic architecture.
              </p>
              <div style={{ display: 'flex',flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <MapPin size={24} color="var(--primary)" />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Grand Pearl Palace</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Marina View Crescent,<br/>Dubai Marina, UAE</p>
                </div>
              </div>
              <MagneticButton href="https://maps.google.com" className="btn-primary">
                GET DIRECTIONS
              </MagneticButton>
            </motion.div>
            
            <motion.div 
               className="glass map-glass" 
               style={{ borderRadius: '30px', overflow: 'hidden', border: '8px solid white', boxShadow: 'var(--shadow)', width: '100%' }}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1 }}
            >
              <MapContainer center={[25.1124, 55.1390]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[25.1124, 55.1390]}>
                  <Popup>
                    <div style={{ textAlign: 'center', padding: '5px' }}>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'Playfair Display', fontSize: '1.1rem' }}>Grand Pearl Palace</strong>
                      <br /> Dubai, UAE
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 20px 40px', textAlign: 'center', background: '#1A1A1A', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="arabesque-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.05 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
          <h3 className="serif gold-text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 3rem)', marginBottom: '15px' }}>Omar & Layla</h3>
          <p style={{ color: '#888', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', marginBottom: '30px' }}>Written in the stars, celebrated on Earth.</p>
          <div className="arabic serif" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: 'var(--primary)', marginBottom: '30px' }}>شكراً لكم</div>
          
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px', maxWidth: '300px' }} />
          <p style={{ color: '#555', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>© 2026 O&L WEDDING. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Internal CSS */}
      <style>{`
        .cursor-dot {
          width: 8px; height: 8px; background: var(--primary);
          border-radius: 50%; position: fixed; top: 0; left: 0;
          pointer-events: none; z-index: 9999;
        }
        .cursor-outline {
          width: 40px; height: 40px; border: 1px solid var(--primary);
          border-radius: 50%; position: fixed; top: 0; left: 0;
          pointer-events: none; z-index: 9998;
        }
        .nav-link {
          text-decoration: none; color: var(--text-dark);
          text-transform: uppercase; font-size: 0.85rem;
          font-weight: 600; letter-spacing: 1.5px;
          transition: var(--transition); position: relative;
        }
        .nav-link-mobile {
            text-decoration: none; color: var(--text-dark);
            text-transform: uppercase; font-size: 1.2rem;
            font-weight: 600; letter-spacing: 2px;
            transition: var(--transition); text-align: center;
            border-bottom: 1px solid rgba(0,0,0,0.05); padding: 15px 0;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -5px; left: 0;
          width: 0; height: 2px; background: var(--primary);
          transition: width 0.3s ease;
        }
        .nav-link:hover { color: var(--primary); }
        .nav-link:hover::after { width: 100%; }
        
        .mobile-menu-btn { display: none; background: none; border: none; color: var(--primary); cursor: pointer; }
        
        .responsive-grid { grid-template-columns: 1fr 1fr; }
        .map-glass { height: 500px; }
        .hero-glass { padding: 60px; }
        .responsive-arabic { fontSize: 3.5rem; marginBottom: 10px; }

        @media (max-width: 900px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block; }
          .responsive-grid { grid-template-columns: 1fr !important; }
          .cursor-dot, .cursor-outline { display: none !important; }
          body, a, button { cursor: auto !important; }
          section { padding: 60px 0; }
          .hero-glass { padding: 40px 20px; width: 100%; border-radius: 30px; }
          .map-glass { height: 350px; }
          .container { padding: 0 20px; }
          .responsive-arabic { font-size: clamp(2rem, 8vw, 3.5rem) !important; margin-bottom: 5px !important; }
          .nav-glass { width: 95% !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
