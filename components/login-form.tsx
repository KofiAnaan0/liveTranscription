"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import SignUpModel from "./SignUpModel";

type Props = React.ComponentPropsWithoutRef<"div"> & {
	handleShowModel: () => void;
	switchtosignUp?: () => void;
	showSignUpModal?: boolean;
	switchtologIn: () => void;
	showLoginModal: boolean;
};

export function LoginForm({
	className,
	handleShowModel,
	switchtosignUp,
	showSignUpModal,
	showLoginModal,
	switchtologIn,
	...props
}: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;

			// remove login model
			handleShowModel();

			// Update this route to redirect to an authenticated route. The user already has an active session.
			router.push("/protected");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{showSignUpModal ? (
				<SignUpModel
					handleshowModel={handleShowModel}
					switchtologIn={switchtologIn}
					showLoginModal={showLoginModal}
				/>
			) : (
				<div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
					<Card className="bg-gradient-to-r from-[#E0EAFC] to-[#CFDEF3]">
						<CardHeader>
							<CardTitle className="text-2xl">Login</CardTitle>
							<CardDescription>
								Enter your email below to login to your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleLogin}>
								<div className="flex flex-col gap-6">
									<div className="grid gap-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											required
											value={email}
											onChange={(e) =>
												setEmail((e.target as HTMLInputElement).value)
											}
										/>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="password">Password</Label>
											<Link
												href="/auth/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</Link>
										</div>
										<Input
											id="password"
											type="password"
											required
											value={password}
											onChange={(e) =>
												setPassword((e.target as HTMLInputElement).value)
											}
										/>
									</div>
									{error && <p className="text-sm text-red-500">{error}</p>}
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? "Logging in..." : "Login"}
									</Button>
								</div>
								<div className="mt-4 text-center text-sm">
									Don&apos;t have an account?{" "}
									<button
										onClick={switchtosignUp}
										className="underline underline-offset-4 hover:shadow-xl hover:shadow-black/60 hover:rotate-1 hover:scale-110 transform transition-all duration-150 cursor-pointer"
									>
										Sign up
									</button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
}
