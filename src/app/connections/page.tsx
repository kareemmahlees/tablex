"use client";
import CreateConnectionBtn from "@/components/create_connection_btn";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getConnections } from "./actions";

const ConnectionsPage = () => {
  const { data: connections } = useQuery({
    queryKey: [],
    queryFn: async () => {
      return await getConnections();
    },
  });

  return (
    <main className="text-background  flex items-start h-full">
      <ul className="flex flex-col justify-start gap-y-5 flex-[0.5] p-5 lg:p-10">
        {connections?.map((connection, index) => {
          return (
            <>
              <li key={index} role="button">
                <p className="lg:text-xl font-medium">{connection.conn_name}</p>
                <p className="text-muted-foreground text-sm lg:text-lg">
                  {connection.driver}
                </p>
              </li>
              <div className="w-full h-[1px] bg-gray-800" aria-label="hidden" />
            </>
          );
        })}
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
