const API_URLS = [
  { label: 'Mapping', url: 'https://prices.runescape.wiki/api/v1/osrs/mapping' },
  { label: 'Latest prices', url: 'https://prices.runescape.wiki/api/v1/osrs/latest' },
  { label: '5-minute avg', url: 'https://prices.runescape.wiki/api/v1/osrs/5m' },
  { label: '1-hour avg', url: 'https://prices.runescape.wiki/api/v1/osrs/1h' },
];

export default function ErrorScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Failed to load price data</h1>
      <p className="text-muted-foreground max-w-sm">
        Could not reach the OSRS Wiki API. Check the endpoints below, then refresh the page.
      </p>
      <button
        onClick={() => window.location.replace('/')}
        className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium transition-colors"
      >
        Refresh
      </button>
      <ul className="text-sm space-y-1">
        {API_URLS.map(({ label, url }) => (
          <li key={url}>
            <span className="text-muted-foreground mr-2">{label}</span>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 hover:underline break-all"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
