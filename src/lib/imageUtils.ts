export const getFileIdentifier = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export interface ImageFields {
  frontImage?: string
  backImage?: string
  leftImage?: string
  rightImage?: string
  frontImageId?: string
  backImageId?: string
  leftImageId?: string
  rightImageId?: string
  overallImage?: string
  nameplateImage?: string
  overallImageId?: string
  nameplateImageId?: string
}

const getImageIdField = (field: keyof ImageFields): keyof ImageFields => {
  return `${field}Id` as keyof ImageFields
}

export const checkImageDuplicate = (
  file: File,
  imageFields: ImageFields,
  excludeField?: keyof ImageFields
): boolean => {
  const targetIdentifier = getFileIdentifier(file)
  const imageFieldNames: (keyof ImageFields)[] = ['frontImage', 'backImage', 'leftImage', 'rightImage', 'overallImage', 'nameplateImage']
  
  for (const field of imageFieldNames) {
    if (field === excludeField) continue
    
    const imageIdField = getImageIdField(field)
    const existingImageId = imageFields[imageIdField]
    if (existingImageId && existingImageId === targetIdentifier) {
      return true
    }
  }
  return false
}

export const getImageData = (file: File): Promise<{ base64: string; identifier: string }> => {
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