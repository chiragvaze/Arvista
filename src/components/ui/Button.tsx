import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles } from 'lucide-react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  glow?: boolean
  shimmer?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    glow = false,
    shimmer = false,
    children,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-primary/25',
      secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white shadow-lg hover:shadow-secondary/25',
      outline: 'border-2 border-gradient-to-r from-primary-600 to-secondary-600 text-white hover:bg-gradient-to-r hover:from-primary-600/10 hover:to-secondary-600/10 premium-border',
      ghost: 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25',
      premium: 'premium-border glass-panel text-white hover:bg-gradient-to-r hover:from-accent-gold/20 hover:to-accent-amethyst/20',
      glass: 'glass-panel text-white border border-white/20 hover:border-accent-gold/50 hover:bg-white/5',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-12 py-5 text-xl',
    }

    const glowClass = glow ? 'shadow-glow hover:shadow-neon' : ''
    const shimmerClass = shimmer ? 'relative overflow-hidden' : ''

    return (
      <motion.button
        ref={ref}
        whileHover={{ 
          scale: 1.05, 
          y: -2,
        }}
        whileTap={{ 
          scale: 0.95,
          y: 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'font-semibold rounded-xl transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold/50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'transform-gpu cursor-premium',
          variants[variant],
          sizes[size],
          glowClass,
          shimmerClass,
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Background Glow Effect */}
        {glow && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-accent-gold/50 to-accent-amethyst/50 rounded-xl filter blur-lg opacity-0 group-hover:opacity-75"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Shimmer Effect */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut" 
            }}
          />
        )}

        {/* Premium Border Animation */}
        {(variant === 'premium' || variant === 'outline') && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-gradient-to-r from-accent-gold via-accent-amethyst to-accent-gold opacity-0 hover:opacity-100"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5 text-accent-gold" />
            </motion.div>
          </motion.div>
        )}

        {/* Content */}
        <motion.span 
          className={cn("relative z-10 flex items-center gap-2", isLoading ? 'invisible' : '')}
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0.9 }}
        >
          {variant === 'premium' && <Sparkles className="w-4 h-4" />}
          {children}
        </motion.span>

        {/* Hover Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/10 opacity-0"
          whileHover={{ 
            opacity: [0, 0.1, 0],
            scale: [1, 1.05, 1.02],
          }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
