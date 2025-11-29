'use client'

import { forwardRef, TextareaHTMLAttributes, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, FileText, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'premium' | 'glass' | 'minimal'
  label?: string
  icon?: 'message' | 'file' | 'edit' | React.ReactNode
  error?: string
  success?: boolean
  showWordCount?: boolean
  maxLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = 'default',
    label,
    icon,
    error,
    success = false,
    showWordCount = false,
    maxLength,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = (ref || textareaRef) as React.RefObject<HTMLTextAreaElement>

    useEffect(() => {
      if (combinedRef.current) {
        const value = combinedRef.current.value
        setHasValue(!!value)
        setWordCount(value.length)
      }
    }, [props.value, props.defaultValue])

    const getIcon = () => {
      if (typeof icon === 'string') {
        switch (icon) {
          case 'message': return <MessageSquare className="w-5 h-5" />
          case 'file': return <FileText className="w-5 h-5" />
          case 'edit': return <Edit3 className="w-5 h-5" />
          default: return null
        }
      }
      return icon
    }

    const getVariantClasses = () => {
      const base = 'relative w-full transition-all duration-300 resize-y'
      
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
          return `${base} bg-transparent border-2 ${
            error 
              ? 'border-red-500' 
              : success
              ? 'border-green-500'
              : isFocused 
                ? 'border-gold' 
                : 'border-gray-300'
          } rounded-lg text-gray-900 placeholder-gray-500`
        
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
              className={`absolute left-3 top-4 z-10 ${
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

          {/* Textarea */}
          <textarea
            ref={combinedRef}
            className={cn(
              getVariantClasses(),
              getIcon() ? 'pl-12' : 'pl-4',
              'pr-4 py-3 text-sm font-medium focus:outline-none min-h-[120px]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            placeholder={isFocused || variant === 'minimal' ? props.placeholder : label || props.placeholder}
            maxLength={maxLength}
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
              setWordCount(e.target.value.length)
              props.onChange?.(e)
            }}
            {...props}
          />

          {/* Word count */}
          {(showWordCount || maxLength) && (
            <motion.div
              className={`absolute bottom-3 right-3 text-xs ${
                variant === 'premium' || variant === 'glass'
                  ? 'text-white/60'
                  : 'text-gray-400'
              } ${
                maxLength && wordCount > maxLength * 0.9 
                  ? 'text-red-500' 
                  : ''
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isFocused || hasValue ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {maxLength ? `${wordCount}/${maxLength}` : wordCount}
            </motion.div>
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
            {[...Array(3)].map((_, i) => (
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
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
