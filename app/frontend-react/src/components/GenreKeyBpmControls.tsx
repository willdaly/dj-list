import { GENRE_OPTIONS, KEY_OPTIONS, CAMELOT_OPTIONS, ENERGY_OPTIONS, SET_CATEGORY_OPTIONS } from '../constants/search-options';

interface GenreKeyBpmControlsProps {
  selectedGenres: string[];
  keyValue: string;
  bpmMin: number;
  bpmMax: number;
  camelotValue: string;
  energyValue: string;
  setCategoryValue: string;
  onToggleGenre: (genre: string) => void;
  onKeyChange: (key: string) => void;
  onBpmMinChange: (value: number) => void;
  onBpmMaxChange: (value: number) => void;
  onCamelotChange: (value: string) => void;
  onEnergyChange: (value: string) => void;
  onSetCategoryChange: (value: string) => void;
  onSearchByGenre: () => void;
  onSearchByBpm: () => void;
  onSearchByKey: () => void;
  onSearchByBpmKey: () => void;
  onSearchByCamelot: () => void;
  onSearchByEnergy: () => void;
  onSearchBySetCategory: () => void;
}

const inputBase =
  'w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const btnPrimary =
  'rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

const btnPill =
  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

export function GenreKeyBpmControls(props: GenreKeyBpmControlsProps) {
  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 p-5 first:mt-0">
      <h2 className="text-base font-semibold text-gray-900">Genre / Key / BPM</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {GENRE_OPTIONS.map((genre) => {
          const selected = props.selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              className={`${btnPill} ${
                selected
                  ? 'border-red-300 bg-red-50 text-red-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => props.onToggleGenre(genre)}
            >
              {genre}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Key
          <select
            value={props.keyValue}
            onChange={(event) => props.onKeyChange(event.target.value)}
            className={inputBase}
          >
            {KEY_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          BPM Min
          <input
            type="number"
            value={props.bpmMin}
            onChange={(event) => props.onBpmMinChange(Number(event.target.value))}
            className={inputBase}
            min={1}
            max={300}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          BPM Max
          <input
            type="number"
            value={props.bpmMax}
            onChange={(event) => props.onBpmMaxChange(Number(event.target.value))}
            className={inputBase}
            min={1}
            max={300}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Camelot Code
          <select
            value={props.camelotValue}
            onChange={(event) => props.onCamelotChange(event.target.value)}
            className={inputBase}
          >
            {CAMELOT_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Energy Tier
          <select
            value={props.energyValue}
            onChange={(event) => props.onEnergyChange(event.target.value)}
            className={inputBase}
          >
            {ENERGY_OPTIONS.map((tier) => (
              <option key={tier} value={tier}>
                {tier.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Set Category
          <select
            value={props.setCategoryValue}
            onChange={(event) => props.onSetCategoryChange(event.target.value)}
            className={inputBase}
          >
            {SET_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByGenre()}>
          Genres
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByBpm()}>
          Genres + BPM
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByKey()}>
          Genres + Key
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByBpmKey()}>
          Genres + BPM + Key
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByCamelot()}>
          Camelot
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchByEnergy()}>
          Energy
        </button>
        <button type="button" className={btnPrimary} onClick={() => props.onSearchBySetCategory()}>
          Set Category
        </button>
      </div>
    </section>
  );
}
