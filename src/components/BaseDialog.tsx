'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface BaseDialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  showCloseButton?: boolean
  className?: string
  zIndex?: number
}

export const BaseDialog = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  maxWidth = '2xl',
  showCloseButton = true,
  className = '',
  zIndex = 1000
}: BaseDialogProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Increment a counter on the body to track open dialogs
      const currentCount = parseInt(document.body.getAttribute('data-dialog-count') || '0')
      document.body.setAttribute('data-dialog-count', (currentCount + 1).toString())
    }
    
    return () => {
      if (isOpen) {
        const currentCount = parseInt(document.body.getAttribute('data-dialog-count') || '1')
        const newCount = currentCount - 1
        document.body.setAttribute('data-dialog-count', newCount.toString())
        
        if (newCount <= 0) {
          document.body.style.overflow = 'unset'
        }
      }
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-[1400px] h-[90vh]'
  }

  const dialogContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#0f1923] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${className}`}
      >
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-px bg-linear-to-r from-red-500/50 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-8 bg-linear-to-b from-red-500/50 to-transparent" />

        <div className="absolute top-0 right-0 w-8 h-px bg-linear-to-l from-zinc-700 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-8 bg-linear-to-b from-zinc-700 to-transparent" />

        <div className="absolute bottom-0 left-0 w-8 h-px bg-linear-to-r from-zinc-700 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-8 bg-linear-to-t from-zinc-700 to-transparent" />

        <div className="absolute bottom-0 right-0 w-8 h-px bg-linear-to-l from-zinc-700 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-8 bg-linear-to-t from-zinc-700 to-transparent" />

        {/* Subtle top light sweep */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 md:p-8 border-b border-zinc-800/50 bg-white/2">
            <div className="relative">
              {title && (
                <div className="relative inline-block">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                    {title}
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-500" />
                </div>
              )}
              {description && (
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-zinc-700 rotate-45" />
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800/80 rounded-sm transition-all group border border-transparent hover:border-zinc-700 relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
                {/* Close button accent */}
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

