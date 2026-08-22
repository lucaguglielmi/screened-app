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
  Send,
  Film,
  Clapperboard,
  LucideIcon
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { IconAnimationType } from './Button';

export type TextLinkVariant = 'primary' | 'emerald' | 'rose' | 'amber' | 'purple' | 'muted' | 'white';
export type TextLinkSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: TextLinkVariant;
  size?: TextLinkSize;
  iconType?: IconAnimationType;
  customIcon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  underlineOnHover?: boolean;
  alwaysUnderlined?: boolean;
  animatedIconContinuous?: boolean;
  playSound?: boolean;
  onActionClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  asButton?: boolean;
  children: React.ReactNode;
}

export const TextLink: React.FC<TextLinkProps> = ({
  variant = 'primary',
  size = 'sm',
  iconType,
  customIcon: CustomIconComponent,
  iconPosition = 'left',
  underlineOnHover = true,
  alwaysUnderlined = false,
  animatedIconContinuous = false,
  playSound = true,
  onActionClick,
  asButton = false,
  className = '',
  children,
  ...props
}) => {
  // Color Variants
  const variantStyles: Record<TextLinkVariant, { text: string; underline: string; iconColor: string }> = {
    primary: {
      text: 'text-blue-400 hover:text-blue-300',
      underline: 'decoration-blue-500/40 hover:decoration-blue-400',
      iconColor: 'text-blue-400 group-hover:text-blue-300',
    },
    emerald: {
      text: 'text-emerald-400 hover:text-emerald-300',
      underline: 'decoration-emerald-500/40 hover:decoration-emerald-400',
      iconColor: 'text-emerald-400 group-hover:text-emerald-300',
    },
    rose: {
      text: 'text-rose-400 hover:text-rose-300',
      underline: 'decoration-rose-500/40 hover:decoration-rose-400',
      iconColor: 'text-rose-400 group-hover:text-rose-300',
    },
    amber: {
      text: 'text-amber-400 hover:text-amber-300',
      underline: 'decoration-amber-500/40 hover:decoration-amber-400',
      iconColor: 'text-amber-400 group-hover:text-amber-300',
    },
    purple: {
      text: 'text-purple-400 hover:text-purple-300',
      underline: 'decoration-purple-500/40 hover:decoration-purple-400',
      iconColor: 'text-purple-400 group-hover:text-purple-300',
    },
    muted: {
      text: 'text-zinc-400 hover:text-zinc-200',
      underline: 'decoration-zinc-600 hover:decoration-zinc-400',
      iconColor: 'text-zinc-400 group-hover:text-zinc-200',
    },
    white: {
      text: 'text-zinc-100 hover:text-white',
      underline: 'decoration-zinc-400 hover:decoration-white',
      iconColor: 'text-zinc-300 group-hover:text-white',
    },
  };

  // Size Styles
  const sizeStyles: Record<TextLinkSize, string> = {
    xs: 'text-xs gap-1',
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2',
    lg: 'text-lg gap-2.5',
  };

  // Icon Sizes
  const iconSizeMap: Record<TextLinkSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const selected = variantStyles[variant];

  // Render Icon with type-specific animations
  const renderIcon = () => {
    if (CustomIconComponent) {
      return (
        <CustomIconComponent
          className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ${
            animatedIconContinuous ? 'animate-pulse' : 'group-hover:scale-110'
          }`}
        />
      );
    }

    switch (iconType) {
      case 'arrow-right':
        return (
          <ArrowRight
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:translate-x-1.5`}
          />
        );
      case 'arrow-up-right':
        return (
          <ArrowUpRight
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
          />
        );
      case 'plus':
        return (
          <Plus
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-500 ease-in-out group-hover:rotate-180`}
          />
        );
      case 'chevron-down':
        return (
          <ChevronDown
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:translate-y-1 ${
              animatedIconContinuous ? 'animate-soft-float' : ''
            }`}
          />
        );
      case 'sparkles':
        return (
          <Sparkles
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 ${
              animatedIconContinuous ? 'animate-soft-twinkle' : ''
            }`}
          />
        );
      case 'search':
        return (
          <Search
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:scale-115 group-hover:-rotate-6`}
          />
        );
      case 'refresh':
        return (
          <RefreshCw
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-500 ease-in-out group-hover:rotate-180`}
          />
        );
      case 'external':
        return (
          <ExternalLink
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
          />
        );
      case 'check':
        return (
          <Check
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:scale-120`}
          />
        );
      case 'help':
        return (
          <HelpCircle
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-all duration-300 ease-out group-hover:rotate-12 group-hover:scale-110 ${
              animatedIconContinuous ? 'animate-pulse' : ''
            }`}
          />
        );
      case 'mail':
        return (
          <Mail
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-6`}
          />
        );
      case 'doc':
        return (
          <FileText
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:scale-110`}
          />
        );
      case 'send':
        return (
          <Send
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12`}
          />
        );
      case 'film':
        return (
          <Film
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-500 ease-in-out group-hover:rotate-45 group-hover:scale-115`}
          />
        );
      case 'clapper':
        return (
          <Clapperboard
            className={`${iconSizeMap[size]} ${selected.iconColor} transition-transform duration-300 ease-out group-hover:scale-115 group-hover:-rotate-6`}
          />
        );
      default:
        return null;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (playSound) {
      soundEffects.playClick();
    }
    if (onActionClick) {
      e.preventDefault();
      onActionClick(e);
    }
  };

  const underlineClass = alwaysUnderlined
    ? `underline underline-offset-4 ${selected.underline}`
    : underlineOnHover
    ? `hover:underline hover:underline-offset-4 ${selected.underline}`
    : '';

  const iconElement = renderIcon();

  if (asButton) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center font-mono transition-colors duration-200 cursor-pointer select-none ${selected.text} ${sizeStyles[size]} ${underlineClass} ${className}`}
      >
        {iconPosition === 'left' && iconElement}
        <span className="truncate">{children}</span>
        {iconPosition === 'right' && iconElement}
      </button>
    );
  }

  return (
    <a
      onClick={handleClick}
      className={`group inline-flex items-center font-mono transition-colors duration-200 cursor-pointer select-none ${selected.text} ${sizeStyles[size]} ${underlineClass} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      <span className="truncate">{children}</span>
      {iconPosition === 'right' && iconElement}
    </a>
  );
};
