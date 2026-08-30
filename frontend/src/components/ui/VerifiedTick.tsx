import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface VerifiedTickProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export const VerifiedTick: React.FC<VerifiedTickProps> = ({
  className,
  size = 14,
  strokeWidth = 2.5,
}) => {
  return (
    <Check
      size={size}
      strokeWidth={strokeWidth}
      className={clsx('text-emerald-400 shrink-0 inline-block', className)}
      aria-hidden="true"
    />
  );
};
