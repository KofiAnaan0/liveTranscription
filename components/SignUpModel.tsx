import React from "react";
import { CgClose } from "react-icons/cg";
import { SignUpForm } from "./sign-up-form";

type Props = {
	handleshowModel: () => void;
	switchtologIn: () => void;
	showLoginModal: boolean;
};

const SignUpModel = ({
	handleshowModel,
	switchtologIn,
	showLoginModal,
}: Props) => {
	return (
		<div className="flex items-center justify-center fixed inset-0 z-2000">
			{/* overlay */}
			<div
				className="absolute z-2000 top-0 w-full h-screen backdrop-filter backdrop-brightness-75 backdrop-blur-md"
				onClick={handleshowModel}
			></div>

			{/* signup form */}
			<div className="relative z-2010 top-0 w-full max-w-md flex items-center justify-center mx-4">
				<SignUpForm
					handleShowModel={handleshowModel}
					showLoginModal={showLoginModal}
					switchtologIn={switchtologIn}
				/>

				{/* close */}
				<CgClose
					onClick={handleshowModel}
					className="absolute top-[0.7rem] right-[1.4rem] w-6 h-6 cursor-pointer text-gray-800"
				/>
			</div>
		</div>
	);
};

export default SignUpModel;
