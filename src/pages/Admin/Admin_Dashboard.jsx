import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Header_Admin from "../../components/Header_Admin";

const AdminDashboard = () => {
  // Event Status Data
  const eventStatusData = [
    { name: "Claimed", value: 60, color: "#FFA500" },
    { name: "Unclaimed", value: 40, color: "#FF8C00" },
  ];

  return (
    <div className="bg-[#272727] main-content">
      {/* Header */}
      <Header_Admin />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 ">
        {/* Sidebar - Fixed Position */}
        <Sidebar_Admin />

        {/* Main Content - Adjusted Layout */}
        <div className="flex-1 p-6">
          {" "}
          {/* Adjusted margin to move content slightly left */}
          {/* Top Section: Metrics & Notifications */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {[
                "Total Users",
                "Total Reservations",
                "Total Events",
                "Completed Events",
              ].map((title, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-[#FFAB40] to-[#FFCF91] p-6 text-center shadow-lg rounded-xl h-32 flex flex-col justify-center"
                >
                  <span className="text-4xl font-bold text-black">100</span>
                  <p className="text-sm text-black">Last month</p>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="bg-[#333] p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">
                Notifications
              </h3>
            </div>
          </div>
          {/* Middle Section: Upcoming Events & Event Status */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Upcoming Events */}
            <div className="bg-[#333] p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">
                Upcoming Events
              </h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-500 text-white">
                    <th className="py-2">Event Name</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5)
                    .fill("Event Name")
                    .map((event, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-600 text-gray-300"
                      >
                        <td className="py-2">{event}</td>
                        <td>Dec 1</td>
                        <td>UST Gym</td>
                        <td>Available</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Event Status */}
            <div className="bg-[#333] p-6 rounded-lg shadow-md w-[675px]">
              <h3 className="text-lg font-bold text-white mb-3">
                EVENT STATUS
              </h3>
              <div className="bg-white rounded-full px-4 py-2 mb-4">
                <select className="w-full bg-transparent outline-none text-black cursor-pointer">
                  <option value="" disabled>
                    Select an Event
                  </option>
                  <option value="event#1">UST vs. DLSU</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={eventStatusData}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={50}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="black"
                    strokeWidth={2}
                  >
                    {eventStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {eventStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    <span className="text-white text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Bottom Section: Recent Reservations */}
          <div className="mt-6">
            <div className="bg-[#333] p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">
                Recent Reservations
              </h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-500 text-white">
                    <th>Reservation ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Event</th>
                    <th>Tier</th>
                    <th>Claim Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5)
                    .fill({
                      id: "RES123",
                      name: "John Doe",
                      role: "Attendee",
                      event: "UST Fair",
                      tier: "VIP",
                      claimDate: "Feb 20",
                      time: "10:00 AM",
                      amount: "₱500",
                      status: "Claimed",
                    })
                    .map((res, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-600 text-gray-300"
                      >
                        <td className="py-2">{res.id}</td>
                        <td>{res.name}</td>
                        <td>{res.role}</td>
                        <td>{res.event}</td>
                        <td>{res.tier}</td>
                        <td>{res.claimDate}</td>
                        <td>{res.time}</td>
                        <td>{res.amount}</td>
                        <td>{res.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
