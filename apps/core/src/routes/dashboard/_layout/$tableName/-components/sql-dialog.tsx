import { commands, events, JsonValue, Result } from "@/bindings"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { Editor, OnMount } from "@monaco-editor/react"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

type RawQueryResult = Result<{ [x: string]: JsonValue }[], string>
type MonakoEditor = Parameters<OnMount>[0]

const SQLDialog = () => {
  const [open, setOpen] = useState(false)
  const [queryResult, setQueryResult] = useState<RawQueryResult>()
  const [editorMounted, setEditorMounted] = useState(false)
  const editorRef = useRef<MonakoEditor>()

  const handleEditorDidMount: OnMount = (editor) => {
    setEditorMounted(true)
    editorRef.current = editor
  }

  useEffect(() => {
    const unlisten = events.sqlDialogOpen.listen(() => setOpen(true))

    return () => {
      unlisten.then((f) => f())
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-5/6 w-5/6 max-w-full p-0">
        <div className="flex flex-col overflow-auto">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel className="relative">
              <Editor
                defaultLanguage="sql"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollbar: { vertical: "hidden" },
                  padding: { top: 10 },
                  lineNumbersMinChars: 3,
                  lineDecorationsWidth: 3,
                  fontSize: 18,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  cursorBlinking: "smooth"
                }}
                onMount={handleEditorDidMount}
              />
              {editorMounted && editorRef.current && (
                <RunBtn
                  editor={editorRef.current}
                  setQueryResult={setQueryResult}
                />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              style={{
                overflow: "auto"
              }}
            >
              {queryResult &&
                (queryResult.status === "error" ? (
                  <pre className="m-4">{queryResult.error}</pre>
                ) : (
                  <ResultTable result={queryResult.data} />
                ))}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SQLDialog

type RunBtnProps = {
  editor: MonakoEditor
  setQueryResult: Dispatch<SetStateAction<RawQueryResult | undefined>>
}

const RunBtn = ({ editor, setQueryResult }: RunBtnProps) => {
  const runQuery = async () => {
    let value: string

    const selection = editor.getSelection()
    if (selection && !selection.isEmpty()) {
      value = editor.getModel()!.getValueInRange(selection)
    } else {
      value = editor.getValue()
    }

    const result = await commands.executeRawQuery(value)
    setQueryResult(result)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="absolute bottom-0 right-0 m-3 origin-bottom-right"
            variant={"secondary"}
            size={"sm"}
            onClick={runQuery}
          >
            Run
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <kbd>Shift</kbd> + <kbd>Enter</kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

type ResultTableProps = {
  result: { [x: string]: JsonValue }[]
}

const ResultTable = ({ result }: ResultTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-zinc-800">
        <TableRow className="sticky top-[-1px] border-none backdrop-blur-lg">
          {/* A quick trick to get column headings without the need to 
              make an extra call to the backend
            */}
          {Object.keys(result[0]).map((header) => (
            <TableHead className="">{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.map((row) => (
          <TableRow>
            {Object.values(row).map((rowValue) => (
              <TableCell>{rowValue?.toString()}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
