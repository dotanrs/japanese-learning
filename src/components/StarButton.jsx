import { useStarred } from './StarredProvider.jsx'

export default function StarButton({ card }) {
  const { isStarred, toggleCard } = useStarred()
  const selected = isStarred(card.id)
  const label = selected ? `Remove ${card.jp} from starred` : `Save ${card.jp} to starred`

  return (
    <button
      type="button"
      className={'star-btn' + (selected ? ' starred' : '')}
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        toggleCard(card)
      }}
    >
      <span aria-hidden="true">{selected ? '★' : '☆'}</span>
    </button>
  )
}

