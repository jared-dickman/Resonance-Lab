import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { DOMParser } from "linkedom"

interface SongLine {
  chord?: { name: string } | null
  lyric: string
}

interface SongSection {
  name: string
  lines: SongLine[]
}

interface SongData {
  artist: string
  title: string
  sections: SongSection[]
}

function flattenText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

function normalizeLyric(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
}

function chordEntriesFromElement(element: Element): SongLine[] {
  const chords: { name: string; column: number }[] = []
  const lines: string[] = []
  let currentLine = ""
  let column = 0

  const pushLine = () => {
    lines.push(currentLine)
    currentLine = ""
    column = 0
  }

  const writeText = (text: string) => {
    for (const ch of text) {
      if (ch === "\r") {
        continue
      }
      if (ch === "\n") {
        pushLine()
      } else {
        currentLine += ch
        column += 1
      }
    }
  }

  const visit = (node: ChildNode | null) => {
    if (!node) {
      return
    }
    if (node.nodeType === node.TEXT_NODE) {
      writeText(node.textContent ?? "")
      return
    }
    if (node.nodeType === node.ELEMENT_NODE) {
      const el = node as Element
      if (el.classList?.contains("chord")) {
        const chordName = flattenText(el.textContent)
        if (chordName) {
          chords.push({ name: chordName, column })
          writeText(chordName)
        }
        return
      }
      for (const child of Array.from(el.childNodes)) {
        visit(child)
      }
    }
  }

  for (const child of Array.from(element.childNodes)) {
    visit(child)
  }
  pushLine()

  const lyricLine = lines.slice(1).find((line) => line.trim().length > 0) ?? ""
  const lyricLength = lyricLine.length

  if (!chords.length && !lyricLine.trim()) {
    return []
  }

  if (!chords.length) {
    return [{ chord: null, lyric: normalizeLyric(lyricLine) }]
  }

  const entries: SongLine[] = []
  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i]
    const next = chords[i + 1]
    const start = Math.min(chord.column, lyricLength)
    const end = next ? Math.min(Math.max(next.column, start), lyricLength) : lyricLength
    const fragment = normalizeLyric(lyricLine.slice(start, end))
    entries.push({ chord: { name: chord.name }, lyric: fragment })
  }

  return entries
}

export function parseChordsToJSON(htmlContent: string): SongData {
  const document = new DOMParser().parseFromString(htmlContent, "text/html")
  const result: SongData = {
    artist: "Unknown Artist",
    title: "Unknown Song",
    sections: []
  }

  const titleElement = document.querySelector("title")
  const titleMatch = titleElement?.textContent?.match(/(.+?)\s+Chords\s+by\s+(.+)/i)
  if (titleMatch) {
    result.title = flattenText(titleMatch[1]).replace(/['"]/g, "")
    result.artist = flattenText(titleMatch[2])
  }

  if (result.artist === "Unknown Artist") {
    const fallbackArtist = document.querySelector("h1 span.font-bold")?.textContent
    if (fallbackArtist) {
      result.artist = flattenText(fallbackArtist)
    }
  }

  const pre = document.querySelector(".tab-content pre")
  if (!pre) {
    return result
  }

  let currentSection: SongSection | null = null
  const sections = result.sections

  const ensureSection = (name: string) => {
    if (currentSection && currentSection.name === name) {
      return
    }
    currentSection = { name, lines: [] }
    sections.push(currentSection)
  }

  const defaultSection = "Intro"

  const addLines = (lines: SongLine[]) => {
    if (!lines.length) {
      return
    }
    if (!currentSection) {
      ensureSection(defaultSection)
    }
    currentSection!.lines.push(...lines)
  }

  const processTextNode = (text: string) => {
    const segments = text.replace(/\r/g, "\n").split(/\n/)
    for (const segment of segments) {
      const trimmed = segment.trim()
      if (!trimmed) {
        continue
      }
      const sectionMatch = trimmed.match(/^\[(.+?)\]$/)
      if (sectionMatch) {
        ensureSection(sectionMatch[1])
      } else {
        addLines([{ chord: null, lyric: normalizeLyric(segment) }])
      }
    }
  }

  const nodes = Array.from(pre.childNodes)
  for (const node of nodes) {
    if (node.nodeType === node.TEXT_NODE) {
      processTextNode(node.textContent ?? "")
    } else if (node.nodeType === node.ELEMENT_NODE) {
      const el = node as Element
      if (el.classList.contains("gtab")) {
        addLines(chordEntriesFromElement(el))
        continue
      }
      if (el.tagName === "BR") {
        continue
      }
      if (el.classList.contains("chord")) {
        // skip standalone chord indicators without lyrics
        continue
      }
      addLines(chordEntriesFromElement(el))
    }
  }

  return result
}

async function main() {
  const [, , inputPath, outputPath] = process.argv
  if (!inputPath) {
    console.error("Usage: songify.ts <chords.html> [output.json]")
    process.exitCode = 1
    return
  }

  const html = await fs.readFile(inputPath, "utf8")
  const song = parseChordsToJSON(html)
  const json = JSON.stringify(song, null, 2)

  if (outputPath) {
    await fs.writeFile(outputPath, json, "utf8")
  } else {
    process.stdout.write(json)
  }
}

const modulePath = fileURLToPath(import.meta.url)
const entryPath = path.resolve(process.argv[1] ?? "")
if (modulePath === entryPath) {
  main().catch((error) => {
    console.error("songify failed:", error)
    process.exitCode = 1
  })
}
