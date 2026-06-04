import { useEffect, useMemo, useRef, useState } from 'react'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { cn } from '@/lib/utils'

countries.registerLocale(enLocale)

const ALL_COUNTRIES = (() => {
  const names = countries.getNames('en', { select: 'official' })
  return Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()

interface CountrySelectProps {
  value: string
  onChange: (code: string) => void
  placeholder?: string
}

export function CountrySelect({ value, onChange, placeholder = 'Search country...' }: CountrySelectProps) {
  const selectedName = useMemo(
    () => (value ? (countries.getName(value, 'en') ?? '') : ''),
    [value]
  )
  const [inputValue, setInputValue] = useState(selectedName)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(selectedName)
  }, [selectedName])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setInputValue(selectedName)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [selectedName])

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase()
    if (!q) return ALL_COUNTRIES
    return ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
  }, [inputValue])

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={inputValue}
        onChange={e => { setInputValue(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {filtered.map(c => (
            <button
              key={c.code}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                onChange(c.code)
                setInputValue(c.name)
                setOpen(false)
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                value === c.code && 'bg-muted font-medium'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
