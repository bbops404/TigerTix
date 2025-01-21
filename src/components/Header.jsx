import React, { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(data);
        setFilterData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFilter = (value) => {
    const res = filterData.filter((f) =>
      f.name.toLowerCase().includes(value.toLowerCase())
    );
    setData(res);
  };

  return (
    <div>
      <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-md">
        <img src={tigertix_logo} className="w-40" alt="Tigertix Logo" />

        <div className="search-top relative">
          <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-xl border-2 border-[#D8DADC] h-8 w-[700px] transition-all duration-200 ease-in-out focus-within:border-yellow-800">
            <FaSearch className="w-5 h-5 text-gray-400 transition-colors duration-200 ease-in-out" />
            <input
              type="text"
              className="focus:border-none focus:outline-none text-sm w-[700px] text-gray-600 focus:text-gray-700 transition-colors duration-200 ease-in-out"
              placeholder="Search"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </div>
          {isFocused && data.length > 0 && (
            <div className="search-result absolute top-full left-0 w-[700px] bg-white shadow-lg border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto">
              {data.map((d, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {d.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-5">
          <button className="font-Poppins text-[15px] font-medium bg-[#2D2D2D] p-2 px-7 rounded-xl text-white">
            LOGIN
          </button>
          <button className="font-Poppins text-[15px] font-medium bg-white p-2 px-7 rounded-xl text-[#2D2D2D]">
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
