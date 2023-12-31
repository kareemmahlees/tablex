import { Loader2 } from "lucide-react"

const LoadingSpinner = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin" color="white" />
    </div>
  )
}

export default LoadingSpinner
