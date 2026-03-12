import type { Song } from '../types/models';

interface ResultsTableProps {
  songs: Song[];
}

export function ResultsTable(props: ResultsTableProps) {
  if (props.songs.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Results</h2>
      <div className="results-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>BPM</th>
              <th>Key</th>
              <th>Song</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
            </tr>
          </thead>
          <tbody>
            {props.songs.map((song) => (
              <tr key={song._id}>
                <td>{song.BPM}</td>
                <td>{song.Key}</td>
                <td>{song.Song}</td>
                <td>{song.Artist}</td>
                <td>{song.Album}</td>
                <td>{song.genre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
