import sys
import re

file_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\app\movie-search\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add `tmdbDetails` state
state_pattern = r'  const \[backdropUrl, setBackdropUrl\] = useState<string \| null>\(null\);'
state_replacement = '''  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<any>(null);'''
content = re.sub(state_pattern, state_replacement, content)

# 2. Add setTmdbDetails(null) inside fetchDetails
fetch_reset_pattern = r'    setBackdropUrl\(null\);'
fetch_reset_replacement = '''    setBackdropUrl(null);
    setTmdbDetails(null);'''
content = re.sub(fetch_reset_pattern, fetch_reset_replacement, content)

# 3. Update the TMDB fetch logic
tmdb_fetch_pattern = r'const tmdbRes = await fetch\(`https://api.themoviedb.org/3/find/\$\{imdbID\}\?api_key=524c16f6e2a0a13c49ff7b99d27b5efb&external_source=imdb_id`\);\s*if \(tmdbRes.ok\) \{\s*const tmdbData = await tmdbRes\.json\(\);\s*const result = tmdbData\.movie_results\?\.\[0\] \|\| tmdbData\.tv_results\?\.\[0\];\s*if \(result\?\.backdrop_path\) \{\s*setBackdropUrl\(`https://image\.tmdb\.org/t/p/original\$\{result\.backdrop_path\}`\);\s*\}\s*\}'

tmdb_fetch_replacement = '''const tmdbRes = await fetch(`https://api.themoviedb.org/3/find/${imdbID}?api_key=524c16f6e2a0a13c49ff7b99d27b5efb&external_source=imdb_id`);
          if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            const result = tmdbData.movie_results?.[0] || tmdbData.tv_results?.[0];
            const type = tmdbData.movie_results?.length > 0 ? "movie" : "tv";
            if (result) {
              if (result.backdrop_path) {
                setBackdropUrl(`https://image.tmdb.org/t/p/original${result.backdrop_path}`);
              }
              // Fetch extended details
              const detailsRes = await fetch(`https://api.themoviedb.org/3/${type}/${result.id}?api_key=524c16f6e2a0a13c49ff7b99d27b5efb&append_to_response=credits,reviews`);
              if (detailsRes.ok) {
                const details = await detailsRes.json();
                setTmdbDetails(details);
              }
            }
          }'''
content = re.sub(tmdb_fetch_pattern, tmdb_fetch_replacement, content)

# 4. Change the layout in `// 2. Render Detail View`
layout_pattern = re.compile(r'    return \(\n      <motion\.main\n        key="preview"\n        initial=\{\{ opacity: 0, scale: 1\.05 \}\}.*?className="fixed inset-0 z-50 bg-\[#000000\] text-white overflow-hidden"\n      >', re.DOTALL)
layout_replacement = '''    return (
      <motion.main
        key="preview"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 bg-[#000000] text-white overflow-y-auto overflow-x-hidden"
      >
        {/* Full-Screen Hero Section */}
        <div className="relative w-full h-screen min-h-[600px] flex flex-col justify-end">'''
content = re.sub(layout_pattern, layout_replacement, content)

# 5. Append new scrollable sections before `</motion.main>`
end_pattern = re.compile(r'          </div>\n        </div>\n      </motion\.main>\n    \);\n  }', re.DOTALL)
end_replacement = '''          </div>
        </div>
        </div> {/* End of Hero Section */}

        {/* Scrollable Expanded Details Section */}
        {tmdbDetails && (
          <div className="relative z-10 bg-[#000000] pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
              
              {/* Top Meta Info Bar */}
              <div className="py-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div>
                  <h4 className="text-[#a8a8a8] text-xs font-bold uppercase tracking-widest mb-1">Status</h4>
                  <p className="text-white font-medium">{tmdbDetails.status || "Unknown"}</p>
                </div>
                {tmdbDetails.budget > 0 && (
                  <div>
                    <h4 className="text-[#a8a8a8] text-xs font-bold uppercase tracking-widest mb-1">Budget</h4>
                    <p className="text-white font-medium">${(tmdbDetails.budget / 1000000).toFixed(1)}M</p>
                  </div>
                )}
                {tmdbDetails.revenue > 0 && (
                  <div>
                    <h4 className="text-[#a8a8a8] text-xs font-bold uppercase tracking-widest mb-1">Revenue</h4>
                    <p className="text-white font-medium">${(tmdbDetails.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                )}
                {tmdbDetails.vote_count > 0 && (
                  <div>
                    <h4 className="text-[#a8a8a8] text-xs font-bold uppercase tracking-widest mb-1">TMDB Rating</h4>
                    <p className="text-white font-medium">{tmdbDetails.vote_average?.toFixed(1)} ({tmdbDetails.vote_count} votes)</p>
                  </div>
                )}
              </div>

              {/* Cast & Crew Section */}
              {tmdbDetails.credits?.cast?.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-sora)] mb-8">Cast & Crew</h3>
                  <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 snap-x scrollbar-hide">
                    {tmdbDetails.credits.cast.slice(0, 15).map((actor: any) => (
                      <div key={actor.id} className="min-w-[140px] w-[140px] flex flex-col gap-3 snap-start group cursor-pointer">
                        <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-white/5 relative border border-white/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:border-white/30">
                          {actor.profile_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <span className="text-3xl font-bold uppercase">{actor.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm leading-tight truncate">{actor.name}</p>
                          <p className="text-[#a8a8a8] text-xs truncate mt-0.5">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {tmdbDetails.reviews?.results?.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-sora)] mb-8">Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tmdbDetails.reviews.results.slice(0, 4).map((review: any) => (
                      <div key={review.id} className="bg-[#121212] p-6 md:p-8 rounded-[12px] border border-white/5 flex flex-col gap-4 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white uppercase overflow-hidden border border-white/20 shrink-0">
                            {review.author_details?.avatar_path ? (
                               // eslint-disable-next-line @next/next/no-img-element
                              <img src={review.author_details.avatar_path.startsWith('/') ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}` : review.author_details.avatar_path.slice(1)} alt={review.author} className="w-full h-full object-cover" />
                            ) : (
                              review.author.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-white font-bold">{review.author}</p>
                            {review.author_details?.rating && (
                              <div className="flex items-center gap-1 mt-1 text-[#F5C518]">
                                <Star className="w-3 h-3 fill-[#F5C518]" />
                                <span className="text-xs font-bold">{review.author_details.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[#a8a8a8] text-sm leading-relaxed line-clamp-4 font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}
      </motion.main>
    );
  }'''
content = re.sub(end_pattern, end_replacement, content)

# 6. Add custom CSS for hide-scrollbar in globals.css if not present
globals_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\app\globals.css'
with open(globals_path, 'r', encoding='utf-8') as f:
    globals_content = f.read()

if '.scrollbar-hide' not in globals_content:
    globals_content += '''\n
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
'''
    with open(globals_path, 'w', encoding='utf-8') as f:
        f.write(globals_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("UI successfully updated with TMDB details.")
