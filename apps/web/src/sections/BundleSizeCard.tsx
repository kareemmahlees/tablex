import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts"
import Card from "../components/Card"

const BundleSizeCard = () => {
  return (
    <Card
      className=""
      header="Ultra small bundle size"
      content={
        <p>
          <span className="text-foreground font-semibold">TableX</span>, thanks
          to{" "}
          <a
            className="text-white underline"
            href="https://tauri.app/"
            target="_blank"
            rel="noreferrer"
          >
            tauri
          </a>
          , produces a very small bundle size (~ 10 MB) compared to the
          alternatives.
        </p>
      }
    >
      <div className="mt-4 flex h-full w-full items-center justify-center md:mt-0">
        <BundleSizeChart />
      </div>
    </Card>
  )
}

export default BundleSizeCard

const BundleSizeChart = () => {
  const data = [
    {
      app: "TableX",
      size: 10
    },
    {
      app: "PhpAdmin",
      size: 13
    },
    { app: "TablePlus", size: 50 },
    { app: "PgAdmin4", size: 120 }
  ]
  return (
    <BarChart data={data} width={400} height={250} layout="horizontal">
      <XAxis dataKey="app" className="text-sm " />
      <YAxis />
      <Tooltip
        wrapperClassName="rounded-md text-muted-foreground"
        contentStyle={{
          background: "hsl(var(--background))"
        }}
      />
      <Bar dataKey="size" fill="white" />
    </BarChart>
  )
}
