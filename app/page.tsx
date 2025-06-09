"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Download, RefreshCw, Sparkles, FileText, Table, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginButton } from '@/components/auth/LoginButton'
import ReactMarkdown from "react-markdown"

interface Product {
  name: string
  url: string
  description: string
}

interface ComparisonSettings {
  tone: string
  format: string
  layout: string
  sections: string[]
  customSections: string
}

const defaultSections = [
  "Features & Functionality",
  "Pricing & Plans",
  "User Experience & Interface",
  "Integrations & Compatibility",
  "Performance & Reliability",
  "Security & Privacy",
  "Customer Support",
  "Pros & Cons",
  "Ideal Use Cases",
  "Final Recommendation",
]

const toneOptions = [
  { value: "neutral", label: "Neutral & Objective" },
  { value: "detailed", label: "Detailed & Technical" },
  { value: "concise", label: "Concise & Brief" },
  { value: "business", label: "Business-Focused" },
  { value: "consumer", label: "Consumer-Friendly" },
]

const formatOptions = [
  { value: "markdown", label: "Markdown" },
  { value: "structured", label: "Structured Text" },
  { value: "table", label: "Comparison Table" },
  { value: "report", label: "Executive Report" },
]

const layoutOptions = [
  { value: "side-by-side", label: "Side-by-Side Comparison" },
  { value: "sequential", label: "Sequential Analysis" },
  { value: "matrix", label: "Feature Matrix" },
]

export default function ProductComparisonTool() {
  const [productA, setProductA] = useState<Product>({ name: "", url: "", description: "" })
  const [productB, setProductB] = useState<Product>({ name: "", url: "", description: "" })
  const [settings, setSettings] = useState<ComparisonSettings>({
    tone: "neutral",
    format: "markdown",
    layout: "side-by-side",
    sections: defaultSections,
    customSections: "",
  })
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [comparisonPreview, setComparisonPreview] = useState("")
  const { toast } = useToast()
  const { isAuthenticated, user, logout, authError } = useAuth()
  const [productAError, setProductAError] = useState<string | null>(null)
  const [productBError, setProductBError] = useState<string | null>(null)
  const [touchedA, setTouchedA] = useState(false)
  const [touchedB, setTouchedB] = useState(false)
  const [productAUrlError, setProductAUrlError] = useState<string | null>(null)
  const [productBUrlError, setProductBUrlError] = useState<string | null>(null)
  const [touchedAUrl, setTouchedAUrl] = useState(false)
  const [touchedBUrl, setTouchedBUrl] = useState(false)
  const [formatError, setFormatError] = useState<string | null>(null)
  const [sectionsError, setSectionsError] = useState<string | null>(null)
  const [touchedFormat, setTouchedFormat] = useState(false)
  const [touchedSections, setTouchedSections] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [comparisonResult, setComparisonResult] = useState<string | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)

  // Auto-save and recovery using localStorage
  const AUTO_SAVE_KEY = 'product-comparison-autosave-v1';
  const isFirstLoad = useRef(true);

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.productA) setProductA(parsed.productA);
        if (parsed.productB) setProductB(parsed.productB);
        if (parsed.settings) setSettings(parsed.settings);
      } catch {}
    }
    isFirstLoad.current = false;
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (isFirstLoad.current) return;
    localStorage.setItem(
      AUTO_SAVE_KEY,
      JSON.stringify({ productA, productB, settings })
    );
  }, [productA, productB, settings]);

  // Clear saved data
  const clearAutoSave = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    setProductA({ name: "", url: "", description: "" });
    setProductB({ name: "", url: "", description: "" });
    setSettings({
      tone: "neutral",
      format: "markdown",
      layout: "side-by-side",
      sections: defaultSections,
      customSections: "",
    });
    setGeneratedPrompt("");
    setComparisonPreview("");
    toast({ title: "Auto-save cleared", description: "All saved data has been reset." });
  };

  const handleSectionToggle = (section: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sections: checked ? [...prev.sections, section] : prev.sections.filter((s) => s !== section),
    }))
  }

  const validateProductA = (name: string) => {
    if (!name.trim()) return 'Product A name is required.'
    return null
  }

  const validateProductB = (name: string) => {
    if (!name.trim()) return 'Product B name is required.'
    return null
  }

  const validateUrl = (url: string) => {
    if (!url.trim()) return null; // Allow empty
    try {
      new URL(url);
      return null;
    } catch {
      return 'Please enter a valid URL (including https://)';
    }
  };

  const validateFormat = (format: string) => {
    if (!format) return 'Please select a comparison format.';
    return null;
  };

  const validateSections = (sections: string[], customSections: string) => {
    const allSections = [...sections];
    if (customSections.trim()) {
      allSections.push(...customSections.split(',').map(s => s.trim()).filter(Boolean));
    }
    if (allSections.length === 0) return 'Please select at least one comparison section.';
    return null;
  };

  const generateSideBySidePrompt = () => {
    const toneDescription = toneOptions.find((t) => t.value === settings.tone)?.label || "neutral"
    const formatDescription = formatOptions.find((f) => f.value === settings.format)?.label || "Markdown"
    const layoutDescription = layoutOptions.find((l) => l.value === settings.layout)?.label || "Side-by-Side"

    const allSections = [...settings.sections]
    if (settings.customSections.trim()) {
      allSections.push(
        ...settings.customSections
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      )
    }

    let layoutInstructions = ""
    if (settings.layout === "side-by-side") {
      layoutInstructions = `
**Layout Requirements:**
- Create a side-by-side comparison table format
- Use two columns: one for ${productA.name} and one for ${productB.name}
- Each row should represent a comparison category
- Include clear headers and organized sections
- Use consistent formatting for easy scanning`
    } else if (settings.layout === "matrix") {
      layoutInstructions = `
**Layout Requirements:**
- Create a feature matrix with products as columns
- Use checkmarks (✓), X marks (✗), or ratings for quick comparison
- Group related features together
- Include a summary row for each major category`
    } else {
      layoutInstructions = `
**Layout Requirements:**
- Analyze each product sequentially within each category
- Provide direct comparisons and contrasts
- Use clear headings and subheadings for organization`
    }

    const prompt = `You are a professional product comparison analyst. Create a comprehensive ${layoutDescription.toLowerCase()} between these two products:

**Product A:** ${productA.name}${productA.url ? ` (${productA.url})` : ""}${productA.description ? `\nDescription: ${productA.description}` : ""}

**Product B:** ${productB.name}${productB.url ? ` (${productB.url})` : ""}${productB.description ? `\nDescription: ${productB.description}` : ""}

**Analysis Requirements:**
- **Analysis Style:** ${toneDescription}
- **Output Format:** ${formatDescription}
- **Comparison Layout:** ${layoutDescription}
${layoutInstructions}

**Comparison Categories:**
${allSections.map((section, index) => `${index + 1}. ${section}`).join("\n")}

**Specific Guidelines:**
${generateDynamicGuidelines(allSections)
  .map((guideline) => `- ${guideline}`)
  .join("\n")}

**Expected Output Structure:**
1. Executive Summary (${layoutDescription.toLowerCase()} overview)
2. Detailed comparison ${formatDescription.toLowerCase()} for each category
3. Key differentiators and unique selling points
4. Recommendation based on different use cases

Please ensure the comparison is thorough, balanced, and presented in a format that makes it easy to compare the products at a glance.`

    return prompt

    // After the allSections array is built, add this function to generate dynamic guidelines:
    function generateDynamicGuidelines(sections: string[]) {
      const guidelines: string[] = [
        "Research current, accurate information about both products",
        "Include specific examples and data points where possible",
        "Maintain objectivity while highlighting key differentiators",
      ]

      // Add section-specific guidelines based on selected sections
      if (sections.includes("Features & Functionality")) {
        guidelines.push("Provide detailed feature comparisons with specific capabilities and limitations")
      }

      if (sections.includes("Pricing & Plans")) {
        guidelines.push("Include specific pricing numbers, plan tiers, and total cost of ownership")
      }

      if (sections.includes("User Experience & Interface")) {
        guidelines.push("Include screenshots or detailed UI/UX descriptions and usability comparisons")
      }

      if (sections.includes("Integrations & Compatibility")) {
        guidelines.push("Consider integration capabilities and ecosystem compatibility")
      }

      if (sections.includes("Performance & Reliability")) {
        guidelines.push("Include performance metrics, uptime statistics, and reliability data")
      }

      if (sections.includes("Security & Privacy")) {
        guidelines.push("Address security protocols, compliance standards, and privacy policies")
      }

      if (sections.includes("Customer Support")) {
        guidelines.push("Include support channel availability, response times, and user satisfaction")
      }

      if (sections.includes("Pros & Cons")) {
        guidelines.push("Present balanced advantages and disadvantages for each product")
      }

      if (sections.includes("Ideal Use Cases")) {
        guidelines.push("Address different user personas and specific use case scenarios")
      }

      if (sections.includes("Final Recommendation")) {
        guidelines.push("Provide actionable decision-making guidance based on different needs")
      }

      // Add guidelines for custom sections
      const customSections = settings.customSections.trim()
      if (customSections) {
        guidelines.push("Address the custom comparison categories with relevant details and examples")
      }

      return guidelines
    }
  }

  const generateComparisonPreview = () => {
    if (!productA.name || !productB.name) return ""

    const preview = `# ${productA.name} vs ${productB.name} Comparison

| Category | ${productA.name} | ${productB.name} |
|----------|${"-".repeat(productA.name.length + 2)}|${"-".repeat(productB.name.length + 2)}|
| **Overview** | [Product A details] | [Product B details] |
| **Pricing** | [Pricing info] | [Pricing info] |
| **Key Features** | [Features list] | [Features list] |
| **Best For** | [Use cases] | [Use cases] |

## Quick Comparison
- **Winner in Features:** [Analysis]
- **Winner in Price:** [Analysis]  
- **Winner in UX:** [Analysis]

## Recommendation
[Final recommendation based on different user needs]`

    return preview
  }

  const generatePrompt = () => {
    setTouchedA(true)
    setTouchedB(true)
    setTouchedAUrl(true)
    setTouchedBUrl(true)
    setTouchedFormat(true)
    setTouchedSections(true)
    const errorA = validateProductA(productA.name)
    const errorB = validateProductB(productB.name)
    const urlErrorA = validateUrl(productA.url)
    const urlErrorB = validateUrl(productB.url)
    const formatErr = validateFormat(settings.format)
    const sectionsErr = validateSections(settings.sections, settings.customSections)
    setProductAError(errorA)
    setProductBError(errorB)
    setProductAUrlError(urlErrorA)
    setProductBUrlError(urlErrorB)
    setFormatError(formatErr)
    setSectionsError(sectionsErr)
    if (errorA || errorB || urlErrorA || urlErrorB || formatErr || sectionsErr) {
      toast({
        title: "Missing or Invalid Information",
        description: "Please complete all required fields and fix errors before generating a prompt.",
        variant: "destructive",
      })
      return
    }

    const prompt = generateSideBySidePrompt()
    const preview = generateComparisonPreview()

    setGeneratedPrompt(prompt)
    setComparisonPreview(preview)
    setActiveTab("output")

    toast({
      title: "Prompt Generated",
      description: "Your side-by-side comparison prompt has been created!",
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard successfully.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${productA.name}-vs-${productB.name}-comparison-prompt.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Prompt saved as markdown file.",
    })
  }

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      let yPos = 30

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(`${productA.name || "Product A"} vs ${productB.name || "Product B"} - Comparison Report`, margin, yPos)
      yPos += 15

      // Date
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos)
      yPos += 8

      // Settings summary
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Comparison Settings:", margin, yPos)
      yPos += 8
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`• Tone: ${toneOptions.find((t) => t.value === settings.tone)?.label || "Neutral & Objective"}`, margin, yPos)
      yPos += 6
      doc.text(`• Format: ${formatOptions.find((f) => f.value === settings.format)?.label || "Markdown"}`, margin, yPos)
      yPos += 6
      doc.text(`• Layout: ${layoutOptions.find((l) => l.value === settings.layout)?.label || "Side-by-Side Comparison"}`, margin, yPos)
      yPos += 6
      doc.text(`• Sections: ${settings.sections.length} categories`, margin, yPos)
      yPos += 10
      doc.setDrawColor(200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8

      // Main comparison result
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Comparison Result", margin, yPos)
      yPos += 10
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      if (comparisonResult) {
        // Basic markdown parsing for headings and bold
        const lines = comparisonResult.split(/\r?\n/)
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim()
          if (line.startsWith("# ")) {
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            line = line.replace(/^# /, "")
          } else if (line.startsWith("## ")) {
            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            line = line.replace(/^## /, "")
          } else if (line.startsWith("### ")) {
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            line = line.replace(/^### /, "")
          } else if (/^\*\*.*\*\*$/.test(line)) {
            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            line = line.replace(/\*\*/g, "")
          } else {
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
          }
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, margin, yPos)
          yPos += 7
        }
      } else {
        doc.text("No comparison result available.", margin, yPos)
      }

      // Footer
      yPos = 285
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("Generated by Product Comparison Tool", margin, yPos)

      // Save the PDF
      doc.save(`${productA.name || "ProductA"}-vs-${productB.name || "ProductB"}-comparison.pdf`)
      toast({
        title: "PDF Exported",
        description: "Comparison exported as PDF successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setProductA({ name: "", url: "", description: "" })
    setProductB({ name: "", url: "", description: "" })
    setSettings({
      tone: "neutral",
      format: "markdown",
      layout: "side-by-side",
      sections: defaultSections,
      customSections: "",
    })
    setGeneratedPrompt("")
    setComparisonPreview("")
    toast({
      title: "Form Reset",
      description: "All fields have been cleared.",
    })
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="main-heading">Product Comparison Tool</h1>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border" />
              )}
              <span className="font-medium text-gray-700">{user?.name}</span>
              <button
                onClick={logout}
                className="ml-2 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ minWidth: 120 }} />
          )}
        </header>
        {isAuthenticated && (
          <div className="flex justify-end items-center mb-2 gap-4">
            <span className="text-green-600 text-xs">Session Parameters Saved</span>
            <button
              onClick={clearAutoSave}
              className="text-xs text-red-600 underline hover:text-red-800"
              type="button"
            >
              Reset Session Parameters
            </button>
          </div>
        )}

        {isAuthenticated ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {user?.name || 'User'}!
            </h2>
            {user?.email && (
              <p className="text-gray-600 mb-2">{user.email}</p>
            )}
            <p className="text-green-600 font-medium mb-4">You are now signed in with Google.</p>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="settings">Compare Options</TabsTrigger>
                <TabsTrigger value="output">Generated Prompt</TabsTrigger>
                <TabsTrigger value="compared">Compared</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Product A</CardTitle>
                      <CardDescription>Enter details for the first product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productA-name">Product Name *</Label>
                        <Input
                          id="productA-name"
                          placeholder="e.g., Notion"
                          value={productA.name}
                          onChange={(e) => {
                            setProductA((prev) => ({ ...prev, name: e.target.value }))
                            setProductAError(validateProductA(e.target.value))
                          }}
                          onBlur={() => {
                            setTouchedA(true)
                            setProductAError(validateProductA(productA.name))
                          }}
                          required
                          className="input"
                        />
                        {touchedA && productAError && (
                          <div className="text-red-600 text-xs mt-1">{productAError}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productA-url">Website URL</Label>
                        <Input
                          id="productA-url"
                          placeholder="https://www.notion.so"
                          value={productA.url}
                          onChange={(e) => {
                            setProductA((prev) => ({ ...prev, url: e.target.value }))
                            setProductAUrlError(validateUrl(e.target.value))
                          }}
                          onBlur={() => {
                            setTouchedAUrl(true)
                            setProductAUrlError(validateUrl(productA.url))
                          }}
                          className="input"
                        />
                        {touchedAUrl && productAUrlError && (
                          <div className="text-red-600 text-xs mt-1">{productAUrlError}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productA-description">Brief Description</Label>
                        <Textarea
                          id="productA-description"
                          placeholder="Optional: Brief description or key features"
                          value={productA.description}
                          onChange={(e) => setProductA((prev) => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="textarea"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Product B</CardTitle>
                      <CardDescription>Enter details for the second product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productB-name">Product Name *</Label>
                        <Input
                          id="productB-name"
                          placeholder="e.g., Evernote"
                          value={productB.name}
                          onChange={(e) => {
                            setProductB((prev) => ({ ...prev, name: e.target.value }))
                            setProductBError(validateProductB(e.target.value))
                          }}
                          onBlur={() => {
                            setTouchedB(true)
                            setProductBError(validateProductB(productB.name))
                          }}
                          required
                          className="input"
                        />
                        {touchedB && productBError && (
                          <div className="text-red-600 text-xs mt-1">{productBError}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productB-url">Website URL</Label>
                        <Input
                          id="productB-url"
                          placeholder="https://www.evernote.com"
                          value={productB.url}
                          onChange={(e) => {
                            setProductB((prev) => ({ ...prev, url: e.target.value }))
                            setProductBUrlError(validateUrl(e.target.value))
                          }}
                          onBlur={() => {
                            setTouchedBUrl(true)
                            setProductBUrlError(validateUrl(productB.url))
                          }}
                          className="input"
                        />
                        {touchedBUrl && productBUrlError && (
                          <div className="text-red-600 text-xs mt-1">{productBUrlError}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productB-description">Brief Description</Label>
                        <Textarea
                          id="productB-description"
                          placeholder="Optional: Brief description or key features"
                          value={productB.description}
                          onChange={(e) => setProductB((prev) => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="textarea"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Style</CardTitle>
                      <CardDescription>Customize the tone, format, and layout of your comparison</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Comparison Layout</Label>
                        <Select
                          value={settings.layout}
                          onValueChange={(value) => setSettings((prev) => ({ ...prev, layout: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {layoutOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select
                          value={settings.tone}
                          onValueChange={(value) => setSettings((prev) => ({ ...prev, tone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {toneOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <Select
                          value={settings.format}
                          onValueChange={(value) => {
                            setSettings((prev) => ({ ...prev, format: value }));
                            setFormatError(validateFormat(value));
                          }}
                          required
                        >
                          <SelectTrigger
                            onBlur={() => {
                              setTouchedFormat(true);
                              setFormatError(validateFormat(settings.format));
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formatOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touchedFormat && formatError && (
                          <div className="text-red-600 text-xs mt-1">{formatError}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Comparison Sections</CardTitle>
                      <CardDescription>Select which aspects to compare side-by-side</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {defaultSections.map((section) => (
                          <div key={section} className="flex items-center space-x-2">
                            <Checkbox
                              id={section}
                              checked={settings.sections.includes(section)}
                              onCheckedChange={(checked) => handleSectionToggle(section, checked as boolean)}
                            />
                            <Label htmlFor={section} className="text-sm font-normal">
                              {section}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="custom-sections">Custom Sections</Label>
                        <Textarea
                          id="custom-sections"
                          placeholder="Add custom sections (comma-separated)"
                          value={settings.customSections}
                          onChange={(e) => setSettings((prev) => ({ ...prev, customSections: e.target.value }))}
                          rows={2}
                          className="textarea"
                        />
                      </div>
                      {touchedSections && sectionsError && (
                        <div className="text-red-600 text-xs mt-1">{sectionsError}</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-center gap-4 pt-6">
                  <Button onClick={resetForm} variant="outline" size="lg" className="accent-btn">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Form
                  </Button>
                  <Button onClick={generatePrompt} size="lg" className="accent-btn">
                    <Table className="h-4 w-4 mr-2" />
                    Generate Prompt
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Side-by-Side Comparison Prompt</CardTitle>
                    <CardDescription>
                      {generatedPrompt ? "Your AI prompt is ready to use" : "Generate a prompt to see the output here"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedPrompt ? (
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {settings.sections.length + settings.customSections.split(",").filter((s) => s.trim()).length} sections
                          </Badge>
                          <Badge variant="outline">{settings.layout}</Badge>
                          <Badge variant="outline">{settings.tone}</Badge>
                          <Badge variant="outline">{settings.format}</Badge>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">{generatedPrompt}</pre>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-between">
                          <div className="flex gap-2 flex-wrap">
                            <Button onClick={copyToClipboard} variant="default">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Prompt
                            </Button>
                            <Button onClick={downloadPrompt} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download MD
                            </Button>
                          </div>
                          <Button
                            onClick={async () => {
                              setCompareLoading(true);
                              setCompareError(null);
                              setActiveTab("compared");
                              try {
                                const res = await fetch("/api/compare", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ prompt: generatedPrompt }),
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || "Unknown error");
                                setComparisonResult(data.result);
                              } catch (err: any) {
                                setCompareError(err.message || "Failed to generate comparison. Please try again.");
                              } finally {
                                setCompareLoading(false);
                              }
                            }}
                            variant="default"
                            disabled={!generatedPrompt || compareLoading}
                            className="ml-auto"
                          >
                            {compareLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Table className="h-4 w-4 mr-2" />}
                            Compare
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Generate your side-by-side comparison prompt to see it here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compared" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compared Output</CardTitle>
                    <CardDescription>
                      {compareLoading ? "Generating comparison..." : "This is the AI-generated comparison based on your prompt."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {compareLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 mb-4 text-blue-500" />
                        <span className="text-blue-600">Generating comparison...</span>
                      </div>
                    ) : compareError ? (
                      <div className="text-red-600 text-center py-8">{compareError}</div>
                    ) : comparisonResult ? (
                      <div className="prose max-w-none bg-slate-50 p-6 rounded-lg border shadow-sm">
                        <h2 className="text-2xl font-bold mb-2">{productA.name} vs {productB.name} - Compared Output</h2>
                        <ReactMarkdown>{comparisonResult}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Click Compare to generate your AI-powered comparison here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {comparisonResult && (
                  <div className="flex justify-center mb-4">
                    <Button
                      onClick={exportToPDF}
                      variant="default"
                      className="accent-btn"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Sign in to Start Comparing
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in with your Google account to access the product comparison tool.
            </p>
            {authError && (
              <div className="text-red-600 text-sm mb-2" role="alert">
                {authError}
              </div>
            )}
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
