import React from "react";
import P from "../ui/P";
import H1 from "../ui/H1";
import { Button } from "../ui/Button";
import Main from "../ui/Main";
import Section from "../ui/Section";
import Link from "next/link";
import Logo from "@/public/logo/JoyAI-logo.png";
import Image from "next/image";

const Hero = () => {
  return (
    <Section className="pt-36 md:pt-38 ">
      {/* main content */}
      <Main data-aos="fade-up">
        {/* logo */}
        <Link
          href={"/"}
          className="cursor-pointer hover:scale-110 hover:rotate-1 transition duration-100 flex items-center justify-center"
        >
          <Image src={Logo} alt={"logo"} width={150} height={150} />
        </Link>

        {/* Title */}
        <H1>Africa&apos;s Voice Automation Platform for <span className="text-[#7AE2CF]">Enterprises.</span> </H1>

        {/* description */}
        <P className="max-w-2xl mx-auto">
          From customer support to sales — automate every call with voice AI
          agents that understand your customers in their own language.
        </P>

        {/* CAT */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 pb-6 w-full">
          {/* try */}
          <Button className="border-black w-full md:w-fit">Join Wailtlist</Button>

          {/* Demo */}
          <Button
            variant="outline"
            size="default"
            className="w-full md:w-fit"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openChatWidget"));
            }}
          >
            Talk to Joy
          </Button>
        </div>

        {/* video explanation */}
        <div
          className="mx-auto flex items-center justify-center max-w-4xl w-full"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/WxWMTFTrxsY?si=bU-dQxONBUIgyVan"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Brands */}
        {/* <LogoCloud /> */}
      </Main>
    </Section>
  );
};

export default Hero;
