export function HpBar({
  current,
  max,
  label,
}: {
  current: number
  max: number
  label?: string
}) {
  const percent = max > 0 ? Math.round((current / max) * 100) : 0

  return (
    <div className="hp-bar">
      {label && <span className="hp-bar__label">{label}</span>}
      <div className="hp-bar__track">
        <div className="hp-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="hp-bar__text">
        {current} / {max}
      </span>
    </div>
  )
}
