import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { useAppStore } from '@/store/appStore'
import {
  Shield,
  Zap,
  Smartphone,
  ChevronRight,
  Check,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'mode', title: 'Execution Mode' },
  { id: 'theme', title: 'Theme' },
  { id: 'ready', title: 'Ready' }
]

export default function Setup() {
  const navigate = useNavigate()
  const { theme, setTheme, completeSetup } = useThemeStore()
  const { executionMode } = useAppStore()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = () => {
    completeSetup()
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index <= currentStep ? 'w-8 bg-primary' : 'w-2 bg-card-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
        {currentStep === 1 && <ModeStep mode={executionMode} onNext={handleNext} />}
        {currentStep === 2 && <ThemeStep theme={theme} setTheme={setTheme} onNext={handleNext} />}
        {currentStep === 3 && <ReadyStep onComplete={handleComplete} />}
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      {/* Logo */}
      <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
          <span className="text-5xl font-black text-white">A</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-3">
        Welcome to AppControlX
      </h1>
      <p className="text-text-secondary mb-8 max-w-xs">
        Take control of your Android apps. Freeze, manage, and optimize with ease.
      </p>

      {/* Features */}
      <div className="w-full space-y-3 mb-8">
        <FeatureItem icon={Shield} text="Safe app management with protection" />
        <FeatureItem icon={Zap} text="Freeze apps to save battery" />
        <FeatureItem icon={Smartphone} text="Monitor system performance" />
      </div>

      <button onClick={onNext} className="btn btn-primary w-full">
        Get Started
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function ModeStep({ mode, onNext }: { mode: string; onNext: () => void }) {
  const modeConfigs = {
    ROOT: {
      icon: Zap,
      title: 'Root Access Detected',
      description: 'Full control over all apps including system apps. You can freeze, unfreeze, and force stop any app.',
      color: 'text-success',
      bgColor: 'bg-success-bg'
    },
    SHIZUKU: {
      icon: Shield,
      title: 'Shizuku Mode',
      description: 'Limited shell access without root. Most features available except some system-level operations.',
      color: 'text-primary',
      bgColor: 'bg-primary-bg'
    },
    NONE: {
      icon: AlertTriangle,
      title: 'View Only Mode',
      description: 'No root or Shizuku detected. You can view app information but cannot perform actions.',
      color: 'text-warning',
      bgColor: 'bg-warning-bg'
    }
  }

  const modeInfo = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.NONE

  const ModeIcon = modeInfo.icon

  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center mb-6', modeInfo.bgColor)}>
        <ModeIcon size={40} className={modeInfo.color} />
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {modeInfo.title}
      </h1>
      <p className="text-text-secondary mb-8 max-w-xs">
        {modeInfo.description}
      </p>

      {/* Mode capabilities */}
      <div className="w-full card p-4 mb-8">
        <h3 className="text-sm font-medium text-text-muted mb-3 text-left">Available Actions</h3>
        <div className="space-y-2">
          <CapabilityItem text="View app list and details" available />
          <CapabilityItem text="Freeze/Unfreeze apps" available={mode !== 'NONE'} />
          <CapabilityItem text="Force stop running apps" available={mode !== 'NONE'} />
          <CapabilityItem text="Clear app cache" available={mode !== 'NONE'} />
          <CapabilityItem text="Manage system apps" available={mode === 'ROOT'} />
        </div>
      </div>

      <button onClick={onNext} className="btn btn-primary w-full">
        Continue
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function ThemeStep({ theme, setTheme, onNext }: { theme: string; setTheme: (t: 'light' | 'dark') => void; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Choose Your Theme
      </h1>
      <p className="text-text-secondary mb-8">
        You can change this later in settings
      </p>

      <div className="w-full grid grid-cols-2 gap-4 mb-8">
        {/* Light Theme */}
        <button
          onClick={() => setTheme('light')}
          className={cn(
            'card p-4 flex flex-col items-center gap-3 transition-all',
            theme === 'light' && 'ring-2 ring-primary border-primary'
          )}
        >
          <div className="w-16 h-16 rounded-xl bg-[#FDF6E3] border border-[#E5DCC5] flex items-center justify-center">
            <Sun size={28} className="text-[#22C55E]" />
          </div>
          <span className="font-medium text-text-primary">Light</span>
          {theme === 'light' && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'card p-4 flex flex-col items-center gap-3 transition-all relative',
            theme === 'dark' && 'ring-2 ring-primary border-primary'
          )}
        >
          <div className="w-16 h-16 rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
            <Moon size={28} className="text-[#8B5CF6]" />
          </div>
          <span className="font-medium text-text-primary">Dark</span>
          {theme === 'dark' && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
        </button>
      </div>

      <button onClick={onNext} className="btn btn-primary w-full">
        Continue
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function ReadyStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mb-6">
        <Check size={40} className="text-success" />
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        You're All Set!
      </h1>
      <p className="text-text-secondary mb-8 max-w-xs">
        AppControlX is ready to help you manage your apps efficiently.
      </p>

      <div className="w-full card p-4 mb-8">
        <h3 className="text-sm font-medium text-text-muted mb-3 text-left">Quick Tips</h3>
        <ul className="text-left text-sm text-text-secondary space-y-2">
          <li>• Long press on an app for quick actions</li>
          <li>• Use filters to find apps quickly</li>
          <li>• Check dashboard for system stats</li>
          <li>• Frozen apps won't run in background</li>
        </ul>
      </div>

      <button onClick={onComplete} className="btn btn-primary w-full">
        Start Using AppControlX
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3 card p-3">
      <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
      <span className="text-sm text-text-primary">{text}</span>
    </div>
  )
}

function CapabilityItem({ text, available }: { text: string; available: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center',
        available ? 'bg-success-bg' : 'bg-error-bg'
      )}>
        {available ? (
          <Check size={12} className="text-success" />
        ) : (
          <span className="text-error text-xs">✕</span>
        )}
      </div>
      <span className={cn('text-sm', available ? 'text-text-primary' : 'text-text-muted')}>
        {text}
      </span>
    </div>
  )
}
