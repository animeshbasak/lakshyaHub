// src/lib/scrapers/buildSearchQuery.ts

export function buildSearchQueries(
  userTitle: string,
  location: string
): { query: string; location: string }[] {
  // Expand the query to cover senior role variants
  const seniorPrefixes = ['Lead', 'Staff', 'Principal', 'Senior Staff', 'Engineering Manager']
  const baseTitles = userTitle
    ? [userTitle]
    : ['Frontend Engineer', 'Full Stack Engineer', 'Software Engineer']

  // Generate combinations
  const queries: { query: string; location: string }[] = []

  for (const prefix of seniorPrefixes) {
    for (const title of baseTitles) {
      queries.push({ query: `${prefix} ${title}`, location })
    }
  }

  // Add the base titles as well
  for (const title of baseTitles) {
      queries.push({ query: title, location })
  }

  // Shuffle and cap at 6 to keep scrape fast but diverse
  return queries.sort(() => Math.random() - 0.5).slice(0, 6)
}

// Multiple LinkedIn URLs — one per query variant
export function buildLinkedInUrls(queries: { query: string; location: string }[]): string[] {
  return queries.map(({ query, location }) => {
    const params = new URLSearchParams({
      keywords: query,
      location: location,
      f_E: '4,5,6',        // experience levels: Associate, Mid-Senior, Director
      f_TPR: 'r604800',    // last 7 days
      sortBy: 'DD',        // most recent first
    })
    return `https://www.linkedin.com/jobs/search?${params.toString()}`
  })
}
