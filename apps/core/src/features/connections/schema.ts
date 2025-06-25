import { Drivers } from "@/lib/types"
import { z } from "zod"

const ConnectionOptsSchema = z.object({
  username: z.string(),
  password: z.string(),
  host: z
    .string()
    .refine(
      (arg) => arg === "localhost" || z.string().ip().safeParse(arg).success
    ),
  port: z.coerce.number({
    invalid_type_error: "Field is not a valid port"
  }),
  db: z.string()
})

export const NewConnectionFormSchema = z.object({
  name: z.string().max(256),
  connectionOpts: z.discriminatedUnion("driver", [
    z.object({ driver: z.literal(Drivers.SQLite), filePath: z.string() }),
    ConnectionOptsSchema.extend({ driver: z.literal(Drivers.PostgreSQL) }),
    ConnectionOptsSchema.extend({ driver: z.literal(Drivers.MySQL) })
  ])
})
