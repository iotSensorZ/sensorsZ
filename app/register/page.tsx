'use client'
import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth"; 
import { auth } from "@/firebase/firebase"; // Adjust the path as needed
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RegisterPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            
            localStorage.setItem(
                "registrationData",
                JSON.stringify({
                    firstName,
                    lastName,
                    email
                })
            );

            setMessage("Registration successful! Please check your email to verify your account.");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

        } catch (err: any) {
            setError(err.message);
            console.log(err.message);
        }
    };

    return (
        <div className="bg-gradient-to-b from-gray-500 to-black flex justify-center items-center h-screen w-screen">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
                {error && <p className="text-red-600 mb-4">{error}</p>}
                {message && <p className="text-green-600 mb-4">{message}</p>}
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label htmlFor="firstName" className="text-sm font-medium block mb-2">
                                First Name
                            </label>
                            <Input
                                type="text"
                                id="firstName"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="lastName" className="text-sm font-medium block mb-2">
                                Last Name
                            </label>
                            <Input
                                type="text"
                                id="lastName"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium block mb-2">
                            Email
                        </label>
                        <Input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label htmlFor="password" className="text-sm font-medium block mb-2">
                                Password
                            </label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
                                Confirm Password
                            </label>
                            <Input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Sign Up/Register</Button>
                </form>
                <p className="text-sm font-medium text-gray-700 mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-700 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
