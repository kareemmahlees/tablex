import { Keybindings } from "@/features/keybindings"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/keybindings")({
  component: KeybindingsRoute
})

function KeybindingsRoute() {
  return <Keybindings />
}
