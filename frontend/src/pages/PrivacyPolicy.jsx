import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo size="large" showText={true} className="justify-center mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/10 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">About Stash</h2>
            <p className="text-slate-300 leading-relaxed">
              Stash is a financial intelligence and money management platform designed to help users understand, 
              organize, and gain insights into their financial activity. Stash is owned and operated by 
              <strong className="text-white"> Cestrum Technologies Private Limited</strong> (India).
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Data We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Authentication Data</h3>
                <p className="text-slate-300 leading-relaxed">
                  When you sign in with Google, we collect:
                </p>
                <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
                  <li>Your Google account email address</li>
                  <li>Basic profile information (name, if provided by Google)</li>
                  <li>Google account ID (for authentication purposes)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Financial Data</h3>
                <p className="text-slate-300 leading-relaxed">
                  You may provide the following information:
                </p>
                <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
                  <li>Expenses and income records</li>
                  <li>Financial goals and targets</li>
                  <li>Budget preferences</li>
                  <li>Age and profession (for personalized insights)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What We Don't Collect</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              We do <strong className="text-white">NOT</strong> collect or store:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Bank account passwords or credentials</li>
              <li>OTPs (One-Time Passwords)</li>
              <li>Payment card numbers or CVV codes</li>
              <li>Bank account numbers or routing information</li>
              <li>Any sensitive financial credentials</li>
            </ul>
          </section>

          {/* How Data is Used */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Data</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              We use your data solely to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Provide financial insights and summaries</li>
              <li>Generate personalized recommendations</li>
              <li>Organize and display your financial activity</li>
              <li>Improve the platform's features and user experience</li>
              <li>Authenticate your account securely</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We do <strong className="text-white">NOT</strong> sell your data to third parties. 
              We do <strong className="text-white">NOT</strong> use your data for advertising purposes.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Store Your Data</h2>
            <p className="text-slate-300 leading-relaxed">
              Your data is stored securely using:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li>MongoDB databases with access controls</li>
              <li>Secure backend services with authentication</li>
              <li>Encrypted connections (HTTPS) for all data transmission</li>
              <li>Industry-standard security practices</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Access your data at any time through the Stash platform</li>
              <li>Update or correct your information in Settings</li>
              <li>Delete your account and all associated data permanently</li>
              <li>Request data deletion at any time</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              To delete your account, go to <Link to="/settings" className="text-cyan-400 hover:text-cyan-300 underline">Settings</Link> and click "Delete Account". 
              This action is irreversible and will permanently remove all your data.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy or your data, please contact us at:
            </p>
            <p className="text-cyan-400 mt-2">
              <a href="mailto:administrator-stash.auth7@gmail.com" className="hover:text-cyan-300 underline">
                administrator-stash.auth7@gmail.com
              </a>
            </p>
            <p className="text-slate-400 text-sm mt-4">
              <strong className="text-white">Cestrum Technologies Private Limited</strong><br />
              India
            </p>
          </section>

          {/* Footer Links */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-500">•</span>
            <Link to="/data-deletion" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Data Deletion Policy
            </Link>
            <span className="text-slate-500">•</span>
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

