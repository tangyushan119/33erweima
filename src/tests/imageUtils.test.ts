import { describe, expect, it } from 'vitest'
import { getFileIdentifier, checkImageDuplicate, getImageData, type ImageFields } from '@/lib/imageUtils'

describe('Image Utils Tests', () => {
  const createTestFile = (name: string, content: string, lastModified: number): File => {
    return new File([content], name, {
      type: 'image/png',
      lastModified,
    })
  }

  describe('getFileIdentifier', () => {
    it('should generate unique identifier for different files', () => {
      const file1 = createTestFile('test1.png', 'content1', 1234567890)
      const file2 = createTestFile('test2.png', 'content2', 1234567891)
      
      const id1 = getFileIdentifier(file1)
      const id2 = getFileIdentifier(file2)
      
      expect(id1).not.toBe(id2)
    })

    it('should generate same identifier for identical files', () => {
      const file1 = createTestFile('test.png', 'content', 1234567890)
      const file2 = createTestFile('test.png', 'content', 1234567890)
      
      const id1 = getFileIdentifier(file1)
      const id2 = getFileIdentifier(file2)
      
      expect(id1).toBe(id2)
    })
  })

  describe('checkImageDuplicate', () => {
    it('should return true when same image exists in another field', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      const fileId = getFileIdentifier(testFile)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: fileId,
        backImage: '',
        backImageId: '',
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: '',
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'backImage')
      
      expect(result).toBe(true)
    })

    it('should return false when image does not exist in any field', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: '',
        backImage: '',
        backImageId: '',
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: '',
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'frontImage')
      
      expect(result).toBe(false)
    })

    it('should return false when same image is in the excluded field', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      const fileId = getFileIdentifier(testFile)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: fileId,
        backImage: '',
        backImageId: '',
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: '',
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'frontImage')
      
      expect(result).toBe(false)
    })

    it('should return true when same image exists in multiple fields', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      const fileId = getFileIdentifier(testFile)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: fileId,
        backImage: '',
        backImageId: fileId,
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: '',
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'leftImage')
      
      expect(result).toBe(true)
    })

    it('should return false when different images exist in other fields', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      const differentFile = createTestFile('other.png', 'different', 9876543210)
      const differentId = getFileIdentifier(differentFile)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: differentId,
        backImage: '',
        backImageId: '',
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: '',
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'backImage')
      
      expect(result).toBe(false)
    })

    it('should handle mixed filled and empty fields correctly', () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      const fileId = getFileIdentifier(testFile)
      const differentFile = createTestFile('other.png', 'different', 9876543210)
      const differentId = getFileIdentifier(differentFile)
      
      const imageFields: ImageFields = {
        frontImage: '',
        frontImageId: differentId,
        backImage: '',
        backImageId: fileId,
        leftImage: '',
        leftImageId: '',
        rightImage: '',
        rightImageId: differentId,
      }
      
      const result = checkImageDuplicate(testFile, imageFields, 'leftImage')
      
      expect(result).toBe(true)
    })
  })

  describe('getImageData', () => {
    it('should return base64 and identifier for valid file', async () => {
      const testFile = createTestFile('test.png', 'content', 1234567890)
      
      const result = await getImageData(testFile)
      
      expect(result.base64).toContain('data:image/png;base64,')
      expect(result.identifier).toBe('test.png-7-1234567890')
    })
  })
})