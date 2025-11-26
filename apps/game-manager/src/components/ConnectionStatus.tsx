import { Wifi, WifiOff, Loader2 } from 'lucide-react'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface ConnectionStatusProps {
  status: ConnectionStatus
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === 'connected') {
    return null // Don't show anything when connected
  }

  const config = {
    connecting: {
      icon: Loader2,
      text: 'Connecting...',
      className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
      iconClassName: 'animate-spin',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected from server',
      className: 'bg-red-500/10 border-red-500/20 text-red-600',
      iconClassName: '',
    },
  }[status]

  const Icon = config.icon

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm ${config.className}`}
      >
        <Icon size={16} className={config.iconClassName} />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    </div>
  )
}
