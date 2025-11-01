"use client";

import { navLinks } from "@/constants/constant";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Add this import
import React, { useEffect, useState } from "react";
import { RiMenuFill } from "react-icons/ri";
import { Button } from "../ui/Button";
import Logo from "@/public/logo/JoyAI-logo.png";

type Props = {
	navOpen: () => void;
	handleshowModel: () => void;
};

const Nav = ({ navOpen }: Props) => {
	const [navBg, setNavBg] = useState(false);
	const pathname = usePathname(); // Get current path

	useEffect(() => {
		const handleNavBg = () => {
			if (window.scrollY > 50) setNavBg(true);
			else setNavBg(false);
		};

		window.addEventListener("scroll", handleNavBg);

		return () => window.removeEventListener("scroll", handleNavBg);
	}, []);

	return (
		<div
			className={`${
				navBg
					? "bg-[#000000]/75 shadow-sm backdrop-blur-lg"
					: "fixed bg-[#000000]"
			} fixed z-[100]  h-[12vh] w-full transition-all duration-100 `}
		>
			<div className="w-[90%] lg:w-[80%] h-full flex justify-between items-center mx-auto">
				{/* logo */}
				<Link
					href={"/"}
					className="cursor-pointer hover:scale-110 hover:rotate-1 transition duration-100"
				>
					<Image src={Logo} alt={"logo"} width={50} height={50} />
				</Link>

				{/* nav links */}
				<div className="hidden lg:flex space-x-4 items-center justify-center py-3 px-6 ">
					{navLinks.map((link) => {
						const isActive = pathname === link.url;
						return (
							<Link
								href={link.url}
								key={link.id}
								className={`text-[#EFEEEA] font-normal text-sm hover:text-[#EFEEEA]/95 hover:rotate-1 hover:scale-110 transition duration-100 relative pb-1 ${
									isActive ? "after:scale-x-100" : "after:scale-x-0"
								} after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#EFEEEA] after:transition-transform after:duration-300 hover:after:scale-x-100`}
							>
								{link.label}
							</Link>
						);
					})}
				</div>

				{/* CAT */}
				<div className="hidden lg:flex space-x-2 items-center ">
					{/* login */}
					<Button
						variant="outline"
						size="default"
						onClick={() => {
							window.dispatchEvent(new CustomEvent("openChatWidget"));
						}}
						className="border-[#EFEEEA] text-[#EFEEEA]"
					>
						Contact Us
					</Button>

					{/* Demo Button */}
					<Button
						variant="default"
						size="default"
						className="bg-[#FFFFFF] text-[#000000]"
					>
						Book a Demo
					</Button>
				</div>

				{/* Hamburger Menu */}
				<RiMenuFill
					onClick={navOpen}
					className="text-gray-400 hover:text-gray-200 w-8 h-8 cursor-pointer transition-all duration-100 lg:hidden"
				/>
			</div>
		</div>
	);
};

export default Nav;
