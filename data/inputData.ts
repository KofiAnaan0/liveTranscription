import { InputProps } from "@/types/input";

export const inputData: InputProps[] = [
	{
		id: "name",
		type: "text",
		placeholder: "Name",
	},
	{
		id: "email",
		type: "email",
		placeholder: "Email",
	},
	{
		id: "subject",
		type: "text",
		placeholder: "Subject",
		className: "mb-0", // No margin bottom for the subject input
	},
];
