"use client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { check_cons_exist } from "./_actions/actions";

export default function Home() {
  const router = useRouter();
  useQuery({
    queryKey: [""],
    queryFn: async () => {
      if (await check_cons_exist()) {
        router.push("/connections");
      }
    },
  });
  return (
    <main
      className="flex items-center justify-center h-full bg-black before:bg-[url(/bg-2.svg)] before:content-[''] before:absolute
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
        <Button
          className="cursor-pointer font-semibold"
          variant={"secondary"}
          asChild
        >
          <Link href={"/connect"}>
            <LinkIcon className="text-muted-foreground mr-3" size={20} />
            Start a connection
          </Link>
        </Button>
      </section>
    </main>
  );
}
