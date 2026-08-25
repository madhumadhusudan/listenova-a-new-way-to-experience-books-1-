import { DocumentItem } from '../types';

export const INITIAL_SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-art-of-war',
    title: 'The Art of Strategy & Mindfulness',
    author: 'Sun Tzu & Ancient Philosophers',
    originalLanguage: 'en',
    selectedLanguage: 'en',
    selectedVoice: 'charon',
    coverColor: 'from-amber-700 via-stone-800 to-stone-950',
    coverIcon: 'Compass',
    category: 'Philosophy & Strategy',
    fileType: 'pdf',
    fileSize: 1420000,
    totalDurationSeconds: 1240,
    currentProgressPercent: 42,
    currentChapterId: 'ch-aow-1',
    currentAudioPositionSeconds: 125,
    isFavorite: true,
    isDownloaded: true,
    downloadSizeMb: 12.4,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStageMessage: 'All chapters processed & synthesized in natural audio',
    createdAt: '2026-08-20T08:30:00.000Z',
    lastPlayedAt: '2026-08-25T09:15:00.000Z',
    summary: {
      shortSummary: 'A timeless treatise on strategic wisdom, mental clarity, conflict resolution, and the supreme triumph of winning without fighting.',
      detailedSummary: 'The text explores the foundational laws of strategic planning, self-awareness, timing, emotional control, and adaptability in competitive and life environments. Rather than glorifying brute conflict, it emphasizes profound psychological positioning, resource conservation, and quiet discipline.',
      keyPoints: [
        'The highest excellence is subduing resistance without conflict.',
        'Know yourself and know the terrain; in a hundred battles you will never perish.',
        'Speed, secrecy, and emotional equanimity govern all decisive endeavors.',
        'Adaptability is like water, taking the shape of whatever vessel it enters.'
      ],
      mainCharactersOrEntities: [
        { name: 'The Master Strategist', role: 'Archetype', description: 'The calm, calculating mind who masters inner impulses before making external moves.' },
        { name: 'The Sovereign', role: 'Leadership Entity', description: 'Represents overarching vision, restraint, and ethical stewardship.' }
      ],
      keyQuotesOrTakeaways: [
        'In the midst of chaos, there is also opportunity.',
        'Let your rapidity be that of the wind, your compactness that of the forest.'
      ],
      chapterBreakdown: [
        { chapterNumber: 1, title: 'Laying Plans & Mental Clarity', summary: 'Establishing foundational discipline, moral integrity, weather, and terrain calculation.' },
        { chapterNumber: 2, title: 'The Economics of Energy', summary: 'Understanding that prolonged strain drains spirit, treasury, and clarity.' },
        { chapterNumber: 3, title: 'Strategic Vulnerability & Maneuver', summary: 'Moving where the opposing force is absent, striking like thunder when prepared.' }
      ]
    },
    chapters: [
      {
        id: 'ch-aow-1',
        documentId: 'doc-art-of-war',
        chapterNumber: 1,
        title: 'Chapter 1: Laying Plans & Mental Clarity',
        durationSeconds: 380,
        isProcessed: true,
        originalText: `The art of strategic mindfulness is of vital importance to the soul. It is a matter of life and growth, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.

To master any craft or life endeavor, one must evaluate five constant factors. These factors are: Moral Harmony, Heaven's Timing, Earth's Terrain, Wise Leadership, and Method and Discipline.

Moral Harmony causes people to be in complete accord with their higher purpose, so that they will follow their path regardless of danger, undismayed by any peril.

Heaven's Timing signifies night and day, cold and heat, times and seasons. Earth's Terrain comprises distances, great and small; danger and security; open ground and narrow passes.

The Wise Leader exemplifies the virtues of wisdom, sincerity, benevolence, courage, and strictness. When you know yourself and know the terrain, every calculated decision leads toward quiet mastery.`,
        translatedText: `ರಣತಂತ್ರ ಮತ್ತು ಮನಃಶಾಂತಿಯ ಕಲೆಯು ಆತ್ಮಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಮುಖವಾದುದಾಗಿದೆ. ಇದು ಜೀವನ ಮತ್ತು ಬೆಳವಣಿಗೆಯ ವಿಷಯವಾಗಿದೆ. ಆದ್ದರಿಂದ ಇದನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ನಿರ್ಲಕ್ಷಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.

ಯಾವುದೇ ಕಾರ್ಯದಲ್ಲಿ ಸಿದ್ಧಿಯನ್ನು ಸಾಧಿಸಲು, ಒಬ್ಬ ವ್ಯಕ್ತಿಯು ಐದು ಅಂಶಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಬೇಕು: ನೈತಿಕ ಸಾಮರಸ್ಯ, ಸಮಯ ಪ್ರಜ್ಞೆ, ಭೂಮಿಯ ಸನ್ನಿವೇಶ, ಜ್ಞಾನಯುಕ್ತ ನಾಯಕತ್ವ, ಮತ್ತು ಶಿಸ್ತು.

ನೈತಿಕ ಸಾಮರಸ್ಯವು ಜನರನ್ನು ಅವರ ಶ್ರೇಷ್ಠ ಗುರಿಯೊಂದಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಬೆಸೆಯುತ್ತದೆ. ಇದರಿಂದಾಗಿ ಅವರು ಯಾವುದೇ ಆಪತ್ತಿಗೆ ಹೆದರದೆ ತಮ್ಮ ಪಥವನ್ನು ಮುನ್ನಡೆಸುತ್ತಾರೆ.

ನಿಮ್ಮನ್ನು ನೀವು ಅರಿತುಕೊಂಡು ಮತ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಾಗ, ಪ್ರತಿಯೊಂದು ನಿರ್ಧಾರವೂ ನಿಮ್ಮನ್ನು ನಿಶ್ಯಬ್ದ ಪ್ರಭುತ್ವದತ್ತ ಕೊಂಡೊಯ್ಯುತ್ತದೆ.`,
        narrationScript: `The art of strategic mindfulness is of vital importance to the soul. It is a matter of life and growth, a road either to safety or to ruin. Hence, it is a subject of inquiry which can on no account be neglected. To master any craft or life endeavor, one must evaluate five constant factors: Moral Harmony, Heaven's Timing, Earth's Terrain, Wise Leadership, and Method and Discipline. When you know yourself and know the terrain, every calculated decision leads toward quiet mastery.`,
        sentences: [
          { id: 's-1', text: 'The art of strategic mindfulness is of vital importance to the soul.', startPercent: 0, endPercent: 18 },
          { id: 's-2', text: 'It is a matter of life and growth, a road either to safety or to ruin.', startPercent: 18, endPercent: 36 },
          { id: 's-3', text: 'Hence it is a subject of inquiry which can on no account be neglected.', startPercent: 36, endPercent: 54 },
          { id: 's-4', text: 'To master any craft or life endeavor, one must evaluate five constant factors.', startPercent: 54, endPercent: 78 },
          { id: 's-5', text: 'When you know yourself and know the terrain, every calculated decision leads toward quiet mastery.', startPercent: 78, endPercent: 100 }
        ]
      },
      {
        id: 'ch-aow-2',
        documentId: 'doc-art-of-war',
        chapterNumber: 2,
        title: 'Chapter 2: The Economics of Energy',
        durationSeconds: 420,
        isProcessed: true,
        originalText: `In the operations of life and creation, when you mobilize immense energy, constant depletion is your chief adversary. 

There is no instance of a country or an individual having benefited from prolonged, unfocused agitation. Only one who is thoroughly acquainted with the perils of effort can thoroughly understand the profitable method of resting.

Bring forth your creative output with deliberate precision. Nourish your mind from sustainable wells. Conserve your vital reserve so that when momentum calls, your strike is effortless.`,
        translatedText: `ಜೀವನ ಮತ್ತು ಸೃಷ್ಟಿಯ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ, ಅಪಾರವಾದ ಶಕ್ತಿಯನ್ನು ತೊಡಗಿಸಿದಾಗ, ನಿರಂತರ ಕ್ಷೀಣತೆಯು ನಿಮ್ಮ ಮುಖ್ಯ ಎದುರಾಳಿಯಾಗುತ್ತದೆ.

ದೀರ್ಘಕಾಲದ, ಗುರಿಯಿಲ್ಲದ ಆಂದೋಲನದಿಂದ ಯಾವುದೇ ವ್ಯಕ್ತಿ ಅಥವಾ ಸಂಸ್ಥೆಗೆ ಲಾಭವಾದ ನಿದರ್ಶನವಿಲ್ಲ. ಶ್ರಮದ ಅಪಾಯಗಳನ್ನು ಚೆನ್ನಾಗಿ ತಿಳಿದಿರುವವನು ಮಾತ್ರ ವಿಶ್ರಾಂತಿಯ ಲಾಭದಾಯಕ ವಿಧಾನವನ್ನು ಆಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಲ್ಲನು.`,
        narrationScript: `In the operations of life and creation, when you mobilize immense energy, constant depletion is your chief adversary. Bring forth your creative output with deliberate precision. Nourish your mind from sustainable wells.`,
        sentences: [
          { id: 's-2-1', text: 'In the operations of life and creation, constant depletion is your chief adversary.', startPercent: 0, endPercent: 33 },
          { id: 's-2-2', text: 'There is no instance of a mind having benefited from prolonged, unfocused agitation.', startPercent: 33, endPercent: 66 },
          { id: 's-2-3', text: 'Conserve your vital reserve so that when momentum calls, your strike is effortless.', startPercent: 66, endPercent: 100 }
        ]
      },
      {
        id: 'ch-aow-3',
        documentId: 'doc-art-of-war',
        chapterNumber: 3,
        title: 'Chapter 3: Strategic Vulnerability & Flow',
        durationSeconds: 440,
        isProcessed: true,
        originalText: `Water shapes its course according to the nature of the ground over which it flows. The wise thinker works out their victory in relation to the circumstance they face.

Therefore, just as water retains no constant shape, so in creative life there are no constant conditions. He who can modify his tactics in relation to his dynamic world may be called a master of living.`,
        translatedText: `ನೀರು ತಾನು ಹರಿಯುವ ನೆಲದ ಸ್ವರೂಪಕ್ಕೆ ತಕ್ಕಂತೆ ತನ್ನ ಹಾದಿಯನ್ನು ರೂಪಿಸಿಕೊಳ್ಳುತ್ತದೆ. ಜ್ಞಾನಿಯಾದ ಚಿಂತಕನು ತಾನು ಎದುರಿಸುವ ಸಂದರ್ಭಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ತನ್ನ ಯಶಸ್ಸನ್ನು ರೂಪಿಸುತ್ತಾನೆ.

ಆದ್ದರಿಂದ, ನೀರಿನಂತೆ ಯಾವುದೇ ಸ್ಥಿರ ಆಕಾರವನ್ನು ಹೊಂದಿರದೆ, ಬದಲಾಗುವ ಜಗತ್ತಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವವನು ನಿಜವಾದ ಜೀವನದ ಸಾಕ್ಷಾತ್ಕಾರವನ್ನು ಪಡೆಯುತ್ತಾನೆ.`,
        sentences: [
          { id: 's-3-1', text: 'Water shapes its course according to the nature of the ground over which it flows.', startPercent: 0, endPercent: 50 },
          { id: 's-3-2', text: 'He who can modify his tactics in relation to his dynamic world may be called a master of living.', startPercent: 50, endPercent: 100 }
        ]
      }
    ]
  },
  {
    id: 'doc-kannada-heritage',
    title: 'Vachana Sahitya & Kannada Philosophical Wisdom',
    author: 'Basavanna, Allama Prabhu & Akka Mahadevi',
    originalLanguage: 'kn',
    selectedLanguage: 'kn',
    selectedVoice: 'kavya',
    coverColor: 'from-emerald-800 via-teal-900 to-neutral-950',
    coverIcon: 'Sparkles',
    category: 'Literature & Philosophy',
    fileType: 'epub',
    fileSize: 890000,
    totalDurationSeconds: 980,
    currentProgressPercent: 65,
    currentChapterId: 'ch-kan-1',
    currentAudioPositionSeconds: 90,
    isFavorite: true,
    isDownloaded: true,
    downloadSizeMb: 8.7,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStageMessage: 'Multilingual speech engine ready for Kannada & English',
    createdAt: '2026-08-22T11:00:00.000Z',
    lastPlayedAt: '2026-08-25T08:00:00.000Z',
    summary: {
      shortSummary: 'An illuminating collection of 12th-century Kannada Vachana poetry exploring social equality, work as worship (Kayakave Kailasa), and inner spiritual directness.',
      detailedSummary: 'Vachana literature revolutionized Kannada cultural ethos through free-verse rhythmic prose. This volume curates profound verses that break superficial dogmas, celebrating the divine within human compassion, integrity in daily labor, and deep experiential wisdom.',
      keyPoints: [
        'Kayakave Kailasa: Dedicated honest labor itself is heaven.',
        'Spiritual truth is not found in static temples, but in the living temple of the human body and compassionate heart.',
        'Universal brotherhood beyond caste, gender, and social pretension.',
        'The power of simple, rhythmic native vernacular to convey ultimate reality.'
      ],
      mainCharactersOrEntities: [
        { name: 'Basaveshwara', role: 'Philosopher-Reformer', description: 'Champion of Kayaka, Dasoha, and Anubhava Mantapa.' },
        { name: 'Allama Prabhu', role: 'Mystic Master', description: 'The supreme voice of non-dual consciousness and razor-sharp wisdom.' },
        { name: 'Akka Mahadevi', role: 'Poet-Seeker', description: 'Embodied fierce devotional freedom, seeing Chennamallikarjuna in all nature.' }
      ],
      keyQuotesOrTakeaways: [
        'ಉಳ್ಳವರು ಶಿವಾಲಯ ಮಾಡುವರು ನಾನೇನ ಮಾಡಲಿ ಬಡವನಯ್ಯಾ? ಎನ್ನ ಕಾಲೇ ಕಂಬ ದೇಹವೇ ದೇಗುಲ ಶಿರವೇ ಹೊನ್ನ ಕಳಶವಯ್ಯಾ.',
        'ಕಾಯಕವೇ ಕೈಲಾಸ - Work performed with pure dedication is supreme divinity.'
      ],
      chapterBreakdown: [
        { chapterNumber: 1, title: 'ದೇಹವೇ ದೇಗುಲ (The Living Temple)', summary: 'Reflections on authentic devotion versus outward ritualism.' },
        { chapterNumber: 2, title: 'ಕಾಯಕ ಮತ್ತು ದಾಸೋಹ (Labor & Community Service)', summary: 'The sanctification of daily work and joyful sharing.' }
      ]
    },
    chapters: [
      {
        id: 'ch-kan-1',
        documentId: 'doc-kannada-heritage',
        chapterNumber: 1,
        title: 'ಅಧ್ಯಾಯ ೧: ದೇಹವೇ ದೇಗುಲ (The Living Temple)',
        durationSeconds: 480,
        isProcessed: true,
        originalText: `ಉಳ್ಳವರು ಶಿವಾಲಯ ಮಾಡುವರು, ನಾನೇನ ಮಾಡಲಿ ಬಡವನಯ್ಯಾ?
ಎನ್ನ ಕಾಲೇ ಕಂಬ, ದೇಹವೇ ದೇಗುಲ, ಶಿರವೇ ಹೊನ್ನ ಕಳಶವಯ್ಯಾ.
ಕೂಡಲಸಂಗಮದೇವಾ ಕೇಳಯ್ಯಾ,
ಸ್ಥಾವರಕ್ಕಳಿವುಂಟು ಜಂಗಮಕ್ಕಳಿವಿಲ್ಲ.

ಈ ವಚನವು ನಮಗೆ ಕಲಿಸುವ ಮುಖ್ಯ ಪಾಠವೇನೆಂದರೆ: ಬಾಹ್ಯ ಸಂಪತ್ತು ಮತ್ತು ಕಲ್ಲಿನ ಗುಡಿಗಳಿಗಿಂತ ಮನುಷ್ಯನ ಅಂತಃಕರಣ ಮತ್ತು ಜೀವಂತ ದೇಹವೇ ಪರಮಾತ್ಮನ ಅತ್ಯಂತ ಪವಿತ್ರ ಸನ್ನಿಧಾನ. ಜಡವಾದುದು ಕಾಲಕ್ರಮೇಣ ನಶಿಸಿಹೋಗುತ್ತದೆ, ಆದರೆ ಚೈತನ್ಯಶೀಲವಾದ ಜೀವ ಎಂದಿಗೂ ಶಾಶ್ವತ.`,
        translatedText: `The rich may build temples for Shiva, but what shall I, a poor man, do?
My legs are pillars, the body the shrine, the head a cupola of gold.
Listen, O Lord of the Meeting Rivers,
Things standing shall fall, but the moving shall ever stay.

This verse teaches us that internal consciousness and a compassionate human heart are far more sacred than external edifices of stone. The rigid and stationary shall perish, but the flowing spirit endures forever.`,
        narrationScript: `ಉಳ್ಳವರು ಶಿವಾಲಯ ಮಾಡುವರು, ನಾನೇನ ಮಾಡಲಿ ಬಡವನಯ್ಯಾ? ಎನ್ನ ಕಾಲೇ ಕಂಬ, ದೇಹವೇ ದೇಗುಲ, ಶಿರವೇ ಹೊನ್ನ ಕಳಶವಯ್ಯಾ. ಕೂಡಲಸಂಗಮದೇವಾ ಕೇಳಯ್ಯಾ, ಸ್ಥಾವರಕ್ಕಳಿವುಂಟು ಜಂಗಮಕ್ಕಳಿವಿಲ್ಲ. ಈ ವಚನವು ನಮಗೆ ಕಲಿಸುವ ಪಾಠ: ಮನುಷ್ಯನ ಅಂತಃಕರಣವೇ ಪರಮಾತ್ಮನ ಪವಿತ್ರ ಸನ್ನಿಧಾನ.`,
        sentences: [
          { id: 'sk-1', text: 'ಉಳ್ಳವರು ಶಿವಾಲಯ ಮಾಡುವರು, ನಾನೇನ ಮಾಡಲಿ ಬಡವನಯ್ಯಾ?', startPercent: 0, endPercent: 25 },
          { id: 'sk-2', text: 'ಎನ್ನ ಕಾಲೇ ಕಂಬ, ದೇಹವೇ ದೇಗುಲ, ಶಿರವೇ ಹೊನ್ನ ಕಳಶವಯ್ಯಾ.', startPercent: 25, endPercent: 55 },
          { id: 'sk-3', text: 'ಕೂಡಲಸಂಗಮದೇವಾ ಕೇಳಯ್ಯಾ, ಸ್ಥಾವರಕ್ಕಳಿವುಂಟು ಜಂಗಮಕ್ಕಳಿವಿಲ್ಲ.', startPercent: 55, endPercent: 80 },
          { id: 'sk-4', text: 'ಜಡವಾದುದು ಕಾಲಕ್ರಮೇಣ ನಶಿಸಿಹೋಗುತ್ತದೆ, ಆದರೆ ಚೈತನ್ಯಶೀಲವಾದ ಜೀವ ಶಾಶ್ವತ.', startPercent: 80, endPercent: 100 }
        ]
      },
      {
        id: 'ch-kan-2',
        documentId: 'doc-kannada-heritage',
        chapterNumber: 2,
        title: 'ಅಧ್ಯಾಯ ೨: ಕಾಯಕವೇ ಕೈಲಾಸ (Work as Worship)',
        durationSeconds: 500,
        isProcessed: true,
        originalText: `ಕಾಯಕದಲ್ಲಿ ನಿರತನಾದಡೆ ಗುರುದರ್ಶನವಾದಡೂ ಮರೆಯಬೇಕು, ಲಿಂಗಪೂಜೆಯಾದಡೂ ತೊರೆಯಬೇಕು.
ಏಕೆಂದರೆ ಕಾಯಕವೇ ಕೈಲಾಸವಾದ ಕಾರಣ.

ಯಾವ ಕೆಲಸವೂ ಕೀಳಲ್ಲ, ಯಾವ ಕೆಲಸವೂ ಮೇಲಲ್ಲ. ಮಾಡುವ ಕಾಯಕದಲ್ಲಿ ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ನಿಷ್ಠೆ ಇದ್ದರೆ ಅದೇ ಮೋಕ್ಷದ ನೇರ ಹಾದಿ. ಶ್ರಮಜೀವಿಯ ಬೆವರ ಹನಿಯಲ್ಲಿ ದೇವರನ್ನು ಕಾಣುವುದೇ ಬಸವ ತತ್ವದ ಮೂಲ ಸಾರ.`,
        translatedText: `When one is immersed in purposeful work (Kayaka), even the sight of the Master should be forgotten, even worship can wait. For truthful labor is itself the abode of heaven.

No honest work is superior or inferior. When work is performed with unwavering integrity and joyful dedication, it becomes the direct pathway to liberation.`,
        sentences: [
          { id: 'sk-2-1', text: 'ಕಾಯಕದಲ್ಲಿ ನಿರತನಾದಡೆ ಗುರುದರ್ಶನವಾದಡೂ ಮರೆಯಬೇಕು, ಲಿಂಗಪೂಜೆಯಾದಡೂ ತೊರೆಯಬೇಕು.', startPercent: 0, endPercent: 50 },
          { id: 'sk-2-2', text: 'ಏಕೆಂದರೆ ಕಾಯಕವೇ ಕೈಲಾಸವಾದ ಕಾರಣ.', startPercent: 50, endPercent: 100 }
        ]
      }
    ]
  },
  {
    id: 'doc-tamil-thirukkural',
    title: 'Thirukkural: The Timeless Ethics of Life & Duty',
    author: 'Thiruvalluvar',
    originalLanguage: 'ta',
    selectedLanguage: 'ta',
    selectedVoice: 'kavya',
    coverColor: 'from-orange-800 via-rose-950 to-neutral-950',
    coverIcon: 'BookOpen',
    category: 'Classics & Ethics',
    fileType: 'txt',
    fileSize: 640000,
    totalDurationSeconds: 820,
    currentProgressPercent: 20,
    currentChapterId: 'ch-ta-1',
    currentAudioPositionSeconds: 40,
    isFavorite: false,
    isDownloaded: false,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStageMessage: 'Synthesized with native prosody and rhythm',
    createdAt: '2026-08-23T14:15:00.000Z',
    lastPlayedAt: '2026-08-24T18:30:00.000Z',
    summary: {
      shortSummary: 'A masterwork of universal ethical aphorisms composed in couplets, guiding humankind on virtue (Aram), prosperity (Porul), and noble conduct.',
      detailedSummary: 'Composed over two millennia ago, the Thirukkural provides pragmatic, non-denominational principles for living with dignity, cultivating wisdom, exercising moral courage, and governing with justice.',
      keyPoints: [
        'Learning without righteousness is barren; kindness without boundary is true wealth.',
        'Words spoken with sweetness conquer more hearts than weapons of gold.',
        'Perseverance in righteous endeavors will overcome even seemingly insurmountable fate.'
      ],
      mainCharactersOrEntities: [
        { name: 'Thiruvalluvar', role: 'Universal Sage', description: 'The venerable Tamil philosopher whose couplets transcend religion and time.' }
      ],
      keyQuotesOrTakeaways: [
        'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.',
        'இனிய உளவாக இன்னாத கூறல் கனியிருப்பக் காய்கவர்ந் தற்று.'
      ],
      chapterBreakdown: [
        { chapterNumber: 1, title: 'கடவுள் வாழ்த்து & அறன் வலியுறுத்தல் (Invocation to Primordial Truth)', summary: 'Recognizing foundational wisdom as the alphabet begins with A.' },
        { chapterNumber: 2, title: 'இனியவை கூறல் (The Grace of Gentle Speech)', summary: 'The art of speaking words that uplift, heal, and bring harmony.' }
      ]
    },
    chapters: [
      {
        id: 'ch-ta-1',
        documentId: 'doc-tamil-thirukkural',
        chapterNumber: 1,
        title: 'அதிகாரம் 1: இனியவை கூறல் (Sweet & Noble Words)',
        durationSeconds: 410,
        isProcessed: true,
        originalText: `இனிய உளவாக இன்னாத கூறல்
கனியிருப்பக் காய்கவர்ந் தற்று.

பணிவுடையன் இன்சொலன் ஆதல் ஒருவற்கு
அணியல்ல மற்றுப் பிற.

இன்சொலால் ஈரம் அளைஇப் படிறிலவாம்
செம்பொருள் கண்டார்வாய்ச் சொல்.

விளக்கம்: நல்ல இனிய சொற்கள் இருக்கும் போது கடுமையான சொற்களைப் பேசுவது, கனிந்த பழம் இருக்கும் போது காயைத் தின்பதற்கு சமமாகும். பணிவும் இனிய சொல்லுமே ஒரு மனிதனுக்கு உண்மையான அணிகலன் ஆகும்.`,
        translatedText: `To speak harsh words when sweet words are available is like eating unripe fruit when sweet ripe fruit is ready at hand.

Humility and pleasant speech alone are the true ornaments of a noble human being; all other adornments are merely superficial.

Speaking kindly with sincere affection and free from deceit is the hallmark of those who perceive essential truth.`,
        narrationScript: `இனிய உளவாக இன்னாத கூறல் கனியிருப்பக் காய்கவர்ந் தற்று. பணிவுடையன் இன்சொலன் ஆதல் ஒருவற்கு அணியல்ல மற்றுப் பிற. நல்ல இனிய சொற்கள் இருக்கும் போது கடுமையான சொற்களைப் பேசுவது, சுவையான கனி இருக்கும் போது காயைத் தின்பதற்கு சமமாகும்.`,
        sentences: [
          { id: 'st-1', text: 'இனிய உளவாக இன்னாத கூறல் கனியிருப்பக் காய்கவர்ந் தற்று.', startPercent: 0, endPercent: 35 },
          { id: 'st-2', text: 'பணிவுடையன் இன்சொலன் ஆதல் ஒருவற்கு அணியல்ல மற்றுப் பிற.', startPercent: 35, endPercent: 70 },
          { id: 'st-3', text: 'பணிவும் இனிய சொல்லுமே ஒரு மனிதனுக்கு உண்மையான அணிகலன் ஆகும்.', startPercent: 70, endPercent: 100 }
        ]
      }
    ]
  },
  {
    id: 'doc-quantum-ai',
    title: 'Frontiers of Neural Computing & Quantum Information',
    author: 'Dr. Evelyn Vance & AI Research Labs',
    originalLanguage: 'en',
    selectedLanguage: 'en',
    selectedVoice: 'fenrir',
    coverColor: 'from-cyan-900 via-indigo-950 to-slate-950',
    coverIcon: 'Cpu',
    category: 'Science & Research',
    fileType: 'pdf',
    fileSize: 2840000,
    totalDurationSeconds: 1540,
    currentProgressPercent: 12,
    currentChapterId: 'ch-quant-1',
    currentAudioPositionSeconds: 60,
    isFavorite: false,
    isDownloaded: false,
    processingStatus: 'ready',
    processingProgress: 100,
    processingStageMessage: 'Structured with mathematical and technical prosody',
    createdAt: '2026-08-24T09:00:00.000Z',
    lastPlayedAt: '2026-08-25T07:20:00.000Z',
    summary: {
      shortSummary: 'A comprehensive investigation into how quantum superposition and topological qubits accelerate deep neural network training and molecular dynamics.',
      detailedSummary: 'This paper bridges quantum circuit optimization and transformer architectures. By leveraging coherent states and entanglement entropy, modern hybrid quantum-classical algorithms achieve polynomial speedups in combinatorial search and drug discovery optimization.',
      keyPoints: [
        'Topological qubits reduce decoherence rates by orders of magnitude compared to transmon qubits.',
        'Hybrid Quantum-Classical variational algorithms (VQE) demonstrate breakthrough convergence on non-convex loss surfaces.',
        'Multilingual token embeddings benefit from hyper-dimensional quantum Hilbert spaces.'
      ],
      mainCharactersOrEntities: [
        { name: 'Hybrid Co-Processor Architecture', role: 'Hardware Paradigm', description: 'Integrates cryo-cooled QPU clusters with low-latency GPU neural accelerators.' }
      ],
      keyQuotesOrTakeaways: [
        'Quantum advantage is not merely raw FLOPS, but the topological reduction of search complexity.'
      ],
      chapterBreakdown: [
        { chapterNumber: 1, title: 'Introduction to Quantum Neural States', summary: 'Foundational concepts of Hilbert spaces and tensor product embeddings.' },
        { chapterNumber: 2, title: 'Error Correction & Topological Invariance', summary: 'Protecting quantum phase coherence during high-parameter calculations.' }
      ]
    },
    chapters: [
      {
        id: 'ch-quant-1',
        documentId: 'doc-quantum-ai',
        chapterNumber: 1,
        title: 'Section 1: The Quantum Neural Paradigm',
        durationSeconds: 520,
        isProcessed: true,
        originalText: `Contemporary deep learning models have encountered fundamental thermal and memory bandwidth walls in standard silicon architectures. As parameter scales exceed trillions of active weights, the energy cost of dense gradient descent becomes unsustainable.

Quantum machine learning introduces computational spaces governed by Hilbert state vectors. In these spaces, linear superpositions allow simultaneous representation of exponential dimensional configurations.

By mapping semantic token topologies directly onto Hamiltonian evolution cycles, quantum-classical hybrid architectures unlock unprecedented efficiencies in contextual representation and zero-shot reasoning.`,
        translatedText: `ಸಮಕಾಲೀನ ಆಳವಾದ ಕಲಿಕೆಯ ಮಾದರಿಗಳು ಸಾಮಾನ್ಯ ಸಿಲಿಕಾನ್ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ಉಷ್ಣ ಮತ್ತು ಮೆಮೊರಿ ನಿರ್ಬಂಧಗಳನ್ನು ಎದುರಿಸುತ್ತಿವೆ. ನಿಯತಾಂಕಗಳ ಪ್ರಮಾಣವು ಟ್ರಿಲಿಯನ್‌ಗಳನ್ನು ಮೀರಿದಂತೆ, ಗ್ರೇಡಿಯಂಟ್ ತರಬೇತಿಯ ಶಕ್ತಿಯ ವೆಚ್ಚವು ಅತಿಯಾಗುತ್ತದೆ.

ಕ್ವಾಂಟಮ್ ಯಂತ್ರ ಕಲಿಕೆಯು ಹಿಲ್ಬರ್ಟ್ ಸ್ಥಿತಿ ವೆಕ್ಟರ್‌ಗಳಿಂದ ನಿಯಂತ್ರಿಸಲ್ಪಡುವ ಗಣನಾತ್ಮಕ ಸ್ಥಳಗಳನ್ನು ಪರಿಚಯಿಸುತ್ತದೆ. ಇಲ್ಲಿ ಏಕಕಾಲದಲ್ಲಿ ಅಪಾರ ಸಂರಚನೆಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲು ಸಾಧ್ಯವಾಗುತ್ತದೆ.`,
        narrationScript: `Contemporary deep learning models have encountered fundamental thermal and memory bandwidth walls in standard silicon architectures. Quantum machine learning introduces computational spaces governed by Hilbert state vectors, unlocking exponential efficiency.`,
        sentences: [
          { id: 'sq-1', text: 'Contemporary deep learning models have encountered fundamental thermal and memory bandwidth walls.', startPercent: 0, endPercent: 35 },
          { id: 'sq-2', text: 'Quantum machine learning introduces computational spaces governed by Hilbert state vectors.', startPercent: 35, endPercent: 70 },
          { id: 'sq-3', text: 'Quantum-classical hybrid architectures unlock unprecedented efficiencies in contextual representation.', startPercent: 70, endPercent: 100 }
        ]
      }
    ]
  }
];
