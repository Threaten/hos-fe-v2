"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import SkeletonImage from "@/components/ui/SkeletonImage";
import { fetchTenants, fetchHomeInformation } from "@/lib/data";
import { getTenantUrl, tenantBranchLabel } from "@/lib/domain";
import { mediaUrl } from "@/lib/media";
import type { Tenant, HomeInformation, MediaDoc } from "@/types/payload";

export default function Welcome() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [branches, setBranches] = useState<Tenant[]>([]);
  const [homeInfo, setHomeInfo] = useState<HomeInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [randomizedQuotes, setRandomizedQuotes] = useState<
    Array<{ quote: string; id: string }>
  >([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsData, homeData] = await Promise.all([
          fetchTenants(),
          fetchHomeInformation(),
        ]);
        setBranches(tenantsData || []);
        setHomeInfo(homeData || null);

        const info = (homeData || {}) as Record<string, unknown>;
        const rawQuotes = (homeData?.["quote(s)"] ||
          (info.quote_s_ as Array<{ quote: string; id?: string }>) ||
          []) as Array<{ quote: string; id?: string }>;

        const items = rawQuotes.map((item, idx) => ({
          quote: item.quote,
          id: item.id || `quote-${idx}`,
        }));

        setRandomizedQuotes([...items].sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("Failed to fetch home page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use tenant addresses for marquee instead of home information addresses
  const addresses = useMemo(
    () =>
      branches
        .filter((t) => t.address)
        .map((t) => ({
          address: t.address!,
          id: t.id,
        })),
    [branches],
  );

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || addresses.length === 0) return;

    let animationFrame: number;
    let scrollPosition = 0;
    let lastTime = performance.now();

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;

        scrollPosition += 60 * deltaTime; // 60 pixels per second

        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }

        scrollContainer.scrollLeft = scrollPosition;
        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [addresses]);

  useEffect(() => {
    const scrollContainer = bottomScrollRef.current;
    if (!scrollContainer || randomizedQuotes.length === 0) return;

    let animationFrame: number;
    const maxScroll = scrollContainer.scrollWidth / 2;
    scrollContainer.scrollLeft = maxScroll;
    let scrollPosition = maxScroll;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      scrollPosition -= 60 * deltaTime; // 60 pixels per second (reversed direction)

      if (scrollPosition <= 0) {
        scrollPosition = maxScroll;
        scrollContainer.scrollLeft = maxScroll;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [randomizedQuotes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E4D9] flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const info = (homeInfo || {}) as Record<string, unknown>;
  const catchPhrase1 = (homeInfo?.["Catch Phrase 1"] ||
    info.CatchPhrase1 ||
    "") as string;
  const catchPhrase2 = (homeInfo?.["Catch Phrase 2"] ||
    info.CatchPhrase2 ||
    "") as string;
  const mobileBg = (homeInfo?.["Background Image (for Mobile)"] ||
    info.BackgroundImage_forMobile_ ||
    null) as MediaDoc | string | null;
  const mobileBgUrl = mediaUrl(mobileBg) || "/media/Asset 6.png";

  // Duplicate addresses for seamless infinite loop (ensure enough length)
  const marqueeAddresses =
    addresses.length > 0
      ? addresses.length < 4
        ? [...addresses, ...addresses, ...addresses, ...addresses]
        : [...addresses, ...addresses]
      : [];

  const marqueeQuotes =
    randomizedQuotes.length > 0
      ? randomizedQuotes.length < 4
        ? [
            ...randomizedQuotes,
            ...randomizedQuotes,
            ...randomizedQuotes,
            ...randomizedQuotes,
          ]
        : [...randomizedQuotes, ...randomizedQuotes]
      : [];

  return (
    <div className="min-h-screen bg-[#E8E4D9] flex flex-col relative">
      {/* Mobile background image */}
      <div className="lg:hidden absolute inset-0 z-0">
        <SkeletonImage
          src={mobileBgUrl}
          alt="Background"
          fill
          className="object-cover opacity-20"
        />
      </div>

      {/* Top section - Infinite Marquee - Addresses */}
      <div
        ref={scrollRef}
        className="h-12 w-screen border-b border-[rgb(124,118,89)]/40 overflow-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex h-12">
          {marqueeAddresses.map((item, index) => (
            <React.Fragment key={`marquee-${index}-${item.id}`}>
              <div className="h-12 flex items-center justify-center text-black shrink-0 border-b border-l border-r border-[rgb(124,118,89)]/40 px-6 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span>{item.address}</span>
                </div>
              </div>
              <div className="bg-transparent h-12 flex items-center justify-center shrink-0 border-b border-l border-r border-[rgb(124,118,89)]/40 px-4">
                <div className="flex gap-4">
                  <Image
                    src="/media/Asset 1.png"
                    alt="Phone"
                    width={24}
                    height={24}
                  />
                  <Image
                    src="/media/Asset 2.png"
                    alt="Email"
                    width={24}
                    height={24}
                  />
                  <Image
                    src="/media/Asset 3.png"
                    alt="Location"
                    width={24}
                    height={24}
                  />
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Upper right image */}
      <div className="hidden lg:block absolute top-16 right-8 w-[350px] h-[350px]">
        <SkeletonImage
          src="/media/Asset 7.png"
          alt="Decoration"
          fill
          className="object-contain"
        />
      </div>

      {/* Upper left text - Catch Phrase 1 */}
      <div className="absolute top-16 lg:left-8 left-0 right-0 lg:right-auto lg:translate-x-0 text-gray-800 text-sm w-auto lg:text-left text-center px-4 lg:px-0">
        <div className="text-2xl md:text-3xl font-bold italic leading-tight">
          {catchPhrase1
            ? catchPhrase1.split(",").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part.trim()}
                  {i < arr.length - 1 && ","}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            : "Loading..."}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Center content */}
          <div className="text-center space-y-8">
            {/* Title */}
            <h1 className="italic text-4xl tracking-tight text-black">
              house of senses
            </h1>

            {/* Dropdown */}
            <div className="flex justify-center">
              <div ref={dropdownRef} className="relative w-full max-w-xs">
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-6 py-4 bg-black text-white rounded-3xl text-base font-normal italic cursor-pointer border border-black shadow-lg flex items-center justify-between"
                  aria-expanded={isDropdownOpen}
                >
                  <span>{selectedBranch || 'pick your "home"'}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute w-full mt-0 bg-white rounded-3xl border border-gray-300 shadow-xl overflow-hidden z-10">
                    {branches.map((branch, index) => (
                      <button
                        type="button"
                        key={branch.name || branch.id}
                        onClick={() => {
                          setSelectedBranch(tenantBranchLabel(branch));
                          setIsDropdownOpen(false);
                          // Redirect to tenant subdomain
                          window.location.href = getTenantUrl(branch.domain);
                        }}
                        className={`w-full px-6 py-3 text-left italic text-black hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                          index !== branches.length - 1
                            ? "border-b border-gray-300"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col w-full">
                          <span className="text-[0.95rem]">
                            {tenantBranchLabel(branch)}
                          </span>
                          {branch.address && (
                            <span className="text-[0.69rem] text-gray-500 not-italic">
                              {branch.address}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom left image */}
      <div className="hidden lg:block absolute bottom-16 left-8 w-[350px] h-[350px]">
        <SkeletonImage
          src="/media/Asset 5.png"
          alt="Decoration"
          fill
          className="object-contain"
        />
      </div>

      {/* Catch Phrase 2 */}
      <div className="absolute text-3xl bottom-16 lg:right-8 left-0 lg:left-auto right-0 text-gray-800 w-auto lg:text-right text-center px-4 lg:px-0">
        <div className="text-2xl md:text-3xl bold italic font-extrabold leading-tight">
          {catchPhrase2
            ? catchPhrase2.split(",").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part.trim()}
                  {i < arr.length - 1 && ","}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            : "Loading..."}
        </div>
      </div>

      {/* Bottom section - Reversed Marquee - Quotes */}
      <div
        ref={bottomScrollRef}
        className="h-12 w-screen border-t border-[rgb(124,118,89)]/40 overflow-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex h-12">
          {marqueeQuotes.map((item, index) => (
            <div
              key={`quote-${index}-${item.id}`}
              className="h-12 flex items-center justify-center shrink-0 border-t border-l border-r border-[rgb(124,118,89)]/40 px-6 whitespace-nowrap text-black"
            >
              {item.quote}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
