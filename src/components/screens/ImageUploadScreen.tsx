import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Camera, Upload, CheckCircle, ArrowRight, X, PencilSimple } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import IrisCropEditor from '@/components/iris/IrisCropEditor'
import type { IrisImage } from '@/types'

interface ImageUploadScreenProps {
  onComplete: (left: IrisImage, right: IrisImage) => void
  initialLeft: IrisImage | null
  initialRight: IrisImage | null
}

export default function ImageUploadScreen({ onComplete, initialLeft, initialRight }: ImageUploadScreenProps) {
  const [leftImage, setLeftImage] = useState<IrisImage | null>(initialLeft)
  const [rightImage, setRightImage] = useState<IrisImage | null>(initialRight)
  const [editingImage, setEditingImage] = useState<{ dataUrl: string; side: 'left' | 'right' } | null>(null)
  
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (side: 'left' | 'right', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Моля, качете изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      // Open crop editor instead of directly setting the image
      setEditingImage({ dataUrl, side })
    }
    reader.readAsDataURL(file)
  }
  
  const handleCropSave = (croppedDataUrl: string) => {
    if (!editingImage) return
    
    const image: IrisImage = { dataUrl: croppedDataUrl, side: editingImage.side }
    
    if (editingImage.side === 'left') {
      setLeftImage(image)
    } else {
      setRightImage(image)
    }
    
    setEditingImage(null)
    toast.success(`${editingImage.side === 'left' ? 'Ляв' : 'Десен'} ирис запазен успешно`)
  }
  
  const handleCropCancel = () => {
    setEditingImage(null)
  }
  
  const handleEditImage = (side: 'left' | 'right') => {
    const image = side === 'left' ? leftImage : rightImage
    if (image) {
      setEditingImage({ dataUrl: image.dataUrl, side })
    }
  }

  const handleDrop = (side: 'left' | 'right', e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(side, file)
    }
  }

  const handleNext = () => {
    if (!leftImage || !rightImage) {
      toast.error('Моля, качете и двете снимки')
      return
    }
    onComplete(leftImage, rightImage)
  }

  const removeImage = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftImage(null)
    } else {
      setRightImage(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Camera size={32} weight="duotone" className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Качване на Снимки</h2>
          <p className="text-muted-foreground">
            Качете ясни снимки на левия и десния си ирис
          </p>
        </motion.div>

        <Card className="p-6 mb-6 bg-secondary/30">
          <h3 className="font-semibold mb-3">📋 Инструкции за качествени снимки:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Осигурете добро осветление - естествена светлина е най-добра</li>
            <li>• Заснемете отблизо, за да се вижда ириса ясно</li>
            <li>• Уверете се, че снимката е фокусирана и не е замъглена</li>
            <li>• Избягвайте отражения и сенки</li>
          </ul>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block">Ляв Ирис</Label>
              
              {!leftImage ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onDrop={(e) => handleDrop('left', e)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => leftInputRef.current?.click()}
                >
                  <Upload size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Кликнете или пуснете снимка</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG до 10MB</p>
                  <input
                    ref={leftInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect('left', file)
                    }}
                  />
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={leftImage.dataUrl}
                    alt="Ляв ирис"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditImage('left')}
                      className="gap-2"
                    >
                      <PencilSimple size={16} />
                      Редактирай
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeImage('left')}
                      className="gap-2"
                    >
                      <X size={16} />
                      Премахни
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                    <CheckCircle size={20} weight="fill" />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block">Десен Ирис</Label>
              
              {!rightImage ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onDrop={(e) => handleDrop('right', e)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => rightInputRef.current?.click()}
                >
                  <Upload size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Кликнете или пуснете снимка</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG до 10MB</p>
                  <input
                    ref={rightInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect('right', file)
                    }}
                  />
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={rightImage.dataUrl}
                    alt="Десен ирис"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditImage('right')}
                      className="gap-2"
                    >
                      <PencilSimple size={16} />
                      Редактирай
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeImage('right')}
                      className="gap-2"
                    >
                      <X size={16} />
                      Премахни
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                    <CheckCircle size={20} weight="fill" />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!leftImage || !rightImage}
            className="gap-2"
          >
            Започни Анализ
            <ArrowRight size={20} weight="bold" />
          </Button>
        </motion.div>
      </div>
      
      {/* Crop Editor Modal */}
      {editingImage && (
        <IrisCropEditor
          imageDataUrl={editingImage.dataUrl}
          side={editingImage.side}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
