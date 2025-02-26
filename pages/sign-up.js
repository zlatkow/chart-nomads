"use client";
import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Noise from "../components/Noise"; // Your existing component
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";

const Signup = () => {
  const { isLoaded, signUp } = useSignUp();  // ✅ Ensure Clerk is loaded
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log("Signup component mounted");
  }, []);

  // ✅ Validate Password Complexity
  const validatePassword = (password) => {
    setPasswordValidations({
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  };

  // ✅ OAuth Sign-In Handler (Google, Facebook)
  const handleOAuthSignIn = async (provider) => {
    if (!isLoaded) return;  // ✅ Prevent running before Clerk loads

    try {
      await signUp.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("OAuth Sign-In Error:", err);
      setError("Failed to sign in with " + provider);
    }
  };

  // ✅ Handle Form Field Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (name === "password") validatePassword(value);
  };

  // Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isLoaded) return;

  setLoading(true);
  setError(null);

  try {
    const result = await signUp.create({
      emailAddress: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
    });

    console.log("Clerk Signup Result:", result);

    if (result.status === "complete") {
      // 🔹 Store user in Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: result.id, // Clerk user ID
            email: form.email,
            first_name: form.firstName,
            last_name: form.lastName,
          },
        ]);

      if (error) {
        console.error("Error inserting user into Supabase:", error);
      } else {
        console.log("User inserted into Supabase:", data);
      }

      // Redirect to onboarding
      // window.location.href = "/onboarding-1";
    } else if (result.status === "needs_verification") {
      setError("A verification email has been sent to your email.");
    } else {
      setError("Signup failed. Please try again.");
    }
  } catch (err) {
    console.error("Signup Error:", err);
    setError(err.errors?.[0]?.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  

  return (

      <><div className='fixed top-0 left-0 w-full h-[7px] bg-[rgba(231,231,231,0.05)] flex'>
      <div className='h-full w-[20%] bg-[#EDB900]'></div>
      <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
      <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
      <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
      <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
    </div><div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_bottom_right,_#EDB900_1%,_#6f5908_22%,_#0f0f0f_53%)] text-white">
        <Noise />
        <div className="w-full max-w-lg p-12 bg-[#0f0f0f] rounded-lg shadow-md z-50">
          <h2 className="mt-5 text-4xl text-[#EDB900]">GET STARTED!</h2>
          <p className="text-sm text-400 mb-8">Use your social profile to register.</p>

          {/* OAuth Buttons */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="w-full h-[45px] flex items-center justify-center space-x-3 border border-white-500 p-3 rounded-lg text-white transition-all duration-100 ease-in-out hover:border-[#EDB900] hover:-translate-y-1 hover:-translate-x-1">
            <Image 
            src="/icons/google.svg" 
            alt="Google" 
            width={24} 
            height={24} 
            className="w-6 h-6" 
            />
            <span className="text-xs px-9">Continue with Google</span>
          </button>
          <button
            onClick={() => handleOAuthSignIn("facebook")}
            className="w-full h-[45px] flex items-center justify-center space-x-3 border border-white-500 p-3 rounded-lg text-white transition-all duration-100 ease-in-out hover:border-[#EDB900] hover:-translate-y-1 hover:-translate-x-1 mt-3">
            <Image 
            src="/icons/facebook.svg" 
            alt="Facebook" 
            width={24} 
            height={24} 
            className="w-6 h-6" 
            />
            <span className="text-xs px-7">Continue with Facebook</span>
          </button>

          <div className="flex items-center justify-center my-10">
            <hr className="w-2/3 border-white-600" />
            <span className="mx-2 text-white-400 text-3xl font-[balboa] px-5">OR</span>
            <hr className="w-2/3 border-600" />
          </div>

          {/* Signup Form */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <div className="w-full">
                <label className="block text-sm font-medium mb-3">First Name</label>
                <input type="text" name="firstName" placeholder="e.g. Howard" value={form.firstName} onChange={handleChange} className="w-full p-3 border border-gray-500 rounded-lg bg-white text-black h-[45px] text-xs" required />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-3">Last Name</label>
                <input type="text" name="lastName" placeholder="e.g. Thurman" value={form.lastName} onChange={handleChange} className="w-full p-3 border border-gray-500 rounded-lg bg-white text-black h-[45px] text-xs" required />
              </div>

            </div>
            <label className="block text-sm font-medium my-3">Email</label>
            <input type="email" name="email" placeholder="e.g. howard.thurman@email.com" value={form.email} onChange={handleChange} className="w-full p-3 border border-gray-500 rounded-lg bg-white text-black h-[45px] text-xs" required />
            <label className="block text-sm font-medium my-3">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full h-[45px] p-3 border border-gray-500 rounded-lg bg-white text-black text-xs" required />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password Strength Validation */}
            <div className="text-xs grid grid-cols-2 mb-5 mt-3">
              <p className={passwordValidations.length ? "text-400 font-[balboa]" : "text-500 font-[balboa]"}>
                {passwordValidations.length ? <FaCheckCircle className="inline mx-2 text-green-400" /> : <FaTimesCircle className="inline mx-2 text-red-500" />}
                Minimum 8 characters
              </p>
              <p className={passwordValidations.number ? "text-400 font-[balboa]" : "text-500 font-[balboa]"}>
                {passwordValidations.number ? <FaCheckCircle className="inline mx-2 text-green-400" /> : <FaTimesCircle className="inline mx-2 text-red-500" />}
                At least one number
              </p>
              <p className={passwordValidations.lowercase ? "text-400 font-[balboa]" : "text-500 font-[balboa]"}>
                {passwordValidations.lowercase ? <FaCheckCircle className="inline mx-2 text-green-400" /> : <FaTimesCircle className="inline mx-2 text-red-500" />}
                At least one lowercase letter
              </p>
              <p className={passwordValidations.uppercase ? "text-400 font-[balboa]" : "text-500 font-[balboa]"}>
                {passwordValidations.uppercase ? <FaCheckCircle className="inline mx-2 text-green-400" /> : <FaTimesCircle className="inline mx-2 text-red-500" />}
                At least one uppercase letter
              </p>
            </div>
            <div className="flex items-center my-10">
              <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={handleChange} className="mr-2 accent-yellow-500" required />
              <span className="text-xs">I agree to the <span className="text-xs text-[#EDB900] hover:opacity-70">Terms of Service</span> and <span className="text-xs text-[#EDB900] hover:opacity-70">Privacy Policy</span></span>
            </div>
            <div id="clerk-captcha"></div>
            <button id="registerButton" type="submit" className="h-[45px] w-full p-3 bg-[#EDB900] text-black font-bold uppercase rounded-lg hover:opacity-70 font-[balboa]" disabled={loading || !form.agreeToTerms}>
              {loading ? "REGISTER" : "REGISTER"}
            </button>
          </form>
          <p className="text-sm text-center mt-5">Already have an account? <Link href="/login" className="text-[#EDB900] hover:opacity-70">Log in</Link></p>
        </div>
      </div></>
  );
};

export default Signup;
