import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../utils/walletUtils'; // Import the utility function
import { useUser } from '../UserContext'; // Import the user context
import { portrait } from "../assets";
import Section from "./Section";
import { BackgroundCircles, BottomLine, Gradient } from "./design/Hero";
// import { heroIcons } from "..constants";
// import { ScrollParallax } from "react-just-parallax";
import Message from "./Message";

const Hero = () => {
  const parallaxRef = useRef(null);
  const navigate = useNavigate();
  const { setAccount } = useUser(); // Get the setAccount function from context
  const [, setIsConnected] = useState(false); // Local state to manage connection status

  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6 gradient-text">
            Uncover our health services with
            <span
              className="font-semibold text-[2.6rem] leading-[3.25rem]
          md:text-[2.80rem] md:leading-[3.75rem] lg:text-[3.50rem] lg:leading-[4.0625rem] xl:text-[3.75rem] xl:leading-[4.5rem] 
          bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
            >
              {" "}
              MediByte
            </span>{" "}
            solutions
          </h1>
          <p className="body-1 max-w-3xl mx-auto mb-6 text-n-2 lg:mb-5">
            Unlock your Health Potential with Medibyte - Where Health Meets
            Innovation, Revolutionize Your Well-being with Medibyte services
            <span className="text-2xl ml-1">🩺</span>
          </p>
          <button
            onClick={() => connectWallet(setAccount, setIsConnected, navigate)}
            className="relative inline-block text-lg group mt-4"
          >
            <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
              <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
              <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
              <span className="relative font-extrabold">Get Started</span>
            </span>
            <span
              className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-400 rounded-lg group-hover:mb-0 group-hover:mr-0"
              data-rounded="rounded-lg"
            ></span>
          </button>
        </div>
        <div className="relative max-w-[23rem] mx-auto -mt-5 md:max-w-5xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />

              <div className="aspect-[33/40] rounded-b-[0.9rem] overflow-hidden md:aspect-[688/490] lg:aspect-[1024/490]">
                <img
                  src={portrait}
                  className="w-full scale-[1.7] translate-y-[8%] md:scale-[1] md:-translate-y-[10%] lg:-translate-y-[23%]"
                  width={1024}
                  height={490}
                  alt="MediByte"
                />
              </div>
            </div>

            <Gradient />
          </div>
          {/* <div className="absolute -top-[54%] left-1/2 w-[234%] -translate-x-1/2 md:-top-[46%] md:w-[138%] lg:-top-[104%]">
            <img
              src={heroBackground}
              className="w-full"
              width={1440}
              height={1800}
              alt="hero"
            />
          </div> */}
          <BackgroundCircles />
        </div>

        <Message className="hidden relative z-10 mt-20 lg:block" />
      </div>

      <BottomLine />
    </Section>
  );
};

export default Hero;
