import React from "react";
import { LoginForm } from "./login-form";
import { CgClose } from "react-icons/cg";

type Props = {
	handleshowModel: () => void;
	switchtosignUp: () => void;
	showSignUpModal: boolean;
	switchtologIn: () => void;
	showLoginModal: boolean;
};

const LoginModel = ({
	handleshowModel,
	switchtosignUp,
	showSignUpModal,
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

			{/* login form */}
			<div className="relative z-2010 top-0 w-full max-w-md flex items-center justify-center mx-4">
				<LoginForm
					handleShowModel={handleshowModel}
					switchtosignUp={switchtosignUp}
					showSignUpModal={showSignUpModal}
					switchtologIn={switchtologIn}
					showLoginModal={showLoginModal}
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

export default LoginModel;
