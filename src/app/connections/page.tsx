"use client";
import CreateConnectionBtn from "@/components/create_connection_btn";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getConnections } from "./actions";

const ConnectionsPage = () => {
  const { data } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      return await getConnections();
    },
  });
  return (
    <main className="text-background p-5 md:p-7 lg:p-10 flex items-start h-full">
      <ul className="flex flex-col justify-start gap-y-5 flex-[0.5]">
        {data?.map((connection, index) => {
          return (
            <>
              <li key={index} role="button" className="text-sm">
                <p>{connection.driver}</p>
                <p className="text-muted-foreground">
                  {connection.conn_string}
                </p>
              </li>
              <div className="w-full h-[1px] bg-gray-800" aria-label="hidden" />
            </>
          );
        })}
      </ul>
      <aside className="flex flex-col items-center gap-y-4 md:gap-y-6 lg:gap-y-10 justify-center h-full flex-[0.5]">
        <div className="relative w-[100px] h-[100px] lg:w-[150px] lg:h-[150px]">
          <Image
            src={"/icons/planet.svg"}
            alt="planet"
            aria-label="hidden"
            fill
          />
        </div>
        <CreateConnectionBtn />
      </aside>
    </main>
  );
};

export default ConnectionsPage;
