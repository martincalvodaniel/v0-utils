"use client"

import type React from "react"

import { useState } from "react"
import { compareJsonUrls, compareJsonDirect } from "@/actions/compare-json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonResults } from "@/components/comparison-results"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ComparisonForm() {
  const [inputMode, setInputMode] = useState<"urls" | "direct">("urls")
  const [url1, setUrl1] = useState("")
  const [url2, setUrl2] = useState("")
  const [json1, setJson1] = useState("")
  const [json2, setJson2] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inputMode === "urls") {
      if (!url1 || !url2) {
        toast({
          title: "Missing URLs",
          description: "Please enter both URLs to compare",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!json1 || !json2) {
        toast({
          title: "Missing JSON",
          description: "Please paste both JSON objects to compare",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      let result
      if (inputMode === "urls") {
        result = await compareJsonUrls(url1, url2)
      } else {
        result = await compareJsonDirect(json1, json2)
      }
      setResults(result)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare JSON",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-gray-800 bg-gray-900 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "urls" | "direct")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="urls" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                From URLs
              </TabsTrigger>
              <TabsTrigger value="direct" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Direct JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="urls" className="space-y-4">
              <div>
                <label htmlFor="url1" className="block text-sm font-medium text-gray-300">
                  First URL
                </label>
                <Input
                  id="url1"
                  type="url"
                  placeholder="https://api.example.com/data1"
                  value={url1}
                  onChange={(e) => setUrl1(e.target.value)}
                  className="mt-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="url2" className="block text-sm font-medium text-gray-300">
                  Second URL
                </label>
                <Input
                  id="url2"
                  type="url"
                  placeholder="https://api.example.com/data2"
                  value={url2}
                  onChange={(e) => setUrl2(e.target.value)}
                  className="mt-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="direct" className="space-y-4">
              <div>
                <label htmlFor="json1" className="block text-sm font-medium text-gray-300">
                  First JSON
                </label>
                <Textarea
                  id="json1"
                  placeholder='{"key": "value", "array": [1, 2, 3]}'
                  value={json1}
                  onChange={(e) => setJson1(e.target.value)}
                  className="mt-1 min-h-[150px] border-gray-700 bg-gray-800 font-mono text-sm text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="json2" className="block text-sm font-medium text-gray-300">
                  Second JSON
                </label>
                <Textarea
                  id="json2"
                  placeholder='{"key": "value2", "array": [1, 2, 4]}'
                  value={json2}
                  onChange={(e) => setJson2(e.target.value)}
                  className="mt-1 min-h-[150px] border-gray-700 bg-gray-800 font-mono text-sm text-white placeholder:text-gray-500"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare JSON"
            )}
          </Button>
        </form>
      </Card>

      {results && <ComparisonResults results={results} />}
    </div>
  )
}
