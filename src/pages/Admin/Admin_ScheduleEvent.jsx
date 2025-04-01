import React from "react";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";

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
