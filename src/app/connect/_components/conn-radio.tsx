import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Drivers, type DriversValues } from "@/lib/types"
import { useState } from "react"
import ConnectionParamsForm from "./conn-params"
import ConnectionStringForm from "./conn-string"

interface ConnectionParamsProps {
  driver: Exclude<DriversValues, typeof Drivers.SQLite>
}

const ConnectionDetails = ({ driver }: ConnectionParamsProps) => {
  const [radioValue, setRadioValue] = useState<
    (string & {}) | "conn_params" | "conn_string"
  >("conn_params")
  return (
    <>
      <RadioGroup
        defaultValue="conn_params"
        className="flex items-center gap-x-7 lg:gap-x-10"
        onValueChange={(value) => setRadioValue(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="conn_params"
            id="conn_params"
            className="border-secondary-foreground text-secondary-foreground"
          />
          <Label htmlFor="conn_params" className="hover:cursor-pointer">
            Connection Params
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="conn_string"
            id="conn_string"
            className="border-secondary-foreground text-secondary-foreground"
          />
          <Label htmlFor="conn_string" className="hover:cursor-pointer">
            Connection String
          </Label>
        </div>
      </RadioGroup>
      {radioValue === "conn_params" && <ConnectionParamsForm driver={driver} />}
      {radioValue === "conn_string" && <ConnectionStringForm driver={driver} />}
    </>
  )
}

export default ConnectionDetails
