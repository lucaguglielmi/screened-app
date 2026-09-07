import React from 'react';

interface Props {
  className?: string;
}

export const OrganicBlobBackground: React.FC<Props> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Ambient Base Gradient */}
      <div className="absolute inset-0 bg-moving-dark-gradient opacity-60" />

      {/* Organic Blob 1: Upper Right / Mid Fluid Body */}
      <div
        className="absolute -top-[15%] -right-[10%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-br from-[#0c224a]/40 via-[#091b3b]/30 to-transparent blur-3xl animate-organic-blob-1 transform-gpu"
        style={{ willChange: 'transform, border-radius' }}
      />

      {/* Organic Blob 2: Lower Left Fluid Swell */}
      <div
        className="absolute top-[35%] -left-[15%] w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-[#0b1c3d]/45 via-[#071530]/35 to-transparent blur-3xl animate-organic-blob-2 transform-gpu"
        style={{ willChange: 'transform, border-radius' }}
      />

      {/* Organic Blob 3: Center-Bottom Subtle Glow */}
      <div
        className="absolute -bottom-[10%] right-[20%] w-[38rem] h-[38rem] rounded-full bg-gradient-to-r from-[#0d2248]/35 via-[#0a1936]/25 to-transparent blur-3xl animate-organic-blob-3 transform-gpu"
        style={{ willChange: 'transform, border-radius' }}
      />

      {/* Soft Vignette Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-midnight-base/20 to-midnight-base/50" />
    </div>
  );
};
