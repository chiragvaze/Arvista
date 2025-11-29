'use client'

import { forwardRef, useState, useRef, useEffect, InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Search, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'premium' | 'glass' | 'minimal'
  label?: string
  icon?: 'search' | 'mail' | 'lock' | 'user' | 'phone' | 'location' | React.ReactNode
  showPasswordToggle?: boolean
  error?: string
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'default',
    label,
    icon,
    showPasswordToggle = false,
    error,
    success = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const combinedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>

    useEffect(() => {
      if (combinedRef.current) {
        setHasValue(!!combinedRef.current.value)
      }
    }, [props.value, props.defaultValue])

    const getIcon = () => {
      if (typeof icon === 'string') {
        switch (icon) {
          case 'search': return <Search className="w-5 h-5" />
          case 'mail': return <Mail className="w-5 h-5" />
          case 'lock': return <Lock className="w-5 h-5" />
          case 'user': return <User className="w-5 h-5" />
          case 'phone': return <Phone className="w-5 h-5" />
          case 'location': return <MapPin className="w-5 h-5" />
          default: return null
        }
      }
      return icon
    }

    const getVariantClasses = () => {
      const base = 'relative w-full transition-all duration-300'
      
      switch (variant) {
        case 'premium':
          return `${base} bg-gradient-to-br from-gray-900/50 via-purple-900/20 to-gray-900/50 backdrop-blur-xl border-2 ${
            error 
              ? 'border-red-500/50 shadow-red-glow' 
              : success
              ? 'border-green-500/50 shadow-green-glow'
              : isFocused 
                ? 'border-gold shadow-premium-glow' 
                : 'border-white/20'
          } rounded-xl text-white placeholder-gray-400`
        
        case 'glass':
          return `${base} bg-white/10 backdrop-blur-md border ${
            error 
              ? 'border-red-500/50' 
              : success
              ? 'border-green-500/50'
              : isFocused 
                ? 'border-white/40' 
                : 'border-white/20'
          } rounded-lg text-white placeholder-white/60`
        
        case 'minimal':
          return `${base} bg-transparent border-b-2 ${
            error 
              ? 'border-red-500' 
              : success
              ? 'border-green-500'
              : isFocused 
                ? 'border-gold' 
                : 'border-gray-300'
          } rounded-none text-gray-900 placeholder-gray-500`
        
        default:
          return `${base} bg-white border ${
            error 
              ? 'border-red-500' 
              : success
              ? 'border-green-500'
              : isFocused 
                ? 'border-gold' 
                : 'border-gray-300'
          } rounded-md text-gray-900 placeholder-gray-500`
      }
    }

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && variant !== 'minimal' && (
          <AnimatePresence>
            {(isFocused || hasValue) && (
              <motion.label
                initial={{ opacity: 0, y: 10, scale: 1 }}
                animate={{ opacity: 1, y: -10, scale: 0.85 }}
                exit={{ opacity: 0, y: 10, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`absolute left-3 px-2 pointer-events-none z-10 ${
                  variant === 'premium' || variant === 'glass'
                    ? 'text-gold bg-gray-900/80'
                    : 'text-gray-600 bg-white'
                } rounded text-sm font-medium`}
              >
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </motion.label>
            )}
          </AnimatePresence>
        )}

        {/* Minimal variant label */}
        {label && variant === 'minimal' && (
          <motion.label
            className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              isFocused ? 'text-gold' : 'text-gray-700'
            }`}
            animate={{ 
              color: isFocused ? '#D4AF37' : '#374151' 
            }}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        <div className="relative">
          {/* Icon */}
          {getIcon() && (
            <motion.div
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${
                variant === 'premium' || variant === 'glass'
                  ? isFocused ? 'text-gold' : 'text-white/60'
                  : isFocused ? 'text-gold' : 'text-gray-400'
              } transition-colors duration-300`}
              animate={{
                scale: isFocused ? 1.1 : 1,
                rotate: isFocused ? 5 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              {getIcon()}
            </motion.div>
          )}

          {/* Input */}
          <motion.input
            ref={combinedRef}
            type={inputType}
            className={cn(
              getVariantClasses(),
              getIcon() ? 'pl-12' : 'pl-4',
              (showPasswordToggle || type === 'password') ? 'pr-12' : 'pr-4',
              'py-3 text-sm font-medium focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            placeholder={isFocused || variant === 'minimal' ? props.placeholder : label || props.placeholder}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value)
              props.onChange?.(e)
            }}
            whileFocus={variant === 'premium' ? {
              scale: 1.01,
              transition: { duration: 0.2 }
            } : {}}
            {...props}
          />

          {/* Password toggle */}
          {(showPasswordToggle || type === 'password') && (
            <motion.button
              type="button"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${
                variant === 'premium' || variant === 'glass'
                  ? 'text-white/60 hover:text-gold'
                  : 'text-gray-400 hover:text-gold'
              } transition-colors duration-300`}
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Premium glow effect */}
          {variant === 'premium' && isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 via-transparent to-amethyst/20 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Error/Success message */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-2 text-sm ${
                error ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {error || (success && '✓ Valid')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium floating particles */}
        {variant === 'premium' && isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
