"use client";
import CreateConnectionBtn from "@/components/create_connection_btn";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { checkConsExist } from "./actions";

export default function Home() {
  const router = useRouter();
  const { isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => {
      (await checkConsExist()) ? router.push("/connections") : null;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" color="white" />
      </div>
    );
  }

  return (
    <main
      className="flex items-center justify-center h-full bg-black before:bg-[url(/bg-1.svg)] before:content-[''] before:absolute
    before:top-0 before:left-0 before:right-0 before:bottom-0 before:opacity-20
    "
    >
      <section className="flex flex-col items-center justify-between gap-y-28 z-10">
        <div className="relative flex flex-col items-center justify-center w-[200px] h-[200px] lg:w-[400px] lg:h-[400px]">
          <h1 className="text-6xl font-bold text-white z-20 ">Table</h1>
          <Image
            className="opacity-20 absolute"
            src={"/X.svg"}
            alt="logo"
            fill
          />
        </div>
        <CreateConnectionBtn />
      </section>
    </main>
  );
}
