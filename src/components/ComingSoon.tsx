"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, Github } from "lucide-react";
import Image from "next/image";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ComingSoonPage = () => {
  // Set the launch date (September 1, 2025, 00:00:00 UTC)
  const launchDate = new Date("2025-09-01T00:00:00Z").getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState("");

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, [launchDate]);

  // Handle newsletter subscription (placeholder)
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter a valid email address");
      return;
    }
    alert(`Subscribed with email: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/dashboard.png" // Replace with your logo
            alt="Logo"
            width={120}
            height={120}
            className="w-24 h-24 sm:w-32 sm:h-32"
          />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-center mb-6">
          Coming Soon
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-center mb-8 max-w-md">
          We&apos;re launching something amazing! Stay tuned for the big reveal.
        </p>

        {/* Countdown Timer */}
        <div
          className="grid grid-cols-4 gap-4 sm:gap-6 mb-10"
          role="timer"
          aria-label="Countdown to launch"
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-sm sm:text-base uppercase">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
            <span className="text-sm sm:text-base uppercase">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
            <span className="text-sm sm:text-base uppercase">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-sm sm:text-base uppercase">Seconds</span>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:w-auto text-black"
            required
            aria-label="Email for newsletter subscription"
          />
          <Button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            aria-label="Subscribe to newsletter"
          >
            Notify Me
          </Button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/20 py-6">
        <div className="flex justify-center space-x-6">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300"
            aria-label="Visit our Facebook page"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300"
            aria-label="Visit our Twitter page"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300"
            aria-label="Visit our Instagram page"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300"
            aria-label="Visit our GitHub page"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
        <p className="text-center mt-4 text-sm">
          &copy; 2025 Qwik Technology. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ComingSoonPage;
