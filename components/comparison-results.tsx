"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { JsonView } from "@/components/json-view"
import { JsonDiffViewer } from "@/components/json-diff-viewer"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface ComparisonResultsProps {
  results: {
    json1: any
    json2: any
    differences: {
      added: string[]
      removed: string[]
      changed: Array<{
        path: string
        value1: any
        value2: any
      }>
    }
    identical: boolean
  }
}

export function ComparisonResults({ results }: ComparisonResultsProps) {
  const [activeTab, setActiveTab] = useState("differences")
  const { toast } = useToast()
  const { json1, json2, differences, identical } = results
  const { added, removed, changed } = differences

  const totalDifferences = added.length + removed.length + changed.length

  const copyToClipboard = (value: any, label: string) => {
    const text = JSON.stringify(value, null, 2)
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied`,
    })
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Comparison Results</CardTitle>
          {identical ? (
            <Badge className="bg-green-600 text-white">Identical</Badge>
          ) : (
            <Badge className="bg-red-600 text-white">{totalDifferences} Differences</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="differences" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Differences
            </TabsTrigger>
            <TabsTrigger value="json1" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              First JSON
            </TabsTrigger>
            <TabsTrigger value="json2" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Second JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="differences" className="space-y-6 py-4">
            {identical ? (
              <div className="rounded-md bg-green-950 p-4 text-center text-green-400 border border-green-800">
                The JSON responses are identical
              </div>
            ) : (
              <>
                {/* Side-by-side diff view */}
                <JsonDiffViewer json1={json1} json2={json2} differences={differences} />

                {/* Detailed changes list */}
                <div className="space-y-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-medium text-gray-200">Detailed Changes</h3>

                  {added.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-200">Added in second JSON:</h4>
                      <ul className="space-y-1 rounded-md bg-green-950 border border-green-800 p-3">
                        {added.map((path) => (
                          <li key={path} className="text-sm text-green-400">
                            <code>{path}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {removed.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-200">Removed in second JSON:</h4>
                      <ul className="space-y-1 rounded-md bg-red-950 border border-red-800 p-3">
                        {removed.map((path) => (
                          <li key={path} className="text-sm text-red-400">
                            <code>{path}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {changed.length > 0 && (
                    <div className="space-y-3 rounded-md bg-yellow-950 border border-yellow-800 p-3">
                      {changed.map((item) => (
                        <div key={item.path} className="space-y-1">
                          <div className="text-sm font-medium text-yellow-400">
                            <code>{item.path}</code>
                          </div>
                          <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-800 p-2 text-xs">
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-medium text-gray-400">First JSON:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                  onClick={() => copyToClipboard(item.value1, "First JSON value")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <code className="block whitespace-pre-wrap break-all text-gray-200">
                                {JSON.stringify(item.value1, null, 2)}
                              </code>
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-medium text-gray-400">Second JSON:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                  onClick={() => copyToClipboard(item.value2, "Second JSON value")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <code className="block whitespace-pre-wrap break-all text-gray-200">
                                {JSON.stringify(item.value2, null, 2)}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="json1">
            <JsonView data={json1} />
          </TabsContent>

          <TabsContent value="json2">
            <JsonView data={json2} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
