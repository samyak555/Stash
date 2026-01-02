import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Onboarding from './Onboarding';
import FirstTimeOnboarding from './FirstTimeOnboarding';
import GuestUpgradeBanner from './GuestUpgradeBanner';
import SlidingMenu from './SlidingMenu';
import { useGuestMode } from '../hooks/useGuestMode';

const Layout = ({ children, user, setUser }) => {
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isGuest } = useGuestMode();

  useEffect(() => {
    // Check both localStorage and backend user data
    const localOnboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    const backendOnboardingCompleted = user?.onboardingCompleted === true;
    const isGuest = user?.isGuest === true || user?.role === 'guest';
    
    // Skip onboarding checks for guests
    if (isGuest) {
      setShowFirstTimeOnboarding(false);
      setShowOnboarding(false);
      setCheckingOnboarding(false);
      return;
    }
    
    // Show first-time onboarding (Name, Age, Profession) if onboarding not completed
    if (!localOnboardingCompleted && !backendOnboardingCompleted && user) {
      // Check if user has name, age, and profession - if not, show first-time onboarding
      if (!user.name || !user.age || !user.profession) {
        setShowFirstTimeOnboarding(true);
        setShowOnboarding(false);
      } else {
        // User has basic info but onboarding not marked complete - show full onboarding
        setShowFirstTimeOnboarding(false);
        setShowOnboarding(true);
      }
    } else {
      // If onboarding is completed, ensure localStorage is synced
      if (backendOnboardingCompleted && !localOnboardingCompleted) {
        localStorage.setItem('onboardingCompleted', 'true');
      }
      setShowFirstTimeOnboarding(false);
      setShowOnboarding(false);
    }
    setCheckingOnboarding(false);
  }, [user]);

  if (checkingOnboarding) {
    return null; // Or a loading state
  }

  // First-time onboarding (Name, Age, Profession) - mandatory for new Google users
  if (showFirstTimeOnboarding) {
    return (
      <FirstTimeOnboarding
        user={user}
        onComplete={(updatedUser) => {
          setUser(updatedUser);
          setShowFirstTimeOnboarding(false);
          // After first-time onboarding, show full onboarding if needed
          // For now, just complete onboarding
        }}
      />
    );
  }

  // Full onboarding (Income, Expenses, Goals) - optional after first-time
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-app-bg relative flex flex-col">
      {/* Guest Upgrade Banner - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GuestUpgradeBanner />
      </div>
      
      <div className="flex flex-1 pt-0">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar user={user} setUser={setUser} />
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 lg:ml-60 min-h-screen relative z-10 ${isGuest ? 'pt-12' : 'pt-0'}`}>
          {/* Hamburger Menu Button - Visible on mobile/tablet */}
          <div className="lg:hidden fixed top-4 left-4 z-30">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 transition-all"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Sliding Menu */}
      <SlidingMenu 
        user={user} 
        setUser={setUser} 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
      />
    </div>
  );
};

export default Layout;

