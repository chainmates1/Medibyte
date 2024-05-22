import ButtonGradient from "../assets/svg/ButtonGradient";
import Header from "../components/header";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden"> 
        {/* configure lg:pt-[0.1rem] to your needs, original was 5.25rem */}
       <Header />
       <Hero /> 
      </div>
      <ButtonGradient />
    </>
  );
}

export default Home;
