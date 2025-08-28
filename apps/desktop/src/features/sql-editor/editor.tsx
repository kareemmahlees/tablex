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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSetupCodeMirror } from "@/hooks/use-setup-code-mirror"
import { zodJsonValidation } from "@/lib/utils"
import { sql } from "@codemirror/lang-sql"
import { vim } from "@replit/codemirror-vim"
import sqlFormatter from "@sqltools/formatter"
import { useMutation } from "@tanstack/react-query"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import CodeMirror, {
  EditorState,
  EditorView,
  keymap
} from "@uiw/react-codemirror"
import { AlertTriangle, Loader2, Play, Rainbow } from "lucide-react"
import { useMemo } from "react"
import { useSettings } from "../settings/context"

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

const formatDocument = (view?: EditorView) => {
  view?.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: sqlFormatter.format(view.state.doc.toString(), {
        reservedWordCase: "upper",
        indent: "\t"
      })
    }
  })
}

export const SQLEditor = () => {
  const { sqlEditor: editorSettings } = useSettings()
  const {
    mutate: runQuery,
    data: result,
    isError,
    error,
    isPending
  } = useMutation<RawQueryResult, TxError, { editorState: EditorState }>({
    mutationKey: ["run_query"],
    mutationFn: async ({ editorState }) => {
      let query: string

      if (editorState.selection.main.empty) {
        query = editorState.doc.toString()
      } else {
        query = editorState.sliceDoc(
          editorState.selection.main.from,
          editorState.selection.main.to
        )
      }
      return await commands.executeRawQuery(query)
    }
  })

  const extensions = useMemo(() => {
    const exts = [
      sql({
        upperCaseKeywords: true
      }),
      biggerFont({ fontSize: editorSettings.fontSize }),
      keymap.of([
        {
          key: "F5",
          run: (view) => {
            runQuery({ editorState: view.state })
            return true
          },
          preventDefault: true
        },
        {
          key: "F6",
          run: (view) => {
            formatDocument(view)
            return true
          },
          preventDefault: true
        }
      ])
    ]

    if (editorSettings.vimMode) exts.push(vim())

    return exts
  }, [editorSettings])
  const { editorRef, view } = useSetupCodeMirror({
    extensions,
    theme: tokyoNight,
    value: 'select * from "SaleInvoice" limit 10',
    autoFocus: true
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
          <EditorTools
            disabled={!view?.state}
            onRun={async () => runQuery({ editorState: view!.state })}
            onFormat={() => formatDocument(view)}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{renderQueryResult()}</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

type EditorToolsProps = {
  disabled?: boolean
  onRun: () => Promise<any>
  onFormat: () => void
}

const EditorTools = ({ disabled, onRun, onFormat }: EditorToolsProps) => {
  return (
    <div className="absolute bottom-0 right-0 m-3 origin-bottom-right space-x-4">
      <TooltipButton
        tooltipContent="Format"
        size={"sm"}
        variant={"secondary"}
        disabled={disabled}
        onClick={onFormat}
        className="px-3"
      >
        <Rainbow className="size-4" />
      </TooltipButton>
      <TooltipButton
        tooltipContent="Run"
        size={"sm"}
        disabled={disabled}
        onClick={onRun}
        className="px-3"
      >
        <Play className="size-4" />
      </TooltipButton>
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
  const renderCell = (value: string) => {
    if (zodJsonValidation().safeParse(value).success) {
      console.log(value)
      console.log(typeof value)
      console.log(zodJsonValidation().safeParse(value))
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              size={"sm"}
              className="h-6 bg-gray-100 px-4 text-xs font-semibold"
            >
              JSON
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" align="end">
            <CodeMirror
              id="editor"
              value={value}
              theme={tokyoNight}
              readOnly
              basicSetup={false}
              extensions={[EditorView.lineWrapping]}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    if (value.length > 50)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              size={"sm"}
              className="h-6 bg-gray-100 px-4 text-xs font-semibold"
            >
              TEXT
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" align="end">
            <CodeMirror
              id="editor"
              value={value}
              theme={tokyoNight}
              readOnly
              basicSetup={false}
              extensions={[EditorView.lineWrapping]}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )

    return value
  }

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
                <TableCell className="whitespace-nowrap">
                  {rowValue && renderCell(rowValue.toString())}
                </TableCell>
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
