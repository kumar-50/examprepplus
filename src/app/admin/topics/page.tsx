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
  examType: string
}

interface Topic {
  id: string
  name: string
  sectionId: string
  description: string | null
  createdAt: string
}

interface TopicFormData {
  name: string
  sectionId: string
  description: string
}

export default function TopicsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    sectionId: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
    fetchTopics()
  }, [])

  useEffect(() => {
    if (selectedSectionId) {
      setFilteredTopics(
        topics.filter((topic) => topic.sectionId === selectedSectionId)
      )
    } else {
      setFilteredTopics(topics)
    }
  }, [selectedSectionId, topics])

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
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics')
      if (!response.ok) throw new Error('Failed to fetch topics')
      const data = await response.json()
      setTopics(data.topics)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic)
      setFormData({
        name: topic.name,
        sectionId: topic.sectionId,
        description: topic.description || '',
      })
    } else {
      setEditingTopic(null)
      setFormData({
        name: '',
        sectionId: selectedSectionId || (sections[0]?.id || ''),
        description: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTopic(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingTopic
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics'
      const method = editingTopic ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save topic')

      toast({
        title: 'Success',
        description: `Topic ${editingTopic ? 'updated' : 'created'} successfully`,
      })

      handleCloseDialog()
      fetchTopics()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingTopic ? 'update' : 'create'} topic`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all associated questions.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete topic')

      toast({
        title: 'Success',
        description: 'Topic deleted successfully',
      })

      fetchTopics()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete topic',
        variant: 'destructive',
      })
    }
  }

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground mt-2">
            Manage topics within sections
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} disabled={sections.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Topics</CardTitle>
              <CardDescription>
                {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}{' '}
                {selectedSectionId ? 'in selected section' : 'total'}
              </CardDescription>
            </div>
            <div className="w-[250px]">
              <Select
                value={selectedSectionId || 'all'}
                onValueChange={(val) => setSelectedSectionId(val === 'all' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Please create a section first before adding topics.
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topics found. Create your first topic to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.name}</TableCell>
                    <TableCell>{getSectionName(topic.sectionId)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {topic.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(topic)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(topic.id)}
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
                {editingTopic ? 'Edit Topic' : 'Create Topic'}
              </DialogTitle>
              <DialogDescription>
                {editingTopic
                  ? 'Update the topic details below'
                  : 'Add a new topic within a section'}
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
                <Label htmlFor="sectionId">Section</Label>
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sectionId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
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
