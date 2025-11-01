"use client";

import React, { useState } from "react";
import MobileNav from "./MobileNav";
import Nav from "./Nav";

type Props = {
	handleshowModel: () => void;
};

const Responsive = ({ handleshowModel }: Props) => {
	const [showNav, setShowNav] = useState(false);

	const handleNavOpen = () => {
		setShowNav(true);
	};

	const handleNavClose = () => {
		setShowNav(false);
	};

	return (
		<>
			<Nav navOpen={handleNavOpen} handleshowModel={handleshowModel} />
			<MobileNav
				navClose={handleNavClose}
				showNav={showNav}
				handleshowModel={handleshowModel}
			/>
		</>
	);
};

export default Responsive;
