export interface ParsedSalary {
  min: number
  max: number | null
  currency: string
  unit: string
  display: string
}

const SALARY_REGEX = /([₹$£€]?)\s*([\d.]+)\s*[-–—]\s*([\d.]+)?\s*(LPA|lpa|L|l|k|K|USD|INR)?/

export function parseSalaryRange(raw: string): ParsedSalary | null {
  if (!raw) return null
  const match = raw.match(SALARY_REGEX)
  if (!match) return null

  const currency = match[1] || (raw.includes('₹') ? '₹' : raw.toUpperCase().includes('INR') ? '₹' : '$')
  const min = parseFloat(match[2])
  const max = match[3] ? parseFloat(match[3]) : null
  const rawUnit = match[4] ?? ''
  const unit = rawUnit.toUpperCase() === 'L' || rawUnit.toLowerCase() === 'lpa' ? 'LPA'
    : rawUnit.toLowerCase() === 'k' ? 'K'
    : rawUnit.toUpperCase()

  if (isNaN(min)) return null

  const display = max
    ? `${currency}${min}–${max} ${unit}`.trim()
    : `${currency}${min}+ ${unit}`.trim()

  return { min, max, currency, unit, display }
}
