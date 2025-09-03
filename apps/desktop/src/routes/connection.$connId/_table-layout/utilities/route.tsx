import { commands, MetaXStatus } from "@/bindings"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createFileRoute } from "@tanstack/react-router"
import { openUrl } from "@tauri-apps/plugin-opener"
import {
  Activity,
  Copy,
  ExternalLink,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Server,
  Settings
} from "lucide-react"

export const Route = createFileRoute(
  "/connection/$connId/_table-layout/utilities"
)({
  loader: async () => {
    const [isMetaxBuild, metaxStatus] = await Promise.all([
      commands.isMetaxBuild(),
      commands.getMetaxStatus()
    ])
    return { isMetaxBuild, metaxStatus }
  },
  component: UtilitiesRoute
})

const getUtilities = (metaxStatus: MetaXStatus, isMetaxBuild: boolean) => [
  {
    id: "api-server",
    title: "API Server",
    description: "Interact with the Database via HTTP",
    status: metaxStatus,
    icon: <FileText className="h-5 w-5" />,
    isIncludedInBuild: isMetaxBuild,
    details: {
      links: [
        {
          label: "REST API",
          url: "http://localhost:5522",
          description: "REST API base endpoint"
        },
        {
          label: "GraphQL API",
          url: "http://localhost:5522/graphql",
          description: "GraphQL API base endpoint"
        },
        {
          label: "API Docs",
          url: "http://localhost:5522/swagger",
          description: "Swagger/OpenAPI documentation"
        },
        {
          label: "GraphQL Playground",
          url: "http://localhost:5522/playground",
          description: "Interactive GraphQL API testing"
        }
      ],
      info: [
        { label: "Port", value: "5522" },
        { label: "Version", value: "v1.2.0" },
        { label: "Endpoints", value: "24" }
      ]
    }
  },
  {
    id: "mcp-server",
    title: "MCP Server",
    description: "Model Context Protocol server for AI integrations",
    status: "ready",
    icon: <Server className="h-5 w-5" />,
    details: {
      links: [
        {
          label: "Server Status",
          url: "http://localhost:3002/health",
          description: "Health check endpoint"
        }
      ],
      instructions: [
        "Install MCP client: npm install @modelcontextprotocol/sdk",
        "Connect to server: mcp connect ws://localhost:3002",
        "Available tools: file_operations, code_analysis, documentation"
      ],
      info: [
        { label: "Port", value: "3002" },
        { label: "Protocol", value: "WebSocket" },
        { label: "Tools", value: "3" }
      ]
    }
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-cyan-500 text-cyan-400"
    case "exited":
      return "bg-red-500 text-red-400"
    case "paused":
      return "bg-gray-500 text-gray-400"
    default:
      return "bg-gray-500 text-gray-400"
  }
}

function UtilitiesRoute() {
  const { isMetaxBuild, metaxStatus } = Route.useLoaderData()
  console.log(isMetaxBuild)
  console.log(metaxStatus)

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto my-10 w-2/3 space-y-16 lg:w-4/6">
        <h1 className="text-3xl font-semibold">Utilities</h1>
        <Accordion type="multiple" className="space-y-4">
          {getUtilities(metaxStatus, isMetaxBuild).map((utility) => (
            <AccordionItem
              key={utility.id}
              value={utility.id}
              className="border-0"
            >
              <Card className="bg-sidebar border-slate-800 transition-all duration-200 hover:shadow-lg">
                <AccordionTrigger className="p-0 hover:no-underline [&>div>div>svg]:hidden">
                  <CardHeader className="w-full cursor-pointer transition-colors hover:bg-slate-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
                          {utility.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-slate-100">
                              {utility.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${getStatusColor(
                                  utility.status
                                )} text-xs`}
                                variant="secondary"
                              >
                                {utility.status}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {utility.status === "active" ? (
                                    <Pause className="size-4" />
                                  ) : (
                                    <Play className="size-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <RotateCcw className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Settings className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-pretty text-slate-400">
                            {utility.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </AccordionTrigger>

                <AccordionContent className="pb-0">
                  {!utility.isIncludedInBuild ? (
                    <CardContent>
                      <p className="font-semibold">
                        This utility is not included in this build. Please
                        install another build that contains this feature.
                      </p>
                    </CardContent>
                  ) : (
                    <CardContent className="space-y-6 pt-0">
                      <div>
                        {utility.details.links && (
                          <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                              <ExternalLink className="h-4 w-4 text-cyan-400" />
                              Quick Links
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {utility.details.links.map((link, index) => (
                                <div
                                  key={index}
                                  className="flex h-full w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 transition-colors hover:bg-slate-800"
                                >
                                  <div className="relative w-full space-y-3">
                                    <div className="space-y-1">
                                      <div className="flex items-start justify-between">
                                        <div className="text-sm font-medium text-slate-200">
                                          {link.label}
                                        </div>
                                        <div className="absolute right-0 top-0 ml-3 flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-fit w-fit p-1 text-slate-400 hover:text-slate-100"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              copyToClipboard(link.url)
                                            }}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-fit w-fit p-1 text-slate-400 hover:text-slate-100"
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              await openUrl(link.url)
                                            }}
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      {link.description && (
                                        <div className="text-xs text-slate-400">
                                          {link.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="rounded bg-slate-900/50 px-2 py-1 font-mono text-xs text-cyan-400">
                                      {link.url}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {utility.details.info && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                            <Activity className="h-4 w-4 text-cyan-400" />
                            Service Details
                          </h4>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {utility.details.info.map((info, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
                              >
                                <div className="mb-1 text-xs text-slate-400">
                                  {info.label}
                                </div>
                                <div className="text-sm font-semibold text-cyan-400">
                                  {info.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
