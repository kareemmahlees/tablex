import HighLight from "../components/highlight"

const Settings = () => {
  const str = `"pageSize": 500,
"checkForUpdates": true,
"sqlEditor": {
    "cursorBlinking": "smooth",
    "fontSize": 18,
    "minimap": true,
}`
  return <HighLight lang="json">{str}</HighLight>
}

export default Settings
