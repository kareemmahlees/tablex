import DownloadCard from "@/components/DownloadCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { version as packageVersion } from "@tablex/core/package.json"

const Download = () => {
  return (
    <section
      className="mt-[100px] w-full space-y-7 md:space-y-9 lg:space-y-11
    "
    >
      <h3
        className="text-center text-2xl font-bold underline underline-offset-4 md:text-3xl"
        id="download"
      >
        Download
      </h3>
      <Tabs
        defaultValue="windows"
        className="flex w-full flex-col items-center justify-center"
      >
        <TabsList className="space-x-2">
          <TabsTrigger value="windows">
            <img
              src="/icons/windows.svg"
              alt="windows"
              className="mr-2 h-4 w-4"
            />
            Windows
          </TabsTrigger>
          <TabsTrigger value="macos">macOS</TabsTrigger>
          <TabsTrigger value="linux">
            <img src="/icons/linux.svg" alt="linux" className="mr-2 h-4 w-4" />
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
            downloadLink={`https://github.com/kareemmahlees/tablex/releases/latest/download/TableX_${packageVersion}_x64.dmg
`}
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
    </section>
  )
}

// Windows
// https://github.com/kareemmahlees/tablex/releases/download/latest/TableX_{package_version}_x64-setup.exe
// https://github.com/kareemmahlees/tablex/releases/download/latest/TableX_{package_version}_x64_en-US.msi

// Linux
// https://github.com/kareemmahlees/tablex/releases/download/latest/table-x_{package_version}_amd64.deb
// https://github.com/kareemmahlees/tablex/releases/download/latest/TableX_x64.app.tar.gz

// MacOS
// https://github.com/kareemmahlees/tablex/releases/download/latest/TableX_{package_version}_x64.dmg

export default Download
