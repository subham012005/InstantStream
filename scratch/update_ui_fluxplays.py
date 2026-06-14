import sys
import re

file_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\components\ImdbPlayerClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove CheckCircle2 from imports
content = content.replace('  CheckCircle2,\n', '')

# 2. Replace the previous preview_state with the new one
# The old preview state starts at `        {!isPlaying && streamData && (`
# and ends at the closing `          </motion.div>\n        )}` right before `        {/* ═══════════════ WATCH PAGE (PLAYING) ═══════════════ */}`
preview_pattern = re.compile(r'        \{\!isPlaying && streamData && \(\n          <motion\.div\n            key="preview".*?          </motion\.div>\n        \)\}\n', re.DOTALL)

new_preview_state = '''        {!isPlaying && streamData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#0B0B0B] text-white overflow-y-auto"
          >
            {/* Cinematic Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#E50914]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative min-h-screen px-4 md:px-12 py-8 md:py-16 max-w-7xl mx-auto flex flex-col">
              {/* Back Button */}
              <button
                onClick={() => {
                  setStreamData(null);
                  setImdbId("");
                }}
                className="self-start flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors text-sm font-medium mb-8 md:mb-16"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to search results
              </button>

              <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24">
                {/* Left Column: Poster & Action */}
                <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col gap-6">
                  {streamData.movie?.poster ? (
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                      <Image
                        src={streamData.movie.poster}
                        alt={streamData.movie.title || "Poster"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 380px"
                        priority
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {streamData.movie.type === "series" ? "Series" : "Movie"}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center">
                      <Film className="w-16 h-16 text-white/20" />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedServerId("auto");
                      setIsPlaying(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-[#E50914] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#b80710] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(229,9,20,0.3)]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Stream Now
                  </button>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 flex flex-col py-2">
                  <h1
                    className="font-black text-4xl md:text-5xl lg:text-6xl text-white mb-2 tracking-tight"
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    {streamData.movie?.title ?? streamData.imdbId}
                    {streamData.movie?.year && (
                      <span className="text-white/40 font-medium ml-4">({streamData.movie.year})</span>
                    )}
                  </h1>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#a8a8a8] mb-8">
                    {streamData.movie?.rating && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
                        {streamData.movie.rating}
                      </span>
                    )}
                    {streamData.movie?.runtime && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <Clock className="w-3.5 h-3.5" />
                        {streamData.movie.runtime}
                      </span>
                    )}
                    {streamData.movie?.released && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {streamData.movie.released}
                      </span>
                    )}
                    <span className="px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5 font-mono">
                      IMDB: {streamData.imdbId}
                    </span>
                  </div>

                  {/* Overview */}
                  {streamData.movie?.overview && (
                    <p 
                      className="text-base md:text-lg text-white/70 leading-relaxed mb-12 max-w-3xl" 
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {streamData.movie.overview}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    {streamData.movie?.actors && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5 sm:col-span-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">The Cast</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.actors}</span>
                      </div>
                    )}
                    {streamData.movie?.director && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Director</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.director}</span>
                      </div>
                    )}
                    {streamData.movie?.writer && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Writer</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.writer}</span>
                      </div>
                    )}
                    {streamData.movie?.genre && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5 sm:col-span-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Genres</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.genre}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
'''

content = re.sub(preview_pattern, new_preview_state, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete!")
