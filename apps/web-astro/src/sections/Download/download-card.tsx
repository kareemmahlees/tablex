import { buttonVariants } from "@/components/ui/button"

interface DownloadCardProps {
  title: string
  downloadLink: string
}

const DownloadCard = ({ title, downloadLink }: DownloadCardProps) => {
  return (
    <div className="mt-6 flex w-full items-center justify-between gap-x-10 rounded-md border border-b-2 p-4 transition hover:-translate-y-2 hover:shadow-md hover:shadow-white md:mt-8 lg:mt-10">
      <h5>{title}</h5>
      <a className={buttonVariants()} href={downloadLink}>
        Download
      </a>
    </div>
  )
}

export default DownloadCard
