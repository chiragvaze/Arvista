'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info, AlertCircle, Sparkles } from 'lucide-react'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'premium'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    if (!toast.persistent && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastComponent({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'premium':
        return <Sparkles className="w-5 h-5 text-gold" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStyles = () => {
    const base = 'relative overflow-hidden backdrop-blur-xl border shadow-xl'
    
    switch (toast.type) {
      case 'success':
        return `${base} bg-green-500/10 border-green-500/30 shadow-green-glow`
      case 'error':
        return `${base} bg-red-500/10 border-red-500/30 shadow-red-glow`
      case 'warning':
        return `${base} bg-yellow-500/10 border-yellow-500/30 shadow-yellow-glow`
      case 'info':
        return `${base} bg-blue-500/10 border-blue-500/30 shadow-blue-glow`
      case 'premium':
        return `${base} bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-gray-900/90 border-2 border-gold/50 shadow-premium-glow`
      default:
        return `${base} bg-white/10 border-white/20`
    }
  }

  return (
    <motion.div
      className={`${getStyles()} rounded-xl p-4 min-w-[320px] max-w-md`}
      initial={{ 
        opacity: 0, 
        x: 400, 
        scale: 0.8,
        rotateY: 45 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        rotateY: 0 
      }}
      exit={{ 
        opacity: 0, 
        x: 400, 
        scale: 0.8,
        rotateY: -45,
        transition: { duration: 0.3 }
      }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        duration: 0.5 
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Premium border animation */}
      {toast.type === 'premium' && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.2, 
            type: 'spring', 
            damping: 15, 
            stiffness: 300 
          }}
        >
          {getIcon()}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h4
            className={`font-semibold text-sm mb-1 ${
              toast.type === 'premium' 
                ? 'text-white premium-text-glow' 
                : 'text-white'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {toast.title}
          </motion.h4>
          
          {toast.message && (
            <motion.p
              className={`text-sm ${
                toast.type === 'premium' 
                  ? 'text-gray-300' 
                  : 'text-white/80'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {toast.message}
            </motion.p>
          )}
        </div>

        {/* Close button */}
        <motion.button
          className={`p-1 rounded-full transition-all duration-300 ${
            toast.type === 'premium'
              ? 'hover:bg-white/10 text-white/70 hover:text-gold'
              : 'hover:bg-white/10 text-white/70 hover:text-white'
          }`}
          onClick={onClose}
          whileHover={{ 
            scale: 1.1, 
            rotate: 90,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Premium floating particles */}
      {toast.type === 'premium' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar for non-persistent toasts */}
      {!toast.persistent && toast.duration !== 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${
            toast.type === 'premium'
              ? 'bg-gradient-to-r from-gold to-amethyst'
              : toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
          } rounded-b-xl`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ 
            duration: (toast.duration || 5000) / 1000,
            ease: 'linear' 
          }}
        />
      )}

      {/* Glow effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: toast.type === 'premium'
            ? 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1), transparent 60%)'
            : toast.type === 'success'
              ? 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1), transparent 60%)'
              : toast.type === 'error'
                ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1), transparent 60%)'
                : toast.type === 'warning'
                  ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.1), transparent 60%)'
                  : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 60%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

// Convenience hook for quick toast creation
export function useQuickToast() {
  const { addToast } = useToast()

  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message }),
    
    premium: (title: string, message?: string) => 
      addToast({ type: 'premium', title, message }),
  }
}

export default ToastProvider