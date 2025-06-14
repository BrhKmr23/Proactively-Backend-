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

export default function FormEditor({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Form | null>(null)
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    required: false,
  })
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
    } catch (error: any) {
      console.error('Error fetching form:', error.message)
    }
  }

  const addField = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    try {
      const field: FormField = {
        id: crypto.randomUUID(),
        type: newField.type || 'text',
        label: newField.label || '',
        required: newField.required || false,
        options: newField.type === 'select' ? [] : undefined,
      }

      const updatedFields = [...(form.fields || []), field]
      const { error } = await supabase
        .from('forms')
        .update({ fields: updatedFields })
        .eq('id', form.id)

      if (error) throw error

      setForm({ ...form, fields: updatedFields })
      setNewField({ type: 'text', label: '', required: false })
    } catch (error: any) {
      console.error('Error adding field:', error.message)
    }
  }

  const removeField = async (fieldId: string) => {
    if (!form) return

    try {
      const updatedFields = form.fields.filter((field) => field.id !== fieldId)
      const { error } = await supabase
        .from('forms')
        .update({ fields: updatedFields })
        .eq('id', form.id)

      if (error) throw error

      setForm({ ...form, fields: updatedFields })
    } catch (error: any) {
      console.error('Error removing field:', error.message)
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

  if (!form) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Form Editor: {form.title}</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Dashboard
              </button>
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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Add New Field</h2>
            <form onSubmit={addField} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="field-type" className="block text-sm font-medium text-gray-700">
                    Field Type
                  </label>
                  <select
                    id="field-type"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="field-label" className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    id="field-label"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="field-required" className="ml-2 block text-sm text-gray-900">
                  Required
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Field
              </button>
            </form>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Form Fields</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {form.fields?.map((field) => (
                  <li key={field.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{field.label}</p>
                        <p className="text-sm text-gray-500">Type: {field.type}</p>
                        {field.required && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeField(field.id)}
                        className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
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