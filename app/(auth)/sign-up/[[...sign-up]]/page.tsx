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
    <div>
      {/* Rendering error message */}
      {errorMessage && (
        <div style={{ color: 'red' }}>{errorMessage}</div>
      )}
      {!pendingVerification && (
        <div style={{ backgroundColor: '#14213d', padding: '60px', borderRadius: '15px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <p className="flex flex-col items-center mb-10 text-primary-500"  style={{ fontSize: '30px'}}>
          Welcome to Shadow Talk
        </p>
        <form className="flex flex-col ">
          <div className="flex-col w-full gap-3">
              <label htmlFor="email" className="text-light-1" style={{ fontSize: '30px', fontWeight: 500 }}>Email:</label>
              <div>
                <input
                  onChange={(e) => setEmailAddress(e.target.value)}
                  id="email"
                  name="email"
                  type="email"
                  className="no-focus rounded h-10"
                  placeholder="Enter your DSEU email"
                  style={{ fontSize: '24px', fontWeight: 350}}
                />
              </div>
            </div>
            <div className="flex-col w-full gap-3 mt-5">
              <label htmlFor="password" className=" text-light-2"  style={{ fontSize: '30px', fontWeight: 500 }}>Password:</label>
              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="no-focus rounded h-10"
                  placeholder="Create a password"
                  style={{ fontSize: '24px', fontWeight: 350 }}
                />
                <img
                  src={showPassword ? "/assets/open-eye.svg" : "/assets/closed-eye.svg"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-12 transform -translate-y-1/2 cursor-pointer w-6 h-6"
                  onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
            </div>
          <Button onClick={handleSubmit} className="bg-primary-500 mt-10"  style={{ fontSize: '24px', fontWeight: 'bold' }}>Sign up</Button>
        </form>
        </div>
      )}
      {pendingVerification && (
        <div>
          <form className="flex flex-col items-center">
            <input
              className="h-6 rounded p-7 border-4 border-gray-1 mb-4"
              value={code}
              placeholder="Enter Verification Code"
              onChange={(e) => setCode(e.target.value)}
              style={{ fontSize: '24px', fontWeight: 500 }}
            />
            <button onClick={onPressVerify}className="flex flex-col bg-primary-500 rounded p-2 text-light-1" style={{ fontSize: '24px', fontWeight: 500 }}>
              Verify Email
            </button>
          </form>
        </div>
      )}
    </div>
  );
}