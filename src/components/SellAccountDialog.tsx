'use client'

import React, { useState } from 'react'
import { BaseDialog } from './BaseDialog'
import { toast } from 'sonner'

interface SellAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
  accountName: string
  accountTag: string
  onSuccess: () => void
}

export const SellAccountDialog = ({
  isOpen,
  onClose,
  accountId,
  accountName,
  accountTag,
  onSuccess
}: SellAccountDialogProps) => {
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const priceNum = parseFloat(price.replace(/,/g, ''))
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price (> 0)')
      return
    }

    if (!contactInfo.trim()) {
      setError('Please enter contact information (e.g. Telegram, Discord)')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Listing account for sale...')

    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          price: priceNum,
          description,
          contactInfo
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to list account')
      }

      toast.success('Account listed successfully!', { id: toastId })
      onSuccess()
      onClose()
      // Reset form
      setPrice('')
      setDescription('')
      setContactInfo('')
    } catch (err: any) {
      setError(err.message || 'Failed to list account')
      toast.error(err.message || 'Failed to list account', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setPrice('')
      return
    }
    const formatted = parseInt(value, 10).toLocaleString('en-US')
    setPrice(formatted)
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="LIST ACCOUNT FOR SALE"
      description={`Account: ${accountName}#${accountTag}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 bg-[#0f1923]">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-[#FF4655] text-xs font-bold tracking-wider">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="text-zinc-400 text-[10px] font-bold tracking-widest">
            Asking Price (VND) *
          </label>
          <div className="relative">
            <input
              type="text"
              id="price"
              value={price}
              onChange={handlePriceChange}
              placeholder="e.g. 500,000"
              required
              disabled={loading}
              className="w-full bg-[#1c252e] border border-zinc-800 focus:border-[#FF4655] outline-none text-white px-4 py-3 text-sm rounded-none transition-all font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">VND</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact" className="text-zinc-400 text-[10px] font-bold tracking-widest">
            Contact Info (Discord/Telegram/Phone) *
          </label>
          <input
            type="text"
            id="contact"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="e.g. Telegram @username or Discord username#1234"
            required
            disabled={loading}
            className="w-full bg-[#1c252e] border border-zinc-800 focus:border-[#FF4655] outline-none text-white px-4 py-3 text-sm rounded-none transition-all font-semibold"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="desc" className="text-zinc-400 text-[10px] font-bold tracking-widest">
            Detailed Description (Optional)
          </label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Original owner account, includes Reaver Vandal, Prime Phantom, fully verified..."
            disabled={loading}
            rows={4}
            className="w-full bg-[#1c252e] border border-zinc-800 focus:border-[#FF4655] outline-none text-white px-4 py-3 text-sm rounded-none transition-all resize-none font-medium"
          />
        </div>

        <div className="flex gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 hover:text-white transition-all rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#FF4655] hover:bg-[#ff5e6a] text-white font-bold uppercase tracking-wider text-xs transition-all rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none"
          >
            {loading ? 'Processing...' : 'Confirm Listing'}
          </button>
        </div>
      </form>
    </BaseDialog>
  )
}
