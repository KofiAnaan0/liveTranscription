import React from "react";
import Section from "../ui/Section";
import MainGrid from "../ui/MainGrid";
import H2 from "../ui/H2";
import P from "../ui/P";
import { Button } from "../ui/Button";
import Image from "next/image";
import { ApproachType } from "@/types/approachType";
import Link from "next/link";

interface ApproachProps extends ApproachType {
  reversed: boolean;
}

const ApproachCard = ({
  title,
  index,
  description,
  imageUrl,
  reversed,
  videoUrl
}: ApproachProps) => {
  // Determine the order of text and image based on the 'reversed' prop
  const textOrder = reversed ? "md:order-2" : "md:order-1";
  const imageOrder = reversed ? "md:order-1" : "md:order-2";
  const bgOrder = reversed ? "bg-[#222222]" : "bg-[#854836]";

  // Extract YouTube video ID from URL if it's a watch URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // If it's already an embed URL, return it
    if (url.includes("/embed/")) return url;
    
    // Extract video ID from watch URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return url;
  };

  return (
    <Section>
      <MainGrid className={`${bgOrder} lg:w-[72%] rounded-md p-6`}>
        <div
          className={`${imageOrder} flex items-center justify-center`}
          data-aos="zoom-in"
          data-aos-delay="150"
        >
          {index === "customersupport" && videoUrl ? (
            <div className="relative w-full rounded-md overflow-hidden shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/40 transition-shadow duration-300" style={{ aspectRatio: '16/16' }}>
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={title || "image"}
              priority={!reversed}
              width={600}
              height={380}
              placeholder="blur"
              className="rounded-md shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/40 hover:rotate-1 hover:scale-105 transform transition-all duration-300 cursor-pointer mx-auto object-cover"
            />
          )}
        </div>
        
        {/* text content */}
        <div
          data-aos="fade-up"
          className={`space-y-4 flex flex-col items-center md:items-start justify-center ${textOrder}`}
        >
          {/* title */}
          <H2 className="text-center md:text-start lg:text-start">{title}</H2>

          {/* description */}
          <P className="text-center md:text-start lg:text-start">{description}</P>

          {/* CTA */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start w-full mt-8 gap-4">
            <Link
              href={`/product#${index}`}
              className="inline-flex justify-center items-center font-medium rounded-sm shadow-lg shadow-black/30 text-sm px-6 py-2 h-10 hover:shadow-xl hover:shadow-black/60 hover:scale-105 transform transition-all duration-150 cursor-pointer w-full md:w-fit bg-[#7AE2CF] text-black focus:outline-none"
            >
              Join Waitlist
            </Link>
            <Button
              variant="outline"
              className="w-full md:w-fit"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("openChatWidget"));
              }}
            >
              Talk to Joy
            </Button>
          </div>
        </div>
      </MainGrid>
    </Section>
  );
};

export default ApproachCard;