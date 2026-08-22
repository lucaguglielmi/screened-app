import React from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Plus, 
  ChevronDown, 
  Sparkles, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  HelpCircle,
  Mail,
  FileText,
  LucideIcon
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'glass';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconAnimationType = 
  | 'arrow-right' 
  | 'arrow-up-right' 
  | 'plus' 
  | 'chevron-down' 
  | 'sparkles' 
  | 'search' 
  | 'refresh' 
  | 'external' 
  | 'check' 
  | 'help'
  | 'mail'
  | 'doc'
  | 'custom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconType?: IconAnimationType;
  customIcon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  playSound?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  iconType,
  customIcon: CustomIconComponent,
  iconPosition = 'right',
  isLoading = false,
  playSound = true,
  className = '',
  onClick,
  disabled,
  children,
  ...props
}) => {
  // Base Variant Styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 border border-blue-400/30 hover:border-blue-400/50',
    secondary:
      'bg-[#141838] hover:bg-[#1D2352] text-zinc-200 hover:text-white border border-[#252C5E] hover:border-[#3D488E]',
    outline:
      'bg-transparent hover:bg-zinc-800/50 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500',
    ghost:
      'bg-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-100 border border-transparent',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-md shadow-rose-900/30 border border-rose-500/30',
    accent:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/30',
    glass:
      'bg-zinc-900/60 hover:bg-zinc-850/80 text-zinc-100 backdrop-blur-md border border-zinc-700/60 hover:border-zinc-500/80 shadow-lg',
  };

  // Size Styles
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-2',
    md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2.5',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-3',
  };

  // Icon Dimension based on size
  const iconSizeMap: Record<ButtonSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Icon Render Helper with dedicated micro-animation CSS transitions
  const renderIcon = () => {
    if (isLoading) {
      return (
        <RefreshCw 
          className={`${iconSizeMap[size]} animate-spin text-current opacity-80`} 
        />
      );
    }

    if (CustomIconComponent) {
      return (
        <CustomIconComponent 
          className={`${iconSizeMap[size]} transition-transform duration-300 group-hover:scale-110`} 
        />
      );
    }

    switch (iconType) {
      case 'arrow-right':
        return (
          <ArrowRight 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:translate-x-1.5`} 
          />
        );
      case 'arrow-up-right':
        return (
          <ArrowUpRight 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1`} 
          />
        );
      case 'plus':
        return (
          <Plus 
            className={`${iconSizeMap[size]} transition-transform duration-500 ease-in-out group-hover:rotate-180`} 
          />
        );
      case 'chevron-down':
        return (
          <ChevronDown 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:translate-y-1`} 
          />
        );
      case 'sparkles':
        return (
          <Sparkles 
            className={`${iconSizeMap[size]} transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 text-amber-400`} 
          />
        );
      case 'search':
        return (
          <Search 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:scale-115 group-hover:-rotate-6`} 
          />
        );
      case 'refresh':
        return (
          <RefreshCw 
            className={`${iconSizeMap[size]} transition-transform duration-500 ease-in-out group-hover:rotate-180`} 
          />
        );
      case 'external':
        return (
          <ExternalLink 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} 
          />
        );
      case 'check':
        return (
          <Check 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:scale-120 text-emerald-400`} 
          />
        );
      case 'help':
        return (
          <HelpCircle 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:rotate-12 text-blue-400`} 
          />
        );
      case 'mail':
        return (
          <Mail 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-6 text-rose-400`} 
          />
        );
      case 'doc':
        return (
          <FileText 
            className={`${iconSizeMap[size]} transition-transform duration-300 ease-out group-hover:scale-110 text-indigo-400`} 
          />
        );
      default:
        return null;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound && !disabled && !isLoading) {
      soundEffects.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const iconElement = renderIcon();

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`group relative inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      <span className="truncate">{children}</span>
      {iconPosition === 'right' && iconElement}
    </button>
  );
};
