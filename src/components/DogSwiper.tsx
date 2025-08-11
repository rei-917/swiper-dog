"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiperのスタイルをインポート
import "swiper/css";
import "swiper/css/effect-cards";

interface Dog {
  id: string;
  url: string;
  name: string;
  age: number;
}

// 犬の名前配列
const dogNames = [
  "Buddy","Max","Charlie","Cooper","Rocky","Bear","Tucker","Duke","Jack","Bentley","Oliver","Leo","Milo","Zeus","Finn","Bruno","Bella","Luna","Lucy","Daisy","Lola","Sadie","Molly","Maggie","Sophie","Chloe","Bailey","Stella","Penny","Zoey","Coco","Roxy","レオ","マロン","ココ","リク","チョコ","ソラ","ハル","ムギ","フク","ユズ","ナナ","タロウ"
];

export default function DogSwiper() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedDogs, setLikedDogs] = useState<Dog[]>([]);
  const [showLikedList, setShowLikedList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  // TheDogAPIのレスポンス型
  interface DogApiResponse {
    id: string;
    url: string;
  }

  // ランダムな犬の情報を生成
  const generateDogInfo = (dogData: DogApiResponse, index: number): Dog => ({
    id: `${dogData.id}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    url: dogData.url,
    name: dogNames[Math.floor(Math.random() * dogNames.length)],
    age: Math.floor(Math.random() * 12) + 1,
  });

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await fetch(
          "https://api.thedogapi.com/v1/images/search/?limit=50"
        );
        const data = await res.json();
        const dogsWithInfo = data.map((dogData: DogApiResponse, index: number) => generateDogInfo(dogData, index));
        setDogs(dogsWithInfo);
      } catch (error) {
        console.error("Failed to fetch dogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDogs();
  }, []);

  const handleLike = (dog: Dog) => {
    setLikedDogs((prev) => [...prev, dog]);
    console.log("Liked:", dog.name);
  };

  const handlePass = (dog: Dog) => {
    console.log("Passed:", dog.name);
  };

  // スワイプ完了時の処理
  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    const previousIndex = swiper.previousIndex;

    if (newIndex > previousIndex && dogs[previousIndex]) {
      // 右スワイプ（Like）
      handleLike(dogs[previousIndex]);
    } else if (newIndex > previousIndex && dogs[previousIndex]) {
      // 左スワイプ（Pass）
      handlePass(dogs[previousIndex]);
    }

    setCurrentIndex(newIndex);
  };

  // ボタンクリック時の処理
  const handleButtonAction = (action: "like" | "pass") => {
    if (!swiperRef.current || currentIndex >= dogs.length) return;

    const currentDog = dogs[currentIndex];

    if (action === "like") {
      handleLike(currentDog);
    } else {
      handlePass(currentDog);
    }

    // 次のスライドに移動
    if (typeof swiperRef.current.slideNext === "function") {
      swiperRef.current.slideNext();
    }
  };

  // お気に入りリストを表示/非表示
  const toggleLikedList = () => {
    setShowLikedList(!showLikedList);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading adorable dogs...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= dogs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-pink-600 mb-4">
            🎉 All Done!
          </h2>
          <p className="text-gray-600 mb-6">You&lsquo;ve seen all the dogs!</p>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {likedDogs.length}
            </div>
            <div className="text-gray-600">Dogs Liked</div>
          </div>
          <button
            onClick={toggleLikedList}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105"
          >
            View Liked Dogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-100 to-purple-100">
      {/* ヘッダー */}
      <div className="flex justify-between items-center w-full max-w-sm mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Pawfect Match🐾</h1>
        <button
          onClick={toggleLikedList}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 relative"
        >
          ❤️ Liked ({likedDogs.length})
        </button>
      </div>

      {/* お気に入りリスト */}
      {showLikedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-pink-600">Liked Dogs ❤️</h3>
              <button
                onClick={toggleLikedList}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {likedDogs.length === 0 ? (
              <p className="text-gray-500 text-center">No liked dogs yet!</p>
            ) : (
              <div className="space-y-3">
                {likedDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={dog.url}
                        fill
                        alt={dog.name}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {dog.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {" "}
                        {dog.age} years
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* メインカードエリア */}
      <div className="relative w-full max-w-sm mx-auto mb-8">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          effect="cards"
          grabCursor={true}
          modules={[EffectCards]}
          className="dog-swiper"
          onSlideChange={handleSlideChange}
          allowTouchMove={true}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          }}
        >
          {dogs.slice(currentIndex).map((dog, index) => (
            <SwiperSlide key={dog.id}>
              <div className="relative w-full h-96 bg-white rounded-2xl shadow-xl overflow-hidden">
                <Image
                  src={dog.url}
                  fill
                  alt={dog.name}
                  className="object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", dog.url);
                  }}
                />

                {/* 犬の情報オーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-1">{dog.name}</h3>
                    <p className="text-sm opacity-75">{dog.age} years old</p>
                  </div>
                </div>

                {/* スワイプヒント（最初のカードにのみ表示） */}
                {index === 0 && currentIndex === 0 && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 swipe-hint-pass">
                      PASS
                    </div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 swipe-hint-like">
                      LIKE
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-8 mb-8">
        <button
          onClick={() => handleButtonAction("pass")}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <button
          onClick={() => handleButtonAction("like")}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* 進捗表示 */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600 mb-1">
            {currentIndex + 1} / {dogs.length}
          </div>
          <div className="text-sm text-gray-600">Dogs remaining</div>
        </div>
      </div>

      {/* 使い方のヒント */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        <p>💡 Swipe right to like, left to pass</p>
        <p>or use the buttons below!</p>
      </div>
    </div>
  );
}
