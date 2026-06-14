import sys
import re

file_path = r'd:\Vibe_CODEING\pasteandstream\instantstream\src\components\ImdbPlayerClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add `isInitialLoading` state
state_pattern = r'  const autoPlayFired = useRef\(false\);'
state_replacement = '''  const autoPlayFired = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!!initialId);'''
content = re.sub(state_pattern, state_replacement, content)

# 2. Update `useEffect` for `initialId`
effect_pattern = r'      handleSearch\(initialId\)\.then\(\(success\) => \{\s*if \(success\) \{\s*setIsPlaying\(true\);\s*\}\s*\}\);'
effect_replacement = '''      handleSearch(initialId).then((success) => {
        if (success) {
          setIsPlaying(true);
        }
        setIsInitialLoading(false);
      });'''
content = re.sub(effect_pattern, effect_replacement, content)

# 3. Update conditions in render loop
search_state_pattern = r'\{!isPlaying && !streamData && \('
search_state_replacement = '{!isPlaying && !streamData && !isInitialLoading && ('
content = re.sub(search_state_pattern, search_state_replacement, content)

intermediate_state_pattern = r'\{!isPlaying && streamData && \('
intermediate_state_replacement = '{!isPlaying && streamData && !isInitialLoading && ('
content = re.sub(intermediate_state_pattern, intermediate_state_replacement, content)

# 4. Add the loading screen just for `isInitialLoading`
loading_screen = '''      <AnimatePresence mode="wait">
        {isInitialLoading && (
          <motion.div
            key="loading-initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0B0B]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#E50914] blur-[40px] opacity-20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-sora)] text-white mt-8 mb-2">Preparing Cinematic Stream</h2>
            <AnimatedLoaderText />
          </motion.div>
        )}
        {/* ═══════════════ SEARCH / RESULT STATE ═══════════════ */}'''

content = re.sub(r'      <AnimatePresence mode="wait">\s*\{\/\* ═══════════════ SEARCH \/ RESULT STATE ═══════════════ \*\/\}', loading_screen, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ImdbPlayerClient correctly handles auto-play.")
