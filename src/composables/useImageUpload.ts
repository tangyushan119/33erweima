import { ref } from 'vue'

export interface ImageUploadState {
  [key: string]: {
    base64: string
    identifier: string
  } | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export const useImageUpload = <T extends Record<string, unknown>>(formData: T) => {
  const imageUploadRefs = ref<Record<string, HTMLInputElement | null>>({})
  const uploadErrors = ref<Record<string, string>>({})

  const getFileIdentifier = (file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}`
  }

  const getImageIdField = (field: string): string => {
    return `${field}Id`
  }

  const checkImageDuplicate = (
    file: File,
    excludeField?: string
  ): boolean => {
    const targetIdentifier = getFileIdentifier(file)
    const imageFieldNames = ['frontImage', 'backImage', 'leftImage', 'rightImage', 'overallImage', 'nameplateImage']

    for (const field of imageFieldNames) {
      if (field === excludeField) continue

      const imageIdField = getImageIdField(field)
      const existingImageId = formData[imageIdField as keyof T] as string | undefined

      if (existingImageId && existingImageId === targetIdentifier) {
        return true
      }
    }
    return false
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '请选择有效的图片文件（支持 JPG、PNG、GIF、WebP）'
    }

    if (file.size > MAX_FILE_SIZE) {
      return `图片大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }

    return null
  }

  const getImageData = (file: File): Promise<{ base64: string; identifier: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          base64: e.target?.result as string,
          identifier: getFileIdentifier(file),
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (field: string, event: Event): Promise<boolean> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) {
      uploadErrors.value[field] = '请选择文件'
      return false
    }

    const validationError = validateFile(file)
    if (validationError) {
      uploadErrors.value[field] = validationError
      return false
    }

    if (checkImageDuplicate(file, field)) {
      uploadErrors.value[field] = '该图片已上传，请选择其他图片'
      target.value = ''
      return false
    }

    try {
      const { base64, identifier } = await getImageData(file)
      formData[field as keyof T] = base64 as T[keyof T]
      formData[getImageIdField(field) as keyof T] = identifier as T[keyof T]
      uploadErrors.value[field] = ''
      return true
    } catch {
      uploadErrors.value[field] = '图片读取失败，请重试'
      return false
    } finally {
      target.value = ''
    }
  }

  const removeImage = (field: string) => {
    formData[field as keyof T] = '' as T[keyof T]
    formData[getImageIdField(field) as keyof T] = '' as T[keyof T]
    uploadErrors.value[field] = ''

    const input = imageUploadRefs.value[field]
    if (input) {
      input.value = ''
    }
  }

  const registerUploadRef = (field: string, el: HTMLInputElement | null) => {
    imageUploadRefs.value[field] = el
  }

  const triggerUpload = (field: string) => {
    const input = imageUploadRefs.value[field]
    if (input) {
      input.click()
    }
  }

  return {
    imageUploadRefs,
    uploadErrors,
    handleImageUpload,
    removeImage,
    registerUploadRef,
    triggerUpload,
    validateFile,
    checkImageDuplicate,
  }
}