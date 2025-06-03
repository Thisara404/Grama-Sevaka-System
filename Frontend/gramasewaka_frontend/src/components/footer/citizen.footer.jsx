import React from 'react';

const CitizenFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white shadow-md fixed bottom-0 left-64 right-0 p-4 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-600">
          © {currentYear} Grama Sevaka Citizen Portal. All rights reserved.
        </p>
        <div className="mt-2 md:mt-0 flex space-x-4">
          <a href="/help" className="text-sm text-primary hover:text-secondary">Help</a>
          <a href="/privacy" className="text-sm text-primary hover:text-secondary">Privacy Policy</a>
          <a href="/terms" className="text-sm text-primary hover:text-secondary">Terms of Service</a>
          <a href="/contact" className="text-sm text-primary hover:text-secondary">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default CitizenFooter;