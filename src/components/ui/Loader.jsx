'use client'

import { Heart } from 'lucide-react'



export default function Loader({ title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center">
        <div className="relative">
          <Heart className="h-16 w-16 text-blue-600 mx-auto animate-pulse mb-6" />
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-ping" />
        </div>

        {title && (
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        )}
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
