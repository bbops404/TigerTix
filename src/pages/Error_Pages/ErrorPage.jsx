import React from "react";

const errorMap = {
  400: {
    title: "Bad Request",
    message: "The server could not understand your request.",
  },
  401: {
    title: "Unauthorized",
    message: "You are not authorized to view this page.",
  },
  403: {
    title: "Forbidden",
    message: "Access to this resource is denied.",
  },
  404: {
    title: "Not Found",
    message: "The page you are looking for does not exist.",
  },
  500: {
    title: "Internal Server Error",
    message: "Something went wrong on our end.",
  },
  502: {
    title: "Bad Gateway",
    message: "Received an invalid response from the upstream server.",
  },
  503: {
    title: "Service Unavailable",
    message: "The server is currently unavailable. Please try again later.",
  },
  504: {
    title: "Gateway Timeout",
    message: "The server took too long to respond.",
  },
};

const ErrorPage = ({ code = 404, title, message }) => {
  const error = errorMap[code] || {};
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-100 text-gray-800">
      <h1 className="text-7xl font-bold mb-4">{code}</h1>
      <h2 className="text-3xl font-semibold mb-2">{title || error.title || "Error"}</h2>
      <p className="text-lg mb-6">{message || error.message || "An error occurred."}</p>
      <a href="/" className="text-blue-500 underline">Go Home</a>
    </div>
  );
};

export default ErrorPage;
