'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Form {
  id: string
  title: string
  created_at: string
  created_by: string
}

export default function UserDashboard() {
  const [forms, setForms] = useState<Form[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
    } catch (error: any) {
      console.error('Error fetching forms:', error.message)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error: any) {
      console.error('Error logging out:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">User Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Available Forms</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {forms.map((form) => (
                  <li key={form.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{form.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => router.push(`/forms/${form.id}`)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Fill Form
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Created at: {new Date(form.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 