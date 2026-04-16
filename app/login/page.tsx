"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence,  browserLocalPersistence  } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {motion} from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    }
  };
  

  return (
    <motion.div
     initial={{opacity:0,y:30}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.5 ,ease:"easeOut"}}
    className="min-h-screen flex flex-col items-center justify-center bg-gray-900 min-h-screen font-sans text-white p-4">
      
      <motion.h1
      initial={{opacity:0,y:20}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.5 ,ease:"easeOut"}}
    className="text-2xl font-semibold text-white mb-6 text-center">Login</motion.h1>
<motion.div
initial={{opacity:0,y:20}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.5 ,ease:"easeOut"}}
    className="w-full max-w-md bg-[#111827] rounded-2xl shadow-xl p-8">
      
      <input
        className="text-white px-4 py-3 border border-gray-700 mb-4 w-full rounded-lg bg-[#1f2937] focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input 
        className="text-white px-4 py-3 border border-gray-700 mb-4 w-full rounded-lg bg-[#1f2937] focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <motion.button 
      whileHover={{scale:1.02}}
      whileTap={{scale:0.98}}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleLogin}
      className=" w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-300">
        Login
      </motion.button>Don't have an account?{" "}
      <a href="/signup" className="text-blue-500 hover:underline">
        Sign up
      </a>
      </motion.div>
    </motion.div>
  );
}
