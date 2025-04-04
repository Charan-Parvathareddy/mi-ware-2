"use client"

import type * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn("bg-white rounded-lg shadow-lg max-h-[80vh] w-[600px]", className)}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          {title && <h2 className="text-lg font-medium">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(80vh-60px)]">{children}</div>
      </div>
    </div>
  )
}

