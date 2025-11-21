import { useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, Trash, Image as ImageIcon, CheckCircle, Warning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface OverlayMap {
  id: string
  name: string
  dataUrl: string
  uploadDate: string
  fileSize: number
  isActive: boolean
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export default function CustomOverlayTab() {
  const [overlayMaps, setOverlayMaps] = useStorage<OverlayMap[]>('custom-overlay-maps', [])
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Моля, качете валидно изображение')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Размерът на файла не трябва да надвишава 5MB')
      return
    }

    setUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string

        const newOverlay: OverlayMap = {
          id: Date.now().toString(),
          name: file.name,
          dataUrl,
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          isActive: overlayMaps.length === 0 // First upload is active by default
        }

        setOverlayMaps([...overlayMaps, newOverlay])
        toast.success(`Картата "${file.name}" е качена успешно`)
        setUploading(false)
      }

      reader.onerror = () => {
        toast.error('Грешка при четене на файла')
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Грешка при качване на файла')
      setUploading(false)
    }

    // Reset input
    e.target.value = ''
  }

  const handleSetActive = (id: string) => {
    const updatedMaps = overlayMaps.map(map => ({
      ...map,
      isActive: map.id === id
    }))
    setOverlayMaps(updatedMaps)
    toast.success('Активната карта е обновена')
  }

  const handleDelete = (id: string) => {
    const mapToDelete = overlayMaps.find(m => m.id === id)
    if (!mapToDelete) return

    if (confirm(`Сигурни ли сте, че искате да изтриете "${mapToDelete.name}"?`)) {
      const updatedMaps = overlayMaps.filter(m => m.id !== id)
      
      // If deleted map was active, set first remaining as active
      if (mapToDelete.isActive && updatedMaps.length > 0) {
        updatedMaps[0].isActive = true
      }
      
      setOverlayMaps(updatedMaps)
      toast.success('Картата е изтрита')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" weight="duotone" />
            Качване на Overlay Карта
          </CardTitle>
          <CardDescription>
            Качете персонализирана иридологична карта за използване като overlay при анализ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
              <Label htmlFor="overlay-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Кликнете за качване или провлачете файл
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, SVG до 5MB
                  </p>
                </div>
              </Label>
              <Input
                id="overlay-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>

            {overlayMaps.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Warning className="w-5 h-5 flex-shrink-0" />
                <p>
                  Все още няма качени карти. Качете първата си персонализирана иридологична карта.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overlay Maps List */}
      {overlayMaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" weight="duotone" />
              Налични Overlay Карти
            </CardTitle>
            <CardDescription>
              Управлявайте качените иридологични карти
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overlayMaps.map((map) => (
                <motion.div
                  key={map.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={map.dataUrl}
                      alt={map.name}
                      className="w-full h-full object-contain"
                    />
                    {map.isActive && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                        Активна
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-medium text-sm truncate" title={map.name}>
                        {map.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(map.fileSize)} • {new Date(map.uploadDate).toLocaleDateString('bg-BG')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!map.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSetActive(map.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Задай активна
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(map.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
