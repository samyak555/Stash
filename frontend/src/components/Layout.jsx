import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Onboarding from './Onboarding';

const Layout = ({ children, user, setUser }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted && user) {
      setShowOnboarding(true);
    }
    setCheckingOnboarding(false);
  }, [user]);

  if (checkingOnboarding) {
    return null; // Or a loading state
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-app-bg relative flex">
      {/* Full Page Logo Background Watermark - Transparent, fills complete page */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/logo/ChatGPT_Image_Dec_31__2025__11_43_49_PM-removebg-preview.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.05,
          filter: 'grayscale(80%) brightness(0.4)',
        }}
      />
      
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
  );
};

export default Layout;

