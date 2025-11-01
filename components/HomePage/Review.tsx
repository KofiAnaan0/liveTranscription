import React from "react";
import Main from "../ui/Main";
import Section from "../ui/Section";
import H2 from "../ui/H2";
import ReviewCard from "../helper/ReviewCard";
import { Button } from "../ui/Button";
import Grid from "../ui/Grid";
import { reviewData } from "@/data/reviewData";

const Review = () => {
  return (
    <Section className="bg-gray-200">
      <Main data-aos="fade-up">
        <H2>Hear it From Our Clients</H2>

        {/* Review grid */}
        <Grid className="lg:grid-cols-4 cursor-pointer">
          {/* Render ReviewCard components */}
          {reviewData.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              data-aos-anchor-placement="top-center"
            />
          ))}
        </Grid>

        {/* CAT */}
        <div className="flex items-center justify-center">
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openChatWidget"));
            }}
          >
            Call Us
          </Button>
        </div>
      </Main>
    </Section>
  );
};

export default Review;
