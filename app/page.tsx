"use client"

import { useState } from "react"
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
import { Copy, Download, RefreshCw, Sparkles, FileText, Table } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  const handleSectionToggle = (section: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sections: checked ? [...prev.sections, section] : prev.sections.filter((s) => s !== section),
    }))
  }

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

    // Detailed tone instructions
    let toneInstructions = ""
    switch (settings.tone) {
      case "neutral":
        toneInstructions = `
**Tone Guidelines:**
- Maintain complete objectivity and balance
- Present facts without bias or preference
- Use neutral language: "offers", "provides", "includes" rather than "excels" or "lacks"
- Avoid superlatives and emotional language
- Present both strengths and weaknesses equally`
        break
      case "detailed":
        toneInstructions = `
**Tone Guidelines:**
- Provide comprehensive technical specifications and details
- Include specific version numbers, API capabilities, and technical limitations
- Use precise technical terminology and industry jargon
- Dive deep into architecture, integrations, and implementation details
- Include performance metrics, security protocols, and compliance standards`
        break
      case "concise":
        toneInstructions = `
**Tone Guidelines:**
- Keep explanations brief and to the point
- Use bullet points and short sentences
- Focus on key differentiators only
- Limit each section to 2-3 main points
- Prioritize actionable insights over detailed explanations`
        break
      case "business":
        toneInstructions = `
**Tone Guidelines:**
- Focus on ROI, cost-effectiveness, and business impact
- Emphasize scalability, enterprise features, and team collaboration
- Include total cost of ownership and implementation considerations
- Address decision-maker concerns: security, compliance, support
- Use business terminology: efficiency, productivity, competitive advantage`
        break
      case "consumer":
        toneInstructions = `
**Tone Guidelines:**
- Use friendly, accessible language avoiding technical jargon
- Focus on user experience, ease of use, and everyday benefits
- Emphasize value for money and practical applications
- Include learning curve and setup simplicity
- Address common user pain points and how each product solves them`
        break
    }

    // Detailed format instructions
    let formatInstructions = ""
    switch (settings.format) {
      case "markdown":
        formatInstructions = `
**Format Requirements:**
- Use proper Markdown syntax with headers (##, ###)
- Create comparison tables using | syntax
- Use bullet points (-) and numbered lists (1.)
- Include code blocks for technical details when relevant
- Use **bold** for key points and *italics* for emphasis`
        break
      case "structured":
        formatInstructions = `
**Format Requirements:**
- Organize content in clear, numbered sections
- Use consistent paragraph structure with topic sentences
- Include summary boxes for key takeaways
- Use indentation and spacing for hierarchy
- End each section with a brief conclusion`
        break
      case "table":
        formatInstructions = `
**Format Requirements:**
- Present ALL comparisons in table format
- Create separate tables for each major category
- Use consistent column headers: Feature | ${productA.name} | ${productB.name}
- Include rating symbols (★★★★☆) or checkmarks (✓/✗) where appropriate
- Add a summary comparison table at the end`
        break
      case "report":
        formatInstructions = `
**Format Requirements:**
- Structure as a formal business report with executive summary
- Include methodology section explaining comparison criteria
- Use professional headings and subheadings
- Add conclusions and recommendations section
- Include appendices for detailed specifications`
        break
    }

    // Enhanced layout instructions
    let layoutInstructions = ""
    switch (settings.layout) {
      case "side-by-side":
        layoutInstructions = `
**Layout Requirements:**
- Create side-by-side comparison tables for EVERY category
- Use consistent two-column format: ${productA.name} | ${productB.name}
- Include direct feature-to-feature comparisons in each row
- Add visual indicators (✓, ✗, ★) for quick scanning
- Ensure parallel structure - same aspects compared for both products
- Include "Winner" or "Better For" indicators in each section`
        break
      case "matrix":
        layoutInstructions = `
**Layout Requirements:**
- Create comprehensive feature matrices with products as columns
- Use symbols: ✓ (full support), ◐ (partial), ✗ (not available), ★★★ (ratings)
- Group related features into logical categories
- Include scoring summary at the bottom of each matrix
- Add color-coding suggestions: Green (advantage), Yellow (neutral), Red (disadvantage)
- Create an overall score matrix summarizing all categories`
        break
      case "sequential":
        layoutInstructions = `
**Layout Requirements:**
- Analyze each category by discussing both products together
- Use "Product A vs Product B" structure within each section
- Include direct comparisons and contrasts in the same paragraph
- End each section with a clear winner or "depends on use case" conclusion
- Use transition phrases: "In contrast", "Similarly", "However", "On the other hand"`
        break
    }

    const prompt = `You are a professional product comparison analyst. Create a comprehensive ${layoutDescription.toLowerCase()} between these two products:

**Product A:** ${productA.name}${productA.url ? ` (${productA.url})` : ""}${productA.description ? `\nDescription: ${productA.description}` : ""}

**Product B:** ${productB.name}${productB.url ? ` (${productB.url})` : ""}${productB.description ? `\nDescription: ${productB.description}` : ""}

**Analysis Requirements:**
- **Tone:** ${toneDescription}
- **Format:** ${formatDescription}
- **Layout:** ${layoutDescription}

${toneInstructions}

${formatInstructions}

${layoutInstructions}

**Comparison Categories:**
${allSections.map((section, index) => `${index + 1}. ${section}`).join("\n")}

**Specific Guidelines:**
- Research current, accurate information about both products
- Include specific examples, features, and data points where possible
- Provide pricing information with specific numbers when available
- Address different user personas and use cases explicitly
- Include screenshots or feature descriptions for UI/UX comparisons
- Mention recent updates or changes to either product
- Consider integration capabilities and ecosystem compatibility
- Include user reviews sentiment and common feedback themes

**Expected Output Structure:**
1. Executive Summary (2-3 sentences highlighting key differences)
2. Quick Comparison Overview (key specs side-by-side)
3. Detailed analysis following your specified format and layout
4. Use Case Recommendations (who should choose which product)
5. Final Verdict with specific scenarios

**Quality Standards:**
- Ensure factual accuracy and cite sources when possible
- Maintain consistency in comparison criteria across all sections
- Provide actionable insights that help with decision-making
- Include both current state and future roadmap considerations
- Address potential deal-breakers or must-have features

Please follow these instructions precisely to create a comparison that matches the specified tone, format, and layout requirements.`

    return prompt
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
    if (!productA.name || !productB.name) {
      toast({
        title: "Missing Information",
        description: "Please provide names for both products.",
        variant: "destructive",
      })
      return
    }

    const prompt = generateSideBySidePrompt()
    const preview = generateComparisonPreview()

    setGeneratedPrompt(prompt)
    setComparisonPreview(preview)

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
    const blob = new Blob([generatedPrompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${productA.name}-vs-${productB.name}-comparison-prompt.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Prompt saved as text file.",
    })
  }

  const exportToPDF = async () => {
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - margin * 2

      // Title
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text(`${productA.name} vs ${productB.name}`, margin, 30)

      // Subtitle
      doc.setFontSize(12)
      doc.setFont(undefined, "normal")
      doc.text("Product Comparison Analysis Prompt", margin, 45)

      // Add generation date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 55)

      // Settings summary
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Analysis Settings:", margin, 75)

      doc.setFont(undefined, "normal")
      doc.setFontSize(10)
      let yPos = 85
      doc.text(`• Tone: ${toneOptions.find((t) => t.value === settings.tone)?.label}`, margin, yPos)
      yPos += 10
      doc.text(`• Format: ${formatOptions.find((f) => f.value === settings.format)?.label}`, margin, yPos)
      yPos += 10
      doc.text(`• Layout: ${layoutOptions.find((l) => l.value === settings.layout)?.label}`, margin, yPos)
      yPos += 10
      doc.text(`• Sections: ${settings.sections.length} categories`, margin, yPos)

      // Product details
      yPos += 20
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Product Details:", margin, yPos)

      yPos += 15
      doc.setFont(undefined, "bold")
      doc.setFontSize(11)
      doc.text(`Product A: ${productA.name}`, margin, yPos)

      yPos += 10
      doc.setFont(undefined, "normal")
      doc.setFontSize(9)
      if (productA.url) {
        doc.text(`URL: ${productA.url}`, margin, yPos)
        yPos += 8
      }
      if (productA.description) {
        const descLines = doc.splitTextToSize(productA.description, maxWidth)
        doc.text(descLines, margin, yPos)
        yPos += descLines.length * 8
      }

      yPos += 10
      doc.setFont(undefined, "bold")
      doc.setFontSize(11)
      doc.text(`Product B: ${productB.name}`, margin, yPos)

      yPos += 10
      doc.setFont(undefined, "normal")
      doc.setFontSize(9)
      if (productB.url) {
        doc.text(`URL: ${productB.url}`, margin, yPos)
        yPos += 8
      }
      if (productB.description) {
        const descLines = doc.splitTextToSize(productB.description, maxWidth)
        doc.text(descLines, margin, yPos)
        yPos += descLines.length * 8
      }

      // Add new page for the prompt
      doc.addPage()
      yPos = 30

      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Generated AI Prompt:", margin, yPos)

      yPos += 15
      doc.setFont(undefined, "normal")
      doc.setFontSize(8)

      // Split the prompt into lines that fit the page
      const promptLines = doc.splitTextToSize(generatedPrompt, maxWidth)

      for (let i = 0; i < promptLines.length; i++) {
        if (yPos > 270) {
          // Near bottom of page
          doc.addPage()
          yPos = 30
        }
        doc.text(promptLines[i], margin, yPos)
        yPos += 6
      }

      // Save the PDF
      doc.save(`${productA.name}-vs-${productB.name}-comparison.pdf`)

      toast({
        title: "PDF Exported",
        description: "Comparison prompt exported as PDF successfully.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Table className="h-8 w-8 text-blue-600" />
            Side-by-Side Product Comparison Tool
          </h1>
          <p className="text-slate-600 text-lg">
            Generate comprehensive side-by-side AI prompts for comparing any two products
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="output">Generated Prompt</TabsTrigger>
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
                      onChange={(e) => setProductA((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productA-url">Website URL</Label>
                    <Input
                      id="productA-url"
                      placeholder="https://www.notion.so"
                      value={productA.url}
                      onChange={(e) => setProductA((prev) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productA-description">Brief Description</Label>
                    <Textarea
                      id="productA-description"
                      placeholder="Optional: Brief description or key features"
                      value={productA.description}
                      onChange={(e) => setProductA((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
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
                      onChange={(e) => setProductB((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productB-url">Website URL</Label>
                    <Input
                      id="productB-url"
                      placeholder="https://www.evernote.com"
                      value={productB.url}
                      onChange={(e) => setProductB((prev) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productB-description">Brief Description</Label>
                    <Textarea
                      id="productB-description"
                      placeholder="Optional: Brief description or key features"
                      value={productB.description}
                      onChange={(e) => setProductB((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
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
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
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
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparison Preview</CardTitle>
                <CardDescription>Preview of how your side-by-side comparison will be structured</CardDescription>
              </CardHeader>
              <CardContent>
                {productA.name && productB.name ? (
                  <div className="bg-slate-50 rounded-lg p-6 border">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-white p-4 rounded border">
                        {comparisonPreview || generateComparisonPreview()}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Table className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Enter product names to see the comparison preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                        {settings.sections.length + settings.customSections.split(",").filter((s) => s.trim()).length}{" "}
                        sections
                      </Badge>
                      <Badge variant="outline">{settings.layout}</Badge>
                      <Badge variant="outline">{settings.tone}</Badge>
                      <Badge variant="outline">{settings.format}</Badge>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">{generatedPrompt}</pre>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={copyToClipboard} variant="default">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </Button>
                      <Button onClick={downloadPrompt} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download TXT
                      </Button>
                      <Button
                        onClick={exportToPDF}
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
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
        </Tabs>

        <div className="flex justify-center gap-4 pt-6">
          <Button onClick={generatePrompt} size="lg" className="px-8">
            <Table className="h-4 w-4 mr-2" />
            Generate Side-by-Side Prompt
          </Button>
          <Button onClick={resetForm} variant="outline" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>
    </div>
  )
}
