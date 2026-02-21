"use client";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/stateful-button";
import { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success && result.data?.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
          if (result.data.accessToken) {
            localStorage.setItem('accessToken', result.data.accessToken);
          }
        }

        alert(result.message || 'Login successful!');
        window.location.href = '/mainpage';
        return;
      }

      console.error('Login failed:', result);
      alert(result.error || result.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Login</h1>
          <p className="text-gray-400">Welcome back to DevDuel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
          >
            Login
          </Button>
        </form>

        <div className="text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-400 hover:text-purple-300">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
