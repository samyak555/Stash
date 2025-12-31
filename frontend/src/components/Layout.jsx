import Sidebar from './Sidebar';

const Layout = ({ children, user, setUser }) => {
  return (
    <div className="min-h-screen bg-black relative flex">
      {/* Background Watermark - Subtle, non-intrusive */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/logo.png"
          alt=""
          className="w-[90vw] h-[90vh] max-w-[800px] max-h-[800px] object-contain"
          style={{ 
            opacity: 0.04,
            filter: 'grayscale(100%)',
            mixBlendMode: 'normal'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

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

