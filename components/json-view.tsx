"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JsonViewProps {
  data: any
}

export function JsonView({ data }: JsonViewProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(true)

  const formattedJson = JSON.stringify(data, null, expanded ? 2 : 0)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson)
    toast({
      title: "Copied to clipboard",
      description: "JSON data has been copied to your clipboard",
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700"
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      <pre className="max-h-[500px] overflow-auto rounded-md bg-gray-800 border border-gray-700 p-4 text-sm">
        <code className="text-gray-200">{formattedJson}</code>
      </pre>
    </div>
  )
}
