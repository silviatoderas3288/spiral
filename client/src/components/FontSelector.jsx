import { useState, useRef, useEffect } from 'react'

function FontSelector({ value, onChange, disabled, fonts }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (font) => {
    onChange(font)
    setIsOpen(false)
  }

  return (
    <div className="custom-font-selector" ref={dropdownRef}>
      <div
        className={`font-selector-display ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ fontFamily: value }}
      >
        {value}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="font-selector-dropdown">
          {fonts.map((font) => (
            <div
              key={font}
              className={`font-option ${value === font ? 'selected' : ''}`}
              style={{ fontFamily: font }}
              onClick={() => handleSelect(font)}
            >
              {font}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FontSelector
