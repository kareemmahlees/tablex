import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { newConnectionFormSchema } from "../schema"

export const CommonConnectionOpts = () => {
  const form = useFormContext<z.infer<typeof newConnectionFormSchema>>()
  return (
    <>
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
        name="connectionOpts.db"
        render={({ field }) => (
          <FormItem className="col-span-2">
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
    </>
  )
}
