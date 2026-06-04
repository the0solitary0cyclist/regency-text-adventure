import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { createRoot } from 'react-dom/client';
import './styles.css';
// import { startMusic, stopMusic } from "./music";

const START_ROOM = 'greatHall';

const commandAliases = {
  l: 'look',
  x: 'examine',
  read: 'examine',
  get: 'take',
  pickup: 'take',
  pick: 'take',
  drop: 'remove',
  discard: 'remove',
  leave: 'remove',
  i: 'inventory',
  inv: 'inventory',
  talk: 'speak',
  ask: 'speak',
  go: 'go',
  move: 'go',
  travel: 'go',
  answer: 'answer',
  arrange: 'answer',
  solve: 'answer',
  unscramble: 'answer',
  give: 'give',
  offer: 'give',
  hand: 'give'
};

const cast = {
  reynolds: 'Mrs. Reynolds',
  gray: 'Lady Gray Westmoor',
  elizabeth: 'Elizabeth Bennet',
  gwendolen: 'Gwendolen Fairfax',
  natasha: 'Natasha Rostova',
  turtle: 'Turtle Wexler',
  valjean: 'Jeanne Valjean',
  // thenardierOne: 'Mme. Thénardier',
  // thenardierTwo: 'Mme. Thénardier',
  wren: 'The Ghost'
};

const rooms = {
  greatHall: {
    title: 'Great Hall',
    aliases: ['hall', 'great hall', 'center hall', 'entry', 'foyer'],
    image: 'IMAGE PLACEHOLDER: Great Hall — white marble, candlelit staircase, gray-ribboned portraits, rain at the door.',
    text: 'Westmoor Hall stands east of the village and west of nothing at all. There is not a moor for 50 miles or... more. This would cause no end of confusion among visitors if its mistress were not one Lady Westmoor. However, it would scandalize the town to know that Lady Westmoor never existed.',
    exits: {
      'East Wing': 'eastWing',
      'West Wing': 'westWing',
      'Upper Landing': 'upperLanding',
      'Orangery': 'orangery',
      'Music Room': 'musicRoom',
      'Servants\' Passage': 'servantsPassage'
    },
    objects: ['invitation'],
    people: ['reynolds']
  },
  upperLanding: {
    title: 'Upper Landing',
    aliases: ['upper landing', 'landing', 'stairs', 'staircase'],
    image: 'IMAGE PLACEHOLDER: Upper Landing — white banister, dim portraits, a corridor branching toward the gallery and attic.',
    text: 'The upper landing looks down upon the Great Hall. From here the house seems less like a home than a set of shelves for stories.',
    exits: {
      'Great Hall': 'greatHall',
      'North Gallery': 'northGallery',
      'Attic': 'attic'
    },
    objects: ['silver candlesticks'],
    people: []
  },
  eastWing: {
    title: 'East Wing Drawing Room',
    aliases: ['east wing', 'drawing room', 'east drawing room'],
    image: 'IMAGE PLACEHOLDER: East Wing — white tea table, sofa, embroidery basket, and a chair set slightly apart.',
    text: 'A tea service waits for twice as many guests as could possibly be present.',
    exits: { 'Great Hall': 'greatHall', 'Music Room': 'musicRoom', 'Orangery': 'orangery' },
    objects: ['cigarette case', 'love letter'],
    people: ['gwendolen', 'elizabeth']
  },
  westWing: {
    title: 'West Wing Library',
    aliases: ['west wing', 'library', 'west library'],
    image: 'IMAGE PLACEHOLDER: West Wing Library — legal ledgers, family trees, and a locked white glass bookcase.',
    text: 'The library smells of leather, ink, and... cup noodles? Someone has sorted the shelves into Romance, Revolution, Inheritance, and Fanfiction.',
    exits: { 'Great Hall': 'greatHall', 'Servants\' Passage': 'servantsPassage' },
    // objects: ['darcy letter', 'westing envelope', 'newspaper'],
    objects: ['newspaper'],
    people: ['turtle']
    // people: ['turtle', 'thenardierOne', 'thenardierTwo']
  },
  musicRoom: {
    title: 'Music Room',
    aliases: ['music room', 'ballroom', 'comet room'],
    image: 'IMAGE PLACEHOLDER: Music Room — chandelier, abandoned sheet music, comet painted across the white ceiling.',
    text: 'A piano repeats one unfinished phrase whenever no one is looking. The ceiling comet seems to have been painted over another sky.',
    exits: { 'Great Hall': 'greatHall', 'East Wing': 'eastWing', 'South Garden': 'southGarden' },
    objects: ['sheet music'],
    people: ['natasha']
  },
  southGarden: {
    title: 'South Garden',
    aliases: ['south garden', 'garden', 'rose garden'],
    image: 'IMAGE PLACEHOLDER: South Garden — wet gravel paths, white roses, locked gate, moonlit fountain.',
    text: `The South Garden blooms out of season, full of bright red roses. Tea roses, first bred in 1867. Is it not 1811? The South Garden blooms out of time. The fountain is dry, the path is wet - and holds two sets of identical footprints.  
    Jeanne Valjean sits upon a stone seat; also out of time (though not by much.) Not the man you would expect to see; a woman. Beside her is a bag, as though at any time she may depart. Curious. `,
    exits: { 'Orangery': 'orangery' },
    objects: [''],
    people: ['valjean']
  },
  orangery: {
  title: 'Orangery',
  aliases: ['orangery', 'conservatory', 'greenhouse', 'glasshouse'],
  image: 'IMAGE PLACEHOLDER: Orangery — white orange blossoms, tall windows, citrus trees in painted tubs, a writing desk hidden behind leaves.',
  text: `The citrus fruits glow upon the boughs all around, their scents upon the air.  
  The air...has a surprising chill. Outside, a view into the rose garden.  
  Snow is falling, slowly wiping color from the world.  
  You notice words are evaporating from the condensation on the glass:  
"WAKE"`,
  exits: { 'Great Hall': 'greatHall', 'South Garden': 'southGarden', 'Servants\' Passage': 'servantsPassage' },
  objects: ['notebook', 'hand mirror'],
  people: []
  },  
  northGallery: {
    title: 'North Gallery',
    aliases: ['north gallery', 'gallery', 'portrait gallery'],
    image: 'IMAGE PLACEHOLDER: North Gallery — portraits of women whose faces flicker between painted and blank.',
    text: 'Portraits line the North Gallery. In one are seated two young women in red mantuas, holding fast to one another. They have differing expressions and yet they share a face. One holds a goblet, the other a pen.',
    exits: { 'Upper Landing': 'upperLanding', 'Attic': 'attic' },
    objects: ['blank portrait'],
    people: ['wren']
  },
  servantsPassage: {
    title: 'Servants\' Passage',
    aliases: ['servants passage', 'servants hall', 'passage', 'corridor', 'servants\' passage', 'servants\' hall'],
    image: 'IMAGE PLACEHOLDER: Servants Passage — bells, narrow stairs, laundry basket full of crossed-out pages.',
    text: 'The servants\' passage runs behind the formal rooms. Here the house drops its manners and shows its seams.',
    exits: { 'Great Hall': 'greatHall', 'Orangery': 'orangery', 'West Wing': 'westWing' },
    objects: ['rewritten page'],
    people: []
  },
  attic: {
    title: 'Attic',
    aliases: ['attic', 'upper room', 'nursery'],
    image: 'IMAGE PLACEHOLDER: Attic — trunks, school papers, theater costumes, and a cracked dorm-room mirror.',
    text: 'The attic should belong to the house, but it has the air of a dorm room after finals: books open, clothes abandoned, pages everywhere.',
    exits: { 'Upper Landing': 'upperLanding', 'North Gallery': 'northGallery' },
    objects: ['carry on manuscript', 'brass key'],
    people: []
  },
  lockedStudy: {
    title: 'Lady Gray’s Locked Study',
    aliases: ['study', 'locked study', 'lady gray study'],
    image: 'IMAGE PLACEHOLDER: Locked Study — gray desk, seven labeled drawers, manuscript pages pinned like evidence.',
    text: 'The study is not large, but every story in the house seems to have left something here for safekeeping.',
    exits: { 'Great Hall': 'greatHall' },
    objects: ['final manuscript'],
    people: ['gray']
  },
  ending: {
    title: 'The Edge of Waking',
    aliases: ['ending'],
    image: 'IMAGE PLACEHOLDER: Ending — Westmoor Hall overlaid with a dorm room, two sisters, one notebook.',
    text: 'The house thins into paper. The borrowed name loosens. Another name waits underneath.',
    exits: {},
    objects: [],
    people: []
  }
};

const objectDetails = {
  'invitation': {
    image: 'IMAGE PLACEHOLDER: An invitation addressed to “Miss Simone Snow,” the ink changing midway through.',
    text: `The invitation requests “Miss Simon**e** Snow” at Westmoor Hall. A second hand has inserted the "E". Some conscientious proofreading assistant, no doubt.  
    You do not recall why you are here, but at least you are dressed appropriately.  
    Your reticule hangs from your wrist containing a handkerchief, three hairpins, and no explanations whatsoever.`,
    clue: 'false-name',
    clueLabel: 'False-name invitation',
    requiresPossession: false
  },
  'cigarette case': {
    image: 'IMAGE PLACEHOLDER: Silver cigarette case engraved “From little Cecily, with her fondest love.”',
    text: 'The cigarette case should explain a false identity, but the inscription has been revised three times. Gwendolen has underlined “fondest” in offended pencil.',
    clue: 'earnest-revision',
    clueLabel: 'Earnest false identity',
    requiresPossession: false
  },
  'darcy letter': {
    image: 'IMAGE PLACEHOLDER: Long folded letter beginning “Be not alarmed, madam,” with later sentences crossed out.',
    text: 'Darcy’s letter has been edited into something crueler than pride and less useful than truth. Elizabeth has written in the margin: “This is not what he meant.”',
    clue: 'pride-revision',
    clueLabel: 'Pride and Prejudice letter',
    requiresPossession: false
  },
  // 'comet program': {
  //   image: 'IMAGE PLACEHOLDER: Theater program for a comet-lit ball, Natasha’s name bright, one duet replaced in red ink.',
  //   text: 'The program promises a ball, a betrayal, a comet, and a reconciliation. Someone has rewritten the reconciliation as a disappearance.',
  //   clue: 'comet-revision',
  //   clueLabel: 'Comet program revision',
  //   requiresPossession: false
  // },
  'sheet music': {
    image: 'IMAGE PLACEHOLDER: A piece of sheet music',
    // text: 'You note the lyrics of this fashionable air: Straight from a page of your favorite author / And the weather so breezy / Man, why can\'t life always be this easy? / She in the mirror dancin\' so sleazy / I get a call like, "Where are you, Yeezy?".',
// lack of indentation is important for markdown
    text: `You note the lyrics of this fashionable air:

*Straight from a page of your favorite author*  
*And the weather so breezy*  
*Man, why can't life always be this easy?*  
*She in the mirror dancin' so sleazy*  
*I get a call like, "Where are you, Yeezy?"*`,

    clue: 'comet-revision',
    clueLabel: 'Comet program revision',
    requiresPossession: false
  },
  'westing envelope': {
    image: 'IMAGE PLACEHOLDER: Westing-style envelope with chess notation, stock ticker marks, and a clue cut in half.',
    text: 'The envelope contains half a clue, a chess queen, and Turtle Wexler’s furious note: “This is not a puzzle. This is cheating.”',
    clue: 'westing-revision',
    clueLabel: 'Westing envelope',
    requiresPossession: true
  },
  'silver candlesticks': {
    image: 'IMAGE PLACEHOLDER: Pair of silver candlesticks, one real and one only sketched in pencil.',
    text: `Two large candlesticks of massive silver stand on a narrow mahogany table.  
    They have been polished; you can see yourself reflected in each.`,
    // text: 'The candlestick is warm from someone’s hand. It carries the weight of mercy, theft, and a life rewritten under another name.',
    clue: 'miserables-revision',
    clueLabel: 'Valjean candlestick',
    requiresPossession: true
  },
  'hand mirror': {
    image: 'IMAGE PLACEHOLDER: A silver hand mirror on the Orangery writing desk, its glass dark around the edges.',
    text: `Your hair is is dressed à la grecque, but your face is unexpectedly ashen.  
    The mirror reflects the orange trees, the steamed glass, and a woman standing behind you.  
    When you turn, no one is there.`,
    clue: 'wrong-reflection',
    clueLabel: 'Wrong reflection',
    requiresPossession: false
  },
  'white rose': {
    image: 'IMAGE PLACEHOLDER: White rose tied with gray thread, petals faintly printed with words.',
    text: 'Each petal bears a tiny phrase: forgive her, wake her, rewrite it, remember me. The last phrase has been scratched out.',
    clue: 'mercy-thread',
    clueLabel: 'White rose thread',
    requiresPossession: false
  },
  'notebook': {
    image: 'IMAGE PLACEHOLDER: Notebook page torn down the center, two handwritings arguing in the margins.',
    text: 'Two sisters have written on the same page. One voice builds a scene carefully. The other improves it by force, then pretends force is the same as help.',
    clue: 'wren-thread',
    clueLabel: 'Twin notebook page',
    requiresPossession: true
  },
  'blank portrait': {
    image: 'IMAGE PLACEHOLDER: Portrait of a young woman seen from behind; in the mirror she looks like someone else.',
    text: 'The portrait is not blank after all. It shows a young woman who looks familiar only when she turns away. The haunting is a sister-shaped absence.',
    clue: 'haunting',
    clueLabel: 'Haunting portrait',
    requiresPossession: false
  },
  'rewritten page': {
    image: 'IMAGE PLACEHOLDER: Page where every gentle sentence has been overwritten in darker, faster ink.',
    text: 'The rewritten page keeps the plot moving by breaking everyone’s heart earlier. In the margin: “You were taking too long.”',
    clue: 'rewriting',
    clueLabel: 'Forced rewrite',
    requiresPossession: true
  },
  'carry on manuscript': {
    image: 'IMAGE PLACEHOLDER: Fanfiction manuscript titled Carry On, with “Simone Snow” written over another name.',
    text: 'The manuscript is a story inside the story. “Simone Snow” is not a person so much as a door the dream used because it was already open.',
    clue: 'fanfiction-thread',
    clueLabel: 'Carry On manuscript',
    requiresPossession: false
  },
  'brass key': {
    image: 'IMAGE PLACEHOLDER: Brass key tagged “Lady Gray’s Study,” casting two shadows.',
    text: 'The key is tagged for Lady Gray’s study. A second shadow bends toward the North Gallery, as if the haunting has used it before.',
    clue: 'study-key',
    clueLabel: 'Study key',
    requiresPossession: true
  },
  'newspaper': {
  image: 'IMAGE PLACEHOLDER: A folded New York Times arts page, damp at the edges as though brought in from snow.',
  text: `Not just any newspaper – The New York Times. First published 1851. An anchronism.  
  The newspaper is folded open to a story:  
  *"Emerging Novelist Critically Injured in Winter Car Crash"*  
  Car. Another anachronism.  
  The print fades before your eyes as though obscured by snow.`,
  clue: 'gray-lady-newspaper',
  clueLabel: 'Gray Lady newspaper',
  requiresPossession: false
},
'love letter': {
  image: 'IMAGE PLACEHOLDER: A love letter folded into the sheet music, its seal cracked and its signature blurred.',
  text: "You blush to read the note signed by Sonya: I will stand in the dark for you. I will hold you back by force. I will stand here outside your door. I won't see you disgraced. I will protect your name and your heart. - here, surely, is a love letter.",
  clue: 'love-letter',
  clueLabel: 'Natasha love letter',
  requiresPossession: false
},
  'final manuscript': {
    image: 'IMAGE PLACEHOLDER: Final manuscript pages, some careful, some reckless, all waiting for an ending.',
    text: 'The final manuscript gathers every altered object into one pattern. Lady Gray did not summon suspects. She summoned witnesses.',
    clue: 'final-proof',
    clueLabel: 'Final proof',
    requiresPossession: false
  }
};

const paperClueAnswer = 'bewarethegraylady';
const paperClueWords = ['BE', 'WARE', 'THE', 'GRAY', 'LADY'];
const totalPaperClues = 5;

const dialogue = {
  reynolds: {
    name: cast.reynolds,
    aliases: ['reynolds', 'mrs reynolds', 'housekeeper'],
    image: 'IMAGE PLACEHOLDER: Mrs. Reynolds the housekeeper',
    intro: '“Welcome Miss Snow. Although I fear if you have arrived here, that means someone is missing.”',
    later: `“Since you missed the luncheon the mistress says I am meant to give you a clue of your own, whatever that means.  
    She says "A bird in the hand." I hope it means something to you, as it mean nought to me.”`,
    clue: 'reynolds-warning',
    clueLabel: 'Reynolds warning'
  },
  gray: {
    name: cast.gray,
    aliases: ['gray', 'lady gray', 'westmere', 'lady gray westmere'],
    image: 'IMAGE PLACEHOLDER: Lady Gray Westmoor — silver silk, black gloves, cane across her knees.',
    intro: '“Names are useful until they become cages,” Lady Gray says. “Find what has been rewritten. Then ask who benefits from a story becoming less itself.”',
    later: '“I am not the author of this damage,” Lady Gray says. “I am merely old enough to know when a story is being forced.”',
    clue: 'gray-warning',
    clueLabel: 'Lady Gray’s warning'
  },
  elizabeth: {
    name: cast.elizabeth,
    aliases: ['elizabeth', 'lizzy', 'elizabeth bennet', 'bennet'],
    image: 'IMAGE PLACEHOLDER: Elizabeth Bennet — standing by the tea table, letter folded like a weapon.',
    intro: 'Elizabeth Bennet studies you with amused suspicion. “The house is full of people being improved against their will. I cannot recommend it.”',
    later: 'Elizabeth says, “A misunderstanding can be instructive. A rewriting is only rude.”',
    clue: 'elizabeth-consulted',
    clueLabel: 'Elizabeth on rude revision',
    paperClue: 'LADY'
  },
  gwendolen: {
    name: cast.gwendolen,
    aliases: ['gwendolen', 'gwendolen fairfax', 'fairfax'],
    image: 'IMAGE PLACEHOLDER: Gwendolen Fairfax — immaculate gloves, silver cigarette case, wounded dignity.',
    intro: 'Gwendolen Fairfax snaps the cigarette case shut. “I am prepared to forgive a false name. I am not prepared to forgive bad editing.”',
    later: 'Gwendolen says, “Someone has mistaken complication for wit. A common but devastating error.”',
    clue: 'gwendolen-consulted',
    clueLabel: 'Gwendolen on false names',
    paperClue: 'GRAY'
  },
  natasha: {
    name: cast.natasha,
    aliases: ['natasha', 'natasha rostova', 'rostova'],
    image: 'IMAGE PLACEHOLDER: Natasha Rostova — beneath the painted comet, holding a program with trembling hands.',
    intro: `“I have been like you. I have felt the absence of one I love.  
    And I too have been very ill. Heartsick, ashamed, and pale as a winter sky.  
    I yearn for a kind word, or better yet a love letter,  
    a love letter,  
    a love letter...”`,
    later: 'Natasha says, “Whoever changed it did not understand that sorrow is not the same thing as an ending.”',
    clue: 'natasha-consulted',
    clueLabel: 'Natasha on forgiveness',
    paperClue: 'BE'
  },
  turtle: {
    name: cast.turtle,
    aliases: ['turtle', 'turtle wexler', 'wexler'],
    image: 'IMAGE PLACEHOLDER: Turtle Wexler — seated on a library ladder, envelope open, braid like a challenge.',
    intro: 'Turtle Wexler waves the envelope. “The clues are inconsistent. That means either the puzzle is bad, or someone tampered with the rules.”',
    later: 'Turtle says, “I like games. I hate being played.”',
    clue: 'turtle-consulted',
    clueLabel: 'Turtle on bad rules',
    paperClue: 'THE'
  },
  valjean: {
    name: cast.valjean,
    aliases: ['jeanne', 'jeanne valjean', 'valjean'],
    image: 'IMAGE PLACEHOLDER: Jeanne Valjean — in the garden with silver candlesticks and a guarded, merciful face.',
    intro: "Jeanne Valjean says, “I am not who you would expect to see here, nor as you may expect to see me. I took another name to survive. But at least I wrote my own story. I was Monsieur Madeleine, in reverence to Mary Magdalene; a sainted testament to second chances. It's all the more fitting considering I am a woman. Perhaps these candlesticks can shine some light upon the mysteries in your life.”",    
    later: 'Jeanne Valjean says, “Mercy changes a life. Control merely disguises itself as mercy.”',
    clue: 'valjean-consulted',
    clueLabel: 'Valjean on mercy',
    paperClue: 'WARE'
  },
  // thenardierOne: {
  //   name: cast.thenardierOne,
  //   displayName: 'Mme. Thénardier One',
  //   aliases: ['thenardier', 'mme thenardier', 'madame thenardier', 'one', 'first thenardier', 'first'],
  //   image: 'IMAGE PLACEHOLDER: Mme. Thénardier in plum silk — smiling too brightly beside a ledger of debts.',
  //   intro: 'The first Mme. Thénardier curtsies. “A double is useful, dear. One may deny what the other has done.”',
  //   later: 'The first Mme. Thénardier says, “When everyone is rewritten, identity becomes negotiable.”',
  //   clue: 'thenardier-double',
  //   clueLabel: 'Thénardier double'
  // },
  // thenardierTwo: {
  //   name: cast.thenardierTwo,
  //   displayName: 'Mme. Thénardier Two',
  //   aliases: ['two', 'second thenardier', 'other thenardier', 'second'],
  //   image: 'IMAGE PLACEHOLDER: Mme. Thénardier in green silk — identical smile, different stolen buttons.',
  //   intro: 'The second Mme. Thénardier says, “Do not look so shocked. Some stories have always had two villains in one household.”',
  //   later: 'The second Mme. Thénardier says, “A mirror is only frightening when it starts correcting you.”',
  //   clue: 'thenardier-mirror',
  //   clueLabel: 'Thénardier mirror'
  // },
  wren: {
    name: cast.wren,
    aliases: ['haunting', 'ghost', 'girl', 'wren', 'haunting girl'],
    image: 'IMAGE PLACEHOLDER: The haunting girl — seen in a mirror, almost the protagonist, almost not.',
    intro: 'The haunting girl appears at the end of the gallery. She has the wrong stillness for a ghost. “You were taking too long,” she says, then vanishes.',
    later: 'The haunting girl says, “I fixed them. I fixed us. You were asleep, and someone had to keep writing.”',
    clue: 'wren-consulted',
    clueLabel: 'The haunting speaks'
  }
};

const requiredClues = [
  'false-name',
  'earnest-revision',
  'pride-revision',
  'comet-revision',
  'westing-revision',
  'miserables-revision',
  'wren-thread',
  'haunting',
  'rewriting',
  'fanfiction-thread',
  'study-key',
  'final-proof',
  'wren-consulted',
  // 'thenardier-double'
];

const requiredInventoryForEnding = ['westing envelope', 'silver candlestick', 'twin notebook page', 'rewritten page'];

function normalize(input) {
  return input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?]/g, '').replace(/\s+/g, ' ');
}

function normalizePaperClueGuess(input) {
  return normalize(input)
    .replace(/\s+/g, '')
    .replace(/grey/g, 'gray');
}

function cleanNoun(noun) {
  return noun.replace(/^(to|the|a|an) /, '').trim();
}

function findRoomKey(input) {
  const cleaned = cleanNoun(normalize(input));
  return Object.entries(rooms).find(([, room]) => room.aliases.map(normalize).includes(cleaned))?.[0];
}

function findObject(input, availableObjects) {
  const cleaned = cleanNoun(normalize(input));
  return availableObjects.find(object => object === cleaned || normalize(object).includes(cleaned) || cleaned.includes(normalize(object)));
}

function findCharacter(input) {
  const cleaned = cleanNoun(normalize(input));
  return Object.entries(dialogue).find(([, character]) => character.aliases.map(normalize).includes(cleaned) || normalize(character.name).includes(cleaned) || normalize(character.displayName || '').includes(cleaned))?.[0];
}

function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    return hash || 'game';
  });
  const [location, setLocation] = useState(START_ROOM);
  // const [inventory, setInventory] = useState([]);
  // Test state
  const [inventory, setInventory] = useState(() => [
  'BE',
  'WARE',
  'THE',
  'GRAY'
]);
  const [roomObjects, setRoomObjects] = useState(() => Object.fromEntries(Object.entries(rooms).map(([key, room]) => [key, [...room.objects]])));
  const [foundClues, setFoundClues] = useState([]);
  const [clueSources, setClueSources] = useState({});
  const [visitedPlaces, setVisitedPlaces] = useState([START_ROOM]);
  const [hasHeardPaperClueRule, setHasHeardPaperClueRule] = useState(false);
  const [consultedPeople, setConsultedPeople] = useState([]);
  const [visualText, setVisualText] = useState(rooms[START_ROOM].image);
  const [message, setMessage] = useState('Lady Gray claims someone has stolen the ending. Try a place name, “speak Elizabeth,” “take envelope,” or “help.”');
  const [command, setCommand] = useState('');
  const [placeholderExamples, setPlaceholderExamples] = useState([]);
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const room = rooms[location];
  const visibleObjects = roomObjects[location] || [];
  const peopleHere = room.people || [];
  const progress = Math.round((foundClues.filter(clue => requiredClues.includes(clue)).length / requiredClues.length) * 100);
  const formattedPoem = `

  *Called heirs assemble, names are read,*  
  *as white snow crowns the roses red,*  
  *the key is turned by trembling hand,*  
  *her shadow falls on house and land.*  
  *Wake, dear heart, and claim your due:*  
  *receive the birthright kept for you.*  
  *Estates may pass by trust and deed; but!*  
  *nothing’s clear with just one read.*

`
  const paperClueRules = {
    elizabeth:
      `“Miss Snow! How delightful to see you.  
It's a shame you missed luncheon; the oddest thing happened.  
Lady Gray told us we would discover a treause.  
She read us the queerest poem. Shall I tell you?` + formattedPoem + `Then she gave each of us a slip of paper. A clue, she says, although to what mystery no one can agree.  
My clues are "LADY" and "BIRD." A ladybird sounds like a promising thing.”`,

    natasha:
      `“Miss Snow! We were wondering when you would arrive.   
    It's a pity you missed luncheon; the oddest thing happened.  
    Lady Gray told us we would discover a treause. 
    She read us a poem. I shall tell you all! She said:` + formattedPoem +  `Then she gave us each clue. I think they must belong together somehow.  
    My clues are "BE" and "IN." Just being can suprisingly painful. Nevermind if you don't know where you ought to be.”`,

    valjean:
      `“Miss Snow, welcome. We were sorry to miss you at luncheon.  
      Lady Gray gave a curious speech. She said`  + formattedPoem + `Then she distributed slips of paper to the guests. She says we will discover a treasure.  
      Mine clues say "THE" and "WARE." A reference to my garment business, perhaps.”`,

    turtle:
      `“Simone Snow! You missed lunch. I guess I'll catch you up.  
      Lady Gray said we would "discover a treasure."  
      Then she read us a poem. It was very old-fashioned; like her I guess. It went:` + formattedPoem +
      `Then she handed everybody a clue on a little piece of paper. Now everybody has one except you, I guess.  
      Mine are "A" and "THE" - How useless.    
      You were late and you haven't seen Lady Gray? That's either rude or suspicious.”`,

    gwendolen:
      `“Miss Snow, there you are. It is a pity you missed luncheon; there was such an excitement!  
    Lady Gray told us we would discover a treause. She read us a poem. I shall tell you all! She said:` + formattedPoem +  `Then Lady Gray distributed paper clues to all the guests. I consider the entire arrangement wonderfully dramatic.  
    But mine say "GRAY" and "HAND", how dull. Don't you have one? Perhaps not yet. Well, now you have mine, so that's a start.”`,

    cecily:
      "“Miss Snow! You have just missed the excitement. At luncheon Lady Gray gave everyone a paper clue. No one knows what they mean yet, which makes them much more interesting.”",

    jane:
      "“Miss Snow, it is lovely to see you. We were sorry to miss you at luncheon. Lady Gray presented each guest with a paper clue. Everyone has been trying very politely not to speculate about them.”",

    angela:
      "“Miss Snow, welcome. It's unfortunate that you missed luncheon. Lady Gray distributed clues to the guests, one per person. Everyone seems quite occupied by them.”",
  };

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#/', '');
      setPage(hash || 'game');
    }

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
  const pool = buildRoomExamples();

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  setPlaceholderExamples(shuffled.slice(0, 3));
}, [location]);

  useEffect(() => {
    // audioRef.current = new Audio('/music/westmoor-theme.m4a');
    audioRef.current = new Audio(`${import.meta.env.BASE_URL}music/westmoor-theme.m4a`);
    audioRef.current.loop = true;

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const placeholderText =
  placeholderExamples.length
    ? `try: ${placeholderExamples.join(', ')}`
    : 'enter command';

  const roomSummary = useMemo(() => ({
    objects: visibleObjects,
    people: peopleHere.map(personKey => dialogue[personKey].displayName || dialogue[personKey].name),
    exits: Object.keys(room.exits)
  }), [room, visibleObjects, peopleHere]);

  function goToPage(nextPage) {
    window.location.hash = `/${nextPage}`;
    setPage(nextPage);
  }

  function write(nextMessage) {
    setMessage(nextMessage);
  }

  function discover(clue, source, label) {
    if (!clue) return;
    setFoundClues(previous => previous.includes(clue) ? previous : [...previous, clue]);
    setClueSources(previous => previous[clue] ? previous : { ...previous, [clue]: { source, label } });
  }

  function addItem(item) {
    setInventory(previous => previous.includes(item) ? previous : [...previous, item]);
  }

  function hasAllPaperClues() {
    return paperClueWords.every(clue => inventory.includes(clue));
  }

  function toggleMusic() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setMusicPlaying(true);
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  }

  function handleCommand(raw) {
    const text = normalize(raw);
    if (!text) return;

    const [firstWord, ...restWords] = text.split(' ');
    const verb = commandAliases[firstWord] || firstWord;
    const remainder = restWords.join(' ');

    if (verb === 'help') {
      const addedCommands = hasAllPaperClues()
        ? `
    arrange [phrase]  
    `
    : '';
      write(`Commands:

      - place name
      - go [place]
      - speak [person]
      - take [object]
      - examine [object]
      - remove [object]
      - inventory
      ${addedCommands}
      Some objects must be taken; others left.  
      Do not be afraid to ask for help.  
      In Westmoor Hall, the answer very much depends on where you are standing.`);
    } else if (verb === 'look') {
      setVisualText(room.image);
      write(getRoomText(location));
    } else if (verb === 'inventory') {
      write(inventory.length ? `Reticule: ${inventory.join(', ')}.` : 'Reticule: empty.');
    } else if (verb === 'go') {
      goTo(remainder);
    } else if (verb === 'take') {
      takeItem(remainder);
    } else if (verb === 'remove') {
      removeItem(remainder);
    } else if (verb === 'give') {
      giveItem(remainder);
    } else if (verb === 'examine') {
      examineItem(remainder);
    } else if (verb === 'speak') {
      speakTo(remainder);
    } else if (verb === 'answer') {
      answerPaperClues(remainder);
    } else if (verb === 'open' && remainder.includes('study')) {
      openStudy();
    } else if (verb === 'write' && remainder.includes('ending')) {
      writeEnding();
    } else {
      const asPlace = findRoomKey(text);
      if (asPlace) goTo(text);
      else write('That command does not produce a socially acceptable result. Try “help.”');
    }

    setCommand('');
  }

  function buildRoomExamples() {
    const examples = [];

    // People
    for (const personKey of peopleHere) {
      const person = dialogue[personKey];
      examples.push(`speak ${person.aliases[0]}`);
    }

    // Objects
    for (const object of visibleObjects) {
      examples.push(`examine ${object}`);
    }

    // Places
    for (const place of Object.keys(room.exits)) {
      examples.push(place);
    }

    return examples;
  }

  function getRoomText(roomKey) {
    const baseText = rooms[roomKey].text;

    if (roomKey === 'southGarden' && visitedPlaces.includes('orangery')) {
      return `Despite your view from the Orangery, there is no snow here. Strange.

  ${baseText};`
    }

    return baseText;
  }

  function goTo(placeInput) {
    const requested = findRoomKey(placeInput);
    if (!requested) {
      write(`No place named “${placeInput || 'there'}” comes into focus.`);
      return;
    }

    const exitMatch = Object.values(room.exits).includes(requested);
    if (!exitMatch) {
      write(`You cannot reach ${rooms[requested].title} from here.`);
      return;
    }

    setLocation(requested);
    setVisitedPlaces(previous => previous.includes(requested) ? previous : [...previous, requested]);
    setVisualText(rooms[requested].image);
    write(getRoomText(requested));
  }

  function takeItem(noun) {
    const found = findObject(noun, visibleObjects);
    if (!found) {
      write(`No object matching “${noun || 'that'}” is here.`);
      return;
    }

    addItem(found);
    setRoomObjects(previous => ({ ...previous, [location]: previous[location].filter(object => object !== found) }));
    setVisualText(objectDetails[found]?.image || room.image);
    const detail = objectDetails[found];
    if (detail?.requiresPossession) discover(detail.clue, `Taken: ${found}`, detail.clueLabel);
    write(`Taken: ${found}.${detail?.requiresPossession ? ' Its clue is now secure.' : ''}`);
  }

  function giveItem(remainder) {
  const { itemInput, characterInput } = parseGiveCommand(remainder);

  if (!itemInput || !characterInput) {
    write('Try: give [object] to [person].');
    return;
  }

  const item = findObject(itemInput, inventory);
  if (!item) {
    write(`You are not carrying “${itemInput}.”`);
    return;
  }

  const characterKey = findCharacter(characterInput);
    if (!characterKey || !peopleHere.includes(characterKey)) {
      write(`${characterInput || 'That person'} is not here.`);
      return;
    }

    if (characterKey === 'natasha' && item === 'love letter') {
      setInventory(previous => previous.filter(inventoryItem => inventoryItem !== item));
      setVisualText(dialogue.natasha.image);

      discover(
        'natasha-sonya-realization',
        'Gave Sonya’s love letter to Natasha',
        'Natasha remembers Sonya'
      );

      write(`You give the love letter to Natasha.

  She reads the letter once quickly, then again, with care.  
  “This is not from Anatole,” she says.

  “No. Of course it is not.  
  My cousin. My friend. My sister.  
  Sonya loved me before the comet, before the ball, before any man.  
  She was not the obstacle to my love story. She was the person trying to keep me alive inside it.  
  She is my dearest treasure, and the author of my future.”`);

      return;
    }

        if (characterKey === 'valjean' && item === 'silver candlesticks') {
      setInventory(previous => previous.filter(inventoryItem => inventoryItem !== item));
      setVisualText(dialogue.valjean.image);

      discover(
        'valjean-sister-realization',
        'Gave candlesticks to Valjean',
        'Valjean remembers sister'
      );

      write(`Valjeanne takes the candlesticks carefully, as if they weigh even more than silver.

“Everyone remembers Cosette, the child I saved.  
But no one remembers the child I *tried* to save. My sister's child.  
And before all that, there was my sister.

I stole bread for her and her children. She is the beginning of my story.  
Not my love for Cosette. Not the love of the Bishop. My love for her.
Hugo thinks that in his agony a man would forget his family. I do not believe that.  
And I know a sister never would.
I was given these candlesticks to light my way once, then I will use them now.  
I will find my sister’s family. I will raise us all to the light.”`);

      return;
    }

    write(`“You should keep that; I've no use for it!”`);
  }

  function removeItem(noun) {
    const found = findObject(noun, inventory);
    if (!found) {
      write(`You are not carrying “${noun || 'that'}.”`);
      return;
    }

    setInventory(previous => previous.filter(item => item !== found));
    setRoomObjects(previous => ({ ...previous, [location]: [...previous[location], found] }));
    write(`Removed from reticule: ${found}. It is now in ${room.title}.`);
  }

  function examineItem(noun) {
    const found = findObject(noun, [...inventory, ...visibleObjects]);
    if (!found) {
      write(`You find no useful detail for “${noun || 'that'}.”`);
      return;
    }

    const detail = objectDetails[found];
    setVisualText(detail.image);
    if (detail.requiresPossession && !inventory.includes(found)) {
      write(`${detail.text} You will need to take it before this clue can be used.`);
      return;
    }
    discover(detail.clue, `Examined: ${found}`, detail.clueLabel);
    write(detail.text);
  }

  function parseGiveCommand(remainder) {
    const parts = remainder.split(' to ');

    if (parts.length < 2) {
      return {
        itemInput: remainder,
        characterInput: ''
      };
    }

    return {
      itemInput: parts[0].trim(),
      characterInput: parts.slice(1).join(' to ').trim()
    };
  }

  function speakTo(noun) {
    const key = findCharacter(noun);
    if (!key || !peopleHere.includes(key)) {
      write(`${noun || 'That person'} is not here.`);
      return;
    }

    const character = dialogue[key];
    setVisualText(character.image);
    setConsultedPeople(previous => previous.includes(key) ? previous : [...previous, key]);
    discover(character.clue, `Conversation: ${character.displayName || character.name}`, character.clueLabel);

    // intro vs. later speak dynamic, not sure if I like it
    let response = foundClues.length >= 3 ? character.later : character.intro;

    if (key !== 'reynolds' && !hasHeardPaperClueRule) {
      response = `${paperClueRules[key]}`;
      setHasHeardPaperClueRule(true);
    }

if (character.paperClue && !inventory.includes(character.paperClue)) {
  addItem(character.paperClue);

  const inventoryAfterNewClue = [...inventory, character.paperClue];

  const hasAllPaperCluesNow = paperClueWords.every(clue =>
    inventoryAfterNewClue.includes(clue)
  );

  if (hasAllPaperCluesNow) {
    response += `

The slips of paper shift in your reticule.

Taken in order, they say very little. Taken otherwise, they seem almost willing to confess.

What phrase do they form?

Try: arrange [phrase]`;
  }
}

    write(response);
  }

  function answerPaperClues(guess) {
    const hasAllPaperClues = paperClueWords.every(clue =>
      inventory.includes(clue)
    );

    if (!hasAllPaperClues) {
      write('The paper clues are not all gathered yet.');
      return;
    }
    
     const guessText = `You arrange the clues as: “${guess}.
     `

    const witnessKey = peopleHere.find(personKey => personKey !== 'reynolds');
    const witness = witnessKey
    ? dialogue[witnessKey].displayName || dialogue[witnessKey].name
    : 'your companionon';

    const characterText = `"Oh!" Exclaims ${witness}. 
    "But what does it mean? Surely not our gracious hostess?"  

    "Oddly enough," you reply, "I can think of several meanings..."`

    if (normalizePaperClueGuess(guess) === paperClueAnswer) {
      discover('paper-clue-answer', 'Solved paper clues', 'Paper clue phrase');

      write(guessText + `The paper slips settle into order: “BEWARE THE GRAY LADY.”`  
        + characterText);
    } else {
      write(guessText + `No, that doesn't make sense.`);
    }
  }

  function openStudy() {
    if (location !== 'greatHall') {
      write('Lady Gray’s study opens from the Great Hall. The house is fussy about ceremony.');
      return;
    }
    if (!inventory.includes('brass key')) {
      write('The study door is locked.');
      return;
    }

    setLocation('lockedStudy');
    setVisitedPlaces(previous => previous.includes('lockedStudy') ? previous : [...previous, 'lockedStudy']);
    setVisualText(rooms.lockedStudy.image);
    write(rooms.lockedStudy.text);
  }

  function writeEnding() {
    if (location !== 'lockedStudy') {
      write('The ending must be written in Lady Gray’s study, where the altered pages have gathered.');
      return;
    }

    const missingClues = requiredClues.filter(clue => !foundClues.includes(clue));
    const missingItems = requiredInventoryForEnding.filter(item => !inventory.includes(item));
    if (missingClues.length || missingItems.length) {
      write(`The ending resists you. Missing clues: ${missingClues.length}. Required objects not carried: ${missingItems.length ? missingItems.join(', ') : 'none'}.`);
      return;
    }

    setLocation('ending');
    setVisualText(rooms.ending.image);
    write('Cath Avery wakes with ink on her hand. Wren is asleep across the room, one page of Cath’s story folded beneath her cheek. On the page, Lady Gray has written: “Revision is not resurrection, but love may learn to ask permission.”');
  }

  if (page === 'about') {
  return (
    <>
      <StaticPage title="About" goToPage={goToPage}>
        <div className="static-content about-text">
          <p>
            <strong>FOR JENNY</strong><br />
            who did not ask for a puzzle-mystery<br />
            but got one anyway
          </p>

          <h2>The Prompt</h2>

          <ul>
            <li>
              A podcast, podcast transcript, or live performance where characters from one
              story discuss another story, as part of their ongoing story or musical analysis
              podcast.
            </li>

            <li>
              A <em>Les Misérables</em> character isekai&apos;d into another world and their
              confusion at 1) the existence of men and 2) the idea that women are supposed
              to fall in love with men instead of with other women.
            </li>

            <li>
              <em>Fangirl</em>, and any character from another work writing fic, about their
              world, about another world, who knows!
            </li>

            <li>
              A note from several years ago titled “solstice swap” that says only:
              “Gray is Sam Westing.”
            </li>
          </ul>

          <p>
            I chose <em>Pride and Prejudice</em>, <em>Great Comet</em>, and{' '}
            <em>Earnest</em> as worlds or works that might be fun for these crossover
            prompts, but do not consider yourself limited.
          </p>
        </div>

        <h2>Credits</h2>

        <p>
          The Westmoor Theme is <a href="https://open.spotify.com/track/4XGgzwM2mBPmru2EBJbvd3?flow_ctx=d3590103-c6a1-4cd5-9121-d5a92615062f%3A1780426499a">a Kanye West Medley by Nicholas Yee.</a> 
        </p>
        <p>
          A credit to Alison Bechdel for <a href="https://en.wikipedia.org/wiki/Bechdel_test">The Bechdel Test</a>, which I wanted this project to ace.
        </p>
      </StaticPage>

      <Footer goToPage={goToPage} />
    </>
  );
}

if (page === 'hints') {
  return (
    <>
      <StaticPage title="Hints" goToPage={goToPage}>
        <p>
          Speak to every guest. Many of them carry something more useful than an answer.
        </p>

        <p>
          Some objects must be taken before their clues count. Others are meant to be given away.
        </p>

        <p>
          If the paper clues seem wrong in the order you found them, arrange them another way.
        </p>
      </StaticPage>

      <Footer goToPage={goToPage} />
    </>
  );
}

return (
  <>
    <main>
          <aside className="sidebar" aria-label="Game tracking">
      <section className="side-card">
        <h2>Reticule</h2>
        {inventory.length ? <ul>{inventory.map(item => <li key={item}><span>{item}</span><button type="button" onClick={() => removeItem(item)}>remove</button></li>)}</ul> : <p>Empty.</p>}
      </section>

      <section className="side-card">
        {/* <h2>Places Visited</h2> */}
        <h2>Visited</h2>
        <Checklist items={Object.entries(rooms).filter(([key]) => key !== 'ending').map(([key, room]) => [key, room.title])} checked={visitedPlaces} />
      </section>

      <section className="side-card sidebar-visual-card" aria-label="Current story image placeholder">
        <h2>View</h2>
        <p>{visualText}</p>
        {/* <button type="button" onClick={startMusic}>Start music</button>
        <button type="button" onClick={stopMusic}>Stop music</button> */}
      </section>

      <section>
        <button
        type="button"
        className="inventory-button"
        onClick={toggleMusic}
      >
        {musicPlaying
          // ? '♫ The musicians are engaged'
          ? '♫ Silence the musicians'
          : '♪ Engage the musicians'}
      </button>
      </section>

      {/* <section className="side-card">
        <h2>People Consulted</h2>
        <Checklist items={Object.entries(dialogue).map(([key, person]) => [key, person.displayName || person.name])} checked={consultedPeople} />
      </section> */}
    </aside>

    <section className="game">
      <h1>The Westmoor Game</h1>
      <div className="visual-card" aria-label="Current story image placeholder"><p>{visualText}</p></div>
      <h2>{room.title}</h2>
      <ReactMarkdown>{getRoomText(location)}</ReactMarkdown>

      <div className="room-grid" aria-label="Current room contents">
        <InfoBlock title="People" values={roomSummary.people} />
        <InfoBlock title="Objects" values={roomSummary.objects} />
        <InfoBlock title="Places" values={roomSummary.exits} />
      </div>

      <div className="meter" aria-label={`Mystery progress ${progress}%`}><span style={{ width: `${progress}%` }}></span></div>
      <p className="progress">Clues: {foundClues.filter(clue => requiredClues.includes(clue)).length}/{requiredClues.length}</p>

      <div className="message" aria-live="polite">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>


      <form onSubmit={event => { event.preventDefault(); handleCommand(command); }}>
        <label htmlFor="command">Command</label>
        <input id="command" autoFocus value={command} onChange={event => setCommand(event.target.value)} placeholder={placeholderText} />
        <button>Enter</button>
      </form>
    </section>
    </main>

    <Footer goToPage={goToPage} />
  </>
);

}

function InfoBlock({ title, values }) {
  return <section><h3>{title}</h3><p>{values.length ? values.join(' · ') : 'None'}</p></section>;
}

function StaticPage({ title, children, goToPage }) {
  return (
    <main className="static-page">
      <section className="static-card">
        <h1>{title}</h1>

        <div className="static-content">
          {children}
        </div>

        <button type="button" onClick={() => goToPage('game')}>
          Return to Westmoor Hall
        </button>
      </section>
    </main>
  );
}

function Footer({ goToPage }) {
  return (
    <footer className="site-footer">
      <button type="button" onClick={() => goToPage('game')}>
        Game
      </button>

      <button type="button" onClick={() => goToPage('hints')}>
        Hints
      </button>

      <button type="button" onClick={() => goToPage('about')}>
        About
      </button>
    </footer>
  );
}

function Checklist({ items, checked }) {
  return <ul className="checklist">
    {items.map(([key, label]) => <li key={key} className={checked.includes(key) ? 'done' : ''}><span aria-hidden="true">{checked.includes(key) ? '✓' : '□'}</span>{label}</li>)}
  </ul>;
}

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
// favicon.href = '/favicon.png';
favicon.href = `${import.meta.env.BASE_URL}favicon.png`

document.head.appendChild(favicon);

createRoot(document.getElementById('root')).render(<App />);
