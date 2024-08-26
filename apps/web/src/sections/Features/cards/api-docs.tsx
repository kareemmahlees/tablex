import { cn } from "@tablex/lib/utils"
import HighLight from "../components/highlight"

const requests: RequestBarProps[] = [
  {
    method: "GET",
    endpoint: "/tables"
  },
  {
    method: "POST",
    endpoint: "/tables/column"
  },
  {
    method: "DELETE",
    endpoint: "/tables/column/:columnName"
  },
  {
    method: "PUT",
    endpoint: "/tables/column/:columnName"
  }
]

const APIDocs = () => {
  return (
    <div className="flex items-center gap-x-4">
      <div className="space-y-2">
        {requests.map(({ method, endpoint }, i) => (
          <RequestBar key={i} method={method} endpoint={endpoint} />
        ))}
      </div>

      <HighLight lang="graphql">
        {`query {
  table(name: $tableName) {
    name,
    type,
    nullable
  }
}`}
      </HighLight>
    </div>
  )
}

export default APIDocs

type RequestBarProps = {
  method: "GET" | "POST" | "DELETE" | "PUT"
  endpoint: string
}

const RequestBar = ({ method, endpoint }: RequestBarProps) => {
  return (
    <div className="flex items-center gap-x-1 rounded-md border-[1.5px] text-sm">
      <div
        className={cn(
          "border-r p-2 font-semibold",
          method === "GET" && "text-green-500",
          method === "POST" && "text-blue-500",
          method === "DELETE" && "text-red-500",
          method === "PUT" && "text-violet-500"
        )}
      >
        {method}
      </div>
      <div className="text-muted-foreground flex-1 p-2">{endpoint}</div>
    </div>
  )
}
