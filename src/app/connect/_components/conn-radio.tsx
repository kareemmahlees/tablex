import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FC, useState } from "react";
import ConnectionParams from "./conn-params";
import ConnectionString from "./conn-string";

interface ConnectionParamsProps {
  driver: "mysql" | "psql";
}

const ConnectionRadio: FC<ConnectionParamsProps> = ({ driver }) => {
  const [visibleComp, setVisibleComp] = useState(<ConnectionParams />);
  return (
    <>
      <RadioGroup
        defaultValue="conn_params"
        className="flex items-center gap-x-7 lg:gap-x-10"
        onValueChange={(value) => {
          value === "conn_params"
            ? setVisibleComp(<ConnectionParams />)
            : setVisibleComp(<ConnectionString />);
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="conn_params" id="conn_params" />
          <Label htmlFor="conn_params">Connection Params</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="conn_string" id="conn_string" />
          <Label htmlFor="conn_string">Connection String</Label>
        </div>
      </RadioGroup>
      {visibleComp}
    </>
  );
};

export default ConnectionRadio;
