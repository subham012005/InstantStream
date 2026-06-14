import sys
import re

file_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\app\movie-search\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the content of `if (selectedMovie) { ... return ( ... ); }`
# Find the start of the return statement inside `if (selectedMovie)`
# `    return (\n      <motion.main `
# all the way to `      </motion.main>\n    );\n  }`

pattern = re.compile(r'    return \(\n      <motion\.main \n        initial=\{\{ opacity: 0 \}\}.*?      </motion\.main>\n    \);\n', re.DOTALL)

new_layout = '''    return (
      <motion.main
        key="preview"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 bg-[#000000] text-white overflow-hidden"
      >
        {/* Background Image with Gradients */}
        {hasPoster && (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedMovie.Poster}
              alt={selectedMovie.Title || "Poster"}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent h-2/3 bottom-0" />
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => setSelectedMovie(null)}
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
              {selectedMovie.Title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-[#a8a8a8] mb-6">
              {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                <span className="flex items-center gap-1.5 text-[#F5C518]">
                  <Star className="w-5 h-5 fill-[#F5C518]" />
                  {Math.round(Number(selectedMovie.imdbRating) * 10) || selectedMovie.imdbRating}% Match
                </span>
              )}
              {selectedMovie.Year && selectedMovie.Year !== "N/A" && (
                <span className="text-white drop-shadow-md">{selectedMovie.Year}</span>
              )}
              <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                {selectedMovie.Type === "series" ? "Series" : "Movie"}
              </span>
              <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                HD
              </span>
            </div>

            {/* Overview */}
            {selectedMovie.Plot && selectedMovie.Plot !== "N/A" && (
              <p 
                className="text-base md:text-lg text-white/90 line-clamp-3 leading-relaxed mb-10 max-w-2xl drop-shadow-md font-medium" 
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {selectedMovie.Plot}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/imdb-movie-stream-player?id=${selectedMovie.imdbID}`}
                className="flex items-center justify-center gap-3 bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-[4px] font-bold text-lg hover:bg-white/80 transition-colors"
              >
                <Play className="w-6 h-6 fill-black" />
                Play
              </Link>
              
              <button className="flex items-center justify-center gap-3 bg-[#2f2f2f]/80 backdrop-blur-md border border-[#404040] text-white px-8 py-3 md:py-4 rounded-[4px] font-bold text-lg hover:bg-[#404040] transition-colors cursor-default">
                <Film className="w-6 h-6" />
                Trailer
              </button>

              <button className="flex items-center justify-center w-12 h-12 md:w-[60px] md:h-[60px] bg-[#2f2f2f]/80 backdrop-blur-md border border-[#404040] text-white rounded-full hover:bg-[#404040] transition-colors cursor-default">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    );
'''

new_content = re.sub(pattern, new_layout, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Update complete!")
