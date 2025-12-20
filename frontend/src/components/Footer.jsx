import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-12 py-6 border-t border-gray-800">
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Created by <span className="text-blue-400 font-semibold">Samyak Jain</span> -{' '}
          <a 
            href="mailto:sam718ind@gmail.com" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            sam718ind@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

