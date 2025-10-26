"use client"

interface JsonDiffViewerProps {
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
}

type DiffType = "added" | "removed" | "changed" | "unchanged"

function getDiffType(path: string, differences: JsonDiffViewerProps["differences"]): DiffType {
  if (differences.added.includes(path)) return "added"
  if (differences.removed.includes(path)) return "removed"
  if (differences.changed.some((c) => c.path === path)) return "changed"
  return "unchanged"
}

function renderJsonValue(value: any, indent = 0): JSX.Element[] {
  const indentStr = "  ".repeat(indent)
  const lines: JSX.Element[] = []

  if (value === null) {
    return [
      <span key="null" className="text-purple-400">
        null
      </span>,
    ]
  }

  if (typeof value === "boolean") {
    return [
      <span key="bool" className="text-purple-400">
        {value.toString()}
      </span>,
    ]
  }

  if (typeof value === "number") {
    return [
      <span key="num" className="text-blue-400">
        {value}
      </span>,
    ]
  }

  if (typeof value === "string") {
    return [
      <span key="str" className="text-green-400">
        "{value}"
      </span>,
    ]
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [<span key="arr">[]</span>]
    }
    lines.push(<span key="arr-open">{"[\n"}</span>)
    value.forEach((item, index) => {
      lines.push(
        <span key={`arr-${index}`}>
          {indentStr}
          {"  "}
          {renderJsonValue(item, indent + 1)}
          {index < value.length - 1 ? "," : ""}
          {"\n"}
        </span>,
      )
    })
    lines.push(
      <span key="arr-close">
        {indentStr}
        {"]"}
      </span>,
    )
    return lines
  }

  if (typeof value === "object") {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return [<span key="obj">{"{}"}</span>]
    }
    lines.push(<span key="obj-open">{"{\n"}</span>)
    keys.forEach((key, index) => {
      lines.push(
        <span key={`obj-${key}`}>
          {indentStr}
          {"  "}
          <span className="text-cyan-400">"{key}"</span>
          {": "}
          {renderJsonValue(value[key], indent + 1)}
          {index < keys.length - 1 ? "," : ""}
          {"\n"}
        </span>,
      )
    })
    lines.push(
      <span key="obj-close">
        {indentStr}
        {"}"}
      </span>,
    )
    return lines
  }

  return [<span key="unknown">{String(value)}</span>]
}

function renderJsonWithDiff(
  obj: any,
  side: "left" | "right",
  differences: JsonDiffViewerProps["differences"],
  parentPath = "",
): JSX.Element {
  if (obj === null || typeof obj !== "object") {
    const diffType = getDiffType(parentPath, differences)
    const bgClass =
      side === "left"
        ? diffType === "removed"
          ? "bg-red-950/50"
          : diffType === "changed"
            ? "bg-yellow-950/50"
            : ""
        : diffType === "added"
          ? "bg-green-950/50"
          : diffType === "changed"
            ? "bg-yellow-950/50"
            : ""

    return <span className={bgClass}>{renderJsonValue(obj)}</span>
  }

  if (Array.isArray(obj)) {
    const diffType = getDiffType(parentPath, differences)
    const bgClass =
      side === "left"
        ? diffType === "removed"
          ? "bg-red-950/50"
          : diffType === "changed"
            ? "bg-yellow-950/50"
            : ""
        : diffType === "added"
          ? "bg-green-950/50"
          : diffType === "changed"
            ? "bg-yellow-950/50"
            : ""

    return (
      <span className={bgClass}>
        {"[\n"}
        {obj.map((item, index) => {
          const itemPath = `${parentPath}[${index}]`
          return (
            <span key={index}>
              {"  "}
              {renderJsonWithDiff(item, side, differences, itemPath)}
              {index < obj.length - 1 ? "," : ""}
              {"\n"}
            </span>
          )
        })}
        {"]"}
      </span>
    )
  }

  const keys = Object.keys(obj)
  return (
    <span>
      {"{\n"}
      {keys.map((key, index) => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key
        const value = obj[key]
        const diffType = getDiffType(currentPath, differences)

        const bgClass =
          side === "left"
            ? diffType === "removed"
              ? "bg-red-950/50"
              : diffType === "changed"
                ? "bg-yellow-950/50"
                : ""
            : diffType === "added"
              ? "bg-green-950/50"
              : diffType === "changed"
                ? "bg-yellow-950/50"
                : ""

        return (
          <span key={key} className={bgClass}>
            {"  "}
            <span className="text-cyan-400">"{key}"</span>
            {": "}
            {typeof value === "object" && value !== null
              ? renderJsonWithDiff(value, side, differences, currentPath)
              : renderJsonValue(value)}
            {index < keys.length - 1 ? "," : ""}
            {"\n"}
          </span>
        )
      })}
      {"}"}
    </span>
  )
}

export function JsonDiffViewer({ json1, json2, differences }: JsonDiffViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-950 border border-red-800"></div>
          <span>Removed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-950 border border-green-800"></div>
          <span>Added</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-yellow-950 border border-yellow-800"></div>
          <span>Changed</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">First JSON</h4>
          <pre className="max-h-[600px] overflow-auto rounded-md border border-gray-700 bg-gray-800 p-4 text-xs font-mono">
            <code className="text-gray-200">{renderJsonWithDiff(json1, "left", differences)}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Second JSON</h4>
          <pre className="max-h-[600px] overflow-auto rounded-md border border-gray-700 bg-gray-800 p-4 text-xs font-mono">
            <code className="text-gray-200">{renderJsonWithDiff(json2, "right", differences)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
