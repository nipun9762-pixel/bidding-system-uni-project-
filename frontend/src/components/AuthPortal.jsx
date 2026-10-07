import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Car,
  Gavel,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  X,
  Phone,
  Clock,
  Truck,
  Award,
  Send,
  MapPin,
  MessageSquare,
  Sparkles,
  Headphones
} from 'lucide-react';
import heroWhiteSuv from '../assets/hero-white-suv.jpg';

const SEED_USERS = [
  {
    userId: 1,
    firstName: 'Nadeesha',
    lastName: 'Perera',
    email: 'admin@bidding.com',
    password: 'admin123',
    role: 'ADMINISTRATOR',
    accountStatus: 'ACTIVE',
    phoneNumber: '+94771234567'
  },
  {
    userId: 2,
    firstName: 'Kasun',
    lastName: 'Wickramasinghe',
    email: 'seller.callour@bidding.com',
    password: 'seller123',
    role: 'SELLER',
    accountStatus: 'ACTIVE',
    phoneNumber: '+94772345678'
  },
  {
    userId: 4,
    firstName: 'Dilini',
    lastName: 'Rathnayake',
    email: 'buyer.dilini@bidding.com',
    password: 'buyer123',
    role: 'BUYER',
    accountStatus: 'ACTIVE',
    phoneNumber: '+94774567890'
  }
];

function AnimatedNumber({ value, duration = 1600, isVisible, decimals = 0, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setDisplayValue(0);
      return;
    }

    const end = parseFloat(value);
    const startTime = performance.now();
    let frameId;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * end;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(end);
      }
    };

    frameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span className="tabular-nums">
      {formatted}{suffix}
    </span>
  );
}

export default function AuthPortal({ onLoginSuccess }) {
  // Auth Modal state: boolean (open or closed)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Auth Modal mode: 'LOGIN' or 'REGISTER'
  const [authMode, setAuthMode] = useState('LOGIN');
  // Selected role for login: 'BUYER', 'SELLER', 'ADMINISTRATOR'
  const [selectedRole, setSelectedRole] = useState('BUYER');

  // Interactive Card Tag filter in the hero showcase
  const [selectedTag, setSelectedTag] = useState('Hybrid');

  // Scroll animation visibility state
  const [aboutInView, setAboutInView] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('buyer.dilini@bidding.com');
  const [loginPassword, setLoginPassword] = useState('buyer123');

  // Registration Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('BUYER');

  // Contact Form State (for the scrollable Contact Us section)
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === aboutRef.current && entry.isIntersecting) {
          setAboutInView(true);
        }
        if (entry.target === contactRef.current && entry.isIntersecting) {
          setContactInView(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (aboutRef.current) observer.observe(aboutRef.current);
    if (contactRef.current) observer.observe(contactRef.current);

    return () => observer.disconnect();
  }, []);

  // Smooth scroll helper for navbar links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Switch role helper for quick demo credentials
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'BUYER') {
      setLoginEmail('buyer.dilini@bidding.com');
      setLoginPassword('buyer123');
    } else if (role === 'SELLER') {
      setLoginEmail('seller.callour@bidding.com');
      setLoginPassword('seller123');
    } else if (role === 'ADMINISTRATOR') {
      setLoginEmail('admin@bidding.com');
      setLoginPassword('admin123');
    }
  };

  const openAuthModal = (mode = 'LOGIN', role = null) => {
    setAuthMode(mode);
    if (role) handleSelectRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    setAuthModalOpen(true);
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Try Backend API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        setSuccessMessage(`Welcome back, ${user.firstName || user.role}!`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 500);
        return;
      } else {
        const errData = await res.json().catch(() => null);
        if (errData?.error) {
          setErrorMessage(errData.error);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // Fallback to local accounts if backend is offline
    }

    // 2. Fallback to Local Seed Users or LocalStorage
    const localUsers = JSON.parse(localStorage.getItem('bidding_local_users') || '[]');
    const allUsers = [...localUsers, ...SEED_USERS];

    const matchedUser = allUsers.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );

    if (matchedUser) {
      setSuccessMessage(`Welcome back, ${matchedUser.firstName}!`);
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 500);
    } else {
      setErrorMessage('Invalid credentials. Please check your email or password.');
      setLoading(false);
    }
  };

  // Registration handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    const newUserPayload = {
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim().toLowerCase(),
      phoneNumber: regPhone.trim(),
      password: regPassword,
      role: regRole,
      accountStatus: 'ACTIVE'
    };

    try {
      // 1. Try Backend API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        setSuccessMessage(`Account created as ${user.role}! Logging in...`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 600);
        return;
      } else {
        const errData = await res.json().catch(() => null);
        if (errData?.error) {
          setErrorMessage(errData.error);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // Backend offline fallback
    }

    // 2. Fallback to localStorage registered users
    const localUsers = JSON.parse(localStorage.getItem('bidding_local_users') || '[]');
    const allUsers = [...localUsers, ...SEED_USERS];

    if (allUsers.some(u => u.email.toLowerCase() === newUserPayload.email)) {
      setErrorMessage('An account with this email already exists.');
      setLoading(false);
      return;
    }

    const createdUser = {
      ...newUserPayload,
      userId: 1000 + localUsers.length + 1
    };
    localUsers.push(createdUser);
    localStorage.setItem('bidding_local_users', JSON.stringify(localUsers));

    setSuccessMessage(`Account created! Entering as ${regRole}...`);
    setTimeout(() => {
      onLoginSuccess(createdUser);
    }, 600);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  // Guest view fallback
  const handleBrowseAsGuest = () => {
    onLoginSuccess(SEED_USERS[2]); // Dilini (Buyer) default
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ========================================================================= */}
      {/* 1. HERO TOP SECTION WITH SCENIC SUV BACKDROP                             */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Scenic Landscape Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroWhiteSuv})` }}
        >
          {/* Subtle gradient overlay to keep top navigation elements crisp */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Top Clean Navigation Bar */}
        <header className="relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between">
          {/* Left: Brand Mark */}
          <div className="flex items-center gap-10">
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                AV
              </div>
              <div className="leading-tight text-left">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 block font-display">
                  Avtomat
                </span>
                <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">
                  AUTO EXCHANGE
                </span>
              </div>
            </div>

            {/* Smooth Scroll Links (About & Contact) */}
            <nav className="flex items-center gap-8 text-xs font-semibold text-slate-700">
              <button 
                type="button"
                onClick={() => scrollToSection('about')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                About Us
              </button>
              <button 
                type="button"
                onClick={() => scrollToSection('contact')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </nav>
          </div>

          {/* Right: Login & Sign Up CTA */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('LOGIN')}
              className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors px-3 py-1.5 cursor-pointer"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('REGISTER')}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs px-5 py-2 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sign up</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>
        </header>

        {/* Hero Content Body */}
        <div className="relative z-10 px-6 sm:px-12 pt-8 sm:pt-12 pb-16 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Bold Headline & CTA */}
            <div className="lg:col-span-5 pt-4 sm:pt-6 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-slate-900 tracking-tight leading-[1.06]">
                Easy, affordable <br />
                and stress-free <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  car buying
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-normal">
                We're here to make finding and owning your perfect car simple with trusted support, fair pricing, and a smooth experience from start to finish.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => openAuthModal('REGISTER')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleBrowseAsGuest}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
                >
                  Browse Lots as Guest
                </button>
              </div>
            </div>

            {/* Right Column: Floating Feature Card */}
            <div className="lg:col-span-7 relative flex justify-end">
              
              {/* Top Right Floating Feature Card (Focused on Vehicle Specs without video display) */}
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 max-w-md w-full space-y-4">
                
                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  {['Sedan', 'Push start', 'Hybrid'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-slate-900 text-white shadow-sm font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Model Title & Heading */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Toyota - RAV4
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    Unique design & <span className="text-emerald-600">Eco friendly</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                    A reliable, fuel efficient SUV with smooth hybrid performance
                  </p>
                </div>

                {/* Key Spec Highlights Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Power</div>
                    <div className="text-xs font-bold text-blue-600">219 HP</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Drivetrain</div>
                    <div className="text-xs font-bold text-indigo-600">AWD System</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">Efficiency</div>
                    <div className="text-xs font-bold text-emerald-600">40 MPG</div>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => openAuthModal('LOGIN', 'BUYER')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Place Bid on this Lot</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom spacing helper without cluttered indicator box */}
          <div className="hidden sm:block pt-4" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT US SECTION (SMOOTH SCROLL ANIMATION & CLEAN DESIGN)              */}
      {/* ========================================================================= */}
      <section 
        id="about" 
        ref={aboutRef}
        className="py-24 px-6 sm:px-12 bg-white border-t border-slate-100"
      >
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className={`text-center max-w-2xl mx-auto space-y-3 transition-all duration-700 transform ${
            aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 shadow-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                Platform Overview
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Modern, Transparent Way to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Buy and Sell Vehicles
              </span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-blue-600">AUTOS</span> connects certified automotive dealers and prospective buyers through a secure, high-integrity online auction platform featuring{' '}
              <span className="font-semibold text-emerald-600">escrow slip verification</span> and real-time{' '}
              <span className="font-semibold text-indigo-600">carrier logistics tracking</span>.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: Live Bidding (Electric Blue / Indigo Theme) */}
            <div className={`group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-700 delay-100 transform ${
              aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                <span className="text-blue-600">Competitive</span> Live Bidding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bid in real time with <span className="text-blue-600 font-semibold">transparent minimum increments</span>, overtime extensions, and instant notification updates.
              </p>
            </div>

            {/* Pillar 2: Escrow Protection (Emerald / Teal Theme) */}
            <div className={`group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-700 delay-200 transform ${
              aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                <span className="text-emerald-600">Escrow Slip</span> Protection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Winning buyers upload bank payment slips, which are <span className="text-emerald-600 font-semibold">held and verified</span> by administrators before vehicle release.
              </p>
            </div>

            {/* Pillar 3: Delivery Lifecycle Tracking (Amber / Orange Theme) */}
            <div className={`group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-700 delay-300 transform ${
              aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-4 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                <span className="text-amber-600">Delivery</span> Lifecycle Tracking
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Managed by State design patterns with <span className="text-amber-600 font-semibold">milestone checkpoint scans</span>, carrier dispatch numbers, and buyer sign-off.
              </p>
            </div>

            {/* Pillar 4: Verified Dealerships (Purple / Violet Theme) */}
            <div className={`group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-700 delay-400 transform ${
              aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                <span className="text-purple-600">Verified</span> Dealerships
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only authenticated sellers with <span className="text-purple-600 font-semibold">clear title records</span> and valid vehicle documentation are approved to list inventory.
              </p>
            </div>

          </div>

          {/* Clean Metric Strip with Live Counting Animations & Colorful Gradients */}
          <div className={`pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-700 delay-500 transform ${
            aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                <AnimatedNumber value={1500} suffix="+" isVisible={aboutInView} />
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Vehicles Auctioned</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                <AnimatedNumber value={100} suffix="%" isVisible={aboutInView} />
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Escrow Protected</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                <AnimatedNumber value={99.8} decimals={1} suffix="%" isVisible={aboutInView} />
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Delivery Success Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>24/7</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Admin Operations Desk</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CONTACT US SECTION (SMOOTH SCROLL ANIMATION & CLEAN DESIGN)            */}
      {/* ========================================================================= */}
      <section 
        id="contact" 
        ref={contactRef}
        className="py-24 px-6 sm:px-12 bg-slate-50 border-t border-slate-200/80"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className={`text-center max-w-xl mx-auto space-y-3 transition-all duration-700 transform ${
            contactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 shadow-xs mb-1">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                Direct Support
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Our Team
              </span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Have questions regarding <span className="font-semibold text-blue-600">dealer onboarding</span>, <span className="font-semibold text-emerald-600">bidding limits</span>, or <span className="font-semibold text-indigo-600">payment slip clearance</span>? Send us a message and our support desk will assist you promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Direct Contact Info Cards */}
            <div className={`md:col-span-5 space-y-3.5 transition-all duration-700 delay-100 transform ${
              contactInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              {/* Card 1: Email */}
              <div className="p-4 bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 rounded-2xl flex items-center gap-3 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">Email Inquiries</div>
                  <a href="mailto:support@autos-exchange.com" className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    support@autos-exchange.com
                  </a>
                </div>
              </div>

              {/* Card 2: Hotline */}
              <div className="p-4 bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 rounded-2xl flex items-center gap-3 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase">Customer Hotline</div>
                  <a href="tel:+94112345678" className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    +94 11 234 5678
                  </a>
                </div>
              </div>

              {/* Card 3: Operations Desk */}
              <div className="p-4 bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5 rounded-2xl flex items-center gap-3 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-600 tracking-wide uppercase">Operations Desk</div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Colombo Automotive Logistics Center
                  </div>
                </div>
              </div>

              {/* Card 4: Support Hours */}
              <div className="p-4 bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/5 rounded-2xl flex items-center gap-3 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-purple-600 tracking-wide uppercase">Support Hours</div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    Monday – Saturday: 8:00 AM – 8:00 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Message Form */}
            <div className={`md:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-700 delay-200 transform ${
              contactInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>
                  Send Us a{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Message
                  </span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Fill out the form below and an administrator will respond within 24 hours.
              </p>

              {contactSubmitted ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm text-emerald-900">Thank You! Your Message Was Received.</div>
                  <div className="text-emerald-700">Our support desk will review your inquiry and follow up shortly.</div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name <span className="text-blue-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Kasun Wickramasinghe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-blue-600 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Inquiry / Message <span className="text-blue-600 font-bold">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can we assist you with our bidding platform?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Support</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 sm:px-12 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] tracking-wider">
              AV
            </div>
            <div className="leading-tight text-left">
              <span className="font-bold text-sm text-white block">
                Avtomat
              </span>
              <span className="text-[9px] text-blue-400 font-semibold block uppercase tracking-wider">
                AUTO EXCHANGE
              </span>
            </div>
            <span className="text-slate-500 text-[11px] ml-3">© 2026 Avtomat Auto Exchange. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              type="button" 
              onClick={() => scrollToSection('about')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('contact')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button 
              type="button" 
              onClick={() => openAuthModal('LOGIN')} 
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 5. AUTHENTICATION MODAL (LOGIN & REGISTER)                                */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Brand Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] tracking-wider shadow-sm">
                AV
              </div>
              <div className="leading-tight text-left">
                <span className="font-extrabold text-base tracking-tight text-slate-900 block font-display">
                  Avtomat
                </span>
                <span className="text-[9px] text-blue-600 font-bold block uppercase tracking-wider">
                  AUTO EXCHANGE
                </span>
              </div>
            </div>

            {/* Segmented Switcher: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'LOGIN'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'REGISTER'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* --- SIGN IN MODE --- */}
            {authMode === 'LOGIN' && (
              <div className="space-y-4">
                
                {/* 3 Role Selection Cards with Instant Demo Switch */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectRole('BUYER')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'BUYER'
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Gavel className={`w-3.5 h-3.5 ${selectedRole === 'BUYER' ? 'text-blue-600' : 'text-slate-400'}`} />
                        {selectedRole === 'BUYER' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </div>
                      <div className="font-bold text-xs">Buyer</div>
                      <div className="text-[10px] text-slate-500">Dilini</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole('SELLER')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'SELLER'
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Car className={`w-3.5 h-3.5 ${selectedRole === 'SELLER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {selectedRole === 'SELLER' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </div>
                      <div className="font-bold text-xs">Seller</div>
                      <div className="text-[10px] text-slate-500">Kasun</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole('ADMINISTRATOR')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'ADMINISTRATOR'
                          ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 text-amber-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Shield className={`w-3.5 h-3.5 ${selectedRole === 'ADMINISTRATOR' ? 'text-amber-600' : 'text-slate-400'}`} />
                        {selectedRole === 'ADMINISTRATOR' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                      </div>
                      <div className="font-bold text-xs">Admin</div>
                      <div className="text-[10px] text-slate-500">Nadeesha</div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <span>Sign In as {selectedRole === 'ADMINISTRATOR' ? 'Admin' : selectedRole}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('REGISTER');
                          setRegRole(selectedRole === 'ADMINISTRATOR' ? 'BUYER' : selectedRole);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold ml-1 underline underline-offset-2 cursor-pointer"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </form>

              </div>
            )}

            {/* --- REGISTER MODE --- */}
            {authMode === 'REGISTER' && (
              <div className="space-y-4">
                
                {/* Role Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Register As
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRegRole('BUYER')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        regRole === 'BUYER'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Gavel className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold">Buyer</div>
                        <div className="text-[10px] text-slate-500">Bid on vehicles</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('SELLER')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        regRole === 'SELLER'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Car className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold">Seller</div>
                        <div className="text-[10px] text-slate-500">List vehicles</div>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-3 cursor-pointer"
                  >
                    {loading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('LOGIN');
                          handleSelectRole(regRole);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold ml-1 underline underline-offset-2 cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
