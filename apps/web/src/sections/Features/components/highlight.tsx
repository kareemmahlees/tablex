import hljs from "highlight.js"
import "highlight.js/styles/base16/gruvbox-dark-medium.min.css"
import { useEffect, type PropsWithChildren } from "react"

const HighLight = ({ children, lang }: PropsWithChildren<{ lang: string }>) => {
  useEffect(() => {
    hljs.highlightAll()
  }, [])

  return (
    <pre className="w-full">
      <code
        lang={lang}
        className="rounded-md"
        style={{
          paddingTop: 8,
          paddingBottom: 8
        }}
      >
        {children}
      </code>
    </pre>
  )
}

export default HighLight
