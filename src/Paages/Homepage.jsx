import React from 'react'
import Hero from '../Components/Hero'
import FeaturedListings from '../Components/FeaturesListing'
import LocationHighlights from '../Components/LocationHighlight'
import VideoPropertyTours from '../Components/VideoPropertyTour'
import TestimonialsSuccessStories from '../Components/Testimonies'
import MarketTrendsInsights from '../Components/MarketTrends'
import WhyChooseUs from '../Components/WhyChooseUs'

const Homepage = () => {
  return (
    <>
    <Hero />
    <FeaturedListings />
    <LocationHighlights />
    <VideoPropertyTours />
    <TestimonialsSuccessStories />
    <MarketTrendsInsights />
    <WhyChooseUs />
    </>
  )
}

export default Homepage