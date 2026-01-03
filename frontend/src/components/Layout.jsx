import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Onboarding from './Onboarding';
import FirstTimeOnboarding from './FirstTimeOnboarding';
import TopNav from './TopNav';
import { useGuestMode } from '../hooks/useGuestMode';

const Layout = ({ children, user, setUser }) => {
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
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
    
    // Show first-time onboarding ONLY if onboarding not completed
    // Only check onboardingCompleted flag, not individual fields
    if (!localOnboardingCompleted && !backendOnboardingCompleted && user && !isGuest) {
      setShowFirstTimeOnboarding(true);
      setShowOnboarding(false);
      return; // Block dashboard access
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Safety check: if no user and not guest, redirect to login
  if (!user && !isGuest) {
    return null; // ProtectedRoute will handle redirect
  }

  // Allow Settings page to render even during onboarding (user might need to access settings)
  const isSettingsPage = window.location.pathname === '/settings';
  
  // First-time onboarding (Name, Age, Profession) - mandatory for new Google users
  // BUT allow Settings page to render
  if (showFirstTimeOnboarding && !isSettingsPage) {
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
  // BUT allow Settings page to render
  if (showOnboarding && !isSettingsPage) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-app-bg relative flex flex-col">
      {/* Top Navigation Bar */}
      <TopNav user={user} setUser={setUser} />
      
      <div className="flex flex-1 pt-14 md:pt-16">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <Sidebar user={user} setUser={setUser} />
        </div>

        {/* Mobile Sidebar - Sliding menu */}
        <MobileSidebar user={user} setUser={setUser} />

        {/* Main Content Area - Proper spacing to prevent collision with TopNav */}
        <main className="flex-1 md:ml-60 min-h-screen relative z-10">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 pt-6 sm:pt-8 md:pt-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

