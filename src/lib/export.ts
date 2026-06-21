import * as XLSX from 'xlsx'

export interface ExportFieldConfig {
  key: string
  label: string
  required?: boolean
  formatter?: (value: unknown) => string
}

export interface ExportValidationResult {
  isValid: boolean
  missingFields: string[]
  invalidRows: { index: number; issues: string[] }[]
}

export function validateExportData(
  data: Record<string, unknown>[],
  fields: ExportFieldConfig[]
): ExportValidationResult {
  const result: ExportValidationResult = {
    isValid: true,
    missingFields: [],
    invalidRows: [],
  }

  const requiredFields = fields.filter(f => f.required).map(f => f.key)

  data.forEach((row, index) => {
    const issues: string[] = []
    
    requiredFields.forEach(fieldKey => {
      const fieldConfig = fields.find(f => f.key === fieldKey)
      const value = row[fieldKey]
      
      if (value === undefined || value === null || String(value).trim() === '') {
        issues.push(`${fieldConfig?.label || fieldKey} 为空`)
        if (!result.missingFields.includes(fieldKey)) {
          result.missingFields.push(fieldKey)
        }
      }
    })

    if (issues.length > 0) {
      result.invalidRows.push({ index: index + 1, issues })
      result.isValid = false
    }
  })

  return result
}

export interface ExportOptions {
  data: Record<string, unknown>[]
  fields: ExportFieldConfig[]
  fileName: string
  sheetName?: string
}

export function exportToExcel(options: ExportOptions): void {
  const { data, fields, fileName, sheetName = 'Sheet1' } = options

  const headerRow = fields.map(f => f.label)
  
  const dataRows = data.map(row => 
    fields.map(field => {
      const value = row[field.key]
      if (field.formatter) {
        return field.formatter(value)
      }
      return value !== undefined && value !== null ? String(value) : ''
    })
  )

  const worksheetData = [headerRow, ...dataRows]
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

export function exportToCsv(options: Omit<ExportOptions, 'sheetName'>): void {
  const { data, fields, fileName } = options

  const headerRow = fields.map(f => escapeCsvField(f.label)).join(',')
  
  const dataRows = data.map(row => 
    fields.map(field => {
      const value = row[field.key]
      let result: string
      if (field.formatter) {
        result = field.formatter(value)
      } else {
        result = value !== undefined && value !== null ? String(value) : ''
      }
      return escapeCsvField(result)
    }).join(',')
  )

  const csvContent = [headerRow, ...dataRows].join('\n')
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${fileName}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}