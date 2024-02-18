import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts"

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

export default BundleSizeChart
