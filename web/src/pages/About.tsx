import PageContainer from '@/components/layout/PageContainer'
import { useThemeStore } from '@/store/themeStore'
import { APP_NAME, APP_VERSION } from '@/lib/constants'
import { Github, Heart, Mail, ExternalLink, Code2, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function About() {
  const { theme } = useThemeStore()

  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="flex flex-col items-center py-8 animate-fade-in-up">
        {/* App Icon */}
        <div className="relative">
          <div className={cn(
            'w-28 h-28 rounded-[2rem] flex items-center justify-center',
            theme === 'dark'
              ? 'bg-gradient-to-br from-accent-purple via-accent-purple to-secondary'
              : 'bg-gradient-to-br from-primary via-primary to-secondary'
          )}>
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-5xl font-black text-white drop-shadow-lg">A</span>
            </div>
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-2 rounded-[2.5rem] border border-primary/30 animate-pulse" />
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
