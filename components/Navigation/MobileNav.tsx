import { navLinks } from "@/constants/constant";
import Link from "next/link";
import React from "react";
import { CgClose } from "react-icons/cg";
import { Button } from "../ui/Button";

type Prop = {
	navClose: () => void;
	showNav: boolean;
	handleshowModel: () => void;
};

const MobileNav = ({ navClose, showNav, handleshowModel }: Prop) => {
	const navOpen = showNav ? "translate-x-0" : "translate-x-[-100%]";

	return (
		<div>
			{/* overlay */}
			<div
				className={`fixed ${navOpen} h-screen w-full bg-black opacity-[70%] z-[1002] inset-0 transform transition`}
			></div>

			{/* Menu */}
			<div
				className={`fixed ${navOpen} z-[1054] h-full w-[80%] md:w-[60%] flex flex-col justify-center items-center transform transition duration-500 delay-300 bg-white space-y-6`}
			>
				{/* menu items */}
				{navLinks.map((link) => {
					return (
						<Link
							href={link.url}
							key={link.id}
							className="text-gray-900 border-b w-fit font-medium hover:text-gray-700 text-sm md:text-base"
						>
							{link.label}
						</Link>
					);
				})}

				{/* CAT */}
				<div className="flex flex-col items-center justify-center w-fit space-y-4">
					{/* login */}
					<Button
						variant="outline"
						size="default"
						onClick={() => (window.location.href = "tel:+12244643952")}
					>
						Contact Us
					</Button>

					{/* Demo */}
					<Button variant="default" size="default">
						Book a Demo
					</Button>
				</div>

				{/* close */}
				<CgClose
					onClick={navClose}
					className="absolute top-[0.7rem] right-[1.4rem] w-6 h-6 cursor-pointer text-gray-800"
				/>
			</div>
		</div>
	);
};

export default MobileNav;
