'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Section {
  id: string
  name: string
  description: string | null
  displayOrder: number
  examType: 'RRB_NTPC' | 'SSC_CGL' | 'BANK_PO' | 'OTHER'
  createdAt: string
}

interface SectionFormData {
  name: string
  description: string
  displayOrder: number
  examType: 'RRB_NTPC' | 'SSC_CGL' | 'BANK_PO' | 'OTHER'
}

const EXAM_TYPES = [
  { value: 'RRB_NTPC', label: 'RRB NTPC' },
  { value: 'SSC_CGL', label: 'SSC CGL' },
  { value: 'BANK_PO', label: 'Bank PO' },
  { value: 'OTHER', label: 'Other' },
] as const

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    description: '',
    displayOrder: 0,
    examType: 'RRB_NTPC',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/sections')
      if (!response.ok) throw new Error('Failed to fetch sections')
      const data = await response.json()
      setSections(data.sections)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sections',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section)
      setFormData({
        name: section.name,
        description: section.description || '',
        displayOrder: section.displayOrder,
        examType: section.examType,
      })
    } else {
      setEditingSection(null)
      setFormData({
        name: '',
        description: '',
        displayOrder: sections.length,
        examType: 'RRB_NTPC',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSection(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingSection
        ? `/api/admin/sections/${editingSection.id}`
        : '/api/admin/sections'
      const method = editingSection ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save section')

      toast({
        title: 'Success',
        description: `Section ${editingSection ? 'updated' : 'created'} successfully`,
      })

      handleCloseDialog()
      fetchSections()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingSection ? 'update' : 'create'} section`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section? This will also delete all associated topics and questions.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete section')

      toast({
        title: 'Success',
        description: 'Section deleted successfully',
      })

      fetchSections()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sections</h1>
          <p className="text-muted-foreground mt-2">
            Manage exam sections and categories
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
          <CardDescription>
            {sections.length} section{sections.length !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sections found. Create your first section to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>{section.examType}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {section.description || '-'}
                    </TableCell>
                    <TableCell>{section.displayOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(section)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Section' : 'Create Section'}
              </DialogTitle>
              <DialogDescription>
                {editingSection
                  ? 'Update the section details below'
                  : 'Add a new section to organize your questions'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      examType: value as typeof formData.examType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
