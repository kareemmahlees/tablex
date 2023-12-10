"use client";
import CreateConnectionBtn from "@/components/create_connection_btn";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getConnections } from "./actions";

const ConnectionsPage = () => {
  const router = useRouter();
  const { data: connections } = useQuery({
    queryKey: [],
    queryFn: async () => {
      return await getConnections();
    }
  });

  return (
    <main className="text-background  flex items-start h-full">
      <ul className="flex flex-col justify-start h-full gap-y-5 flex-[0.5] p-5 lg:p-10">
        {/* the guard check is done first to remove the undefined instead of checking for the isLoading */}
        {connections ? (
          Object.entries(connections).map(([id, config]) => {
            return (
              <>
                <li
                  key={id}
                  role="button"
                  onClick={() => router.push(`/dashboard?id=${id}`)}
                >
                  <p className="lg:text-xl font-medium">{config.conn_name}</p>
                  <p className="text-muted-foreground text-sm lg:text-lg">
                    {config.driver}
                  </p>
                </li>
                <div
                  className="w-full h-[1px] bg-gray-800"
                  aria-label="hidden"
                />
              </>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}
      </ul>
      <aside className="relative flex flex-col items-center gap-y-10 lg:gap-y-20 justify-center h-full flex-[0.5]">
        <div className="relative w-[100px] h-[100px] lg:w-[150px] lg:h-[150px]">
          <Image
            src={"/icons/planet.svg"}
            alt="planet"
            aria-label="hidden"
            fill
          />
        </div>
        <CreateConnectionBtn />
        <div className="absolute h-full w-full -z-10 overflow-hidden opacity-10">
          <Image
            src={"/bg-2.svg"}
            alt="background"
            fill
            className="object-cover object-center"
            aria-label="hidden"
          />
        </div>
      </aside>
    </main>
  );
};

export default ConnectionsPage;
