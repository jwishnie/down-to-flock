const adjectives = [
  "Acrimonious",
  "Adept",
  "Admirable",
  "Adventurous",
  "Affable",
  "Afternoonified",
  "Altruistic",
  "Ambitious",
  "Amiable",
  "Apathetic",
  "Authentic",
  "Ballistic",
  "Bashful",
  "Bawdy",
  "Bemused",
  "Bisexual",
  "Blasphemous",
  "Bolshie",
  "Bouncy",
  "Brave",
  "Bright",
  "Bumptious",
  "Buoyant",
  "Cacophonous",
  "Calculating",
  "Callous",
  "Calm",
  "Cat",
  "Catatonic",
  "Cattywampus",
  "Cavalier",
  "Charismatic",
  "Cheerful",
  "Chimeric",
  "Clairvoyant",
  "Compassionate",
  "Competent",
  "Complicit",
  "Confrontational",
  "Considerate",
  "Chaotic",
  "Cloying",
  "Contemptuous",
  "Corny",
  "Courageous",
  "Coy",
  "Craven",
  "Cromulent",
  "Cunning",
  "Daddy",
  "Daring",
  "Daft",
  "Defiant",
  "Demure",
  "Dependable",
  "Diligent",
  "Dire",
  "Dolorous",
  "Dominant",
  "Doomed",
  "Duplicitous",
  "Dynamic",
  "Divine",
  "Dreadful",
  "Easy-going",
  "Efficient",
  "Effusive",
  "Elegant",
  "Eligible",
  "Elite",
  "Embrittled",
  "Emo",
  "Enchanting",
  "Energetic",
  "Engaging",
  "Enigmatic",
  "Enthusiastic",
  "Even-keeled",
  "Exalted",
  "Exciting",
  "Exuberant",
  "Faithful",
  "Fearless",
  "Fiendish",
  "Foolhardy",
  "Forgiving",
  "Formidable",
  "Friendly",
  "Frisky",
  "Frolicsome",
  "Gauche",
  "Generous",
  "Gentle",
  "Giving",
  "Glowing",
  "Gracious",
  "Gregarious",
  "Grim",
  "Guilty",
  "Hapless",
  "Hard-working",
  "Helpful",
  "High-class",
  "Honest",
  "Hootin Tootin"
  "Hopeful",
  "Humble",
  "Imaginative",
  "Impartial",
  "Impetuous",
  "Independent",
  "Indolent",
  "Inquisitive",
  "Insightful",
  "Inspiring",
  "Intellectual",
  "Intuitive",
  "Irresistible",
  "Irresponsible",
  "Joyful",
  "Jubilant",
  "Judgy",
  "Kier",
  "Kind",
  "Knowledgeable",
  "Lackadaisical",
  "Laid-back",
  "Licentious",
  "Listless",
  "Litigious",
  "Lofty",
  "Lovely",
  "Loving",
  "Loyal",
  "Lucky",
  "Ludicrous",
  "Luscious",
  "Magnanimous",
  "Magnetic",
  "Malicious",
  "Malleable",
  "Maximized",
  "Middle-class",
  "Mindful",
  "Moist",
  "Nefarious",
  "Negligent",
  "Neutral",
  "Neurotic",
  "Nitheful",
  "Observant",
  "Open-minded",
  "Optimistic",
  "Ornery",
  "Ostentatious",
  "Paranoid",
  "Passionate",
  "Patient",
  "Patronizing",
  "Pedantic",
  "Perfect",
  "Persistent",
  "Persnickety",
  "Perspicacious",
  "Personable",
  "Petty",
  "Pornographic",
  "Philosophical",
  "Placid",
  "Playful",
  "Plucky",
  "Polite",
  "Powerful",
  "Practical",
  "Pricklesome",
  "Proactive",
  "Productive",
  "Proficient",
  "Provocative",
  "Pugnacious",
  "Puissant",
  "Punctual",
  "Punk",
  "Querulous",
  "Quick-witted",
  "Quirky",
  "Quotidian",
  "Rational",
  "Ravishing",
  "Rebellious",
  "Reckless",
  "Reliable",
  "Remarkable",
  "Remorseless",
  "Resentful",
  "Resilient",
  "Resourceful",
  "Romantic",
  "Sage",
  "Sanguine",
  "Serendipitous",
  "Scandalous",
  "Seditious",
  "Self-confident",
  "Sensitive",
  "Serene",
  "Shackbaggerly",
  "Shrewd",
  "Sincere",
  "Somnolent",
  "Straightforward",
  "Stroppy",
  "Submissive",
  "Sullen",
  "Supercalifragilisticexpialidocious",
  "Supple",
  "Surly",
  "Sympathetic",
  "Thoughtful",
  "Thrawn",
  "Thrifty",
  "Tittynope",
  "Touched",
  "Tough",
  "Traitorous",
  "Trustworthy",
  "Unassuming",
  "Understanding",
  "Upbeat",
  "Vindictive",
  "Vivacious",
  "Wholesome",
  "Wistful",
  "Witty",
  "Woeful",
  "Aberrant",
  "Abject",
  "Adroit",
  "Aloof",
  "Baleful",
  "Bellicose",
  "Bilious",
  "Boorish",
  "Bubbly",
  "Bullish",
  "Caustic",
  "Comely",
  "Dapper",
  "Debonair",
  "Dogmatic",
  "Dilatory",
  "Disheveled",
  "Eccentric",
  "Ebullient",
  "Erudite",
  "Ethereal",
  "Equanimous",
  "Excitable",
  "Fastidious",
  "Feckless",
  "Finicky",
  "Freewheeling",
  "Funky",
  "Genial",
  "Giddy",
  "Glib",
  "Grimy",
  "Guileless",
  "Hubristic",
  "Insidious",
  "Insolent",
  "Jejune",
  "Jittery",
  "Lackadaisical",
  "Laconic",
  "Larcenous",
  "Loquacious",
  "Lugubrious",
  "Obtuse",
  "Pernicious",
  "Petulant",
  "Pitiable",
  "Pompous",
  "Prudent",
  "Puckish",
  "Mannered",
  "Manic",
  "Mendacious",
  "Mercurial",
  "Meretricious",
  "Milquetoast",
  "Radiant",
  "Reclusive",
  "Resilient",
  "Righteous",
  "Risible",
  "Sage",
  "Savvy",
  "Salubrious",
  "Self-righteous",
  "Slovenly",
  "Sly",
  "Spiffy",
  "Spooky",
  "Strident",
  "Sus",
  "Timorous",
  "Touchy",
  "Visionary",
  "Vivacious",
  "Voracious",
  "Whimsical",
  "Luminous",
  "Pulchritudinous",
  "Zesty",
  "Mirthful",
  "Froufrou",
  "Haunted",
  "Flummoxed",
  "Mephistophelean",
  "Rabelaisian",
  "Malevolent",
  "Menacing",
  "Murderous",
  "Magnetic",
  "Melancholy",
  "Mischievous",
  "Moral",
  "Mundane",
  "Maladjusted",
  "Meddlesome",
  "Bloodthirsty",
  "Bossy",
  "Brutish",
  "Befuddling",
  "Arrogant",
  "Empathetic",
  "Fierce",
  "Pensive",
  "Pragmatic",
  "Uptight",
  "Solemn",
  "Uneasy",
  "Deceitful",
  "Playful",
  "Thirsty"
]

export default adjectives
