import React from "react";
import Success from "./Success";

const SuccessModel = () => {
	return (
		<div className="flex items-center justify-center fixed inset-0 z-2000">
			{/* overlay */}
			<div className="absolute z-2000 top-0 w-full h-screen backdrop-filter backdrop-brightness-75 backdrop-blur-md"></div>

			{/* signup form */}
			<div className="relative z-2010 top-0 w-full max-w-md flex items-center justify-center mx-4">
				<Success />
			</div>
		</div>
	);
};

export default SuccessModel;
