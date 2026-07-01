export interface Translations {
  welcomeMsg: string;
  input_node: string;
  llm_node: string;
  tool_node: string;
  output_node: string;
  
  welcome_level_1: string;
  welcome_level_2: string;
  welcome_level_3: string;
  
  level_1_instruction: string;
  level_2_instruction: string;
  level_3_instruction: string;
  
  level_1_complete: string;
  level_2_complete: string;
  level_3_complete: string;
  
  level_up: string;
  title_apprentice: string;
  title_wizard: string;
  title_grandmaster: string;
  
  quest_log: string;
  points: string;
  run_desc: string;
  
  chk_blocks: string;
  chk_ears_brain: string;
  chk_brain_mouth: string;
  chk_ears_brain_mouth: string;
  chk_tool_brain: string;
  chk_ears_brain1: string;
  chk_brain1_brain2: string;
  chk_brain2_mouth: string;
}

export const translations: Record<'en' | 'ur', Translations> = {
  en: {
    welcomeMsg: "Hey there, young Commander! I'm Circuit, your AI sidekick. Welcome to AgenticCraft! Let's select a level from the map to begin!",
    
    input_node: "This is your robot's Ears block! We use it to type messages or questions for our robot. When you run the simulation, the Ears listen to what you wrote and send it down the wire to the AI brain!",
    
    llm_node: "This is the Brain Core! It uses artificial intelligence to think of stories, answers, and jokes. You can slide the Creativity bar: slide left to make it a serious professor, or slide right to make it a super silly storyteller!",
    
    tool_node: "This is the Mod Chip Tool! It gives the AI brain extra powers like hands. You can choose Google Search to find facts on the internet, or Calculator to solve hard math problems!",
    
    output_node: "This is the Mouth block! It receives the thoughts from the AI brain and speaks them out loud in a friendly voice. Connect it at the end so you can hear your robot talk back!",
    
    welcome_level_1: "Let's build a simple AI brain! Wire Ears (Input) ➡️ Brain Core (LLM) ➡️ Mouth (Output). Connect them so our AI can listen and speak!",
    welcome_level_2: "Build an AI Agent! An Agent is a brain that has 'hands' (Tools) to do work. Wire a Mod Chip (Tool) like a Calculator to the Brain Core!",
    welcome_level_3: "Build a Multi-Agent Team! 'Agentic AI' means multiple AI brains working together to collaborate. Connect two Brain Core blocks in a chain: Ears ➡️ Brain 1 ➡️ Brain 2 ➡️ Mouth!",
    
    level_1_instruction: "Wiring complete! Now click the Run button, type a friendly hello, and let's hear your AI brain think!",
    level_2_instruction: "Ears, Brain, and Hands are connected! Now type a math problem like 'What is 156 * 24' and run it to watch your agent use its hands!",
    level_3_instruction: "Multi-agent chain wired! Type a simple word like 'magic' or 'space' and run the simulation to see both brains collaborate!",
    
    level_1_complete: "Hooray! Level 1 Complete! You built a thinking AI! Let's move to Level 2!",
    level_2_complete: "Boom! Level 2 Complete! Your AI agent now has hands to calculate and search! Unlocking Level 3!",
    level_3_complete: "Ultimate Victory! Level 3 Complete! You built a collaborative multi-agent system! You are a certified Logic Grandmaster!",
    
    level_up: "Woohoo! Your score went up! You are now a {title}! You're a rockstar!",
    title_apprentice: "AI Apprentice",
    title_wizard: "Circuit Wizard",
    title_grandmaster: "Logic Grandmaster",
    
    quest_log: "Quest Log",
    points: "BP",
    run_desc: "Run Simulation",
    
    chk_blocks: "Add Ears, Brain & Mouth blocks",
    chk_ears_brain: "Connect Ears to Brain",
    chk_brain_mouth: "Connect Brain to Mouth",
    chk_ears_brain_mouth: "Connect Ears ➡️ Brain ➡️ Mouth",
    chk_tool_brain: "Connect Mod Chip (Tool) to Brain",
    chk_ears_brain1: "Connect Ears to Brain 1",
    chk_brain1_brain2: "Connect Brain 1 to Brain 2",
    chk_brain2_mouth: "Connect Brain 2 to Mouth"
  },
  ur: {
    welcomeMsg: "ہیلو ننھے کمانڈر! میں ہوں سرکٹ، آپ کا دوست۔ لیول میپ میں سے کوئی ایک لیول منتخب کریں!",
    
    input_node: "یہ آپ کے روبوٹ کے کان (Ears) ہیں۔ اس کا کام باہر سے معلومات سننا ہے۔ آپ اس میں جو بھی لکھیں گے، یہ اسے تار کے ذریعے روبوٹ کے دماغ کو بھیج دے گا!",
    
    llm_node: "یہ روبوٹ کا دماغ (Brain Core) ہے! یہ سوچنے، کہانیاں بنانے اور جواب دینے کا کام کرتا ہے۔ سلائیڈر کو بائیں کریں تو یہ سمجھدار بن جائے گا، اور دائیں کریں تو یہ بہت ہی شرارتی ہو جائے گا!",
    
    tool_node: "یہ ٹول یا موڈ چِپ (Tool) ہے! یہ روبوٹ کے دماغ کو ہاتھ فراہم کرتی ہے۔ اس کی مدد سے روبوٹ کیلکولیٹر استعمال کر سکتا ہے یا گوگل پر سچائی تلاش کر سکتا ہے!",
    
    output_node: "یہ روبوٹ کا منہ (Mouth) ہے! یہ دماغ کی سوچ کو وصول کرتا ہے اور اسے پیاری آواز میں بول کر سناتا ہے۔ اسے ہمیشہ آخر میں جوڑیں تاکہ روبوٹ بول سکے!",
    
    welcome_level_1: "چلیے ایک سادہ AI دماغ بناتے ہیں! کینوس پر کان (ان پٹ) ➡️ دماغ (برین کور) ➡️ منہ (آؤٹ پٹ) جوڑیں تاکہ ہمارا روبوٹ سن اور بول سکے!",
    welcome_level_2: "ایک AI ایجنٹ بنائیں! ایجنٹ وہ دماغ ہے جس کے پاس کام کرنے کے لیے 'ہاتھ' (ٹولز) ہوتے ہیں۔ ایک ٹول جیسے کیلکولیٹر کو دماغ سے جوڑیں!",
    welcome_level_3: "ملٹی ایجنٹ ٹیم بنائیں! ایجنٹک AI کا مطلب ہے کہ بہت سے دماغ مل کر کام کریں! دو دماغوں کو چین میں جوڑیں: کان ➡️ دماغ 1 ➡️ دماغ 2 ➡️ منہ!",
    
    level_1_instruction: "بلاکس جڑ گئے! اب رن کا بٹن دبائیں اور روبوٹ سے کوئی بات کریں!",
    level_2_instruction: "ٹول جڑ گیا! اب ریاضی کا کوئی سوال پوچھیں جیسے '156 * 24 کیا ہے' اور روبوٹ کے ہاتھ کام کرتے دیکھیں!",
    level_3_instruction: "دونوں دماغ جڑ گئے! اب کوئی ایک لفظ لکھیں جیسے 'جادو' اور دیکھیں کہ دونوں دماغ مل کر کیسے کام کرتے ہیں!",
    
    level_1_complete: "واہ! لیول 1 مکمل! آپ نے سوچنے والا روبوٹ دماغ بنا لیا! چلیے لیول 2 پر چلتے ہیں!",
    level_2_complete: "شاباش! لیول 2 مکمل! روبوٹ اب اپنے ہاتھوں سے حساب کتاب کر سکتا ہے! چلیے لیول 3 پر چلتے ہیں!",
    level_3_complete: "مبارک ہو! لیول 3 مکمل! آپ نے ملٹی ایجنٹ سسٹم بنا لیا! آپ اب لوجک گرینڈ ماسٹر بن گئے ہیں!",
    
    level_up: "واہ! آپ کا سکور بڑھ گیا! اب آپ {title} بن گئے ہیں! شاباش!",
    title_apprentice: "ننھا اپرنٹس",
    title_wizard: "سرکٹ وزرڈ",
    title_grandmaster: "لوجک گرینڈ ماسٹر",
    
    quest_log: "کویسٹ لاگ",
    points: "پوائنٹس",
    run_desc: "سیمولیشن چلائیں",
    
    chk_blocks: "کان، دماغ اور منہ بلاکس شامل کریں",
    chk_ears_brain: "کان کو دماغ سے جوڑیں",
    chk_brain_mouth: "دماغ کو منہ سے جوڑیں",
    chk_ears_brain_mouth: "کان ➡️ دماغ ➡️ منہ کو جوڑیں",
    chk_tool_brain: "ٹول چپ کو دماغ سے جوڑیں",
    chk_ears_brain1: "کان کو دماغ 1 سے جوڑیں",
    chk_brain1_brain2: "دماغ 1 کو دماغ 2 سے جوڑیں",
    chk_brain2_mouth: "دماغ 2 کو منہ سے جوڑیں"
  }
};
