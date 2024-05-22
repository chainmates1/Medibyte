import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorProfile from "./pages/DoctorProfile";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Rewards from "./pages/Rewards";
import UserProfile from "./pages/UserProfile";
import Error from "./pages/Error";

const App = () => {
  return (
    <>
      
        <Routes>
          <Route path="/" element = {<Home />} />
          <Route path="/user" element = {<UserProfile />} />
          <Route path="/admin" element = {<DoctorProfile />} />
          <Route path="/results" element = {<Results />} />
          <Route path="/rewards" element = {<Rewards />} />
          <Route path = "*" element = {<Error />}/>
        </Routes>
      
    </>
  );
}

export default App;
