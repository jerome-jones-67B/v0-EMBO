"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, GripVertical, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

interface LinkedInfo {
  id: string
  type: "freeform" | "structured"
  url: string
  identifier?: string
  identifierType?: string
  description: string
  level: "manuscript" | "figure" | "panel"
  targetId?: string
  isValid: boolean
  validationMessage?: string
}

interface LinkedInformationEditorProps {
  manuscriptId: string
  level: "manuscript" | "figure" | "panel"
  targetId?: string
  onSave?: (links: LinkedInfo[]) => void
}

const identifierTypes = [
  { value: "doi", label: "DOI", baseUrl: "https://doi.org/" },
  { value: "pmid", label: "PubMed ID", baseUrl: "https://pubmed.ncbi.nlm.nih.gov/" },
  { value: "pmc", label: "PMC ID", baseUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/" },
  { value: "uniprot", label: "UniProt", baseUrl: "https://www.uniprot.org/uniprot/" },
  { value: "ensembl", label: "Ensembl", baseUrl: "https://www.ensembl.org/id/" },
  { value: "pdb", label: "PDB", baseUrl: "https://www.rcsb.org/structure/" },
  { value: "geo", label: "GEO", baseUrl: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=" },
  { value: "arrayexpress", label: "ArrayExpress", baseUrl: "https://www.ebi.ac.uk/arrayexpress/experiments/" },
  { value: "pride", label: "PRIDE", baseUrl: "https://www.ebi.ac.uk/pride/archive/projects/" },
]

export function LinkedInformationEditor({ manuscriptId, level, targetId, onSave }: LinkedInformationEditorProps) {
  const [links, setLinks] = useState<LinkedInfo[]>([
    {
      id: "1",
      type: "structured",
      url: "https://doi.org/10.1038/s41586-023-06789-1",
      identifier: "10.1038/s41586-023-06789-1",
      identifierType: "doi",
      description: "Related publication",
      level: "manuscript",
      isValid: true,
    },
    {
      id: "2",
      type: "structured",
      url: "https://www.uniprot.org/uniprot/P0DMV8",
      identifier: "P0DMV8",
      identifierType: "uniprot",
      description: "SARS-CoV-2 spike protein",
      level: "figure",
      targetId: "fig1",
      isValid: true,
    },
  ])

  const [newLink, setNewLink] = useState<Partial<LinkedInfo>>({
    type: "freeform",
    level,
    targetId,
    description: "",
    url: "",
    isValid: false,
  })

  const validateIdentifier = (type: string, identifier: string): { isValid: boolean; message?: string } => {
    if (!identifier.trim()) return { isValid: false, message: "Identifier is required" }

    switch (type) {
      case "doi":
        const doiPattern = /^10\.\d{4,}\/[^\s]+$/
        return doiPattern.test(identifier)
          ? { isValid: true }
          : { isValid: false, message: "Invalid DOI format (should start with 10.)" }
      case "pmid":
        const pmidPattern = /^\d+$/
        return pmidPattern.test(identifier)
          ? { isValid: true }
          : { isValid: false, message: "PMID should contain only numbers" }
      case "uniprot":
        const uniprotPattern = /^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]|[0-9][A-Z0-9]{3})$/
        return uniprotPattern.test(identifier)
          ? { isValid: true }
          : { isValid: false, message: "Invalid UniProt ID format" }
      default:
        return { isValid: true }
    }
  }

  const generateUrl = (type: string, identifier: string): string => {
    const identifierType = identifierTypes.find((t) => t.value === type)
    return identifierType ? `${identifierType.baseUrl}${identifier}` : ""
  }

  const handleAddLink = () => {
    if (newLink.type === "structured" && newLink.identifierType && newLink.identifier) {
      const validation = validateIdentifier(newLink.identifierType, newLink.identifier)
      const url = generateUrl(newLink.identifierType, newLink.identifier)

      const link: LinkedInfo = {
        id: Date.now().toString(),
        type: newLink.type,
        url,
        identifier: newLink.identifier,
        identifierType: newLink.identifierType,
        description: newLink.description || "",
        level: newLink.level || level,
        targetId: newLink.targetId || targetId,
        isValid: validation.isValid,
        validationMessage: validation.message,
      }

      setLinks([...links, link])
    } else if (newLink.type === "freeform" && newLink.url) {
      const link: LinkedInfo = {
        id: Date.now().toString(),
        type: newLink.type,
        url: newLink.url,
        description: newLink.description || "",
        level: newLink.level || level,
        targetId: newLink.targetId || targetId,
        isValid: true,
      }

      setLinks([...links, link])
    }

    setNewLink({
      type: "freeform",
      level,
      targetId,
      description: "",
      url: "",
      isValid: false,
    })
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const handleReorderLink = (id: string, direction: "up" | "down") => {
    const index = links.findIndex((link) => link.id === id)
    if (index === -1) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return

    const newLinks = [...links]
    const [movedLink] = newLinks.splice(index, 1)
    newLinks.splice(newIndex, 0, movedLink)
    setLinks(newLinks)
  }

  const filteredLinks = links.filter((link) => link.level === level && (!targetId || link.targetId === targetId))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Linked Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredLinks.length > 0 ? (
            <div className="space-y-3">
              {filteredLinks.map((link, index) => (
                <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderLink(link.id, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderLink(link.id, "down")}
                      disabled={index === filteredLinks.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={link.type === "structured" ? "default" : "secondary"}>
                        {link.type === "structured" ? link.identifierType?.toUpperCase() : "URL"}
                      </Badge>
                      {link.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{link.description}</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {link.type === "structured" ? link.identifier : link.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(link.url, "_blank")}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {!link.isValid && link.validationMessage && (
                      <div className="text-xs text-red-600 mt-1">{link.validationMessage}</div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No linked information added yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Link</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={newLink.type}
            onValueChange={(value) => setNewLink({ ...newLink, type: value as "freeform" | "structured" })}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="freeform">Freeform URL</TabsTrigger>
              <TabsTrigger value="structured">Structured Identifier</TabsTrigger>
            </TabsList>

            <TabsContent value="freeform" className="space-y-4">
              <div>
                <Label htmlFor="freeform-url">URL</Label>
                <Input
                  id="freeform-url"
                  placeholder="https://example.com/resource"
                  value={newLink.url || ""}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="freeform-description">Description</Label>
                <Input
                  id="freeform-description"
                  placeholder="Brief description of the linked resource"
                  value={newLink.description || ""}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="structured" className="space-y-4">
              <div>
                <Label htmlFor="identifier-type">Identifier Type</Label>
                <Select
                  value={newLink.identifierType}
                  onValueChange={(value) => setNewLink({ ...newLink, identifierType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select identifier type" />
                  </SelectTrigger>
                  <SelectContent>
                    {identifierTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="identifier">Identifier</Label>
                <Input
                  id="identifier"
                  placeholder="Enter identifier (e.g., 10.1038/nature12373)"
                  value={newLink.identifier || ""}
                  onChange={(e) => setNewLink({ ...newLink, identifier: e.target.value })}
                />
                {newLink.identifierType && newLink.identifier && (
                  <div className="mt-2 text-sm text-gray-600">
                    Generated URL:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {generateUrl(newLink.identifierType, newLink.identifier)}
                    </code>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="structured-description">Description</Label>
                <Input
                  id="structured-description"
                  placeholder="Brief description of the linked resource"
                  value={newLink.description || ""}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddLink}
              disabled={
                (newLink.type === "freeform" && !newLink.url) ||
                (newLink.type === "structured" && (!newLink.identifierType || !newLink.identifier))
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
