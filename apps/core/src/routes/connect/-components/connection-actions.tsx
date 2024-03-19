import { Button } from "@/components/ui/button"

type ConnectionActionsProps = {
  onClickConnect: React.MouseEventHandler
  onClickSave: React.MouseEventHandler<HTMLButtonElement>
  onClickTest: React.MouseEventHandler
}

const ConnectionActions = ({
  onClickConnect,
  onClickSave,
  onClickTest
}: ConnectionActionsProps) => {
  return (
    <div className="col-span-full flex items-center justify-center gap-x-4">
      <Button
        type="button"
        variant={"secondary"}
        className="w-[100px]"
        onClick={onClickConnect}
      >
        Connect
      </Button>
      <Button type="button" className="w-[100px]" onClick={onClickSave}>
        Save
      </Button>
      <Button
        type="button"
        className="w-[100px] bg-green-500 hover:bg-green-700"
        onClick={onClickTest}
      >
        Test
      </Button>
    </div>
  )
}

export default ConnectionActions
