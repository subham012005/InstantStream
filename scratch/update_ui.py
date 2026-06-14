import sys
import re

file_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\components\ImdbPlayerClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change {!isPlaying && ( to {!isPlaying && !streamData && (
content = content.replace('{!isPlaying && (\n          <motion.main', '{!isPlaying && !streamData && (\n          <motion.main')

# 2. Find the AnimatePresence block that wraps the result card and remove it.
# It starts with <AnimatePresence> and ends with </AnimatePresence> right before </motion.main>
result_card_pattern = re.compile(r'<AnimatePresence>\s*\{\(streamData\?\.url \|\| streamData\?\.playerUrl\) && \(\s*<motion\.div.*?</motion\.div>\s*\)\}\s*</AnimatePresence>', re.DOTALL)
content = re.sub(result_card_pattern, '', content)

# 3. Add the new preview state after the </motion.main>\n        )}
preview_state = '''
        {!isPlaying && streamData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#000000] text-white overflow-hidden"
          >
            {/* Background Image with Gradients */}
            {streamData.movie?.poster && (
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={streamData.movie.poster}
                  alt={streamData.movie.title || "Poster"}
                  fill
                  className="object-cover opacity-50"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent h-2/3 bottom-0" />
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => {
                setStreamData(null);
                setImdbId("");
              }}
              className="absolute top-8 left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 z-10 flex flex-col justify-end">
              <div className="max-w-4xl">
                {/* Title */}
                <h1
                  className="font-black text-6xl md:text-8xl lg:text-[100px] text-white mb-6 leading-none tracking-tight drop-shadow-2xl"
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  {streamData.movie?.title ?? streamData.imdbId}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-[#a8a8a8] mb-6">
                  {streamData.movie?.rating && (
                    <span className="flex items-center gap-1.5 text-[#F5C518]">
                      <Star className="w-5 h-5 fill-[#F5C518]" />
                      {Math.round(float(streamData.movie.rating) * 10) if streamData.movie.rating else "NR"}% Match
                    </span>
                  )}
                  {streamData.movie?.year && (
                    <span className="text-white drop-shadow-md">{streamData.movie.year}</span>
                  )}
                  <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                    {streamData.movie?.type === "series" ? "Series" : "NR"}
                  </span>
                  <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                    HD
                  </span>
                </div>

                {/* Overview */}
                {streamData.movie?.overview && (
                  <p 
                    className="text-base md:text-lg text-white/90 line-clamp-3 leading-relaxed mb-10 max-w-2xl drop-shadow-md font-medium" 
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {streamData.movie.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedServerId("auto");
                      setIsPlaying(true);
                    }}
                    className="flex items-center justify-center gap-3 bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-[4px] font-bold text-lg hover:bg-white/80 transition-colors"
                  >
                    <Play className="w-6 h-6 fill-black" />
                    Play
                  </button>
                  
                  <button className="flex items-center justify-center gap-3 bg-[#2f2f2f]/80 backdrop-blur-md border border-[#404040] text-white px-8 py-3 md:py-4 rounded-[4px] font-bold text-lg hover:bg-[#404040] transition-colors">
                    <Film className="w-6 h-6" />
                    Trailer
                  </button>

                  <button className="flex items-center justify-center w-12 h-12 md:w-[60px] md:h-[60px] bg-[#2f2f2f]/80 backdrop-blur-md border border-[#404040] text-white rounded-full hover:bg-[#404040] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
'''
# JS syntax requires fixing the Math.round logic in React
preview_state = preview_state.replace('{Math.round(float(streamData.movie.rating) * 10) if streamData.movie.rating else "NR"}% Match', '{Math.round(Number(streamData.movie.rating) * 10) || streamData.movie.rating}% Match')

content = content.replace('</motion.main>\n        )}', '</motion.main>\n        )}\n' + preview_state)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete!")
