'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TIME_SLOTS } from '@/lib/schedule-store'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingItem {
  batchName?: string
  teacherName?: string
  courseName?: string
  timeSlot?: string
  lectureName?: string
}

interface RoomBookingsModalProps {
  isOpen: boolean
  onClose: () => void
  roomNumber: string | null
  roomSchedule: Record<string, { batchName?: string; teacherName?: string; courseName?: string } | null> | null
  isStaffRoom?: boolean
  onDeleteBooking?: (roomNumber: string, date: string, timeSlot: string) => Promise<void>
  currentDate?: string
  showDeleteButton?: boolean
}

export function RoomBookingsModal({ 
  isOpen, 
  onClose, 
  roomNumber, 
  roomSchedule, 
  isStaffRoom,
  onDeleteBooking,
  currentDate,
  showDeleteButton = false
}: RoomBookingsModalProps) {
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null)
  
  const handleDeleteBooking = async (timeSlot: string) => {
    if (!onDeleteBooking || !roomNumber || !currentDate || deletingSlot) return
    
    const confirmed = window.confirm(`Are you sure you want to cancel the booking for ${roomNumber} at ${timeSlot}?`)
    if (!confirmed) return

    setDeletingSlot(timeSlot)
    try {
      await onDeleteBooking(roomNumber, currentDate, timeSlot)
    } catch (error) {
      console.error('Failed to delete booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setDeletingSlot(null)
    }
  }
  
  const bookings: BookingItem[] = React.useMemo(() => {
    if (!roomSchedule || !roomNumber) return []
    if (isStaffRoom) {
      return [{ lectureName: 'Teachers Department CSE-AI' }]
    }
    const items: BookingItem[] = []
    Object.entries(roomSchedule).forEach(([slot, booking]) => {
      if (booking) {
        const isLab = (booking.courseName || '').toLowerCase().includes('lab')
        items.push({
          batchName: booking.batchName,
          teacherName: booking.teacherName,
          courseName: booking.courseName,
          lectureName: isLab ? 'Lab' : 'Lecture',
          timeSlot: slot
        })
      }
    })
    // Sort by TIME_SLOTS order
    items.sort((a, b) => (TIME_SLOTS as readonly string[]).indexOf(a.timeSlot || '') - (TIME_SLOTS as readonly string[]).indexOf(b.timeSlot || ''))
    return items
  }, [roomSchedule, roomNumber, isStaffRoom])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Room - {roomNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {bookings.length === 0 && (
            <p className="text-white/70">No bookings for this date.</p>
          )}
          {bookings.map((b, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-white/10 bg-white/5 flex justify-between items-start">
              <div className="flex-1">
                {b.batchName && <p className="font-medium">{b.batchName}</p>}
                {b.teacherName && <p className="text-white/80">{b.teacherName}</p>}
                {b.courseName && <p className="text-white/80">{b.courseName}</p>}
                {b.lectureName && <p className="text-white/70">{b.lectureName}</p>}
                {b.timeSlot && <p className="text-xs text-white/60">{b.timeSlot}</p>}
              </div>
              {showDeleteButton && onDeleteBooking && b.timeSlot && !isStaffRoom && (
                <Button
                  onClick={() => handleDeleteBooking(b.timeSlot!)}
                  disabled={deletingSlot === b.timeSlot}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 ml-2"
                >
                  {deletingSlot === b.timeSlot ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full"
                    />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}


