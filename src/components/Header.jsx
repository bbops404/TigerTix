import React, { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import { FaSearch, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Header = ({ toggleLoginPopup, showSearch = true, showAuthButtons = true }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setFilterData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFilter = (value) => {
    const res = filterData.filter((f) => f.name.toLowerCase().includes(value.toLowerCase()));
    setData(res);
  };

  return (
    <div className="bg-custom_yellow py-3 px-5 md:px-8 flex items-center justify-between font-Poppins shadow-2xl w-full z-50 relative flex-nowrap">
      <Link to="/" className="flex items-center flex-shrink-0">
        <img src={tigertix_logo} className="w-20 md:w-40 transition-transform duration-300 hover:scale-105" alt="Tigertix Logo" />
      </Link>

      {showSearch && (
        <div className="relative flex-grow mx-2 flex justify-center max-w-xs md:max-w-lg">
          <div className="bg-white flex px-2 py-2 items-center rounded-xl border-2 border-gray-300 h-10 w-full">
            <FaSearch className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="focus:outline-none text-sm w-full px-2 text-gray-600"
              placeholder="Search"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </div>
          {isFocused && data.length > 0 && (
            <div className="text-black absolute top-full left-1/2 transform -translate-x-1/2 w-full max-w-xs md:max-w-lg bg-white shadow-lg border border-gray-200 rounded-lg mt-1 h-40 overflow-y-auto z-50">
              {data.map((d, i) => (
                <div key={i} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {d.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center">
        {showAuthButtons && (
          <div className="hidden md:flex gap-4">
            <button
              onClick={toggleLoginPopup}
              className="text-sm font-medium bg-gray-800 text-white py-2 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:text-custom_yellow"
            >
              LOGIN
            </button>
            <button
              onClick={() => navigate("/verify")}
              className="text-sm font-medium bg-white text-gray-800 py-2 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:text-yellow-600"
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center ml-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 text-2xl">
            <FaBars />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-16 right-5 bg-white shadow-lg border rounded-lg p-4 flex flex-col gap-2 md:hidden z-50">
          <button
            onClick={toggleLoginPopup}
            className="text-sm font-medium bg-[#D7D7D7] text-gray-800 py-2 px-6 rounded-xl hover:scale-105 hover:shadow-lg hover:text-yellow-600"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/verify")}
            className="text-sm font-medium bg-gray-800 text-white py-2 px-6 rounded-xl hover:scale-105 hover:shadow-lg hover:text-custom_yellow"
          >
            SIGN UP
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
