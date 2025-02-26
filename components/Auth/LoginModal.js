"use client";
import React, { useState} from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const LoginModal = ({ isOpen, onClose }) => {
  const { signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp] = useState(false);

  const handleOAuthSignIn = async (provider) => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/dashboard", // Replace with your correct redirect
        redirectUrlComplete: "/dashboard", // Where users land after successful login
        preferPopup: true, // ✅ Forces the authentication to open in a popup
      });
    } catch (err) {
      setError("Failed to sign in with " + provider);
      console.error("OAuth Error:", err);
    }
  };
  
  

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await signUp.create({ emailAddress: email, password });
        if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
        } else {
          setError("Sign-up failed, please try again.");
        }
      } else {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
        } else {
          setError("Invalid credentials.");
        }
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] text-white p-12 rounded-lg shadow-lg w-full max-w-lg border border-goldenTransparent relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-white text-2xl">✕</button>
        <div className="mb-6 text-center">
          <img src="/logo.webp" alt="Chart Nomads" className="w-40 mb-10 mt-5 mx-auto" />
          <h2 className="text-4xl text-[#EDB900] text-left">{isSignUp ? "Create an account" : "Welcome back!"}</h2>
          <p className="text-xs mt-2 text-left">{isSignUp ? "Join us now!" : "Please enter your details."}</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleAuth}>
          <label id="emailLabel" className="block text-md font-balboa mb-3 mt-3">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[45px] p-3 border border-gray-500 rounded-lg bg-white text-black text-xs
            focus:outline-none focus:ring-0 focus:border-[#EDB900]
            focus:shadow-[rgb(155, 132, 1)_0px_1px_2px_0px]"
            required
          />
          <label id="passwordLabel" className="block text-md font-balboa mb-3 mt-3">Password</label>
          <div className="relative mt-0">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[45px] p-3 border border-gray-500 rounded-lg bg-white text-black text-xs
              focus:outline-none focus:ring-0 focus:border-[#EDB900]
              focus:shadow-[rgba(155, 132, 1, 0.5)_0px_1px_2px_0px]"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-left mt-5 mb-5">
            Forgot password? <span className="text-[#EDB900] cursor-pointer hover:opacity-70">Click here.</span>
          </p>
          <button
            type="submit"
            className="w-full h-[45px] bg-[#EDB900] text-black font-bold uppercase rounded-lg transition hover:opacity-70 font-[balboa]"
            disabled={loading}
          >
            {isSignUp ? "Sign Up" : "LOGIN"}
          </button>
        </form>
        <div className="flex items-center justify-center my-6">
          <hr className="w-[45%] border-500 transition-all duration-300 ease-in-out hover:border-[#EDB900]" />
          <span id="loginModalSeparator"className="mx-3 text-400 text-3xl font-medium px-3">OR</span>
          <hr className="w-[45%] border-500 transition-all duration-300 ease-in-out hover:border-[#EDB900]" />
        </div>
        <button
          onClick={() => handleOAuthSignIn("google")}
          className="w-full h-[45px] flex items-center justify-center space-x-3 border border-white-500 p-3 rounded-lg text-white transition-all duration-100 ease-in-out hover:border-[#EDB900] hover:-translate-y-1 hover:-translate-x-1"
        >
          <Image 
            src="/icons/google.svg" 
            alt="Google" 
            width={24} 
            height={24} 
            className="w-6 h-6" 
            />
          <span className="px-9">Sign in with Google</span>
        </button>
        <button
          onClick={() => handleOAuthSignIn("facebook")}
          className="w-full h-[45px] flex items-center justify-center space-x-3 border border-white-500 p-3 rounded-lg text-white transition-all duration-100 ease-in-out hover:border-[#EDB900] hover:-translate-y-1 hover:-translate-x-1 mt-3"
        >
          <Image 
            src="/icons/facebook.svg" 
            alt="Facebook" 
            width={24} 
            height={24} 
            className="w-6 h-6" 
            />
          <span className="px-7">Sign in with Facebook</span>
        </button>
        <p className="text-xs text-center mt-10">
          Don&apos;t have an account? 
          <Link href="/sign-up" className="ml-2 text-[#EDB900] cursor-pointer hover:opacity-70">
            Sign up for free.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;