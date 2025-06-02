import Editor, { EditorProps, useMonaco } from "@monaco-editor/react"
import { Skeleton } from "../ui/skeleton"

type MonacoEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (v) => void
  defaultLanguage?: string
  options: EditorProps["options"]
}

const MonacoEditor = ({
  value,
  onChange,
  defaultValue,
  defaultLanguage = "json",
  options
}: MonacoEditorProps) => {
  const monaco = useMonaco()
  monaco?.editor.defineTheme("custom-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#191919"
    }
  })

  return (
    <section className="border-[1.5px]">
      <Editor
        className="h-[200px] lg:h-[350px]"
        defaultLanguage={defaultLanguage}
        theme="custom-theme"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        loading={<Skeleton className="h-[300px] w-full" />}
        options={{
          padding: {
            top: 10
          },
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 1,
          minimap: { enabled: false },
          scrollbar: { vertical: "hidden" },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          ...options
        }}
      />
    </section>
  )
}

export default MonacoEditor
