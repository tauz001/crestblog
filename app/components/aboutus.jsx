import React from "react"
import {Users, Flag, Heart} from "lucide-react"

export default function AboutUs() {
  return (
    <section className="bg-white py-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">About CrestBlog</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">CrestBlog is a community-driven publishing platform where writers share practical knowledge, stories and perspectives. We believe that good writing should be discoverable, readable, and delightful — from quick tips to long-form guides. Our editorial approach values clarity, useful examples, and empathy for readers.</p>
        </div>

        {/* Core pillars */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Community First</h3>
            <p className="mt-2 text-sm text-gray-600">We build features and write content with the community in mind. Everyone is welcome to contribute and collaborate — whether you're a first-time writer or a seasoned creator.</p>
          </div>

          <div className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 mb-4">
              <Flag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Our Mission</h3>
            <p className="mt-2 text-sm text-gray-600">To make knowledge sharing simple and accessible; to help creators reach readers who care about their work. We champion transparency, reproducibility, and practical guidance.</p>
          </div>

          <div className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Built with Care</h3>
            <p className="mt-2 text-sm text-gray-600">We prioritize readability, accessibility and performance. Content is formatted for clarity and mobile-first reading experiences.</p>
          </div>
        </div>

        {/* History + Values */}
        <div className="mt-16 grid gap-10 md:grid-cols-2 items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
            <p className="mt-4 text-gray-600">CrestBlog started as a small collection of tutorials and personal essays. Over time it grew into a collaborative space where people share technical deep-dives, thoughtful essays, and everyday tips. We grew deliberately, focusing on quality and community feedback rather than chasing rapid growth.</p>
            <p className="mt-4 text-gray-600">Today, CrestBlog hosts contributors from a wide range of backgrounds — engineers, designers, writers and hobbyists — all contributing knowledge that helps others learn and grow.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900">What We Value</h3>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mr-3">
                  <strong>1</strong>
                </span>
                Clear, actionable content that readers can apply immediately.
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mr-3">
                  <strong>2</strong>
                </span>
                Respectful discourse and constructive feedback for authors.
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mr-3">
                  <strong>3</strong>
                </span>
                Accessibility and performance to reach the widest possible audience.
              </li>
            </ul>
          </div>
        </div>

        {/* Team */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center">Meet the Team</h3>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">A small, focused team helping to keep the platform friendly and useful.</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Minimal team cards; you can replace with real images */}
            {[
              {name: "Aisha Khan", role: "Editor"},
              {name: "Mark Chen", role: "Lead Engineer"},
              {name: "Sara Ali", role: "Product"},
              {name: "Ravi Singh", role: "Community"},
            ].map(person => (
              <div key={person.name} className="p-4 border rounded-lg text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-semibold">
                  {person.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </div>
                <h4 className="mt-3 font-semibold text-gray-900">{person.name}</h4>
                <p className="text-sm text-gray-600">{person.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
          <div className="mt-6 space-y-4">
            <details className="p-4 border rounded-lg border-emerald-600">
              <summary className="font-medium text-gray-900">Is there moderation?</summary>
              <p className="mt-2 text-gray-600">We have basic moderation for spam and abuse. Community reports help us prioritize reviews.</p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Ready to share your story?</h3>
          <p className="mt-3 text-gray-600">Join our community and publish your first post in minutes.</p>
          <div className="mt-6 flex items-center justify-center space-x-3">
            <a href="/write" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Write a Post
            </a>
            <a href="/signup" className="inline-flex items-center px-6 py-3 border border-emerald-600 rounded-lg hover:bg-gray-50 transition-colors text-emerald-600">
              Create an Account
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
