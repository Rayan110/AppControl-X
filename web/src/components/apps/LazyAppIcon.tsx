import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Package } from 'lucide-react'

interface LazyAppIconProps {
  packageName: string
  iconBase64: string | null
  appName: string
  size?: number
  className?: string
}

export default function LazyAppIcon({
  packageName,
  iconBase64,
  appName,
  size = 48,
  className = ''
}: LazyAppIconProps) {
  const { appIcons, loadAppIcon } = useAppStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Intersection Observer untuk lazy load icon saat visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { rootMargin: '100px' } // Load sedikit sebelum visible
    )

    const element = document.getElementById(`icon-${packageName}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [packageName])

  useEffect(() => {
    if (isVisible && !iconBase64 && !appIcons[packageName]) {
      loadAppIcon(packageName)
    }
  }, [isVisible, packageName, iconBase64, appIcons, loadAppIcon])

  const icon = iconBase64 || appIcons[packageName]

  return (
    <div
      id={`icon-${packageName}`}
      className={className}
      style={{ width: size, height: size }}
    >
      {icon ? (
        <img
          src={`data:image/png;base64,${icon}`}
          alt={appName}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-surface flex items-center justify-center">
          <Package size={size / 2} className="text-text-muted" />
        </div>
      )}
    </div>
  )
}
