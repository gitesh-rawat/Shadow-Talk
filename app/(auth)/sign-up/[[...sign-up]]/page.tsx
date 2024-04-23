"use client"

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  // start the sign up process.
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    if (!emailAddress.endsWith("@dseu.ac.in")) {
      setErrorMessage("Use an Email affiliated with DSEU please!");
      return;
    }
 
    try {
      await signUp.create({
        emailAddress,
        password,
      });
 
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
 
  // This verifies the user using email code that is delivered.
  const onPressVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
 
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        /*  investigate the response, to see if there was an error
         or if the user needs to complete more steps.*/
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push("/onboarding");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
 
  return (
    <div className="flex justify-center items-center bg-gray-100 rounded-md">
      {errorMessage && (
        <div className="text-red-500 mb-4">{errorMessage}</div>
      )}
      {!pendingVerification && (
        <div className="glowing-form-bg bg-white p-10 rounded-lg shadow-lg">
        <p className="text-3xl mb-6 text-center text-primary-500 font-semibold">
          Welcome to Shadow Talk
        </p>
        <form className="flex flex-col space-y-4">
          <div className="flex flex-col">
              <label htmlFor="email" className="text-lg font-medium text-gray-700">Email:</label>
              <div>
                <input
                  onChange={(e) => setEmailAddress(e.target.value)}
                  id="email"
                  name="email"
                  type="email"
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none"
                  placeholder="Enter your DSEU email"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className=" text-lg font-medium text-gray-700">Password:</label>
              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none"
                  placeholder="Create a password"
                />
                <img
                  src={showPassword ? "/assets/open-eye.svg" : "/assets/closed-eye.svg"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer w-6 h-6"
                  onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
            </div>
          <Button onClick={handleSubmit} className="bg-primary-500 text-white font-semibold py-2 rounded-md hover:bg-primary-600 transition duration-300">Sign up</Button>
        </form>
        </div>
      )}
      {pendingVerification && (
        <div className="glowing-form-bg bg-white p-10 rounded-lg shadow-lg">
          <form className="flex flex-col items-center space-y-4">
            <input
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none"
              value={code}
              placeholder="Enter Verification Code"
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={onPressVerify}className="bg-primary-500 text-white font-semibold py-2 rounded-md hover:bg-primary-600 transition duration-300">
              Verify Email
            </button>
          </form>
        </div>
      )}
      <style jsx>{`
        .glowing-form-bg {
          animation: glowing 1500ms infinite alternate;
        }

        @keyframes glowing {
          from {
            box-shadow: 0 0 10px 0 rgba(29, 155, 209, 0.8);
          }
          to {
            box-shadow: 0 0 20px 10px rgba(29, 155, 209, 0.8);
          }
        }
      `}</style>
    </div>
  );
}