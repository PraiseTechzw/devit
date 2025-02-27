/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { ArrowRight, BookOpen, Brain, CheckCircle, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[#2D3748]">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                  Your Academic Success, Organized Digitally
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  Streamline your study materials, boost productivity, and achieve better results with StudPal's
                  intelligent organization system.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-[#319795] hover:bg-[#2C7A7B]">
                  Start Organizing - Free Forever
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-full min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#319795] to-[#2D3748] rounded-lg opacity-20 animate-pulse" />
                <img
                  alt="App screenshot"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="400"
                  src="/placeholder.svg"
                  width="600"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#2D3748]">How StudPal Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Transform your academic journey with our intelligent organization system
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 bg-[#319795]/10 rounded-full">
                <BookOpen className="w-6 h-6 text-[#319795]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3748]">Collect</h3>
              <p className="text-center text-gray-500">
                Easily import notes, PDFs, and web links into one secure location
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 bg-[#319795]/10 rounded-full">
                <Brain className="w-6 h-6 text-[#319795]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3748]">Organize</h3>
              <p className="text-center text-gray-500">
                Smart tagging and AI-powered categorization for effortless management
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 bg-[#319795]/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-[#319795]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3748]">Achieve</h3>
              <p className="text-center text-gray-500">
                Track progress and meet deadlines with our smart calendar system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#2D3748]">
                  See StudPal in Action
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experience how StudPal transforms your study materials into an organized digital library
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="gap-2 bg-[#319795] hover:bg-[#2C7A7B]">
                  Try Interactive Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Laptop className="w-full h-auto text-[#2D3748]" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#2D3748]">Trusted by Students</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See how StudPal is helping students achieve their academic goals
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-4 p-6 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    alt={`Student ${i}`}
                    className="rounded-full"
                    height="40"
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: "40/40",
                      objectFit: "cover",
                    }}
                    width="40"
                  />
                  <div>
                    <h3 className="font-bold text-[#2D3748]">Student Name</h3>
                    <p className="text-sm text-gray-500">University Name</p>
                  </div>
                </div>
                <p className="text-gray-500">
                  "StudPal has completely transformed how I organize my study materials. It's intuitive and powerful!"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#2D3748]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">Ready to Get Started?</h2>
              <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students already using StudPal to achieve their academic goals
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-[#319795] hover:bg-[#2C7A7B]">
                Start Organizing - Free Forever
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-[#1A202C]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">© 2024 StudPal. All rights reserved.</p>
            <div className="flex gap-4">
              <Link className="text-gray-400 hover:text-gray-200" href="#">
                Privacy Policy
              </Link>
              <Link className="text-gray-400 hover:text-gray-200" href="#">
                Terms of Service
              </Link>
              <Link className="text-gray-400 hover:text-gray-200" href="#">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

