import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsConfig from './aws-exports';
import { initReactI18next, useTranslation } from 'react-i18next';
import i18n from 'i18next';

// 🚀 ABSOLUTE FALLBACK: Executes before React even renders! 
// Forces Geo-Routing even if the Mobile Browser caches the root URL.
const validLocales = ['us', 'uk', 'in', 'bd', 'es', 'fr', 'jp'];
const currentPath = window.location.pathname;
const pathLocale = currentPath.split('/')[1];

if (!validLocales.includes(pathLocale) && (currentPath === '/' || currentPath === '/index.html' || currentPath === '')) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  let target = 'us';
  if (tz === 'Asia/Dhaka' || tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') target = 'bd';
  else if (tz.startsWith('Europe/Madrid') || tz.startsWith('America/Mexico')) target = 'es';
  else if (tz === 'Europe/Paris') target = 'fr';
  else if (tz === 'Asia/Tokyo') target = 'jp';
  
  window.location.replace(`/${target}/`);
}

Amplify.configure(awsConfig);
const API_BASE_URL = "https://api.ghoshsourav21.in";

I18n.putVocabularies(translations);
I18n.putVocabulariesForLanguage('bn', {
  'Sign In': 'লগইন', 'Create Account': 'নতুন একাউন্ট', 'Username': 'ইউজারনেম', 'Password': 'পাসওয়ার্ড', 'Confirm Password': 'পাসওয়ার্ড নিশ্চিত করুন', 'Sign in': 'লগইন করুন', 'Enter your Username': 'আপনার ইউজারনেম দিন', 'Enter your Password': 'আপনার পাসওয়ার্ড দিন', 'Email': 'ইমেইল'
});
I18n.putVocabulariesForLanguage('hi', {
  'Sign In': 'लॉग इन', 'Create Account': 'खाता बनाएं', 'Username': 'उपयोगकर्ता नाम', 'Password': 'पासवर्ड', 'Confirm Password': 'पासवर्ड की पुष्टि करें', 'Sign in': 'लॉग इन करें', 'Enter your Username': 'अपना उपयोगकर्ता नाम दर्ज करें', 'Enter your Password': 'अपना पासवर्ड दर्ज करें', 'Email': 'ईमेल'
});

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { title: "Global Airways", subtitle: "Experience the Joy of Flying", searchHeader: "Book Your Next Adventure", origin: "From (e.g. CCU)", dest: "To (e.g. DXB)", searchBtn: "Search Flights", bookBtn: "Book Now - $500", loginToBook: "Login to Book", welcome: "Welcome", logout: "Sign Out", login: "Sign In / Register", popularRoutes: "Popular Routes", demoWarning: "⚠️ DEMO: This is an educational portfolio project.", footerText: "© 2026 Global Airways Demo." } },
    bn: { translation: { title: "গ্লোবাল এয়ারওয়েজ", subtitle: "উড্ডয়নের আনন্দ উপভোগ করুন", searchHeader: "আপনার পরবর্তী অ্যাডভেঞ্চার বুক করুন", origin: "কোথা থেকে (CCU)", dest: "কোথায় যাবেন (DXB)", searchBtn: "ফ্লাইট খুঁজুন", bookBtn: "বুক করুন - $500", loginToBook: "বুক করার জন্য লগইন করুন", welcome: "স্বাগতম", logout: "লগআউট", login: "লগইন / নতুন একাউন্ট", popularRoutes: "জনপ্রিয় রুটসমূহ", demoWarning: "⚠️ ডেমো প্রজেক্ট: কোনো আসল পেমেন্ট তথ্য দেবেন না।", footerText: "© 2026 গ্লোবাল এয়ারওয়েজ ডেমো।" } },
    hi: { translation: { title: "ग्लोबल एयरवेज", subtitle: "उड़ान का आनंद लें", searchHeader: "अपना अगला रोमांच बुक करें", origin: "कहाँ से (CCU)", dest: "कहाँ तक (DXB)", searchBtn: "उड़ानें खोजें", bookBtn: "अभी बुक करें - $500", loginToBook: "लॉगिन करें", welcome: "स्वागत है", logout: "लॉगआउट", login: "लॉगिन / रजिस्टर", popularRoutes: "लोकप्रिय मार्ग", demoWarning: "⚠️ डेमो प्रोजेक्ट: वास्तविक भुगतान विवरण दर्ज न करें।", footerText: "© 2026 ग्लोबल एयरवेज डेमो।" } },
    es: { translation: { title: "Aerolíneas Globales", subtitle: "Experimente la alegría de volar", searchHeader: "Reserve su próxima aventura", origin: "Desde", dest: "Hacia", searchBtn: "Buscar", bookBtn: "Reservar", loginToBook: "Iniciar sesión", welcome: "Bienvenido", logout: "Cerrar sesión", login: "Iniciar sesión", popularRoutes: "Rutas populares", demoWarning: "⚠️ PROYECTO DEMO.", footerText: "© 2026 Aerolíneas Globales." } },
    fr: { translation: { title: "Voies Aériennes Mondiales", subtitle: "Vivez la joie de voler", searchHeader: "Réservez votre aventure", origin: "De", dest: "À", searchBtn: "Rechercher", bookBtn: "Réservez", loginToBook: "Connectez-vous", welcome: "Bienvenue", logout: "Déconnexion", login: "Connexion", popularRoutes: "Itinéraires", demoWarning: "⚠️ PROJET DÉMO.", footerText: "© 2026 Voies Aériennes." } },
    ja: { translation: { title: "グローバル航空", subtitle: "飛ぶ喜びを体験しよう", searchHeader: "予約する", origin: "出発地", dest: "目的地", searchBtn: "検索", bookBtn: "予約", loginToBook: "ログイン", welcome: "ようこそ", logout: "ログアウト", login: "ログイン", popularRoutes: "人気のルート", demoWarning: "⚠️ デモプロジェクト", footerText: "© 2026 グローバル航空." } }
  },
  lng: "en", fallbackLng: "en", interpolation: { escapeValue: false }
});

function MainApp() {
  const { localeCode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [search, setSearch] = useState({ origin: 'CCU', destination: 'DXB', date: '2026-12-25' });
  const [flights, setFlights] = useState([]);
  const [bookingMsg, setBookingMsg] = useState('');

  useEffect(() => {
    const langMap = { 'us': 'en', 'uk': 'en', 'in': 'hi', 'bd': 'bn', 'es': 'es', 'fr': 'fr', 'jp': 'ja' };
    const targetLang = langMap[localeCode] || 'en';
    
    i18n.changeLanguage(targetLang);
    I18n.setLanguage(targetLang);
    checkUser();
  }, [localeCode]);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setShowAuth(false);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const handleLanguageChange = (e) => {
    navigate(`/${e.target.value}/`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/search`, search);
      setFlights(res.data.data ? [res.data.data] : []); 
    } catch (err) {
      setFlights([{origin: search.origin, destination: search.destination, date: search.date, flightNo: "GL-7029"}]);
    }
  };

  const handleBook = async (flight) => {
    if (!user) {
      setShowAuth(true); 
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/book`, {
        userId: user.signInDetails?.loginId || user.username,
        flightId: flight.origin + "-" + flight.destination,
        amount: 500
      });
      setBookingMsg(`✅ Booking Confirmed! Ref: ${res.data.bookingReference}`);
    } catch (err) {
      setBookingMsg('❌ Booking failed.');
    }
  };

  if (showAuth) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <h2 style={{ color: '#0a3d62', marginBottom: '20px' }}>{t('title')} - Secure Login</h2>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <Authenticator>
            {({ signOut, user }) => {
              setTimeout(() => { checkUser(); }, 500);
              return <p style={{textAlign: 'center'}}>Successfully authenticated! Redirecting...</p>;
            }}
          </Authenticator>
        </div>
        <button onClick={() => setShowAuth(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Cancel & Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#ff4757', color: 'white', textAlign: 'center', padding: '10px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>{t('demoWarning')}</div>
      <nav style={{ backgroundColor: '#ffffff', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>✈️</span>
          <h1 style={{ color: '#0a3d62', fontSize: '24px', margin: 0, fontWeight: '700' }}>{t('title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <select value={localeCode || 'us'} onChange={handleLanguageChange} style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', outline: 'none' }}>
            <option value="us">USA (English)</option>
            <option value="uk">UK (English)</option>
            <option value="in">India (हिंदी)</option>
            <option value="bd">Bengal (বাংলা)</option>
            <option value="es">Spain (Español)</option>
            <option value="fr">France (Français)</option>
            <option value="jp">Japan (日本語)</option>
          </select>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#555', fontWeight: '500' }}>{t('welcome')}, <span style={{ color: '#0a3d62' }}>{user.signInDetails?.loginId || user.username}</span></span>
              <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{t('logout')}</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ padding: '10px 20px', background: '#0a3d62', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{t('login')}</button>
          )}
        </div>
      </nav>
      <div style={{ background: 'linear-gradient(135deg, #0a3d62 0%, #3c6382 100%)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '10px', fontWeight: '300' }}>{t('subtitle')}</h2>
        
        <div style={{ maxWidth: '800px', margin: '30px auto 0', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#333', marginTop: 0, marginBottom: '20px', fontSize: '20px', textAlign: 'left' }}>{t('searchHeader')}</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input value={search.origin} onChange={e => setSearch({...search, origin: e.target.value})} placeholder={t('origin')} style={{ flex: 1, padding: '12px 15px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}/>
            <span style={{ alignSelf: 'center', color: '#888', fontSize: '20px' }}>⇄</span>
            <input value={search.destination} onChange={e => setSearch({...search, destination: e.target.value})} placeholder={t('dest')} style={{ flex: 1, padding: '12px 15px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}/>
            <button type="submit" style={{ padding: '12px 30px', background: '#f39c12', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}>{t('searchBtn')}</button>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
        {flights.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            {flights.map((f, i) => (
              <div key={i} style={{ border: '1px solid #eee', padding: '20px 30px', borderRadius: '10px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <div style={{ textAlign: 'center' }}><h2 style={{ margin: 0, color: '#0a3d62', fontSize: '28px' }}>{f.origin}</h2></div>
                  <div style={{ textAlign: 'center', color: '#b2bec3' }}><span>────────────────✈</span></div>
                  <div style={{ textAlign: 'center' }}><h2 style={{ margin: 0, color: '#0a3d62', fontSize: '28px' }}>{f.destination}</h2></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => handleBook(f)} style={{ padding: '12px 25px', background: user ? '#27ae60' : '#e67e22', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}>
                    {user ? t('bookBtn') : t('loginToBook')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer style={{ backgroundColor: '#2f3640', color: '#dcdde1', textAlign: 'center', padding: '20px', marginTop: 'auto' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>{t('footerText')}</p>
      </footer>
    </div>
  );
}

// Router Wrapper
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:localeCode/*" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/us/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
