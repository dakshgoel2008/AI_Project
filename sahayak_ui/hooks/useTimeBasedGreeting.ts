"use client"

import { useState, useEffect } from 'react'

export function useTimeBasedGreeting() {
  const [greeting, setGreeting] = useState('Good evening')

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      
      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon')
      } else {
        setGreeting('Good evening')
      }
    }

    // Update greeting immediately
    updateGreeting()
    
    // Update greeting every minute to handle time changes
    const interval = setInterval(updateGreeting, 60000)
    
    return () => clearInterval(interval)
  }, [])

  return greeting
}