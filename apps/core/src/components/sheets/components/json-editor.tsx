import Editor, { useMonaco } from "@monaco-editor/react"
import type { ControllerRenderProps, FieldValues } from "react-hook-form"

const JsonEditor = <T extends FieldValues>({
  field
}: {
  field: ControllerRenderProps<T>
}) => {
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
        value={field.value}
        onChange={field.onChange}
        options={{
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
