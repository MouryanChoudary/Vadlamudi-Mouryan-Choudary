import React from 'react';

interface FooterProps {
  isLoginScreen?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isLoginScreen = false }) => {
  const wrapperClasses = isLoginScreen 
    ? "text-center text-xs text-slate-500 mt-8"
    : "text-center text-xs text-slate-500 mt-8 py-4 border-t border-slate-700/50";
    
  return (
    <footer className={wrapperClasses}>
      <p>Developed by Vadlamudi Mouryan Choudary</p>
      {isLoginScreen ? (
          <p>For access, contact: <a href="mailto:vvadlamudimouryan@gmail.com" className="text-cyan-400 hover:underline">vvadlamudimouryan@gmail.com</a></p>
      ) : (
        <>
          <p>Email: <a href="mailto:vvadlamudimouryan@gmail.com" className="text-cyan-400 hover:underline">vvadlamudimouryan@gmail.com</a></p>
          <p>WhatsApp: <a href="https://wa.me/919182925183" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">+91 9182925183</a></p>
        </>
      )}
    </footer>
  );
};
