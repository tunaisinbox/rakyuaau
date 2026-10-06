import { useState } from 'react';

export default function FloatingInput({
  label, value, onChange, type = 'text', required,
  children, // optional right slot (eye button)
  inputRef,
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || (value && value.length > 0);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={`
          peer w-full px-4 pt-5 pb-2 ${children ? 'pr-12' : ''}
          rounded-xl border-2 bg-white outline-none transition-all text-foreground text-sm
          ${focused ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-200'}
        `}
        placeholder=" "
      />
      {/* Floating label */}
      <label
        className={`
          absolute left-4 pointer-events-none select-none transition-all duration-200 origin-left
          ${lifted
            ? 'top-1.5 text-[10px] font-semibold text-pink-500'
            : 'top-3.5 text-sm text-muted-foreground'}
        `}
      >
        {label}
      </label>
      {children && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}