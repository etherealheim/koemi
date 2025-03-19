"use client"

import TailwindEditor from "@/components/editor/advanced-editor"

export default function EditorTestPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Document Editor</h1>
          <TailwindEditor />
        </div>
      </div>
    </main>
  )
}