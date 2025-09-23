"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-cards";

interface Dog {
  id: string;
  url: string;
  name: string;
  age: number;
}

const dogNames = [
  "Buddy",
  "Max",
  "Charlie",
  "Cooper",
  "Rocky",
  "Bear",
  "Duke",
  "Zeus",
  "Jack",
  "Oliver",
  "Luna",
  "Bella",
  "Lucy",
  "Daisy",
  "Lola",
  "Sadie",
  "Molly",
  "Bailey",
  "Stella",
  "Maggie",
];

import NextImage from "next/image";

// Custom Image component using Next.js Image
const Image = ({
  src,
  alt,
  className,
  fill,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}) => (
  <NextImage
    src={src}
    alt={alt}
    className={className}
    fill={fill}
    onError={onError}
    sizes="100vw"
    style={fill ? { objectFit: "cover" } : {}}
  />
);

export default function DogSwiper() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedDogs, setLikedDogs] = useState<Dog[]>([]);
  const [processedDogs, setProcessedDogs] = useState<Set<string>>(new Set());
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
        // 上限を10に設定
        const res = await fetch(
          "https://api.thedogapi.com/v1/images/search/?limit=10"
        );
        const data = await res.json();
        const dogsWithInfo = data.map(
          (dogData: DogApiResponse, index: number) =>
            generateDogInfo(dogData, index)
        );
        setDogs(dogsWithInfo);
      } catch (error) {
        console.error("Failed to fetch dogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDogs();
  }, []);

  const processDog = (dog: Dog, action: "like" | "pass") => {
    // 既に処理済みの犬はスキップ
    if (processedDogs.has(dog.id)) {
      return;
    }

    // 処理済みとしてマーク
    setProcessedDogs((prev) => new Set([...prev, dog.id]));

    if (action === "like") {
      setLikedDogs((prev) => [...prev, dog]);
      console.log("Liked:", dog.name);
    } else {
      console.log("Passed:", dog.name);
    }
  };

  // スワイプ完了時の処理（ボタン経由でない場合のみ）
  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);

    // スワイプによる自動処理は無効化
    // ボタンクリックでのみ処理を行う
  };

  // ボタンクリック時の処理
  const handleButtonAction = (action: "like" | "pass") => {
    if (currentIndex >= dogs.length) return;

    const currentDog = dogs[currentIndex];
    processDog(currentDog, action);

    // カードのアニメーション方向を制御
    if (swiperRef.current) {
      const currentSlide = swiperRef.current.slides[0]; // 現在のスライド
      if (currentSlide) {
        // アニメーションクラスを追加
        if (action === "like") {
          currentSlide.style.transform = "translateX(100%) rotate(20deg)";
        } else {
          currentSlide.style.transform = "translateX(-100%) rotate(-20deg)";
        }
        currentSlide.style.transition = "transform 0.3s ease-out";
        currentSlide.style.opacity = "0";

        // アニメーション後にスライドを進める
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          // スタイルをリセット
          if (currentSlide) {
            currentSlide.style.transform = "";
            currentSlide.style.transition = "";
            currentSlide.style.opacity = "";
          }
        }, 300);
      }
    } else {
      // Swiperが利用できない場合は手動でインデックスを更新
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // お気に入りリストを表示/非表示
  const toggleLikedList = () => {
    console.log("Toggle liked list:", !showLikedList); // デバッグ用
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
        {/* お気に入りリスト モーダル（完了画面用） */}
        {showLikedList && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={toggleLikedList}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-pink-600">
                  Liked Dogs ❤️
                </h3>
                <button
                  onClick={toggleLikedList}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              {likedDogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No liked dogs yet!
                </p>
              ) : (
                <div className="space-y-3">
                  {likedDogs.map((dog) => (
                    <div
                      key={dog.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={dog.url}
                          fill
                          alt={dog.name}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {dog.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {dog.age} years old
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Completion page button clicked!");
              toggleLikedList();
            }}
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

      {/* お気に入りリスト モーダル */}
      {showLikedList && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={toggleLikedList}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-pink-600">Liked Dogs ❤️</h3>
              <button
                onClick={toggleLikedList}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            {likedDogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No liked dogs yet!
              </p>
            ) : (
              <div className="space-y-3">
                {likedDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={dog.url}
                        fill
                        alt={dog.name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {dog.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dog.age} years old
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
          grabCursor={false}
          modules={[EffectCards]}
          className="dog-swiper"
          onSlideChange={handleSlideChange}
          allowTouchMove={false}
          allowSlideNext={false}
          allowSlidePrev={false}
          simulateTouch={false}
          touchRatio={0}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          }}
        >
          {dogs.map((dog, index) => {
            // 現在のインデックスより前のカードは表示しない
            if (index < currentIndex) return null;

            return (
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
                  {index === currentIndex && currentIndex === 0 && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-75">
                        PASS
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-75">
                        LIKE
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-8 mb-8">
        <button
          onClick={() => handleButtonAction("pass")}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={currentIndex >= dogs.length}
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
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={currentIndex >= dogs.length}
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
            {Math.min(currentIndex + 1, dogs.length)} / {dogs.length}
          </div>
          <div className="text-sm text-gray-600">Dogs remaining</div>
        </div>
      </div>
    </div>
  );
}
