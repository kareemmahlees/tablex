import { Loader2 } from "lucide-react"

const LoadingSpinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" color="white" />
    </div>
  )
}

export default LoadingSpinner
