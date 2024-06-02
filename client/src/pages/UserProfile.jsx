import React from "react";
import SubHeader from "../components/SubHeader";
import ProfileCard from "../components/ProfileCard";
import UserForm from "../components/UserForm";

const UserProfile = () => {
  return (
    <div className="container mx-auto p-4">
      <SubHeader />
      <br />
      <div className="flex flex-col md:flex-row mt-8">
        <div className="w-full md:w-1/3 p-4">
          <ProfileCard />
        </div>
        <div className="w-full md:w-2/3 p-4">
          <UserForm />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
