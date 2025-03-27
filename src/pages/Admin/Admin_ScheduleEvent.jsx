import React from "react";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Header_Admin from "../../components/Header_Admin";

const Admin_ScheduleEvent = () => {
  return (
    <div className="bg-[#272727] main-content font-Poppins">
      {" "}
      <Header_Admin />
      <div className="flex">
        <Sidebar_Admin />
      </div>
    </div>
  );
};

export default Admin_ScheduleEvent;
