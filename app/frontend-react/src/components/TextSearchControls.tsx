export type TextSearchMode = 'smart' | 'artist' | 'album' | 'song';

interface TextSearchControlsProps {
  query: string;
  mode: TextSearchMode;
  onQueryChange: (query: string) => void;
  onModeChange: (mode: TextSearchMode) => void;
  onSearch: () => void;
}

export function TextSearchControls(props: TextSearchControlsProps) {
  return (
    <section className="panel">
      <h2>Text Search</h2>
      <p className="hint">Run smart search or target Artist / Album / Song explicitly.</p>

      <div className="search-row">
        <input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Artist, Album, Song"
        />

        <select value={props.mode} onChange={(event) => props.onModeChange(event.target.value as TextSearchMode)}>
          <option value="smart">Smart</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="song">Song</option>
        </select>

        <button type="button" onClick={props.onSearch}>
          Search
        </button>
      </div>
    </section>
  );
}
