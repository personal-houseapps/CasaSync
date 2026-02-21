export default function NameSelect({ onSelect }) {
  return (
    <div className="name-select">
      <div className="name-select-content">
        <h1 className="name-select-title">CasaSync</h1>
        <p className="name-select-subtitle">Who are you?</p>
        <div className="name-select-buttons">
          <button
            className="name-btn name-btn-filipa"
            onClick={() => onSelect('Filipa')}
          >
            <span className="name-btn-emoji">👩</span>
            <span className="name-btn-name">Filipa</span>
          </button>
          <button
            className="name-btn name-btn-rafael"
            onClick={() => onSelect('Rafael')}
          >
            <span className="name-btn-emoji">👨</span>
            <span className="name-btn-name">Rafael</span>
          </button>
        </div>
      </div>
    </div>
  );
}
