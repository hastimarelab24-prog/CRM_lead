import React from 'react'

const colorMap = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Qualified: 'bg-purple-50 text-purple-700 border-purple-200',
  'Proposal Sent': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Nurturing: 'bg-orange-50 text-orange-700 border-orange-200',
  Won: 'bg-green-50 text-green-700 border-green-200',
  Lost: 'bg-red-50 text-red-700 border-red-200',
};


export default function StatusBadge([status]) {
  return (
    <div className={`px-2.5 py-1 text-xs font-semibold border rounded-full${colorMap[status] || 'bg-gray-50'}`}>{status}</div>
  )
}
