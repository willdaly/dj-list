import { GENRE_OPTIONS, KEY_OPTIONS } from '../constants/search-options';

interface GenreKeyBpmControlsProps {
  selectedGenres: string[];
  keyValue: string;
  bpmMin: number;
  bpmMax: number;
  onToggleGenre: (genre: string) => void;
  onKeyChange: (key: string) => void;
  onBpmMinChange: (value: number) => void;
  onBpmMaxChange: (value: number) => void;
  onSearchByGenre: () => void;
  onSearchByBpm: () => void;
  onSearchByKey: () => void;
  onSearchByBpmKey: () => void;
}

export function GenreKeyBpmControls(props: GenreKeyBpmControlsProps) {
  return (
    <section className="panel">
      <h2>Genre / Key / BPM</h2>

      <div className="genres-list">
        {GENRE_OPTIONS.map((genre) => {
          const selected = props.selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              className={selected ? 'genre-pill selected' : 'genre-pill'}
              onClick={() => props.onToggleGenre(genre)}
            >
              {genre}
            </button>
          );
        })}
      </div>

      <div className="controls-grid">
        <label>
          Key
          <select value={props.keyValue} onChange={(event) => props.onKeyChange(event.target.value)}>
            {KEY_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label>
          BPM Min
          <input
            type="number"
            value={props.bpmMin}
            onChange={(event) => props.onBpmMinChange(Number(event.target.value))}
          />
        </label>

        <label>
          BPM Max
          <input
            type="number"
            value={props.bpmMax}
            onChange={(event) => props.onBpmMaxChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="controls-actions">
        <button type="button" onClick={props.onSearchByGenre}>
          Genres
        </button>
        <button type="button" onClick={props.onSearchByBpm}>
          Genres + BPM
        </button>
        <button type="button" onClick={props.onSearchByKey}>
          Genres + Key
        </button>
        <button type="button" onClick={props.onSearchByBpmKey}>
          Genres + BPM + Key
        </button>
      </div>
    </section>
  );
}
