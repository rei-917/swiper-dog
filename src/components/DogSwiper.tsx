// components/DogSwiper.tsx
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";

interface Dog {
  id: string;
  url: string;
  breeds: {
    name: string;
  }[];
}

export default function DogSwiper() {
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    const fetchDogs = async () => {
      const res = await fetch(
        "https://api.thedogapi.com/v1/images/search?has_breeds=true&limit=10"
      );
      const data = await res.json();
      setDogs(data);
    };

    fetchDogs();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-100 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">🐶 Dog Swiper</h1>
      <Swiper
        effect="cards"
        grabCursor={true}
        modules={[EffectCards]}
        className="w-[300px] h-[400px]"
      >
        {dogs.map((dog) => (
          <SwiperSlide key={dog.id}>
            <div className="relative w-full h-full">
              <img
                src={dog.url}
                alt="dog"
                className="object-cover w-full h-full rounded-xl"
              />
              {dog.breeds[0] && (
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-center py-2 rounded-b-xl">
                  {dog.breeds[0].name}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
