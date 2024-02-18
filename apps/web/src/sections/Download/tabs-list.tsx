import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { version as packageVersion } from "@tablex/core/package.json"
import DownloadCard from "./download-card"

const DownloadTabs = () => {
  return (
    <Tabs
      defaultValue="windows"
      className="mt-7 flex w-full flex-col items-center justify-center md:mt-9 lg:mt-10"
    >
      <TabsList className="space-x-2">
        <TabsTrigger value="windows">
          <img
            src="https://cdn.simpleicons.org/windows11/white"
            alt="windows"
            className="mr-2 h-4 w-4"
          />
          Windows
        </TabsTrigger>
        <TabsTrigger value="macos">macOS</TabsTrigger>
        <TabsTrigger value="linux">
          <img
            src="https://cdn.simpleicons.org/linux/white"
            alt="linux"
            className="mr-2 h-4 w-4"
          />
          Linux
        </TabsTrigger>
      </TabsList>
      <TabsContent value="windows" className="w-2/3">
        <DownloadCard
          title="exe installer"
          downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/TableX_${packageVersion}_x64-setup.exe`}
        />
        <DownloadCard
          title="msi installer"
          downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/TableX_${packageVersion}_x64_en-US.msi`}
        />
      </TabsContent>
      <TabsContent value="macos" className="w-2/3">
        <DownloadCard
          title=".dmg"
          downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/TableX_${packageVersion}_x64.dmg`}
        />
      </TabsContent>
      <TabsContent value="linux" className="w-2/3">
        <DownloadCard
          title=".deb"
          downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/table-x_${packageVersion}_amd64.deb`}
        />
        <DownloadCard
          title=".tar.gz"
          downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/TableX_x64.app.tar.gz`}
        />
      </TabsContent>
    </Tabs>
  )
}

export default DownloadTabs
