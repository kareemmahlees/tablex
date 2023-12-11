"use client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createConnectionRecord, testConnection } from "../actions"

const formSchema = z.object({
  connName: z.string(),
  connString: z.string()
})

const ConnectionStringForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createConnectionRecord(values.connName, values.connString)
  }

  const onTest = async (values: z.infer<typeof formSchema>) => {
    await testConnection(values.connString)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <FormField
          control={form.control}
          name="connName"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g awesome project dev" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="connString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String</FormLabel>
              <FormControl>
                <Input
                  placeholder="user:password@host:port/dbName"
                  className="w-[300px] lg:w-[400px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-2 flex justify-center items-center gap-x-4">
          <Button variant={"secondary"} type="submit">
            Connect
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-700"
            onClick={form.handleSubmit(onTest)}
          >
            Test
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ConnectionStringForm
