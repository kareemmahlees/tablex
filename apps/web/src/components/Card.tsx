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
        "mt-[100px] flex flex-col rounded-md border-2 border-b-4 p-6 md:mx-6 md:flex-row md:p-7 lg:p-8 leading-7",
        className
      )}
    >
      <div className="text-start">
        <h3 className="text-xl font-semibold">{header}</h3>
        <div className="text-muted-foreground mt-4">{content}</div>
      </div>
      {children}
    </section>
  )
}

export default Card
