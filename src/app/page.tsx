// pages/index.tsx
import Head from "next/head";
import DogSwiper from "@/components/DogSwiper";

export default function Home() {
  return (
    <>
      <Head>
        <title>Dog Swiper</title>
      </Head>
      <DogSwiper />
    </>
  );
}
