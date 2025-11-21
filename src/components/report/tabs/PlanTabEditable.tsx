import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CaretUp, 
  CaretDown,
  Pencil,
  Trash,
  Plus,
  GripVertical,
  CheckCircle,
  X,
  FloppyDisk
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/types'
import { toast } from 'sonner'

interface EditableRecommendation extends Recommendation {
  id: string
  order: number
  hidden?: boolean
}

interface PlanTabEditableProps {
  recommendations: Recommendation[]
  onSave: (recommendations: Recommendation[]) => void
  onCancel: () => void
}

export default function PlanTabEditable({
  recommendations,
  onSave,
  onCancel
}: PlanTabEditableProps) {
  // Initialize with IDs and order
  const [items, setItems] = useState<EditableRecommendation[]>(
    recommendations.map((rec, index) => ({
      ...rec,
      id: `rec-${index}-${Date.now()}`,
      order: index
    }))
  )
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<EditableRecommendation>>({})
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = items.findIndex(item => item.id === draggedId)
    const targetIndex = items.findIndex(item => item.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    // Update order
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    setItems(reorderedItems)
    setDraggedId(null)
    toast.success('Редът е променен')
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const moveUp = (id: string) => {
    const index = items.findIndex(item => item.id === id)
    if (index <= 0) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp

    setItems(newItems.map((item, i) => ({ ...item, order: i })))
    toast.success('Преместено нагоре')
  }

  const moveDown = (id: string) => {
    const index = items.findIndex(item => item.id === id)
    if (index >= items.length - 1) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp

    setItems(newItems.map((item, i) => ({ ...item, order: i })))
    toast.success('Преместено надолу')
  }

  const startEdit = (item: EditableRecommendation) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = () => {
    if (!editingId) return

    const updatedItems = items.map(item =>
      item.id === editingId
        ? { ...item, ...editForm }
        : item
    )

    setItems(updatedItems)
    setEditingId(null)
    setEditForm({})
    toast.success('Промените са запазени')
  }

  const removeItem = (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този елемент?')) {
      const updatedItems = items
        .filter(item => item.id !== id)
        .map((item, index) => ({ ...item, order: index }))
      
      setItems(updatedItems)
      toast.success('Елементът е изтрит')
    }
  }

  const toggleHidden = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id
        ? { ...item, hidden: !item.hidden }
        : item
    )
    setItems(updatedItems)
    toast.success(items.find(i => i.id === id)?.hidden ? 'Показан' : 'Скрит')
  }

  const addNewItem = () => {
    const newItem: EditableRecommendation = {
      id: `rec-new-${Date.now()}`,
      category: 'lifestyle',
      title: 'Нова препоръка',
      description: 'Описание на препоръката',
      priority: 'medium',
      order: items.length
    }

    setItems([...items, newItem])
    startEdit(newItem)
  }

  const handleSave = () => {
    const finalRecommendations: Recommendation[] = items
      .filter(item => !item.hidden)
      .sort((a, b) => a.order - b.order)
      .map(({ id, order, hidden, ...rec }) => rec)

    onSave(finalRecommendations)
    toast.success('Планът е запазен успешно')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Редактор на План за Действие</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Преподреждайте, редактирайте или премахвайте препоръки
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Отказ
              </Button>
              <Button onClick={handleSave}>
                <FloppyDisk className="w-4 h-4 mr-2" />
                Запази промените
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "cursor-move transition-all",
              draggedId === item.id && "opacity-50",
              item.hidden && "opacity-60"
            )}
          >
            <Card className={cn(
              "border-2",
              getPriorityColor(item.priority),
              draggedId === item.id && "shadow-lg"
            )}>
              <CardContent className="p-4">
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Заглавие</label>
                      <Input
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Заглавие"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Описание</label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Описание"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Категория</label>
                        <select
                          value={editForm.category || 'lifestyle'}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="diet">Хранене</option>
                          <option value="supplement">Добавки</option>
                          <option value="lifestyle">Начин на живот</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Приоритет</label>
                        <select
                          value={editForm.priority || 'medium'}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="high">Висок</option>
                          <option value="medium">Среден</option>
                          <option value="low">Нисък</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveEdit}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Запази
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Отказ
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-grab" />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className={cn(
                            "font-semibold",
                            item.hidden && "line-through text-muted-foreground"
                          )}>
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {item.category === 'diet' ? 'Хранене' : 
                           item.category === 'supplement' ? 'Добавки' : 
                           'Начин на живот'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveUp(item.id)}
                          disabled={index === 0}
                        >
                          <CaretUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveDown(item.id)}
                          disabled={index === items.length - 1}
                        >
                          <CaretDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleHidden(item.id)}
                        >
                          {item.hidden ? 'Покажи' : 'Скрий'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add New Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={addNewItem}
      >
        <Plus className="w-4 h-4 mr-2" />
        Добави нова препоръка
      </Button>
    </div>
  )
}
