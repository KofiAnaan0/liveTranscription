import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";

const Success = () => {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-md">
				<div className="flex flex-col gap-6">
					<Card className="bg-gradient-to-r from-[#E0EAFC] to-[#CFDEF3]">
						<CardHeader>
							<CardTitle className="text-2xl">
								Thank you for signing up!
							</CardTitle>
							<CardDescription>Check your email to confirm</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								You&apos;ve successfully signed up. Please check your email to
								confirm your account before signing in.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Success;
