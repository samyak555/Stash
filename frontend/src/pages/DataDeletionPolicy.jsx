import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const DataDeletionPolicy = () => {
  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo size="large" showText={true} className="justify-center mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Data Deletion Policy</h1>
          <p className="text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/10 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Right to Delete</h2>
            <p className="text-slate-300 leading-relaxed">
              At Stash, owned and operated by <strong className="text-white">Cestrum Technologies Private Limited</strong> (India), 
              we believe you should have full control over your data. You can delete your account and all associated data at any time.
            </p>
          </section>

          {/* How to Delete */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How to Delete Your Account</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              To delete your account:
            </p>
            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-4">
              <li>Sign in to your Stash account</li>
              <li>Navigate to <Link to="/settings" className="text-cyan-400 hover:text-cyan-300 underline">Settings</Link></li>
              <li>Scroll to the "Delete Account" section</li>
              <li>Click "Delete Account" and confirm your decision</li>
            </ol>
            <p className="text-slate-300 leading-relaxed mt-4">
              You will be asked to confirm the deletion. Once confirmed, the deletion process begins immediately.
            </p>
          </section>

          {/* What Gets Deleted */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Gets Deleted</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              When you delete your account, we permanently delete:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Your user profile and account information</li>
              <li>All expense records</li>
              <li>All income records</li>
              <li>All financial goals and targets</li>
              <li>All budget preferences</li>
              <li>All transaction history</li>
              <li>All associated data and preferences</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              <strong className="text-white">This deletion is permanent and irreversible.</strong> Once your account is deleted, 
              we cannot recover any of your data.
            </p>
          </section>

          {/* Deletion Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Deletion Timeline</h2>
            <p className="text-slate-300 leading-relaxed">
              Account deletion happens immediately upon confirmation. All data is permanently removed from our databases 
              within 24 hours of your deletion request. Your session will be invalidated immediately, and you will be 
              redirected to the login page.
            </p>
          </section>

          {/* Guest Data */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Guest Mode Data</h2>
            <p className="text-slate-300 leading-relaxed">
              If you use Stash in guest mode (without signing in), your data is stored only in your browser's local storage. 
              Guest data is automatically cleared after 15 minutes of inactivity or when you close your browser. 
              Guest data is never stored in our databases.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We do not retain your data after account deletion. Once deleted, your data cannot be recovered. 
              If you wish to use Stash again after deletion, you will need to create a new account.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Deletion</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about account deletion or need assistance, please contact us at:
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
            <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-500">•</span>
            <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
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

export default DataDeletionPolicy;

