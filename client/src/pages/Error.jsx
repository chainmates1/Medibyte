import React from "react";
import Header from "../components/header";
import ProfileCard from "../components/ProfileCard";
import UserForm from "../components/UserForm";

const UserProfile = () => {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <br />
      <br />
      <div className="flex flex-col md:flex-row mt-8">
        <div className="h1 w-full">
          Invalid Route!
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
