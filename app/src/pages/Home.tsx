import Hero from "../components/hero";
import  Features  from "../components/features"
import Pricing from "../components/pricing";
import CTABanner from "../components/ctabanner";

const Home = () => {
  return (
    <div className="bg-page">
      <Hero/>
      <Features/>
      <Pricing/>
      <CTABanner/>
    </div>
    );
};


export default Home;


