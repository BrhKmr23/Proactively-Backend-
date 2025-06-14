'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  title: string
  fields: FormField[]
}

interface FormSubmission {
  [key: string]: string | boolean | number
}

export default function FormSubmission({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Form | null>(null)
  const [submission, setSubmission] = useState<FormSubmission>({})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchForm()
  }, [params.id])

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setForm(data)

      // Initialize submission object with empty values
      const initialSubmission: FormSubmission = {}
      data.fields.forEach((field: FormField) => {
        initialSubmission[field.id] = field.type === 'checkbox' ? false : ''
      })
      setSubmission(initialSubmission)
    } catch (error: any) {
      console.error('Error fetching form:', error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('form_submissions')
        .insert([
          {
            form_id: form?.id,
            user_id: user.id,
            data: submission,
          },
        ])

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleInputChange = (fieldId: string, value: string | boolean | number) => {
    setSubmission((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  if (!form) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">{form.title}</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields?.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      id={field.id}
                      value={submission[field.id] as string}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.id}
                      value={submission[field.id] as string}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      id={field.id}
                      value={submission[field.id] as number}
                      onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value))}
                      required={field.required}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  )}
                  {field.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={submission[field.id] as boolean}
                      onChange={(e) => handleInputChange(field.id, e.target.checked)}
                      required={field.required}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      id={field.id}
                      value={submission[field.id] as string}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 