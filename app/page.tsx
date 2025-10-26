import { ComparisonForm } from "@/components/comparison-form"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">JSON Comparison Tool</h1>
            <p className="mt-4 text-lg text-gray-400">
              Compare JSON responses from URLs or paste your JSON directly to find differences!
            </p>
          </div>

          <ComparisonForm />
        </div>
      </div>
      <Toaster />
    </div>
  )
}
