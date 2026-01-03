import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-12 py-6 border-t border-gray-800">
      <div className="text-center space-y-4">
        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600">•</span>
          <Link to="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-600">•</span>
          <Link to="/data-deletion" className="text-gray-400 hover:text-cyan-400 transition-colors">
            Data Deletion Policy
          </Link>
        </div>
        
        {/* Company Identity */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-gray-400 text-xs">
            Powered by <span className="text-gray-300 font-medium">Cestrum Technologies Private Limited</span> (India)
          </p>
          <p className="text-gray-500 text-xs mt-1">
            <a 
              href="mailto:administrator-stash.auth7@gmail.com" 
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              administrator-stash.auth7@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


