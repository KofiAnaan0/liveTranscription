"use client";

import React, { useState } from "react";
import Responsive from "./Navigation/Responsive";
import LoginModel from "./LoginModel";

export default function ClientWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const [showModel, setShowModel] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showSignUpModal, setShowSignUpModal] = useState(false);

	const switchtosignUp = () => {
		setShowLoginModal(false);
		setShowSignUpModal(true);
	};

	const switchtologIn = () => {
		setShowLoginModal(true);
		setShowSignUpModal(false);
	};

	const handleshowModel = () => {
		setShowModel(!showModel);
	};

	return (
		<>
			<Responsive handleshowModel={handleshowModel} />
			{children}
			{showModel && (
				<LoginModel
					handleshowModel={handleshowModel}
					switchtosignUp={switchtosignUp}
					showSignUpModal={showSignUpModal}
					showLoginModal={showLoginModal}
					switchtologIn={switchtologIn}
				/>
			)}
		</>
	);
}
