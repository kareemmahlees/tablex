"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Table } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { KeyboardEvent, PropsWithChildren, useState } from "react";
import {
  establishConnection,
  getConnectionDetails,
  getTables,
} from "./actions";

const TablesLayout = ({ children }: PropsWithChildren) => {
  const params = useSearchParams();
  const [tables, setTables] = useState<string[]>([]);
  const connectionId = params.get("id")!;

  const { data, isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const connDetails = await getConnectionDetails(connectionId);
      await establishConnection(connDetails.conn_string);
      const tables = await getTables();
      setTables(tables);
      return { connName: connDetails.conn_name, tables };
    },
  });

  let timeout: NodeJS.Timeout;
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const searchPattern = e.currentTarget.value;
    if (searchPattern === "") {
      setTables(data?.tables!);
      return;
    }

    let regex = new RegExp(`.*${searchPattern}.*`);
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      const filteredTables = tables.filter((table) => regex.test(table));
      setTables(filteredTables);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin" color="white" />
      </div>
    );
  }
  return (
    <>
      <nav className="w-full bg-amber-600 h-6 fixed top-0 text-white font-semibold text-center z-20">
        {data?.connName} • Connected
      </nav>
      <aside className="text-white z-10 w-48 lg:w-60 h-full flex flex-col items-start p-2 gap-y-5 bg-zinc-800 fixed top-[1.5rem]">
        <input
          type="text"
          className="mt-2 bg-foreground w-full h-6 placeholder:text-xs text-white/60 text-xs  focus-visible:ring-gray-800 outline-none rounded-md p-1 flex items-center placeholder:opacity-50"
          placeholder="type to search"
          onKeyUp={handleKeyUp}
        />
        <ul>
          {tables.map((table, index) => {
            return (
              <li
                key={index}
                className="flex items-center justify-center text-white text-sm lg:text-base gap-x-1"
              >
                <Table size={16} className="fill-amber-600 text-black" />
                {table}
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="w-full h-full flex items-center justify-center fixed left-[6rem] lg:left-[7.5rem] top-[1.5rem] overflow-y-scroll">
        {tables.length == 0 ? (
          <div className="flex flex-col items-center text-muted-foreground text-sm font-semibold gap-y-3 opacity-50 lg:text-base">
            <Image src={"/empty.svg"} alt="empty" width={100} height={100} />
            <p>Breity empty around here</p>
          </div>
        ) : (
          children
        )}
      </section>
    </>
  );
};

export default TablesLayout;
