const adjectives = [
  'Acrimonious',
  'Adept',
  'Admirable',
  'Adventurous',
  'Affable',
  'Afternoonified',
  'Altruistic',
  'Ambitious',
  'Amiable',
  'Apathetic',
  'Astute',
  'Authentic',
  'Authoritative',
  'Balletic',
  'Bashful',
  'Bawdy',
  'Bemused',
  'Bisexual',
  'Blasphemous',
  'Bolshie',
  'Bouba',
  'Bouncy',
  'Brave',
  'Bright',
  'Bumptious',
  'Buoyant',
  'Cacophonous',
  'Calculating',
  'Callous',
  'Calm',
  'Cat',
  'Catatonic',
  'Cattywampus',
  'Cavalier',
  'Charismatic',
  'Cheerful',
  'Chimeric',
  'Clairvoyant',
  'Compassionate',
  'Competent',
  'Complicit',
  'Confrontational',
  'Considerate',
  'Chaotic',
  'Circumspect',
  'Cloying',
  'Contemptuous',
  'Corny',
  'Courageous',
  'Coy',
  'Craven',
  'Cromulent',
  'Cunning',
  'Daddy',
  'Daring',
  'Daft',
  'Defiant',
  'Deft',
  'Dejected',
  'Demure',
  'Dependable',
  'Diligent',
  'Diplomatic',
  'Dire',
  'Disquieting',
  'Dolorous',
  'Dominant',
  'Doomed',
  'Duplicitous',
  'Dynamic',
  'Divine',
  'Dreadful',
  'Easy-going',
  'Efficient',
  'Effusive',
  'Elegant',
  'Eligible',
  'Elite',
  'Embrittled',
  'Emo',
  'Enchanting',
  'Energetic',
  'Engaging',
  'Enigmatic',
  'Enthusiastic',
  'Envious',
  'Euphoric',
  'Even-keeled',
  'Exalted',
  'Exciting',
  'Exuberant',
  'Faithful',
  'Fashion',
  'Fearless',
  'Fickle',
  'Fiendish',
  'Foolhardy',
  'Forgiving',
  'Formidable',
  'Friendly',
  'Frisky',
  'Frolicsome',
  'Gallant',
  'Gauche',
  'Generous',
  'Gentle',
  'Giving',
  'Glowing',
  'Gluttonous',
  'Gracious',
  'Greedy',
  'Gregarious',
  'Grim',
  'Guilty',
  'Gullible'
  'Hapless',
  'Hard-working',
  'Helpful',
  'High-class',
  'Honest',
  'Hootin Tootin',
  'Hopeful',
  'Humble',
  'Illecebrous',
  'Imaginative',
  'Impartial',
  'Impertinent',
  'Impetuous',
  'Independent',
  'Indolent',
  'Inquisitive',
  'Insightful',
  'Inspiring',
  'Intellectual',
  'Intuitive',
  'Irresistible',
  'Irresponsible',
  'Joyful',
  'Jubilant',
  'Judgy',
  'Kier',
  'Kiki',
  'Kind',
  'Knowledgeable',
  'Lackadaisical',
  'Laid-back',
  'Licentious',
  'Listless',
  'Litigious',
  'Lofty',
  'Lovely',
  'Loving',
  'Loyal',
  'Lucky',
  'Ludicrous',
  'Luscious',
  'Lustful',
  'Magnanimous',
  'Magnetic',
  'Malicious',
  'Malleable',
  'Maximized',
  'Middle-class',
  'Mindful',
  'Moist',
  'Nefarious',
  'Negligent',
  'Neutral',
  'Neurotic',
  'Nitheful',
  'Observant',
  'Open-minded',
  'Optimistic',
  'Ornery',
  'Ostentatious',
  'Paranoid',
  'Passionate',
  'Patient',
  'Patronizing',
  'Pedantic',
  'Perfect',
  'Persistent',
  'Persnickety',
  'Perspicacious',
  'Personable',
  'Petty',
  'Pornographic',
  'Philosophical',
  'Pious',
  'Placid',
  'Playful',
  'Plucky',
  'Polite',
  'Powerful',
  'Practical',
  'Pricklesome',
  'Proactive',
  'Productive',
  'Proficient',
  'Provocative',
  'Pugnacious',
  'Puissant',
  'Punctual',
  'Punk',
  'Quaint',
  'Querulous',
  'Quick-witted',
  'Quirky',
  'Quotidian',
  'Rational',
  'Ravishing',
  'Rebellious',
  'Reckless',
  'Reliable',
  'Remarkable',
  'Remorseless',
  'Repulsive',
  'Resentful',
  'Resilient',
  'Resourceful',
  'Romantic',
  'Sage',
  'Sanguine',
  'Serendipitous',
  'Scandalous',
  'Seditious',
  'Self-confident',
  'Sensitive',
  'Serene',
  'Shackbaggerly',
  'Shrewd',
  'Sincere',
  'Sinister',
  'Slothful',
  'Somnolent',
  'Soothing',
  'Straightforward',
  'Stroppy',
  'Suave',
  'Submissive',
  'Subversive',
  'Succulent',
  'Sullen',
  'Supercalifragilisticexpialidocious',
  'Supple',
  'Supportive',
  'Surly',
  'Sympathetic',
  'Thoughtful',
  'Thrawn',
  'Thrifty',
  'Tittynope',
  'Touched',
  'Tough',
  'Traitorous',
  'Truculent',
  'Trustworthy',
  'Unassuming',
  'Understanding',
  'Unscrupulous',
  'Upbeat',
  'Vain',
  'Versute',
  'Vile',
  'Vindictive',
  'Vivacious',
  'Wholesome',
  'Wistful',
  'Witty',
  'Woeful',
  'Wrathful',
  'Aberrant',
  'Abject',
  'Adroit',
  'Aloof',
  'Baleful',
  'Bellicose',
  'Bilious',
  'Boorish',
  'Bubbly',
  'Bullish',
  'Caustic',
  'Comely',
  'Dapper',
  'Debonair',
  'Dogmatic',
  'Dilatory',
  'Disheveled',
  'Eccentric',
  'Ebullient',
  'Erudite',
  'Ethereal',
  'Equanimous',
  'Excitable',
  'Fastidious',
  'Feckless',
  'Finicky',
  'Freewheeling',
  'Funky',
  'Genial',
  'Giddy',
  'Glib',
  'Grimy',
  'Guileless',
  'Hubristic',
  'Insidious',
  'Insolent',
  'Jejune',
  'Jittery',
  'Lackadaisical',
  'Laconic',
  'Larcenous',
  'Loquacious',
  'Lugubrious',
  'Obtuse',
  'Pernicious',
  'Petulant',
  'Pitiable',
  'Pompous',
  'Prudent',
  'Puckish',
  'Mannered',
  'Manic',
  'Mendacious',
  'Mercurial',
  'Meretricious',
  'Milquetoast',
  'Radiant',
  'Reclusive',
  'Resilient',
  'Righteous',
  'Risible',
  'Sage',
  'Savvy',
  'Salubrious',
  'Self-righteous',
  'Slovenly',
  'Sly',
  'Spiffy',
  'Spooky',
  'Strident',
  'Sus',
  'Timorous',
  'Touchy',
  'Visionary',
  'Vivacious',
  'Voracious',
  'Whimsical',
  'Luminous',
  'Pulchritudinous',
  'Zesty',
  'Mirthful',
  'Froufrou',
  'Haunted',
  'Flummoxed',
  'Mephistophelean',
  'Rabelaisian',
  'Malevolent',
  'Menacing',
  'Murderous',
  'Magnetic',
  'Melancholy',
  'Mischievous',
  'Moral',
  'Mundane',
  'Maladjusted',
  'Meddlesome',
  'Bloodthirsty',
  'Bossy',
  'Brutish',
  'Befuddling',
  'Arrogant',
  'Empathetic',
  'Fierce',
  'Pensive',
  'Pragmatic',
  'Uptight',
  'Solemn',
  'Uneasy',
  'Deceitful',
  'Playful',
  'Thirsty',
]

export default adjectives
