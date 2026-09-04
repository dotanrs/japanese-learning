import { useStarred } from './StarredProvider.jsx'

export default function StarButton({ card }) {
  const { isStarred, toggleCard } = useStarred()
  const selected = isStarred(card.id)
  const cardName = card.jp || card.romaji
  const label = selected ? `Remove ${cardName} from starred` : `Save ${cardName} to starred`

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
