import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"
import type { z } from "zod"
import type { NewConnectionFormSchema } from "../schema"

export const PgMySQLConnectionForm = () => {
  const form = useFormContext<z.infer<typeof NewConnectionFormSchema>>()

  return (
    <div className="mt-4 grid w-full grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="connectionOpts.username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="connectionOpts.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input placeholder="password" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="connectionOpts.host"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Host</FormLabel>
            <FormControl>
              <Input placeholder="host" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="connectionOpts.db"
        render={({ field }) => (
          <FormItem>
            <FormLabel>DB</FormLabel>
            <FormControl>
              <Input placeholder="DB name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="connectionOpts.port"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Port</FormLabel>
            <FormControl>
              <Input placeholder="port" inputMode="numeric" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
