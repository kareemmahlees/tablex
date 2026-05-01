import { Preferences } from '@/features/settings/preferences'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/connection/$connId/settings/')({
  component: Preferences,
})
