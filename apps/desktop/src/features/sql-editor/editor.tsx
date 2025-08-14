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

import CustomTooltip from "@/components/custom-tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { sql } from "@codemirror/lang-sql"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"
import { EditorState, EditorView, useCodeMirror } from "@uiw/react-codemirror"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from "react"
import { useSettings } from "../settings/manager"

type RawQueryResult = Awaited<ReturnType<typeof commands.executeRawQuery>>

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
    []
  )
  const [queryResult, setQueryResult] = useState<RawQueryResult>()
  const editor = useRef<HTMLDivElement | null>(null)
  const { setContainer, state } = useCodeMirror({
    container: editor.current,
    extensions,
    theme: tokyoNight
  })

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current)
    }
  }, [editor.current])

  return (
    <div className="flex h-full flex-col overflow-auto">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel className="relative">
          <div
            ref={editor}
            style={{
              height: "100%",
              minHeight: 0
            }}
          />
          {state && (
            <RunBtn editorState={state} setQueryResult={setQueryResult} />
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          {/* {queryResult &&
            (queryResult.status === "error" ? (
              <pre className="m-4">{`message: ${queryResult.error.message} details: ${queryResult.error.details}`}</pre>
            ) : (
              <ResultTable result={queryResult.data} />
            ))} */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

type RunBtnProps = {
  editorState: EditorState
  setQueryResult: Dispatch<SetStateAction<RawQueryResult | undefined>>
}

const RunBtn = ({ editorState, setQueryResult }: RunBtnProps) => {
  const runQuery = async () => {
    let query: string

    if (editorState.selection.main.empty) {
      query = editorState.doc.toString()
    } else {
      query = editorState.sliceDoc(
        editorState.selection.main.from,
        editorState.selection.main.to
      )
    }

    const result = await commands.executeRawQuery(query)
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
