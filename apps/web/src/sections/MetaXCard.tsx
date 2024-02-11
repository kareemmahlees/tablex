import Card from "@/components/Card"
import { cn } from "@/lib/utils"

const MetaXCard = () => {
  return (
    <Card
      className="md:flex-col"
      header="RESTfull & GraphQL APIs for your database"
      content={
        <p>
          <span className="text-foreground font-semibold ">TableX</span>, thanks
          to{" "}
          <a
            className="text-foreground underline"
            href="https://github.com/kareemmahlees/meta-x"
          >
            MetaX{" "}
          </a>
          , Automatically generates a RESTfull and GraphQL APIS for your
          database that is:
          <br />
          <ul className="list-inside list-disc indent-4">
            <li>Fully documented.</li>
            <li>Works with any type of databases.</li>
            <li>A playground to test your GraphQL queries</li>
            <li>No effort from you what so ever.</li>
          </ul>
          Just connect and start running 🚀.
        </p>
      }
    >
      <section className="mt-6 grid grid-cols-2 gap-4">
        <MetaXFeatureCard imgSrc="/icons/swagger.svg" alt="Swagger" />
        <MetaXFeatureCard imgSrc="/icons/graphql.svg" alt="GraphQL" />
        <MetaXFeatureCard imgSrc="/icons/globe.svg" alt="REST" />
        <MetaXFeatureCard imgSrc="/icons/play.svg" alt="Playground" />
      </section>
    </Card>
  )
}

export default MetaXCard

interface MetaXFeatureCardProps {
  imgSrc: string
  alt: string
  className?: string
}

const MetaXFeatureCard = ({
  imgSrc,
  alt,
  className
}: MetaXFeatureCardProps) => {
  return (
    <section
      className={cn(
        className,
        "flex flex-col items-center justify-center gap-y-1 rounded-lg border-[1px] border-[#333333] bg-[#111111] p-5 "
      )}
    >
      <img src={imgSrc} alt={alt} className="h-10 w-10 invert" />
      <p className="text-muted-foreground">{alt}</p>
    </section>
  )
}
