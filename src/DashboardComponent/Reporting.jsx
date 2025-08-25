import React from 'react'
import { BarChart3 } from 'lucide-react'

const Reporting = () => {
  return (
    <>
    <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reporting</h3>
      <p className="text-gray-600 mb-4">Advanced analytics and reporting features.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
        <p className="text-blue-800 text-sm">🚀 Coming Soon!</p>
      </div>
    </div>
  </div>
    </>
  )
}

export default Reporting