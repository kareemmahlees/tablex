"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/tauri";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";

const formSchema = z.object({
  conn_string: z.string()
});

const ConnectionString = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await invoke("test_conn");
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <FormField
          control={form.control}
          name="conn_string"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection String</FormLabel>
              <FormControl>
                <Input
                  placeholder="user:password@host:port"
                  className="w-[300px] lg:w-[400px] text-muted-foreground ring-offset-cyan-700 border-blue-500"
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
          <Button className="bg-green-500 hover:bg-green-700">Test</Button>
        </div>
      </form>
    </Form>
  );
};

export default ConnectionString;
