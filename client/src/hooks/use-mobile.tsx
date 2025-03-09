import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }
    
    // Set initial values
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    handleOrientationChange()
    
    // Add event listeners
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    orientation
  }
}
