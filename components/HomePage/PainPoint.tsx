import React from "react";
import P from "../ui/P";
import H2 from "../ui/H2";
import { Button } from "../ui/Button";
import Section from "../ui/Section";
import Main from "../ui/Main";

const PainPoint = () => {
	return (
		<Section>
			<Main data-aos="fade-up">
				{/* title */}
				<H2>
					Stop Getting Ghosted After Applications. Tagi AI Finds, Applies &
					Follows Up So Recruiters Respond
				</H2>

				{/* description */}
				<div className="space-y-4 flex flex-col items-center justify-center">
					{/* pain */}
					<P className="max-w-3xl mx-auto">
						Tired of endlessly scrolling through hundreds of job listings only
						to find most are irrelevant or out of reach? Spending hours
						customizing each application, only to hear nothing back, can drain
						your motivation and leave you frustrated. Traditional job boards
						flood you with overwhelming options but provide little guidance,and
						manual applications often get lost in automated screening systems.
					</P>

					{/* solution */}
					<P className="max-w-3xl mx-auto">
						Tagi AI transforms your job search by automating the entire process
						from start to finish. It intelligently scans thousands of
						opportunities to find the perfect matches based on your skills and
						goals. Then, it crafts tailored, ATS-optimized resumes and cover
						letters designed to get past automated filters and catch recruiters’
						attention. Finally, Tagi AI manages follow-ups to keep you top of
						mind—helping you skip the endless wait and land real interviews
						faster than ever before.
					</P>
				</div>

				{/* CTA */}
				<div className="flex items-center justify-center">
					<Button>Try for Free</Button>
				</div>
			</Main>
		</Section>
	);
};

export default PainPoint;
