import React from "react";
import Hero from "./HomePage/Hero";
import Approach from "./HomePage/Approach";
import Contact from "./HomePage/Contact";

const Home = () => {
	return (
		<div className="w-full space-y-20">
			<Hero />
			<Approach />
			<Contact />
		</div>
	);
};

export default Home;
