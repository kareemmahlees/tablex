import { type PropsWithChildren } from "react"

const MaxWidthWrapper = ({ children }: PropsWithChildren) => {
  return (
    <section className="w-full m-auto max-w-3xl p-4 md:p-0">{children}</section>
  )
}

export default MaxWidthWrapper
