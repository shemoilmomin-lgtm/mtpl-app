/**
 * UserAvatar — shows a user's profile photo if available, falls back to initials.
 *
 * Props:
 *   name      — user's display name (for initials + alt text)
 *   photoUrl  — presigned URL string or null/undefined
 *   size      — Tailwind size class, e.g. 'size-8' (default)
 *   textSize  — Tailwind text class for initials, e.g. 'text-xs' (default)
 *   className — extra classes on the wrapper
 *   dark      — when true, uses white text/bg (sidebar usage)
 */
export function UserAvatar({ name, photoUrl, size = 'size-8', textSize = 'text-xs', className = '', dark = false }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const base = `${size} rounded-full shrink-0 overflow-hidden flex items-center justify-center ${className}`

  if (photoUrl) {
    return (
      <div className={base}>
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
        {/* fallback shown if image fails */}
        <span
          style={{ display: 'none' }}
          className={`w-full h-full items-center justify-center font-semibold ${textSize} ${dark ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'}`}
        >
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={`${base} font-semibold ${textSize} ${dark ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'}`}>
      {initials}
    </div>
  )
}
