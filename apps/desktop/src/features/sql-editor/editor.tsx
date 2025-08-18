import { commands, DecodedRow, RawQueryResult, type TxError } from "@/bindings"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { TooltipButton } from "@/components/custom/tooltip-button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSetupCodeMirror } from "@/hooks/use-setup-code-mirror"
import { sql } from "@codemirror/lang-sql"
import { useMutation } from "@tanstack/react-query"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { EditorView } from "@uiw/react-codemirror"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useMemo } from "react"
import { useSettings } from "../settings/manager"

const biggerFont = ({ fontSize }: { fontSize: number }) =>
  EditorView.theme({
    "&": {
      fontSize: `${fontSize}px`,
      lineHeight: "1.6",
      height: "100%",
      minHeight: "0"
    },
    ".editor-wrapper": {
      height: "100%"
    },

    ".cm-editor": {
      height: "100%"
    },

    ".cm-scroller": {
      overflow: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none"
    },
    ".cm-scroller::-webkit-scrollbar": {
      display: "none"
    }
  })

export const SQLEditor = () => {
  const { sqlEditor: editorSettings } = useSettings()
  const extensions = useMemo(
    () => [
      sql({
        upperCaseKeywords: true
      }),
      biggerFont({ fontSize: editorSettings.fontSize })
    ],
    [editorSettings]
  )
  const { editorRef, view } = useSetupCodeMirror({
    extensions,
    theme: tokyoNight
    // value: 'select * from "Customer" limit 10;'
  })

  const {
    mutateAsync: runQuery,
    data: result,
    isError,
    error,
    isPending
  } = useMutation<RawQueryResult, TxError>({
    mutationKey: ["run_query"],
    mutationFn: async () => {
      let query: string
      let editorState = view!.state

      if (editorState!.selection.main.empty) {
        query = editorState!.doc.toString()
      } else {
        query = editorState!.sliceDoc(
          editorState!.selection.main.from,
          editorState!.selection.main.to
        )
      }
      const res = await commands.executeRawQuery(query)
      return res
    }
  })

  const renderQueryResult = () => {
    if (isPending) return <QueryLoading />
    if (isError) return <QueryError error={error} />

    if (!result) return null

    if ("Query" in result) {
      return <QueryResultTable result={result} />
    }
    if ("Exec" in result)
      return <code>{`Rows Affected: ${result.Exec.rows_affected}`} </code>
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel className="relative">
          <div
            ref={editorRef}
            style={{
              height: "100%",
              minHeight: 0
            }}
          />
          <TooltipButton
            tooltipContent="Shift + Enter"
            className="absolute bottom-0 right-0 m-3 origin-bottom-right"
            size={"sm"}
            disabled={!view?.state}
            onClick={async () => await runQuery()}
          >
            Run
          </TooltipButton>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{renderQueryResult()}</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

const QueryLoading = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-4">
      <Loader2 className="h-10 w-10 animate-spin" color="white" />
      <span className="text-muted-foreground text-xl">Doing Science</span>
    </div>
  )
}

const QueryResultTable = ({
  result
}: {
  result: Extract<RawQueryResult, { Query: DecodedRow[] }>
}) => {
  return (
    <ScrollArea className="flex h-full w-full min-w-0 flex-1 flex-col">
      <Table>
        <TableHeader>
          <TableRow className="bg-sidebar sticky top-0 z-50 backdrop-blur-lg">
            {Object.keys(result.Query[0]).map((header) => (
              <TableHead className="text-sm font-semibold">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.Query.map((row) => (
            <TableRow>
              {Object.values(row).map((rowValue) => (
                <TableCell>{rowValue?.toString()}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

const QueryError = ({ error }: { error: TxError }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-4">
      <div className="flex items-center gap-x-4">
        <AlertTriangle stroke="red" />
        <span className="text-xl">An error occurred in your query</span>
      </div>
      <div className="border-muted-foreground rounded-lg border px-4 py-2">
        {error.details}
      </div>
    </div>
  )
}
