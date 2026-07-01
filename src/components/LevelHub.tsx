import { useQuestStore } from "../store/questStore";
import { translations } from "../constants/translations";

export default function LevelHub() {
  const { setLevel, language, setLanguage, score, title } = useQuestStore();

  const handleLevelClick = (lvl: 1 | 2 | 3) => {
    setLevel(lvl);
  };

  return (
    <div className="min-h-screen w-full bg-[#050510] text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Navigation Row */}
      <div className="flex items-center justify-between w-full z-10">
        {/* Title / Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-[bounce_1.5s_infinite]">🤖</span>
          <div>
            <h1 className="text-2xl font-black text-cyan-300 tracking-wide">
              {language === 'ur' ? 'ایجنٹک کرافٹ' : 'AgenticCraft'}
            </h1>
            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">
              AI Playground for Kids
            </p>
          </div>
        </div>

        {/* Stats and Language */}
        <div className="flex items-center gap-4">
          {/* Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-indigo-500/30 rounded-2xl px-4 py-2">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Rank:</span>
            <span className="text-xs font-bold text-indigo-200">{title}</span>
            <span className="text-indigo-500/50">|</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Score:</span>
            <span className="text-xs font-bold text-indigo-200">{score} BP</span>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-slate-950/80 border border-slate-800 rounded-full p-1 shadow-md">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'ur'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      {/* Main Level Cards Map */}
      <div className="my-auto py-10 flex flex-col items-center gap-8 z-10 w-full max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400">
            {language === 'ur' ? 'اپنا لیول منتخب کریں!' : 'Choose Your Mission!'}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            {language === 'ur'
              ? 'اپنا AI اور ایجنٹ ایڈونچر شروع کرنے کے لیے نیچے دیے گئے لیولز میں سے ایک چنیں!'
              : 'Choose a level to start your AI and Agentic building adventure!'}
          </p>
        </div>

        {/* 3 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
          {/* Level 1 Card */}
          <div className="group rounded-3xl bg-slate-900/90 border-2 border-amber-500/40 hover:border-amber-400 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] relative overflow-hidden min-h-[360px]">
            <div className="absolute top-3 right-3 bg-amber-500/10 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold border border-amber-500/20">
              Level 1
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 text-3xl">
                👂
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-amber-200">
                  {language === 'ur' ? 'AI کیا ہے؟' : 'What is AI?'}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {language === 'ur'
                    ? 'سیکھیں کہ AI کیسے سنتا ہے (کان)، سوچتا ہے (دماغ)، اور بولتا ہے (منہ)!'
                    : 'Learn how an AI listens (Input), thinks (Brain Core), and talks back to you (Output)!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLevelClick(1)}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs tracking-wider transition-colors shadow-md uppercase"
            >
              {language === 'ur' ? 'لیول 1 کھیلیں 🎮' : 'Play Level 1 🎮'}
            </button>
          </div>

          {/* Level 2 Card */}
          <div className="group rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 hover:border-emerald-400 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] relative overflow-hidden min-h-[360px]">
            <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
              Level 2
            </div>

            <div className="space-y-4 mt-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-3xl">
                🛠️
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-emerald-200">
                  {language === 'ur' ? 'AI ایجنٹس اور ٹولز' : 'AI Agents & Tools'}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {language === 'ur'
                    ? 'اپنے AI کو جادوئی طاقتیں دیں! کیلکولیٹر یا سرچ جیسے ٹولز کو جوڑیں!'
                    : 'Give your AI superpowers! Connect a Mod Chip (Tool) so it can search the web and solve math!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLevelClick(2)}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs tracking-wider transition-colors shadow-md uppercase"
            >
              {language === 'ur' ? 'لیول 2 کھیلیں 🎮' : 'Play Level 2 🎮'}
            </button>
          </div>

          {/* Level 3 Card */}
          <div className="group rounded-3xl bg-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-400 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] relative overflow-hidden min-h-[360px]">
            <div className="absolute top-3 right-3 bg-indigo-500/10 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
              Level 3
            </div>

            <div className="space-y-4 mt-4">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/30 text-3xl">
                🤝
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-indigo-200">
                  {language === 'ur' ? 'ملٹی ایجنٹ ٹیمیں' : 'Multi-Agent Teams'}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {language === 'ur'
                    ? 'بہت سے دماغوں کو ملا کر کام کروائیں! دو AI دماغوں کو آپس میں جوڑیں!'
                    : 'Supercharge your build! Connect multiple AI brains in a chain so they can talk and help each other!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLevelClick(3)}
              className="w-full mt-6 bg-indigo-500 hover:bg-indigo-400 text-white font-black py-3 px-4 rounded-2xl text-xs tracking-wider transition-colors shadow-md uppercase"
            >
              {language === 'ur' ? 'لیول 3 کھیلیں 🎮' : 'Play Level 3 🎮'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-500 w-full z-10 mt-6">
        © 2026 AgenticCraft. Created with ❤️ for young creators.
      </div>
    </div>
  );
}
