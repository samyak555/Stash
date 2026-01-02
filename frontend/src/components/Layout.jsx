import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Onboarding from './Onboarding';
import FirstTimeOnboarding from './FirstTimeOnboarding';
import GuestUpgradeBanner from './GuestUpgradeBanner';

const Layout = ({ children, user, setUser }) => {
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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
      {/* Guest Upgrade Banner */}
      <GuestUpgradeBanner />
      
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar user={user} setUser={setUser} />

        {/* Main Content Area */}
        <main className="flex-1 ml-60 min-h-screen relative z-10">
          <div className="p-6 sm:p-8 lg:p-10">
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

