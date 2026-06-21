export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

const PHONE_REGEX = /^1[3-9]\d{9}$/
const ID_CARD_REGEX = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
const CREDIT_CODE_REGEX = /^[0-9A-Z]{18}$/
const PLATE_NUMBER_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/
const CODE_REGEX = /^[A-Za-z0-9\-]{3,20}$/
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/
const NAME_REGEX = /^[\u4e00-\u9fa5]{2,4}(·[\u4e00-\u9fa5]{2,4})?$/
const PRESSURE_REGEX = /^\d+(\.\d{1,2})?MPa$/
const FORBIDDEN_CHARS_REGEX = /[<>{}[\]|`~!@#$%^&*()+=;:'"?\\]/
const MODEL_REGEX = /^[\u4e00-\u9fa5A-Za-z0-9\-_/]+$/
const SPEC_REGEX = /^[\u4e00-\u9fa5A-Za-z0-9\-_/.××]+$/
const INSPECTOR_REGEX = /^[\u4e00-\u9fa5A-Za-z]{2,20}$/

export const validatePhone = (value: string): string | null => {
  if (!value.trim()) return '请输入手机号'
  if (!PHONE_REGEX.test(value)) return '手机号格式不正确，请输入11位手机号'
  return null
}

export const validateIdCard = (value: string): string | null => {
  if (!value.trim()) return '请输入身份证号'
  if (!ID_CARD_REGEX.test(value)) return '身份证号格式不正确'
  return null
}

export const parseIdCard = (idCard: string): { age: string; gender: string } | null => {
  const cleanIdCard = idCard.replace(/\s/g, '').toUpperCase()
  
  if (!ID_CARD_REGEX.test(cleanIdCard)) return null
  
  const year = parseInt(cleanIdCard.substring(6, 10))
  const month = parseInt(cleanIdCard.substring(10, 12))
  const day = parseInt(cleanIdCard.substring(12, 14))
  
  const today = new Date()
  let age = today.getFullYear() - year
  
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
    age--
  }
  
  const genderCode = parseInt(cleanIdCard.substring(16, 17))
  const gender = genderCode % 2 === 1 ? '男' : '女'
  
  return { age: age.toString(), gender }
}

export const validateCreditCode = (value: string): string | null => {
  if (!value.trim()) return '请输入统一社会信用代码'
  if (!CREDIT_CODE_REGEX.test(value)) return '统一社会信用代码格式不正确，应为18位字母数字组合'
  return null
}

export const validatePlateNumber = (value: string): string | null => {
  if (!value.trim()) return '请输入车牌号'
  if (!PLATE_NUMBER_REGEX.test(value.toUpperCase())) return '车牌号格式不正确，请输入符合国标格式的车牌号'
  return null
}

export const validateVin = (value: string): string | null => {
  if (!value.trim()) return '请输入车辆识别代号(VIN)'
  if (!VIN_REGEX.test(value.toUpperCase())) return '车辆识别代号(VIN)格式不正确，应为17位字母数字组合'
  return null
}

export const validateCode = (value: string, fieldName: string = '编号'): string | null => {
  if (!value.trim()) return `请输入${fieldName}`
  if (!CODE_REGEX.test(value)) return `${fieldName}格式不正确，应为3-20位字母数字组合`
  return null
}

export const validatePrice = (value: string): string | null => {
  if (!value.trim()) return '请输入价格'
  if (!PRICE_REGEX.test(value)) return '价格格式不正确，请输入数字（最多两位小数）'
  return null
}

export const validateName = (value: string): string | null => {
  if (!value.trim()) return '请输入姓名'
  if (!NAME_REGEX.test(value)) return '请输入2-4个汉字的中文姓名（少数民族姓名可带间隔号）'
  return null
}

export const validateAge = (value: string): string | null => {
  if (!value.trim()) return '请输入年龄'
  const numValue = parseInt(value)
  if (isNaN(numValue) || numValue <= 0 || numValue > 150) return '年龄格式不正确，应为1-150之间的整数'
  return null
}

export const validateDateNotFuture = (value: string, fieldName: string = '日期'): string | null => {
  if (!value.trim()) return `请选择${fieldName}`
  const date = new Date(value)
  const today = new Date()
  if (date > today) return `${fieldName}不能大于当前日期`
  return null
}

export const validateDateAfter = (value: string, compareDate: string, fieldName: string): string | null => {
  if (!value.trim()) return `请选择${fieldName}`
  if (!compareDate) return null
  if (value <= compareDate) return `${fieldName}应大于${compareDate}`
  return null
}

export const validatePressure = (value: string): string | null => {
  if (!value.trim()) return '请输入压力值'
  if (!PRESSURE_REGEX.test(value)) return '压力值格式不正确，例如：0.35MPa'
  const pressureValue = parseFloat(value.replace('MPa', ''))
  if (pressureValue <= 0 || pressureValue > 10) return '压力值范围应为0-10MPa'
  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `请输入${fieldName}`
  return null
}

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) return `${fieldName}长度不能超过${maxLength}个字符`
  return null
}

export const validateForbiddenChars = (value: string, fieldName: string): string | null => {
  if (FORBIDDEN_CHARS_REGEX.test(value)) return `${fieldName}不能包含特殊字符（如<>{}\\[\\]|\\\`~!@#$%^&*等）`
  return null
}

export const validateModel = (value: string): string | null => {
  if (!value.trim()) return '请输入型号'
  if (value.length > 30) return '型号长度不能超过30个字符'
  if (!MODEL_REGEX.test(value)) return '型号只能包含中文、英文、数字、横线、下划线和斜杠'
  return null
}

export const validateSpecification = (value: string): string | null => {
  if (!value.trim()) return '请输入规格'
  if (value.length > 50) return '规格长度不能超过50个字符'
  if (!SPEC_REGEX.test(value)) return '规格只能包含中文、英文、数字、横线、下划线、斜杠、点和乘号'
  return null
}

export const validateInspector = (value: string): string | null => {
  if (!value.trim()) return '请输入检查人'
  if (value.length > 20) return '检查人姓名长度不能超过20个字符'
  if (!INSPECTOR_REGEX.test(value)) return '检查人姓名只能包含中文和英文，长度2-20个字符'
  return null
}

export const validateSelect = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `请选择${fieldName}`
  return null
}

export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  validators: Record<keyof T, (value: unknown) => string | null>
): ValidationResult => {
  const errors: Record<string, string> = {}
  
  for (const key of Object.keys(validators)) {
    const validator = validators[key as keyof T]
    const value = data[key as keyof T]
    const error = validator(value)
    
    if (error) {
      errors[key] = error
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}