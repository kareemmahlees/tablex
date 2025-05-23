import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import { cn } from "@tablex/lib/utils"
import { type PropsWithChildren } from "react"

export const SettingsSection = ({
  children,
  className
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <section className={cn("flex flex-col items-start gap-y-4", className)}>
      {children}
    </section>
  )
}

export const SettingsHeader = ({ children }: PropsWithChildren) => {
  return <h1 className="text-xl font-semibold">{children}</h1>
}

export const SettingsContent = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-sidebar flex w-full flex-col gap-y-3 rounded-lg border px-5 py-4">
      {children}
    </div>
  )
}

type SettingProps = PropsWithChildren<{
  label: string
  description: string
}>

export const Setting = (props: SettingProps) => {
  return (
    <FormItem className="flex w-full items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
      <div className="space-y-0.5">
        <FormLabel className="text-base">{props.label}</FormLabel>
        <FormDescription>{props.description}</FormDescription>
      </div>
      <FormControl>{props.children}</FormControl>
    </FormItem>
  )
}
