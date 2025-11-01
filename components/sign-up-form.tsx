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
import { LoginForm } from "./login-form";

type Props = React.ComponentPropsWithoutRef<"div"> & {
	handleShowModel: () => void;
	switchtologIn: () => void;
	showLoginModal: boolean;
};

export function SignUpForm({
	className,
	handleShowModel,
	showLoginModal,
	switchtologIn,
	...props
}: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		if (password !== repeatPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/protected`,
				},
			});
			if (error) throw error;

			// remove signup modal
			handleShowModel();

			// show success
			router.push("/auth/sign-up-success");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{showLoginModal ? (
				<LoginForm
					handleShowModel={handleShowModel}
					switchtologIn={switchtologIn}
					showLoginModal={showLoginModal}
				/>
			) : (
				<div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
					<Card className="bg-gradient-to-r from-[#E0EAFC] to-[#CFDEF3]">
						<CardHeader>
							<CardTitle className="text-2xl">Sign up</CardTitle>
							<CardDescription>Create a new account</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSignUp}>
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
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="repeat-password">Repeat Password</Label>
										</div>
										<Input
											id="repeat-password"
											type="password"
											required
											value={repeatPassword}
											onChange={(e) =>
												setRepeatPassword((e.target as HTMLInputElement).value)
											}
										/>
									</div>
									{error && <p className="text-sm text-red-500">{error}</p>}
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? "Creating an account..." : "Sign up"}
									</Button>
								</div>
								<div className="mt-4 text-center text-sm">
									Already have an account?{" "}
									<button
										onClick={switchtologIn}
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
