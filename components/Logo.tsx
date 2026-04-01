import React from 'react';

interface LogoProps {
  className?: string;
  showSymbol?: boolean; // Kept for backward compatibility
  dark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showSymbol = false, dark = false }) => {
  // Use specific text colors based on background
  const textColor = dark ? "text-white" : "text-gray-900";

  return (
    <div className={`flex items-center ${className}`}>
      {/* Symbol removed */}
      <div className="flex flex-col justify-center h-full pt-1">
        <span className={`text-2xl font-black leading-none tracking-tighter lowercase ${textColor}`}>
            idealle.
        </span>
        <span className={`text-[0.45rem] font-bold uppercase tracking-widest leading-none mt-1 ${textColor}`} style={{ letterSpacing: '0.15em' }}>
            INSPEÇÕES INDUSTRIAIS
        </span>
      </div>
    </div>
  );
};

export default Logo;