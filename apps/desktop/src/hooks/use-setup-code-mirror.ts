import { ReactCodeMirrorProps, useCodeMirror } from "@uiw/react-codemirror"
import { useEffect, useRef } from "react"

export const useSetupCodeMirror = (
  props?: Omit<ReactCodeMirrorProps, "container">
) => {
  const editor = useRef<HTMLDivElement | null>(null)
  const { setContainer, ...editorStuff } = useCodeMirror({
    container: editor.current,
    ...props
  })

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current)
    }
  }, [editor.current])

  return { editorRef: editor, ...editorStuff }
}
