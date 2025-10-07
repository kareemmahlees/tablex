import { Drivers } from "@/lib/types"
import { z } from "zod"

const connectionOptsSchema = z.object({
  username: z.string(),
  password: z.string(),
  host: z.union([z.string().ip({ version: "v4" }), z.literal("localhost")]),
  port: z.coerce.number({
    invalid_type_error: "Field is not a valid port"
  }),
  db: z.string()
})

export const newConnectionFormSchema = z.object({
  name: z.string().max(256),
  connectionOpts: z.discriminatedUnion("driver", [
    z.object({ driver: z.literal(Drivers.SQLite), filePath: z.string() }),
    connectionOptsSchema.extend({
      driver: z.literal(Drivers.PostgreSQL),
      sslMode: z.boolean().default(false)
    }),
    connectionOptsSchema.extend({ driver: z.literal(Drivers.MySQL) })
  ])
})
