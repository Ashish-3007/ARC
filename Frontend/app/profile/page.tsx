"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, CreditCard } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleSave = () => {
    // In a real app, update user profile
    setIsEditing(false)
  }

  return (
    <PageLayout title="Profile">
      <div className="max-w-4xl mx-auto">
        {/* Remove the h1 title */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white">{user?.email}</p>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Member since Jan 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">5 purchases</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-gray-300">Email notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-gray-300">Auto-play trailers</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
