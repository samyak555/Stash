import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo size="large" showText={true} className="justify-center mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/10 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using Stash, a financial intelligence and money management platform owned and operated by 
              <strong className="text-white"> Cestrum Technologies Private Limited</strong> (India), you agree to be bound by these Terms of Service.
            </p>
          </section>

          {/* Platform Description */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">About Stash</h2>
            <p className="text-slate-300 leading-relaxed">
              Stash is a financial intelligence and money management platform designed to help users understand, 
              organize, and gain insights into their financial activity. Stash provides tools for:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1 ml-4">
              <li>Tracking expenses and income</li>
              <li>Setting and monitoring financial goals</li>
              <li>Generating insights and summaries</li>
              <li>Organizing financial data</li>
            </ul>
          </section>

          {/* Not Financial Advice */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Not Financial, Legal, or Investment Advice</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              <strong className="text-white">IMPORTANT:</strong> Stash does <strong className="text-white">NOT</strong> provide:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Financial advice</li>
              <li>Investment recommendations</li>
              <li>Legal advice</li>
              <li>Tax advice</li>
              <li>Professional financial planning services</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Stash is a tool for insight, organization, and decision support. All financial decisions are your sole responsibility.
            </p>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Responsibility</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>All decisions made using information from Stash</li>
              <li>Verifying the accuracy of your financial data</li>
              <li>Maintaining the security of your account</li>
              <li>Using Stash in compliance with applicable laws</li>
              <li>Not sharing your account credentials with others</li>
            </ul>
          </section>

          {/* Account Usage */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Account Usage</h2>
            <p className="text-slate-300 leading-relaxed mb-2">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
              <li>Provide accurate and truthful information</li>
              <li>Use Stash only for lawful purposes</li>
              <li>Not attempt to access other users' accounts</li>
              <li>Not use automated systems to access Stash</li>
              <li>Not interfere with the platform's operation</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Termination and Suspension</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in 
              fraudulent, abusive, or illegal activity. You may delete your account at any time from Settings.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, Cestrum Technologies Private Limited and Stash shall not be 
              liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, 
              including but not limited to financial losses or decisions made based on Stash insights.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms of Service from time to time. Continued use of Stash after changes constitutes 
              acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              For questions about these terms, please contact us at:
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

export default TermsOfService;

