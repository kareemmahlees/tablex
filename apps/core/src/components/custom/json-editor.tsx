import Editor, { useMonaco } from "@monaco-editor/react"
import { Skeleton } from "../ui/skeleton"

type JsonEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (v) => void
  readOnly: boolean
}

const JsonEditor = ({
  value,
  onChange,
  defaultValue,
  readOnly = false
}: JsonEditorProps) => {
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
        defaultLanguage="json"
        theme="custom-theme"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        loading={<Skeleton className="h-[300px] w-full" />}
        options={{
          readOnly,
          padding: {
            top: 10
          },
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 1,
          minimap: { enabled: false },
          scrollbar: { vertical: "hidden" },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true
        }}
      />
    </section>
  )
}

export default JsonEditor
