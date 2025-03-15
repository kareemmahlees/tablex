import { commands, JsonValue } from "@/bindings"
import { Button } from "@/components/ui/button"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { useSettings } from "@/settings/manager"

import CustomTooltip from "@/components/custom-tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Editor, type OnMount } from "@monaco-editor/react"
import { useRef, useState, type Dispatch, type SetStateAction } from "react"

type RawQueryResult = Awaited<ReturnType<typeof commands.executeRawQuery>>
type MonacoEditor = Parameters<OnMount>[0]

export const SQLEditor = () => {
  const [queryResult, setQueryResult] = useState<RawQueryResult>()
  const editorRef = useRef<MonacoEditor>()
  const { sqlEditor: editorSettings } = useSettings()

  const handleEditorDidMount: OnMount = (editor) => (editorRef.current = editor)

  return (
    <div className="flex h-full flex-col overflow-auto">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel className="relative">
          <Editor
            defaultLanguage="sql"
            theme="vs-dark"
            options={{
              minimap: { enabled: editorSettings.minimap },
              scrollbar: editorSettings.scrollbar,
              padding: { top: 10 },
              lineNumbersMinChars: 3,
              lineDecorationsWidth: 3,
              fontSize: editorSettings.fontSize,
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              cursorBlinking: editorSettings.cursorBlinking
            }}
            onMount={handleEditorDidMount}
          />
          {editorRef.current && (
            <RunBtn
              editor={editorRef.current}
              setQueryResult={setQueryResult}
            />
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          {queryResult &&
            (queryResult.status === "error" ? (
              <pre className="m-4">{`message: ${queryResult.error.message} details: ${queryResult.error.details}`}</pre>
            ) : (
              <ResultTable result={queryResult.data} />
            ))}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

type RunBtnProps = {
  editor: MonacoEditor
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
      <CustomTooltip side="top" content="Shift + Enter" asChild>
        <Button
          className="absolute bottom-0 right-0 m-3 origin-bottom-right"
          size={"sm"}
          onClick={runQuery}
        >
          Run
        </Button>
      </CustomTooltip>
    </TooltipProvider>
  )
}

type ResultTableProps = {
  result: { [x: string]: JsonValue }[]
}

const ResultTable = ({ result }: ResultTableProps) => {
  return (
    <ScrollArea className="h-full overflow-auto">
      <Table>
        <TableHeader className="bg-zinc-800">
          <TableRow className="sticky -top-[1px] border-none backdrop-blur-lg">
            {Object.keys(result[0]).map((header) => (
              <TableHead>{header}</TableHead>
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
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
