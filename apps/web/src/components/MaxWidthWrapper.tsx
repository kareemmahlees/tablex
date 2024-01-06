import { type PropsWithChildren } from "react"

const MaxWidthWrapper = ({ children }: PropsWithChildren) => {
  return (
    <section className="m-auto w-full max-w-3xl p-4 md:p-0">{children}</section>
  )
}

export default MaxWidthWrapper
