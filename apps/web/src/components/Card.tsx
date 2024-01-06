import { cn } from "@/lib/utils"
import { PropsWithChildren, ReactNode } from "react"

interface CardProps {
  header: string
  content: ReactNode
  id?: string
  className?: string
}

const Card = ({
  header,
  content,
  className,
  children,
  id
}: CardProps & PropsWithChildren) => {
  return (
    <section
      id={id}
      className={cn(
        "border-2 rounded-md border-b-4 p-6 md:p-7 lg:p-8 mt-[100px] flex flex-col md:flex-row md:mx-6",
        className
      )}
    >
      <div className="text-start">
        <h3 className="text-xl font-semibold">{header}</h3>
        <div className="mt-4 text-muted-foreground">{content}</div>
      </div>
      {children}
    </section>
  )
}

export default Card
