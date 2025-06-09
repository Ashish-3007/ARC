"use client"

import { useState } from "react"
import { Bell, Shield, CreditCard, Download, Trash2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    watchHistoryVisible: false,
  })

  return (
    <PageLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Email notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Push notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, push: e.target.checked }))}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">SMS notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, sms: e.target.checked }))}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Privacy</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Make profile visible to others</span>
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={(e) => setPrivacy((prev) => ({ ...prev, profileVisible: e.target.checked }))}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Share watch history</span>
                <input
                  type="checkbox"
                  checked={privacy.watchHistoryVisible}
                  onChange={(e) => setPrivacy((prev) => ({ ...prev, watchHistoryVisible: e.target.checked }))}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Payment Methods</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">•••• •••• •••• 1234</p>
                  <p className="text-sm text-gray-400">Expires 12/25</p>
                </div>
                <button className="text-red-400 hover:text-red-300 transition-colors">Remove</button>
              </div>
              <button className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Download className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Downloads & Storage</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Download quality</span>
                <select className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white">
                  <option>High (1080p)</option>
                  <option>Medium (720p)</option>
                  <option>Low (480p)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Storage used</span>
                <span className="text-gray-400">2.3 GB of 10 GB</span>
              </div>
              <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Clear all downloads</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
