import Highlight from "react-highlight"

const Settings = () => {
  const exampleSettings = {
    pageSize: 500,
    checkForUpdates: true,
    fontSize: 18
  }

  return (
    <Highlight className="language-json rounded-md">
      {`"pageSize": 500,
"checkForUpdates":true,
"sqlEditor": {
    "cursorBlinking": "smooth",
    "fontSize": 18,
    "minimap": true,
`}
    </Highlight>
  )
}

export default Settings
