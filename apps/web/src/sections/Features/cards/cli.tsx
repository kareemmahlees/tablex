const CLI = () => {
  return (
    <div className="bg-muted h-full space-y-3 overflow-x-auto rounded-md p-3">
      <div className="flex items-center gap-x-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>
      <p className="flex items-center gap-x-3">
        <span className="text-muted-foreground">$</span> <pre>table --help</pre>
      </p>
      <pre className="text-muted-foreground space-y-1 text-sm">
        <span>Table Viewer for modern developers.</span>
        <p>
          <span className="font-bold underline">Usage</span>: tablex.exe
          [OPTIONS] [CONN_STRING]
        </p>
      </pre>
    </div>
  )
}

export default CLI
