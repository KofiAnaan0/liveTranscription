import React from "react";
import Section from "../ui/Section";
import Main from "../ui/Main";
import H2 from "../ui/H2";
import P from "../ui/P";
import MainGrid from "../ui/MainGrid";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import { inputData } from "@/data/inputData";

const Contact = () => {
	return (
		<Section className="mb-0">
			<Main data-aos="fade-up" className="bg-[#169976] lg:w-[73%] rounded-md p-6">
				{/* title */}
				<H2>Get In Touch</H2>

				{/* description */}
				<P className="max-w-2xl mx-auto">
					Have questions or need a demo? Our team is here to help you get
					started fast.
				</P>

				{/* Contact Form Placeholder */}
				<MainGrid data-aos="fade-up" data-aos-delay="150">
					<div>
						{inputData.map((item) => (
							<Input
								key={item.id}
								type={item.type}
								placeholder={item.placeholder}
								className={item.className}
							/>
						))}
					</div>
					<div className="h-full">
						<textarea
							placeholder="Your Message"
							className="w-full bg-gray-400 rounded-md py-2 px-4 mb-4 hover:bg-gray-500 transition-all duration-150 h-full"
						/>
					</div>
				</MainGrid>

				{/* Submit Button */}
				<div className="flex items-center justify-center max-w-3xl mx-auto">
					<Button>Send Message</Button>
				</div>
			</Main>
		</Section>
	);
};

export default Contact;
