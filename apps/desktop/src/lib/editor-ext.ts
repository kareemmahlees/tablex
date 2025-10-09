import { EditorView } from "@uiw/react-codemirror"

export const betterStyling = (
  { fontSize }: { fontSize?: number } = {
    fontSize: 16
  }
) =>
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
