/**
 * Chat Response Templates
 * Typed, immutable response templates for AI chat simulation
 */

export const CHAT_RESPONSES = {
  greeting: [
    "Hey there! I'm here to help you write an amazing song. What's inspiring you today?",
    "Welcome! Let's create something magical together. What kind of song are you working on?",
    "Ready to write? Tell me about the vibe or emotion you're going for!",
  ],
  lyricHelp: [
    'Here are some lyric ideas based on your theme:\n\n• "Dancing through the shadows, chasing golden light"\n• "Your voice echoes in the silence of my mind"\n• "We built castles out of moments that would never last"\n\nWould you like me to expand on any of these?',
    'Let me suggest some lines that capture that feeling:\n\n• "Time slips away like sand between our fingers"\n• "Every heartbeat sounds like thunder in the rain"\n• "I\'m searching for the words you\'ll never say"\n\nShould I explore a different angle?',
    'How about these opening lines:\n\n• "Midnight conversations with the stars above"\n• "I found freedom in the places I got lost"\n• "Your memory\'s a melody I can\'t forget"\n\nLet me know if you\'d like variations!',
  ],
  chordHelp: [
    'For that emotional vibe, try this progression:\n\n🎵 Am → F → C → G\n\nThis creates a bittersweet, introspective feeling. Want me to suggest variations?',
    "Here's a powerful progression that builds tension:\n\n🎵 C → Em → Am → F → G\n\nIt moves from stability to emotion and back. Should I adjust the complexity?",
    "This progression has a modern, uplifting feel:\n\n🎵 G → D → Em → C\n\nIt's the pop axis in G major - super catchy! Want alternatives?",
  ],
  structureHelp: [
    'Classic song structure suggestion:\n\n📋 Verse 1 → Pre-Chorus → Chorus\n📋 Verse 2 → Pre-Chorus → Chorus\n📋 Bridge → Final Chorus (x2)\n\nThis gives you space to tell a story and build momentum!',
    "Here's a modern structure with impact:\n\n📋 Intro (instrumental)\n📋 Verse 1 → Chorus\n📋 Verse 2 → Chorus\n📋 Bridge → Breakdown\n📋 Final Chorus (extended)\n\nThe early chorus hook grabs attention immediately!",
  ],
  rhymeHelp: [
    "Looking for rhymes? Here are some that match your line:\n\n🎯 Perfect rhymes: 'night/light/flight/sight'\n🎯 Near rhymes: 'time/climb/find/mind'\n🎯 Internal rhymes: 'dream/seem/beam/stream'\n\nWhich direction feels right?",
  ],
  encouragement: [
    "That's a strong start! The emotion really comes through. What section are you working on next?",
    'I love where this is going! Your imagery is vivid. Want to develop the chorus more?',
    'Great choice! That chord change adds exactly the tension you need. Keep going!',
  ],
} as const;

export type ChatResponseType = keyof typeof CHAT_RESPONSES;

export const WELCOME_MESSAGE =
  "Hey! I'm your AI songwriting partner. I can help you with:\n\n✨ Lyric ideas and rhyme suggestions\n🎵 Chord progressions and harmony\n📝 Song structure and arrangement\n💡 Creative brainstorming\n\nWhat would you like to work on first?";
