import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorProfile from "./pages/DoctorProfile";
import Home from "./pages/Home";
import Rewards from "./pages/Rewards";
import UserProfile from "./pages/UserProfile";
import Error from "./pages/Error";
import TestResult from './pages/TestResult';
import { UserProvider } from "./UserContext";

const App = () => {
  return (
      <UserProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/admin" element={<DoctorProfile />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/patient/:address" element={<TestResult />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </UserProvider>
  );
}

export default App;
