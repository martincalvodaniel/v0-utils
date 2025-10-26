"use server"

import { get, isEqual, isObject } from "lodash"

// Function to fetch JSON from a URL
async function fetchJson(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`URL did not return JSON: ${url}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching JSON: ${error.message}`)
    }
    throw new Error("Unknown error occurred while fetching JSON")
  }
}

// Function to parse JSON string
function parseJsonString(jsonString: string, label: string) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${error instanceof Error ? error.message : "Parse error"}`)
  }
}

// Function to get all paths in an object
function getPaths(obj: any, parentPath = ""): string[] {
  if (!isObject(obj)) {
    return [parentPath]
  }

  return Object.entries(obj).flatMap(([key, value]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    if (Array.isArray(value)) {
      // For arrays, include the array itself and its items with indices
      const arrayPaths = [currentPath]
      value.forEach((item, index) => {
        if (isObject(item)) {
          arrayPaths.push(...getPaths(item, `${currentPath}[${index}]`))
        } else {
          arrayPaths.push(`${currentPath}[${index}]`)
        }
      })
      return arrayPaths
    }

    if (isObject(value)) {
      return getPaths(value, currentPath)
    }

    return [currentPath]
  })
}

// Function to find differences between two objects
function findDifferences(obj1: any, obj2: any) {
  const paths1 = getPaths(obj1)
  const paths2 = getPaths(obj2)

  const added = paths2.filter((path) => !paths1.includes(path))
  const removed = paths1.filter((path) => !paths2.includes(path))

  // Find changed values (paths that exist in both but have different values)
  const commonPaths = paths1.filter((path) => paths2.includes(path))
  const changed = commonPaths
    .map((path) => {
      const value1 = get(obj1, path)
      const value2 = get(obj2, path)

      if (!isEqual(value1, value2)) {
        return { path, value1, value2 }
      }
      return null
    })
    .filter(Boolean) as Array<{ path: string; value1: any; value2: any }>

  return {
    added,
    removed,
    changed,
  }
}

// Main function to compare JSON from two URLs
export async function compareJsonUrls(url1: string, url2: string) {
  // Validate URLs
  try {
    new URL(url1)
    new URL(url2)
  } catch (error) {
    throw new Error("Please enter valid URLs")
  }

  // Fetch JSON from both URLs
  const [json1, json2] = await Promise.all([fetchJson(url1), fetchJson(url2)])

  // Find differences
  const differences = findDifferences(json1, json2)

  // Check if they are identical
  const identical =
    differences.added.length === 0 && differences.removed.length === 0 && differences.changed.length === 0

  return {
    json1,
    json2,
    differences,
    identical,
  }
}

// Function to compare JSON strings directly
export async function compareJsonDirect(jsonString1: string, jsonString2: string) {
  // Parse JSON strings
  const json1 = parseJsonString(jsonString1, "First JSON")
  const json2 = parseJsonString(jsonString2, "Second JSON")

  // Find differences
  const differences = findDifferences(json1, json2)

  // Check if they are identical
  const identical =
    differences.added.length === 0 && differences.removed.length === 0 && differences.changed.length === 0

  return {
    json1,
    json2,
    differences,
    identical,
  }
}
