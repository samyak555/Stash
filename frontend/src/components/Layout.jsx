import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Onboarding from './Onboarding';
import FirstTimeOnboarding from './FirstTimeOnboarding';
import TopNav from './TopNav';
import GuestCTABanner from './GuestCTABanner';
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
      {/* Top Navigation Bar */}
      <TopNav user={user} setUser={setUser} />
      
      <div className="flex flex-1 pt-14 md:pt-16">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <Sidebar user={user} setUser={setUser} />
        </div>

        {/* Mobile Sidebar - Sliding menu */}
        <MobileSidebar user={user} setUser={setUser} />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-60 min-h-screen relative z-10">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
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

