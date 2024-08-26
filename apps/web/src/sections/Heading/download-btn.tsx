import { Button } from "@/components/ui/button"

const DownloadBtn = () => {
  const userAgent = window.navigator.userAgent
  let iconSrc: string
  if (userAgent.includes("Mac")) {
    iconSrc = "https://cdn.simpleicons.org/macos/black"
  } else if (userAgent.includes("Linux")) {
    iconSrc = "https://cdn.simpleicons.org/linux/black"
  } else {
    iconSrc = ""
  }

  return (
    <Button
      className="space-x-3"
      onClick={() => {
        document.getElementById("download")?.scrollIntoView({ block: "center" })
      }}
    >
      {iconSrc.length > 0 && (
        <img src={iconSrc} alt="os_icon" className="h-4 w-4" />
      )}
      <p>Download</p>
    </Button>
  )
}

export default DownloadBtn
