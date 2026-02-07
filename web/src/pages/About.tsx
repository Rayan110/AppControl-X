import PageContainer from '@/components/layout/PageContainer'
import { useThemeStore } from '@/store/themeStore'
import { APP_NAME, APP_VERSION } from '@/lib/constants'
import { Github, Heart, Mail, ExternalLink, Code2, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function About() {
  const { theme } = useThemeStore()

  return (
    <PageContainer title="About">
      {/* Hero Section */}
      <div className="flex flex-col items-center py-6 animate-fade-in-up">
        {/* App Icon - Gear with A */}
        <div className="relative">
          <div className={cn(
            'w-28 h-28 rounded-[2rem] flex items-center justify-center overflow-hidden',
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]'
              : 'bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb]'
          )}>
            <svg
              viewBox="0 0 108 108"
              className="w-24 h-24"
            >
              {/* Gear outer ring with teeth */}
              <path
                fill="#1E88E5"
                d="M54,24 L58,24 L60,20 L64,20 L66,24 L70,26 L74,24 L77,27 L75,31 L78,34 L82,34 L84,38 L84,42 L80,44 L82,48 L82,52 L84,54 L84,58 L82,60 L80,64 L84,66 L84,70 L82,74 L78,74 L75,77 L77,81 L74,84 L70,82 L66,84 L64,88 L60,88 L58,84 L54,84 L50,84 L48,88 L44,88 L42,84 L38,82 L34,84 L31,81 L33,77 L30,74 L26,74 L24,70 L24,66 L28,64 L26,60 L26,56 L24,54 L24,50 L26,48 L28,44 L24,42 L24,38 L26,34 L30,34 L33,31 L31,27 L34,24 L38,26 L42,24 L44,20 L48,20 L50,24 Z"
              />
              {/* Inner circle (cutout effect) */}
              <path
                fill="white"
                d="M54,34 A20,20 0 1,1 54,74 A20,20 0 1,1 54,34z"
              />
              {/* Letter A */}
              <path
                fill="#1E88E5"
                d="M54,38 L66,70 L60,70 L57,62 L51,62 L48,70 L42,70 L54,38z M54,48 L52,58 L56,58 L54,48z"
              />
            </svg>
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-2 rounded-[2.5rem] border border-[#1E88E5]/30 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mt-6">{APP_NAME}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-primary-bg text-primary text-sm font-medium">
            v{APP_VERSION}
          </span>
        </div>

        <p className="text-center text-text-secondary mt-6 max-w-xs leading-relaxed">
          A powerful app control utility for Android. Freeze, manage, and optimize your installed applications.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="card p-4 mb-6 animate-fade-in-up stagger-1">
        <div className="flex items-center justify-center gap-6">
          <TechBadge icon={Code2} label="React" />
          <div className="w-px h-8 bg-card-border" />
          <TechBadge icon={Smartphone} label="Kotlin" />
        </div>
      </div>

      {/* Links Section */}
      <div className="space-y-3 animate-fade-in-up stagger-2">
        <AboutLink
          icon={Github}
          iconColor="text-text-primary"
          title="GitHub Repository"
          subtitle="View source code and contribute"
          href="https://github.com/appcontrolx/appcontrolx"
        />
        <AboutLink
          icon={Mail}
          iconColor="text-secondary"
          title="Report an Issue"
          subtitle="Found a bug? Let us know"
          href="https://github.com/appcontrolx/appcontrolx/issues"
        />
        <AboutLink
          icon={Heart}
          iconColor="text-error"
          title="Rate this App"
          subtitle="If you like it, leave a review"
          href="#"
        />
      </div>

      {/* Footer */}
      <div className="mt-12 text-center animate-fade-in-up stagger-3">
        <div className="flex items-center justify-center gap-2 text-text-secondary">
          <span className="text-sm">Made with</span>
          <Heart size={14} className="text-error fill-error animate-pulse" />
          <span className="text-sm">using Kotlin + React</span>
        </div>
        <p className="text-xs text-text-muted mt-3">
          © 2026 AppControlX. All rights reserved.
        </p>
      </div>
    </PageContainer>
  )
}

interface TechBadgeProps {
  icon: React.ElementType
  label: string
}

function TechBadge({ icon: Icon, label }: TechBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
        <Icon size={16} className="text-text-secondary" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
  )
}

interface AboutLinkProps {
  icon: React.ElementType
  iconColor: string
  title: string
  subtitle: string
  href: string
}

function AboutLink({ icon: Icon, iconColor, title, subtitle, href }: AboutLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'card p-4 flex items-center gap-4',
        'group hover:border-primary/30 transition-all duration-300'
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary-bg transition-colors duration-300">
        <Icon size={20} strokeWidth={1.5} className={cn(iconColor, 'group-hover:text-primary transition-colors duration-300')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary group-hover:text-primary transition-colors duration-300">{title}</p>
        <p className="text-sm text-text-muted truncate">{subtitle}</p>
      </div>
      <ExternalLink
        size={16}
        strokeWidth={1.5}
        className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
      />
    </a>
  )
}
