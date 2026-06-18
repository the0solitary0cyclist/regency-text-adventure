import React, { useMemo, useState, useEffect, useRef } from 'react';
import { HintsPage } from './components/HintsPage';
import { AboutPage } from './components/AboutPage';
import { createRoot } from 'react-dom/client';
import './styles.css';

const START_ROOM = 'greatHall';

const START_MESSAGE = `
  <p>Try a place name, <strong>speak reynolds</strong>, <strong>examine invitation</strong>, or <strong>help</strong>.</p>
`;

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
  reticule: 'inventory',
  bag: 'inventory',
  purse: 'inventory',
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
  hand: 'give',
  use: 'use',
  // unlock: 'use',
  open: 'use'
};

const cast = {
  reynolds: 'Mrs. Reynolds',
  gray: 'Lady Gray',
  elizabeth: 'Elizabeth Bennet',
  gwendolen: 'Gwendolen Fairfax',
  natasha: 'Natasha Rostova',
  turtle: 'Turtle Wexler',
  valjean: 'Jeanne Valjean',
  wren: 'The Spectre'
};

const rooms = {
  greatHall: {
    title: 'Great Hall',
    aliases: ['hall', 'great hall', 'center hall', 'entry', 'foyer'],
    // image: 'IMAGE PLACEHOLDER: Great Hall — white marble, candlelit staircase, gray-ribboned portraits, rain at the door.',
    image: `${import.meta.env.BASE_URL}images/great-hall.png`,
    text: `<p>The Great Hall is spread before you, its twin staircases curving upward beneath a delicate chandelier.<br />
  Portraits watch from either wall.<br/ > A polished compass rose is set into the floor, directing you everywhere all at once.</p>`,
  // Mrs. Reynolds waits beside the foot of the stairs, composed as any housekeeper in a great estate ought to be.</p>`,
    // text: 'Westmoor Hall stands east of the village and west of nothing at all. There is not a moor for 50 miles or... more. This would cause no end of confusion among visitors if its mistress were not one Lady Westmoor. However, it would scandalize the town to know that Lady Westmoor never existed.',
    exits: {
      'Drawing Room': 'drawingRoom',
      'Orangery': 'orangery',
      // 'Music Room': 'musicRoom',
      'Servants’ Passage': 'servantsPassage',
      'Upper Landing': 'upperLanding',
      'Study': 'study'
    },
    objects: ['invitation'],
    people: ['reynolds']
  },
  upperLanding: {
    title: 'Upper Landing',
    aliases: ['upper landing', 'landing', 'stairs', 'staircase'],
    // image: 'IMAGE PLACEHOLDER: Upper Landing — white banister, dim portraits, a corridor branching toward the gallery and attic.',
    image: `${import.meta.env.BASE_URL}images/upper-landing.png`,
    text: '<p>The Upper Landing looks down upon the Great Hall.</p> <p>The expanse of snow-white marble, the watchful women in the portraits, and the curve of the stairs make the whole house feel like it is wrapped around an absence.</p>',
    // text: 'The upper landing looks down upon the Great Hall. From here the house seems less like a home than a set of shelves for stories.',
    exits: {
      'Great Hall': 'greatHall',
      'Music Room': 'musicRoom',
      'Library': 'library',
      'Servants’ Passage': 'servantsPassage',
    },
    objects: ['candlesticks'],
    people: []
  },
  drawingRoom: {
    title: 'Drawing Room',
    aliases: ['drawing room'],
    image: `${import.meta.env.BASE_URL}images/drawing-room.png`,
    text: '<p>A tea service waits for twice as many guests as could possibly be present in the house.</p>',
    exits: { 'Great Hall': 'greatHall' },
    objects: ['love letter'],
    people: ['gwendolen', 'elizabeth']
  },
  library: {
    title: 'Library',
    aliases: ['library'],
    image: `${import.meta.env.BASE_URL}images/library.png`,
    text: 'The library smells of leather, ink, and... cup noodles? Someone has sorted the shelves into Romance, Revolution, Inheritance, and Fanfiction.',
    exits: { 'Upper Landing': 'upperLanding' },
    objects: ['newspaper', 'book'],
    people: ['turtle']
  },
  musicRoom: {
    title: 'Music Room',
    aliases: ['music room', 'ballroom', 'comet room'],
    image: `${import.meta.env.BASE_URL}/images/music-room.png`,
    text: 'A piano repeats one unfinished phrase whenever no one is looking. The ceiling comet seems to have been painted over another sky.',
    exits: { 'Upper Landing': 'upperLanding' },
    objects: ['sheet music', 'cigarette case'],
    people: ['natasha']
  },
  garden: {
    title: 'Garden',
    aliases: ['garden', 'rose garden'],
    image: `${import.meta.env.BASE_URL}images/rose-garden.png`,
    text: `<p>The Garden blooms out of season, full of bright red roses.<br /> Tea roses, first bred in 1867. Is it not 1811?<br /> The Garden blooms out of time.<br /> The fountain is dry, the path is wet - and holds two sets of identical footprints.</p>`,
    exits: { 'Orangery': 'orangery' },
    objects: ['ring'],
    people: ['valjean']
  },
  orangery: {
    title: 'Orangery',
    aliases: ['orangery', 'conservatory', 'greenhouse', 'glasshouse'],
    image: `${import.meta.env.BASE_URL}images/orangery.png`,
    text: `<p>The citrus fruits glow upon the boughs all around, their scents upon the air.<br />  
    The air...has a surprising chill. Outside, a view into the rose garden.<br />  
    Snow is falling, slowly wiping color from the world.<br />  
    You notice words are evaporating from the condensation on the glass:<br />  
    <em>"WAKE"</em>`,
    exits: { 'Great Hall': 'greatHall', 'Garden': 'garden'},
    objects: ['hand mirror'],
    people: []
  },  
  servantsPassage: {
    title: 'Servants’ Passage',
    aliases: ['servants passage', 'servants hall', 'passage', 'corridor', 'servants’ passage', 'servants’ hall'],
    image: `${import.meta.env.BASE_URL}images/servants-passage.png`,
    text: 'The servants’ passage runs behind the formal and family rooms, forming unseen connections between them.',
    exits: { 'Great Hall': 'greatHall', 'Upper Landing': 'upperLanding', 'Attic': 'attic' },
    objects: ['key', 'correspondence'],
    people: []
  },
  attic: {
    title: 'Attic',
    aliases: ['attic', 'upper room', 'nursery'],
    image: `${import.meta.env.BASE_URL}images/attic.png`,
    text: 'The attic should belong to the house, but it has the air of a dorm room after finals: books open, clothes abandoned, pages everywhere.',
    exits: { 'Servants’ Passage': 'servantsPassage' },
    objects: ['trunk'],
    people: ['spectre']
  },
  study: {
    title: 'Lady Gray’s Study',
    aliases: ['study', 'locked study'],
    image: `${import.meta.env.BASE_URL}images/study.png`,
    text: 'Behind the locked door is a modern study. A laptop, an ergonomic chair... and a quill pen. Leaning on her desk with a modern nonchalance is Lady Gray.',
    exits: { 'Great Hall': 'greatHall' },
    objects: [],
    people: ['gray']
  },
  // ending: {
  //   title: 'The Edge of Waking',
  //   aliases: ['ending'],
  //   text: 'The house thins into paper. The borrowed name loosens. Another name waits underneath.',
  //   exits: {},
  //   objects: [],
  //   people: []
  // }
};

const objectDetails = {
  'invitation': {
    image: 'IMAGE PLACEHOLDER: An invitation addressed to “Miss Simone Snow,” the ink changing midway through.',
    text: `<p>The invitation requests “Miss Simon<em>e</em> Snow” at Westmoor Hall. <br />A second hand has inserted the "E". Some conscientious proofreading assistant, no doubt.<br />
    That name is more familiar than your own.</p>`, 
    clue: 'false-name',
    clueLabel: 'False-name invitation',
  },
  'cigarette case': {
    image: 'IMAGE PLACEHOLDER: Silver cigarette case engraved “From little Cecily, with her fondest love.”',
    // text: 'The cigarette case should explain a false identity, but the inscription has been revised three times. Gwendolen has underlined “fondest” in offended pencil.',
    text: '<p>When you open the  cigarette case you see it is engraved:</p> <p><i>"‘From little Cecily with her fondest love."</i></p>',
    clue: 'earnest-revision',
    clueLabel: 'Earnest false identity',
  },
  'ring': {
    image: 'IMAGE PLACEHOLDER: An invitation addressed to “Miss Simone Snow,” the ink changing midway through.',
    text: `<p>Something sparkles in the grass.<br />
    Looking down, you see a diamond ring. An engagement ring, perhaps.<br />
    It is undeniably lovely but its shine is strangely cold, somehow.</p>`,  
    clue: 'engagement-ring',
    clueLabel: 'engagement-ring',
  },
  'correspondence': {
    image: 'IMAGE PLACEHOLDER: Long folded letter beginning “Be not alarmed, madam,” with later sentences crossed out.',
    text: `<p>This letter is from Jane Bennet. Courtesy argues against reading it. The hurried hand, however, argues more persuasively that you should find its intended recipient.</p>
    <blockquote>
    <p>
      <em>I am truly glad, dearest Lizzy, that you have been spared something of these distressing scenes; but now, as the first shock is over, shall I own that I long for your return?</em>
    </p>
    <p>
      <em>I am not so selfish, however, as to press for it, if inconvenient. Adieu.</em>
    </p>
    <p>
      <em>I take up my pen again to do what I have just told you I would not, but circumstances are such, that I cannot help earnestly begging you all to come here as soon as possible.</em>
    </p>
  </blockquote>`,
    clue: 'pride-revision',
    clueLabel: 'Pride and Prejudice letter',
  },
  'sheet music': {
    image: 'IMAGE PLACEHOLDER: A piece of sheet music',
    text: `<p>You note the lyrics of the fashionable air:</p>
      <blockquote>
      <p><em>Straight from a page of your favorite author<br /> 
      And the weather so breezy<br />  
      Man, why can't life always be this easy?<br />  
      She in the mirror dancin' so sleazy<br /> 
      I get a call like, "Where are you, Yeezy?"</em></p>
      <blockquote/>`,

    clue: 'comet-revision',
    clueLabel: 'Comet program revision',
  },
  'trunk': {
    // image: 'IMAGE PLACEHOLDER: A heavy old trunk in the attic, its lock scratched by many failed attempts.',
    text: `<p>The trunk is old, heavy, and locked.</p>`,
    clue: 'examined-trunk',
    clueLabel: 'Examined trunk',
  },
  'book': {
    // image: 'IMAGE PLACEHOLDER: Westing-style envelope with chess notation, stock ticker marks, and a clue cut in half.',
    text: `<p>Grimms' Fairy Tales.</p> 
    <p>You open to an old favorite: </p>
    <blockquote>
    <p>They were as good and happy, as busy and cheerful<br /> as ever two children in the world were,<br />
    only Snow-white was more quiet and gentle than Rose- red.<br />
    Rose-red liked better to run about in the meadows and fields<br /> seeking flowers and catching butterflies;<br /> 
    but Snow-white sat at home with her mother, and helped her with her house-work,<br /> or read to her when there was nothing to do.<br />
    The two children were so fond of each another<br /> that they always held each other by the hand when they went out together,<br /> 
    and when Snow-white said, "We will not leave each other,"<br /> 
    Rose-red answered, "Never so long as we live".</p>
    </blockquote>`,
    clue: 'grimms',
    clueLabel: 'Grimm',
  },
  'candlesticks': {
    // image: 'IMAGE PLACEHOLDER: Pair of silver candlesticks, one real and one only sketched in pencil.',
    text: `<p>Two large candlesticks of massive silver stand on a narrow mahogany table.<br />  
    They have been polished; you can see yourself reflected in each.</p>`,
    clue: 'miserables-revision',
    clueLabel: 'Valjean candlestick',
  },
  'hand mirror': {
    // image: 'IMAGE PLACEHOLDER: A silver hand mirror on the Orangery writing desk, its glass dark around the edges.',
    text: `<p>Your hair is is dressed à la grecque, but your face is unexpectedly ashen.</p>  
    <p>The mirror reflects the orange trees, the steamed glass, and a woman standing behind you.<br />  
    When you turn, no one is there.</p>`,
    clue: 'wrong-reflection',
    clueLabel: 'Wrong reflection',
  },
  'manuscript': {
    // image: 'IMAGE PLACEHOLDER: Fanfiction manuscript titled Carry On, with “Simone Snow” written over another name.',    
     text: `<p><em>Carry On, Simon</em>: the magnum opus of your college years.</p>
     <p>A story inside a story - it’s been a while since you’ve written "Simon Snow" fanfiction.</p></p>

  <p>You have written original books since then, with the mentorship of your Creative Writing professor Gray Piper, but this is the work that made you a writer first.</p>


  <p>This manuscript bears the marks of your sister's red pen;<br /> some classic copyediting marks, but many of her own design, intelligible only to you two.</p>`,
  clue: 'fanfiction-thread',
    clueLabel: 'Carry On manuscript',
  },
  'handkerchief': {
    image: 'IMAGE PLACEHOLDER: A neatly folded white handkerchief, monogrammed in an unfamiliar hand.',
    text: `<p>The small white handkerchief is embroidered in red with <em>C.A.</em>.</p>`,
    clue: 'examined-handkerchief',
    clueLabel: 'Examined handkerchief',
  },
  'hairpins': {
    image: 'IMAGE PLACEHOLDER: Three dark hairpins tucked into the lining of a reticule.',
    text: `<p>Three hairpins, plain and practical.</p>
    <p>These hairpins are no doubt meant to keep a respectable coiffure in place, but they look sturdy enough to assist in something less respectable.</p>`,
    clue: 'examined-hairpins',
    clueLabel: 'Examined hairpins',
  },
  'key': {
    image: 'IMAGE PLACEHOLDER: Brass key tagged “Lady Gray’s Study,” casting two shadows.',
    text: '<p>A tarnished brass key, befitting an old house with old secrets.<br />Good manners would forbid a guest from taking it.<br />But then, good manners are for people who know why they have been invited.</p>',
    clue: 'study-key',
    clueLabel: 'Study key',
  },
  'newspaper': {
    image: 'IMAGE PLACEHOLDER: A folded New York Times arts page, damp at the edges as though brought in from snow.',
    text: `<p>Not just any newspaper – The New York Times. First published 1851. An anchronism.</p>  
    <p>The newspaper is folded open to a story:</p>  
    <p><i>"Emerging Novelist Critically Injured in Winter Car Crash"</i></p> 
    <p>Car. Another anachronism.</p>  
    <p>The print fades before your eyes as though obscured by snow.</p>`,
    clue: 'gray-lady-newspaper',
    clueLabel: 'Gray Lady newspaper',
  },
'love letter': {
  image: 'IMAGE PLACEHOLDER: A love letter folded into the sheet music, its seal cracked and its signature blurred.',
  text: `<p>You blush to read the note signed by Sonya:</p> 
  <blockquote>
  <p>I will stand in the dark for you.<br /> 
  I will hold you back by force.<br />  
  I will stand here outside your door.<br />  
  I won't see you disgraced.<br />  
  I will protect your name and your heart,<br />
  because I miss my friend.</p>
  </blockquote>
  <p>Although the sentiment may not be romantic, here, surely, is a love letter.</p>`,
  clue: 'love-letter',
  clueLabel: 'Natasha love letter',
},
  'final manuscript': {
    image: 'IMAGE PLACEHOLDER: Final manuscript pages, some careful, some reckless, all waiting for an ending.',
    text: '',
    clue: 'final-proof',
    clueLabel: 'Final proof',
  }
};

const paperClueAnswer = 'bewarethegraylady';
const paperClueWords = ['BE', 'WARE', 'THE', 'GRAY', 'LADY'];
const totalPaperClues = 5;

const dialogue = {
  reynolds: {
    name: cast.reynolds,
    aliases: ['reynolds', 'mrs reynolds', 'housekeeper'],
    // image: 'IMAGE PLACEHOLDER: Mrs. Reynolds the housekeeper',
    intro: '“Welcome Miss Snow. Although I fear if you have arrived here, that means someone is missing.”',
    // later: `“Since you missed the luncheon the mistress says I am meant to give you a clue of your own, whatever that means.  
    // She says "A bird in the hand." I hope it means something to you, as it mean nought to me.”`,
    later: '<p>“Since you missed luncheon, Miss Snow, the mistress says I am to give you a clue of your own.</p> <p>She said: ‘A bird in the hand.’</p> <p>Unfortunately I was given no bird for you nor any further instructions.”</p>',
    clue: 'reynolds-warning',
    clueLabel: 'Reynolds warning'
  },
  gray: {
    name: cast.gray,
    aliases: ['gray', 'lady gray', 'grey', 'lady grey'],
    image: 'IMAGE PLACEHOLDER: Lady Gray Westmoor — silver silk, black gloves, cane across her knees.',
    // intro: '“Names are useful until they become cages,” Lady Gray says. “Find what has been rewritten. Then ask who benefits from a story becoming less itself.”',
    // later: '“I am not the author of this damage,” Lady Gray says. “I am merely old enough to know when a story is being forced.”',
    intro: `<p>Lady Gray stands beside the writing desk.</p>
      <p>“A bird in hand,” she says. “Do you know who is missing from your story?”</p>`,
    later: `<p>Lady Gray stands beside the writing desk.</p>
      <p>“A bird in hand,” she says. “Do you know who is missing from your story?”</p>`,
    clue: 'gray-warning',
    clueLabel: 'Lady Gray’s warning'
  },
  elizabeth: {
    name: cast.elizabeth,
    aliases: ['elizabeth', 'lizzy', 'elizabeth bennet', 'bennet'],
    // image: 'IMAGE PLACEHOLDER: Elizabeth Bennet — standing by the tea table, letter folded like a weapon.',
    intro: 'Elizabeth Bennet studies you with amused suspicion. “The house is full of people being improved against their will. I cannot recommend it.”',
    later: 'Elizabeth says, “A misunderstanding can be instructive. A rewriting is only rude.”',
    clue: 'elizabeth-consulted',
    clueLabel: 'Elizabeth on rude revision',
    paperClue: 'LADY',
    repeat: '<p>Elizabeth says, “The more I see of this house, the more I admire the comforts of an honest misunderstanding. A deliberate revision has none of its charm.”</p>'
  },
  gwendolen: {
    name: cast.gwendolen,
    aliases: ['gwendolen', 'gwendolen fairfax', 'fairfax'],
    // image: 'IMAGE PLACEHOLDER: Gwendolen Fairfax — immaculate gloves, silver cigarette case, wounded dignity.',
    intro: 'Gwendolen Fairfax snaps the cigarette case shut. “I am prepared to forgive a false name. I am not prepared to forgive bad editing.”',
    later: 'Gwendolen says, “Someone has mistaken complication for wit. A common but devastating error.”',
    clue: 'gwendolen-consulted',
    clueLabel: 'Gwendolen on false names',
    paperClue: 'GRAY',
    repeat: '<p>Gwendolen says, “There is a great deal to be said for mystery, provided it is properly managed. This one has not yet shown a sufficient respect for form.”</p>'
  },
  natasha: {
    name: cast.natasha,
    aliases: ['natasha', 'natasha rostova', 'rostova', 'natalie', 'natalia'],
    // image: 'IMAGE PLACEHOLDER: Natasha Rostova — beneath the painted comet, holding a program with trembling hands.',
    intro: `“I have been like you. I have felt the absence of one I love.  
    And I too have been very ill. Heartsick, ashamed, and pale as a winter sky.  
    I yearn for a kind word, or better yet a love letter,  
    a love letter,  
    a love letter...”`,
    later: 'Natasha says, “Whoever changed it did not understand that sorrow is not the same thing as an ending.”',
    clue: 'natasha-consulted',
    clueLabel: 'Natasha on forgiveness',
    paperClue: 'BE',
    repeat: '<p>Natasha says, “Everything here feels like a song beginning again, but not quite in the same key.”</p>'
  },
  turtle: {
    name: cast.turtle,
    aliases: ['turtle', 'turtle wexler', 'wexler', 'tabitha', 'tabitha wexler'],
    // image: 'IMAGE PLACEHOLDER: Turtle Wexler — seated on a library ladder, envelope open, braid like a challenge.',
    intro: 'Turtle Wexler waves the envelope. “The clues are inconsistent. That means either the puzzle is bad, or someone tampered with the rules.”',
    later: 'Turtle says, “I like games. I hate being played.”',
    clue: 'turtle-consulted',
    clueLabel: 'Turtle on bad rules',
    paperClue: 'THE',
    repeat: '<p>Turtle says, “If this is a game, someone changed the rules after it started. That is usually the interesting part.”</p>'
  },
  valjean: {
    name: cast.valjean,
    aliases: ['jeanne', 'jeanne valjean', 'valjean'],
    // image: 'IMAGE PLACEHOLDER: Jeanne Valjean — in the garden with silver candlesticks and a guarded, merciful face.',
    intro: "Jeanne Valjean says, “I am not who you would expect to see here, nor as you may expect to see me. I took another name to survive. But at least I wrote my own story. I was Monsieur Madeleine, in reverence to Mary Magdalene; a sainted testament to second chances. It's all the more fitting considering I am a woman. Perhaps these candlesticks can shine some light upon the mysteries in your life.”",    
    later: 'Jeanne Valjean says, “Mercy changes a life. Control merely disguises itself as mercy.”',
    clue: 'valjean-consulted',
    clueLabel: 'Valjean on mercy',
    paperClue: 'WARE',
    repeat: '<p>Jeanne Valjean says, “A locked door is not always the most important prison in a house.”</p>'
  },
  spectre: {
    name: cast.wren,
    aliases: ['spectre', 'girl', 'wren', 'ghost'],
    // image: 'IMAGE PLACEHOLDER: The haunting girl — seen in a mirror, almost the protagonist, almost not.',
    intro: '<p>A gray woman lingers in the room.<br /> You do not fear her, although she is transparent and has your face.</p><p>“If I’m going to change the stories,” she says, “then I figure the least I can do is make you Simon.<br /> It’s a shame he doesn’t have a sister. It’s not like I can be Baz!” She makes a face.</br> “That’d be too weird.” ',
    // intro: 'The haunting girl appears at the end of the gallery. She has the wrong stillness for a ghost. “You were taking too long,” she says, then vanishes.',
    later: 'The haunting girl says, “I fixed them. I fixed us. You were asleep, and someone had to keep writing.”',
    clue: 'wren-consulted',
    clueLabel: 'The haunting speaks'
  }
};

const progressMilestones = [
  'false-name',
  'earnest-revision',
  'pride-revision',
  'comet-revision',
  'miserables-revision',
  'fanfiction-thread',
  'bird-in-hand',
  'study-key',
  'wren-consulted',
  'paper-clue-answer',
  'elizabeth-jane-realization',
  'gwendolen-cecily-realization',
  'natasha-sonya-realization',
  'turtle-angela-ring-realization',
  'valjean-sister-realization',
  'trunk-unlocked',
  'study-unlocked',
  'final-mystery-answered',
  'chapter-written',
];

const requiredInventoryForEnding = ['westing envelope', 'silver candlestick', 'twin notebook page', 'rewritten page'];

function HtmlText({ html, className = 'story-text' }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

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
    return hash || 'intro';
  });
  const [location, setLocation] = useState(START_ROOM);
  const [inventory, setInventory] = useState(['handkerchief', 'hairpins',]);

  const [paperClues, setPaperClues] = useState([]);
//   const [paperClues, setPaperClues] = useState([
//   'BE',
//   'WARE',
//   'THE',
//   'GRAY'
// ]);
  const [roomObjects, setRoomObjects] = useState(() => Object.fromEntries(Object.entries(rooms).map(([key, room]) => [key, [...room.objects]])));
  const [roomPeople, setRoomPeople] = useState(() =>
    Object.fromEntries(
      Object.entries(rooms).map(([key, room]) => [key, [...room.people]])
    )
  );
  const [foundClues, setFoundClues] = useState([]);
  const [clueSources, setClueSources] = useState({});
  const [visitedPlaces, setVisitedPlaces] = useState([START_ROOM]);
  const [hasHeardPaperClueRule, setHasHeardPaperClueRule] = useState(false);
  const [consultedPeople, setConsultedPeople] = useState([]);
  const [visualText, setVisualText] = useState(rooms[START_ROOM].image);
  const [visualImage, setVisualImage] = useState(rooms[START_ROOM].image);
  const [message, setMessage] = useState(START_MESSAGE);
  // const [message, setMessage] = useState('Try a command like “speak reynolds,” “examine invitation,” “Drawing Room“, or “help.”');
  const [command, setCommand] = useState('');
  const [isTrunkUnlocked, setIsTrunkUnlocked] = useState(false);
  const [isStudyUnlocked, setIsStudyUnlocked] = useState(false);
  const [placeholderExamples, setPlaceholderExamples] = useState([]);
  const [finalMysteryStep, setFinalMysteryStep] = useState(null);
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const room = rooms[location];
  const visibleObjects = roomObjects[location] || [];
  const peopleHere = roomPeople[location] || [];
  const completedProgressMilestones = foundClues.filter(clue => progressMilestones.includes(clue)).length;
  const progress = Math.round((completedProgressMilestones / progressMilestones.length) * 100);
  const formattedPoem = `
    <blockquote class="poem">
      <p>
        <em>Called souls assemble, names are read,</em><br />
        <em>as white snow crowns the roses red,</em><br />
        <em>the key is turned by trembling hand,</em><br />
        <em>her shadow falls on house and land.</em><br />
        <em>Wake, dear heart, and claim your due:</em><br />
        <em>receive the birthright kept for you.</em><br />
        <em>Estates may pass by trust and deed; but!</em><br />
        <em>nothing’s clear with just one read.</em>
      </p>
    </blockquote>
  `;
  const paperClueRules = {
    elizabeth:
      `<p>“Miss Snow! How delightful to see you.<br />
      It's a shame you missed luncheon; the oddest thing happened.<br />
      Lady Gray told us we would rediscover a treasure.<br />
      She read us the queerest poem. Shall I tell you?”</p>
      ${formattedPoem}
      <p>“Then she gave each of us a slip of paper.<br /> A clue, she says, although to what mystery no one can agree.<br />
      <p>My clue is <strong>“LADY”</strong>. I cannot pretend it makes the matter clearer.”</p>`,

    natasha:
      `<p>“Miss Snow! We were wondering when you would arrive.<br />   
    It's a pity you missed luncheon; the oddest thing happened.<br />  
    Lady Gray read us a poem at luncheon.<br /> I shall tell you all! She said we would rediscover a treasure!<br /> She said:<br />` + formattedPoem +  `<p>Then she gave us each a clue. I think they must belong together somehow.<br />  
    My clue is "BE". I take this word to heart. To <i>be</i> can be quite painful, especially when you feel your life is over.”`,

    valjean:
      `<p>“Miss Snow, welcome. We were sorry to miss you at luncheon.<br />  
      Lady Gray gave a curious speech. She said:<br />`  + formattedPoem + `<p>Then she distributed slips of paper to the guests. She says we will rediscover a treasure.<br />  
      My clue is "WARE." A reference to my garment business, perhaps.”</p>`,

    turtle:
      `<p>“Simone Snow! You missed lunch. I guess I'll catch you up.<br />  
      Lady Gray said we would "rediscover a treasure," whatever that means.<br />  
      Then she read us a poem. It was very old-fashioned; like her I guess. It went:<br />` + formattedPoem +
      `<p>Then she handed everybody a clue on a little piece of paper. Now everybody has one except you, I guess.<br />  
      Mine is "THE" - How useless.”</p>`,

    gwendolen:
      `<p>“Miss Snow, there you are. It is a pity you missed luncheon; there was such an excitement!<br />  
    Lady Gray told us we would rediscover a treasure. She read us a poem.<br /> I shall tell you all! She said:<br />` + formattedPoem +  `<p>Then Lady Gray distributed paper clues to all the guests. I consider the entire arrangement wonderfully dramatic.  
    But mine says "GRAY" how literally dull.<br /> Don't you have one? Perhaps not yet. Well, now you have mine, so that's a start.”</p>`
  };

  const paperClueKnownRules = {
    elizabeth:
    // <p>“The poem was puzzling, the promised treasure more so, and the distribution of clues very much in the style of a hostess who enjoys having the advantage of her guests.”</p>
      `<p>“Miss Snow,” Elizabeth says, “I trust you’ve heard about our luncheon entertainment?”</p>

      <p>“It seems the hostess much enjoys having the advantage of her guests! Perhaps we can outwit her with our combined efforts.”</p>

      <p>“My clue is <strong>“LADY”</strong>. I cannot pretend it makes the matter clearer.”</p>`,

    natasha:
      `<p>“Miss Snow,” Natasha says, “you have heard about the luncheon? About Lady Gray’s poem and the treasure?”</p>

      <p>“Then I will not tell it all again, though I could. I keep repeating the lines in my head.”</p>

      <p>“My clue is <strong>“BE”</strong>. It is a small word, but not a simple one.”</p>`,

    valjean:
      `<p>“Miss Snow,” Jeanne Valjean says, “well met! You have heard of Lady Gray’s luncheon, I presume?”</p>

      <p>“I will confess to you that my clue is <strong>“WARE”</strong>. A reference to my garment business, perhaps.”</p>`,

    turtle:
      `<p>“Simone!” exclaims Turtle in greeting. ”So you already heard about lunch? Good. That saves time.”</p>

      <p>“Lady Gray made a speech, read a poem, promised treasure, blah, blah, blah.”</p>

      <p>“My clue is <strong>“THE”</strong>. It isn't a stock ticker, unfortunately.”</p>`,

    gwendolen:
      `<p>“Miss Snow,” Gwendolen says, “I gather you have now heard about Lady Gray’s theatrical little luncheon.”</p>

      <p>“My clue is <strong>“GRAY”</strong>. How very unflattering.”</p>`,
  };

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#/', '');
      setPage(hash || 'intro');
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

  function startGame() {
    setLocation(START_ROOM);
    setVisualImage(rooms[START_ROOM].image);

    setMessage(`
      ${getRoomText(START_ROOM)}

      ${START_MESSAGE}
    `);

    setVisitedPlaces(previous =>
      previous.includes(START_ROOM) ? previous : [...previous, START_ROOM]
    );

    goToPage('game');
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

  function addPaperClue(clue) {
    setPaperClues(previous =>
      previous.includes(clue) ? previous : [...previous, clue]
    );
  }

  function hasAllPaperClues() {
    return paperClueWords.every(clue => paperClues.includes(clue));
  }

  function getPaperCluePrelude(characterKey) {
    const character = dialogue[characterKey];

    if (!character?.paperClue || paperClues.includes(character.paperClue)) {
      return '';
    }

    const clueText = !hasHeardPaperClueRule && paperClueRules[characterKey]
      ? paperClueRules[characterKey]
      : paperClueKnownRules[characterKey] || `<p>${character.name} gives you a slip of paper marked <strong>“${character.paperClue}”</strong>.</p>`;

    if (!hasHeardPaperClueRule && paperClueRules[characterKey]) {
      discover('heard-luncheon-poem', 'Heard Lady Gray’s luncheon poem', 'Heard luncheon poem');
      setHasHeardPaperClueRule(true);
    }

    addPaperClue(character.paperClue);
    discover(
      `paper-clue-${character.paperClue.toLowerCase()}`,
      `Received paper clue from ${character.name}`,
      `Paper clue: ${character.paperClue}`
    );

    const paperCluesAfterNewClue = [...paperClues, character.paperClue];

    const hasAllPaperCluesNow = paperClueWords.every(clue =>
      paperCluesAfterNewClue.includes(clue)
    );

    if (hasAllPaperCluesNow) {
      return `
        ${clueText}

        <p>The slips of paper shift in your reticule.</p>

        <p>Taken in order, they say very little. Taken otherwise, they seem almost willing to confess.</p>

        <p>What phrase do they form?</p>

        <p>Try: <strong>arrange [phrase]</strong></p>
      `;
    }

    return clueText;
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

  function getRoomImage(roomKey, objectsByRoom = roomObjects) {
    if (
      roomKey === 'upperLanding' &&
      !(objectsByRoom.upperLanding || []).includes('candlesticks')
    ) {
      return `${import.meta.env.BASE_URL}images/upper-landing-no-candlesticks.png`;
    }

    return rooms[roomKey].image;
  }

  function removeCharacterFromRoom(characterKey) {
    setRoomPeople(previous => ({
      ...previous,
      [location]: previous[location].filter(personKey => personKey !== characterKey)
    }));
  }

  function completeGift(item, characterKey) {
    setInventory(previous =>
      previous.filter(inventoryItem => inventoryItem !== item)
    );

    removeCharacterFromRoom(characterKey);
  }

  function handleCommand(raw) {
    const text = normalize(raw);
    if (!text) return;

    const [firstWord, ...restWords] = text.split(' ');
    const verb = commandAliases[firstWord] || firstWord;
    const remainder = restWords.join(' ');

    if (finalMysteryStep === 'missing-story') {
      answerFinalMystery(text);
      setCommand('');
      return;
    }

    if (finalMysteryStep === 'write-ending') {
      finishStory(text);
      setCommand('');
      return;
    }

    if (verb === 'help') {
      const arrangeCommand = hasAllPaperClues()
      ? `
        - arrange [phrase]<br />
      `
      : '';

        const endingCommand = finalMysteryStep === 'write-ending'
    ? `
      - write next chapter<br />
    `
    : '';

  write(`<h4>Commands:</h4>

    <p>
    - place name<br />
    - go [place]<br />
    - look<br />
    - speak [person]<br />
    - examine [object]<br />
    - take [object]<br />
    - remove [object]<br />
    - inventory or reticule<br />
    - give [object] to [person]<br />
    - use [object] on [object/place]<br />
    - unlock [object/place]<br />
    ${arrangeCommand}<br />
    ${endingCommand}</p>

    <p>Some objects must be taken; others left.<br />  
    Do not be afraid to ask for help.<br />  
    In Westmoor Hall, the answer very much depends on where you are standing.</p>`);
    } else if (verb === 'look') {
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
    } else if (verb === 'unlock') {
      unlockItem(remainder);
    } else if (verb === 'use') {
      useItem(remainder);
    } else if (verb === 'examine') {
      examineItem(remainder);
    } else if (verb === 'speak') {
      speakTo(remainder);
    } else if (verb === 'answer') {
      answerPaperClues(remainder);
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
    const peopleText = getPeopleText(roomKey);

    if (roomKey === 'garden' && visitedPlaces.includes('orangery')) {
      return `Despite your view from the Orangery, there is no snow here. Strange.
      ${baseText}
      ${peopleText}
    `;
  }

  return `
    ${baseText}
    ${peopleText}
  `;
}

function getPeopleText(roomKey) {
  const people = roomPeople[roomKey] || [];

  if (people.length === 0) {
    return '';
  }

  const hasPerson = personKey => people.includes(personKey);

  if (roomKey === 'greatHall' && hasPerson('reynolds')) {
    // return `<p>Mrs. Reynolds waits near the stairs, composed and watchful.</p>`;
    return `<p>Mrs. Reynolds waits beside the foot of the stairs, composed as any housekeeper in a great estate ought to be.</p>`;
  }

  if (roomKey === 'drawingRoom') {
    const hasElizabeth = hasPerson('elizabeth');
    const hasGwendolen = hasPerson('gwendolen');

    if (hasElizabeth && hasGwendolen) {
      return `<p>Elizabeth Bennet listens to Gwendolen Fairfax with every appearance of polite amusement, however not, perhaps, for the reasons Gwendolen would wish.</p>`;
    }

    if (hasElizabeth) {
      return `<p>Elizabeth Bennet remains by the tea service, looking as if the room has confirmed several of her private opinions.</p>`;
    }

    if (hasGwendolen) {
      return `<p>Gwendolen Fairfax sits in elegant possession of the conversation, whether or not anyone remains to receive it.</p>`;
    }

    return '';
  }

  if (roomKey === 'musicRoom' && hasPerson('natasha')) {
    return `<p>Natasha Rostova stands beneath the painted comet, listening as if the unfinished phrase from the piano pains her personally.</p>`;
  }

  if (roomKey === 'library' && hasPerson('turtle')) {
    return `<p>Tabitha Wexler, alias "Turtle", sits at a chessboard, moving pieces for both players.<br />
    Her gown is plausibly Regency; her signature braid is not.</p>`
  }

  if (roomKey === 'garden' && hasPerson('valjean')) {
    return `Jeanne Valjean sits upon a stone seat; also out of time (though not by much.)<br /> Not the man you would expect to see; a woman.<br /> Beside her is a bag, as though at any time she may depart.`
  }

  if (roomKey === 'attic' && hasPerson('spectre')) {
    return `<p>A gray woman lingers near the trunks, transparent and somehow familiar.</p>`;
  }

  if (roomKey === 'study' && hasPerson('gray')) {
    return `<p>Lady Gray waits beside the writing desk, as though she has been expecting you to arrive at precisely this paragraph.</p>`;
  }

  return '';
}

  // function goTo(placeInput) {
  //   const requested = findRoomKey(placeInput);
  //   if (!requested) {
  //     write(`No place named “${placeInput || 'there'}” comes into focus.`);
  //     return;
  //   }

  //   if (requested === 'study' && !isStudyUnlocked) {
  //     write(`
  //       <p>The Study door is locked.</p>`
  //     );

  //     setVisualImage(`${import.meta.env.BASE_URL}images/door.png`);
  //     return;
  //   }

  //   const exitMatch = Object.values(room.exits).includes(requested);
  //   if (!exitMatch) {
  //     write(`You cannot reach the ${rooms[requested].title} from here.`);
  //     return;
  //   }

  //   setLocation(requested);
  //   setVisitedPlaces(previous => previous.includes(requested) ? previous : [...previous, requested]);
  //   discover(
  //     `visited-${requested}`,
  //     `Visited: ${rooms[requested].title}`,
  //     `Visited ${rooms[requested].title}`
  //   );

  //   // setVisualImage(rooms[requested].image);
  //   setVisualImage(getRoomImage(requested));
  //   write(getRoomText(requested));
  // }

  function goTo(placeInput) {
    const requested = findRoomKey(placeInput);

    if (!requested) {
      write(`No place named “${placeInput || 'there'}” comes into focus.`);
      return;
    }

    const exitMatch = Object.values(room.exits).includes(requested);

    if (!exitMatch) {
      write(`You cannot reach the ${rooms[requested].title} from here.`);
      return;
    }

    if (requested === 'study' && !isStudyUnlocked) {
      write(`
        <p>The Study door is locked.</p>
      `);

      setVisualImage(`${import.meta.env.BASE_URL}images/door.png`);
      return;
    }

    setLocation(requested);

    setVisitedPlaces(previous =>
      previous.includes(requested) ? previous : [...previous, requested]
    );

    discover(
      `visited-${requested}`,
      `Visited: ${rooms[requested].title}`,
      `Visited ${rooms[requested].title}`
    );

    setVisualImage(getRoomImage(requested));
    write(getRoomText(requested));
  }

  function takeItem(noun) {
    const found = findObject(noun, visibleObjects);
    if (!found) {
      write(`No object matching “${noun || 'that'}” is here.`);
      return;
    }

  if (found === 'trunk') {
    if (!isTrunkOpen()) {
      write(`
        <p>You try to lift the trunk.</p>

        <p>It does not so much as dignify your attempt by shifting.</p>

        <p>It is heavy, and locked besides - not very useful.</p>
      `);
      return;
    }

    write(`
      <p>You try to lift the trunk.</p>

      <p>It does not so much as dignify your attempt by shifting.</p>

      <p>The trunk is unlocked now, but it is far too heavy to carry.</p>
    `);
    return;
  }

    addItem(found);
    discover(
      `took-${found.replaceAll(' ', '-')}`,
      `Took: ${found}`,
      `Took ${found}`
    );
    discover(objectDetails[found]?.clue, `Took: ${found}`, objectDetails[found]?.clueLabel);

    setRoomObjects(previous => {
    const nextRoomObjects = {
      ...previous,
      [location]: previous[location].filter(object => object !== found)
    };

    if (location === 'upperLanding' && found === 'candlesticks') {
      setVisualImage(getRoomImage(location, nextRoomObjects));
    }

    return nextRoomObjects;
  });

  write(`Taken: ${found}.`);
  }

  function wrongGiftResponse(characterKey, item) {
    if (characterKey === 'turtle') {
      return `
        <p>Turtle gives the ${item} one sharp, appraising look.</p>

        <p>“Nope. That’s not mine, and it’s not useful. Try somebody else.”</p>
      `;
    }

    if (characterKey === 'natasha') {
      return `
        <p>Natasha looks at the ${item} with polite confusion.</p>

        <p>“I am sure it matters terribly to someone,” she says, “but I do not think it belongs with me.”</p>
      `;
    }

    if (characterKey === 'gwendolen') {
      return `
        <p>Gwendolen smiles at you and at the ${item}.</p>

        <p>“How very thoughtful! Unfortunately, I cannot imagine what I should do with it.”</p>
      `;
    }

    if (characterKey === 'elizabeth') {
      return `
        <p>Elizabeth glances at the ${item}, then back at you.</p>

        <p>“I suspect you will find a better use for that elsewhere.”</p>
      `;
    }

    if (characterKey === 'valjean') {
      return `
        <p>Jeanne Valjean shakes her head.</p>

        <p>“Keep it. A thing should go where it can do the most good.”</p>
      `;
    }

    return `
      <p>“You should keep that; I've no use for it!”</p>
    `;
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

    if (characterKey === 'elizabeth' && item === 'correspondence') {
      const paperCluePrelude = getPaperCluePrelude(characterKey);

      completeGift(item, characterKey);

      discover(
        'elizabeth-jane-realization',
        'Gave Jane’s correspondence to Elizabeth',
        'Elizabeth remembers Jane'
      );

      write(`
        ${paperCluePrelude}
      <p>Elizabeth takes the letter from you with a smirk of amusement, which fades to sentimental sincerity as she reads.</p>
      <p>“I am most fortunate,” she says, “that Jane and I are such a joy and comfort to one another, in good times and in bad.”</p>
      <p>“I have been told my family is foolish; and I have said so often enough myself.<br /> My circumstances are such that it has never been guaranteed that I should have husband, or a fortune, or any <i>respectable</i> conclusion to my story.<br /> But if I had nothing in the world, I should still have Jane. And that would be no small portion.”</p>
      <p>“To think our mother risked Jane's health for the sake of a man’s notice. Jane is worth more than every match in Hertfordshire.”</p>
      <p>Elizabeth leaves with the letter folded carefully in her hand. At the threshold, she fades as if called home.</p>` );

      return;
    }

    if (characterKey === 'gwendolen' && item === 'cigarette case') {
      const paperCluePrelude = getPaperCluePrelude(characterKey);

      completeGift(item, characterKey);
      discover(
        'gwendolen-cecily-realization',
        'Gave Cecily cigarette case to Gwendolen',
        'Gwendolen remembers Cecily'
      );

      write(`
        ${paperCluePrelude}

        <p>You give the cigarette case to Gwedolen.</p>

        <p>“Something something Cecily is my sister</p>”

        <p>Gwendolen walks away with the cigarette case held like a settled point of etiquette. Before she reaches the door, she fades from view.</p>`);

      return;
    }

    if (characterKey === 'natasha' && item === 'love letter') {
      const paperCluePrelude = getPaperCluePrelude(characterKey);

      completeGift(item, characterKey);

      discover(
        'natasha-sonya-realization',
        'Gave Sonya’s love letter to Natasha',
        'Natasha remembers Sonya'
      );

      write(`
        ${paperCluePrelude}

        <p>You give the love letter to Natasha.<br />

      She reads the letter once quickly, then again, with care.</p>  
      <p>“This is not from Anatole,” she says.<br />

      “No. Of course it is not.<br />  
      My cousin. My friend. My sister.<br />  
      Sonya loved me before the comet, before the ball, before any man. <br /> 
      She was not the obstacle to my love story. She was the person trying to keep me alive inside it.\n  
      She is my dearest treasure, and the author of my future.”</p>
      <p>Natasha leaves with the letter held close. By the doorway, she fades like the last note of a song.</p>`);

      return;
    }

    if (characterKey === 'turtle' && item === 'ring') {
      const paperCluePrelude = getPaperCluePrelude(characterKey);

      completeGift(item, characterKey);

      discover(
        'turtle-angela-ring-realization',
        'Gave engagement ring to Turtle',
        'Turtle understands Angela'
      );

      write(`
        ${paperCluePrelude}

        <p>You give the engagement ring to Turtle.</p>

        <p>You expect her to snatch it, in her excited way, but takes it slowly and turns it over in her palm.</p>

        <p>“This is my siter Angela’s,” Turtle says.<br />
        “Everybody kept acting like this was the ultimate prize. Pretty Angela. Engaged Angela. Perfect Angela. She won.”<br/>
        TurleaQQA    closes her fist around the ring.</p>

        <p>“But she didn’t want to be a prize. She wanted a way out.”</p>

        <p>Turtle looks toward the door, suddenly brisk again.</p>

        <p>“This should go back to Denton. Not because Angela failed at something. Because she gets to choose what promises she keeps.”</p>

        <p>She tucks the ring away carefully.</p>

        <p>“I’ll give it to him. And if he has any sense, he’ll understand that giving it back is the first honest thing anyone has done for her.”</p>

        <p>Turtle pockets the ring and heads off briskly. By the time she reaches the door, she is gone.</p>
      `);

      return;
    }

    if (characterKey === 'valjean' && item === 'candlesticks') {
      const paperCluePrelude = getPaperCluePrelude(characterKey);

      completeGift(item, characterKey);

      discover(
        'valjean-sister-realization',
        'Gave candlesticks to Valjean',
        'Valjean remembers sister'
      );

      write(`
        ${paperCluePrelude}

      <p>Valjean takes the candlesticks carefully, as if they weigh even more than silver.</p>

      <p>“Everyone remembers Cosette, the child I saved.<br />  
      But no one remembers the child I <i>tried</i> to save. My sister's child.<br /> 
      And before all that, there was my sister.</p>

      <p>I stole bread for her and her children.<br />  
      My story began not with my love for Cosette, not the love of the Bishop, but with my love for her.</p>
      <p>My biographer Victor Hugo thinks that, in his agony, a man would forget his family.<br /> 
      I do not believe that. And I know a sister never would.</p>
      <p>I was given these candlesticks to light my way once, and I will use them again now.<br /> 
      <p>I will find my sister and her family. I will raise us all to the light.”</p>
      <p>Jeanne Valjean takes up the candlesticks and walks into the garden light. For a moment the silver shines; then she is gone.</p>`);

      return;
    }

    write(wrongGiftResponse(characterKey, item));
  }

  function removeItem(noun) {
    const found = findObject(noun, inventory);
    if (!found) {
      write(`You are not carrying “${noun || 'that'}.”`);
      return;
    }

    discover(
      `removed-${found.replaceAll(' ', '-')}`,
      `Removed from reticule: ${found}`,
      `Removed ${found}`
    );
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

    if (found === 'trunk') {
      discover('examined-trunk', 'Examined: trunk', 'Examined trunk');

      if (isTrunkOpen()) {
        const manuscriptLocation = getManuscriptLocationStatus();

        if (manuscriptLocation === 'inventory') {
          write(`
            <p>The trunk stands open.</p>

            <p>It is old, heavy, and empty now. The manuscript is already in your reticule.</p>
          `);
          return;
        }

        if (manuscriptLocation === 'attic') {
          write(`<p>The trunk stands open.</p>
            <p>It is old and heavy, but no longer locked.</p>
            <p>Inside lies a manuscript labeled <em>Carry On, Simon</em>.</p>
          `);
          return;
        }

        write(`
          <p>The trunk stands open.</p>

          <p>It is old, heavy, and empty.</p>
        `);
        return;
      }

      write(`<p>The old trunk is festooned with cobwebs. It is heavy, and, in spite of its age, securely locked.</p>`);
      return;
    }

    const detail = objectDetails[found];

    if (!detail) {
      write(`You find no useful detail for “${found}.”`);
      return;
    }

    discover(detail.clue, `Examined: ${found}`, detail.clueLabel);
    write(detail.text);
  }

  function useItem(remainder) {
    const normalized = normalize(remainder);

    const isUsingKey =
      normalized.includes('key') || normalized.includes('key');

    const isUsingHairpin =
      normalized.includes('hairpin') || normalized.includes('hairpins');

    const isTryingStudy =
      normalized.includes('study') ||
      normalized.includes('study door') ||
      (normalized.includes('door') && location === 'greatHall');

    const isTryingTrunk =
      normalized.includes('trunk');

    if (isTryingStudy) {
      if (location !== 'greatHall') {
        write(`
          <p>You are not standing by the Study door.</p>
        `);
        return;
      }

      if (isStudyUnlocked) {
        write(`
          <p>The Study door is unlocked.</p>

          <p>You may enter the Study now.</p>
        `);
        return;
      }

      if (!isUsingKey) {
        write(`
          <p>The Study door remains locked, despite your efforts.</p>`

          // <p>Perhaps Lady Gray's poem is incentive to use a key...</p>

          // <p>Try: <strong>unlock study with brass key</strong></p>
        );
        return;
      }

      if (!inventory.includes('key')) {
        write(`
          <p>You do not have a key in your possession.</p>
        `);
        return;
      }

      setIsStudyUnlocked(true);

      setInventory(previous =>
        previous.filter(item => item !== 'key')
      );

      discover('study-unlocked', 'Unlocked Lady Gray’s Study', 'Unlocked Study');

      write(`
        <p>You fit the brass key into the Study door.</p>

        <p>The lock turns with a soft, final click.</p>

        <p>The Study is unlocked.</p>

        <p>Try: <strong>go study</strong></p>
      `);
      return;
    }

    if (!isTryingTrunk) {
      write(`<p>You try using it, but nothing <i>useful</i> happens.</p>`);
      return;
    }

    if (!visibleObjects.includes('trunk')) {
      write(`<p>There is no trunk here to unlock.</p>`);
      return;
    }

    if (isTrunkUnlocked) {
      const manuscriptIsInInventory = inventory.includes('manuscript');

      const manuscriptRoom = Object.entries(roomObjects).find(([, objects]) =>
        objects.includes('manuscript')
      )?.[0];

      if (manuscriptRoom === 'attic') {
        write(`
          <p>The trunk is already unlocked.</p>

          <p>Inside it, the manuscript waits.</p>
        `);
        return;
      }

      if (manuscriptIsInInventory) {
        write(`
          <p>The trunk is already unlocked.</p>

          <p>It is empty now; the manuscript is already in your reticule.</p>
        `);
        return;
      }

      if (manuscriptRoom) {
        write(`
          <p>The trunk is already unlocked.</p>

          <p>It is empty now. The manuscript is no longer here.</p>
        `);
        return;
      }

      write(`
        <p>The trunk is already unlocked.</p>

        <p>It is empty.</p>
      `);
      return;
    }

    if (isUsingKey) {
      if (!inventory.includes('key')) {
        write(`
          <p>You do not have a key.</p>
        `);
        return;
      }

      discover('tried-key-on-trunk', 'Tried the key on the trunk', 'Tried key on trunk');

      write(`
        <p>You try the brass key in the trunk lock.</p>

        <p>It will not turn. This key belongs to a larger lock.</p>

        <p>Perhaps you could <strong>use</strong> something else.</p>
      `);
      return;
    }

    if (isUsingHairpin) {
      if (!inventory.includes('hairpins') && !inventory.includes('hairpin')) {
        write(`<p>You have no hairpin to use.</p>`);
        return;
      }

      setIsTrunkUnlocked(true);
      discover('trunk-unlocked', 'Unlocked attic trunk with hairpins', 'Unlocked trunk');

      setRoomObjects(previous => {
        const manuscriptAlreadySomewhere =
          inventory.includes('manuscript') ||
          Object.values(previous).some(objects =>
            objects.includes('manuscript')
          );

        if (manuscriptAlreadySomewhere) {
          return previous;
        }

        return {
          ...previous,
          attic: [...(previous.attic || []), 'manuscript']
        };
      });

      write(`
        <p>You slide a hairpin into the lock.</p>

        <p>For a moment nothing happens. Then the trunk gives a resigned *click*.</p>

        <p>Inside lies a manuscript labeled <em>Carry On, Simon</em>.</p>
      `);

      return;
    }

    write(`<p>You try using it, but nothing <i>useful</i> happens.</p>`);

    // write(`
    //   <p>The trunk is locked.</p>

    //   <p>The brass key seems too large for it.</p>

    //   <p>Perhaps you could <strong>use</strong> something </strong>on trunk</strong>.</p>
    // `);
  }

  function unlockItem(remainder) {
    const normalized = normalize(remainder);

    const isTryingStudy =
      normalized.includes('study') ||
      normalized.includes('study door') ||
      (normalized.includes('door') && location === 'greatHall');

    const isTryingTrunk = normalized.includes('trunk');

    if (isTryingStudy) {
      if (location !== 'greatHall') {
        write(`
          <p>You are not standing by the Study door.</p>
        `);
        return;
      }

      if (isStudyUnlocked) {
        write(`
          <p>The Study door is already unlocked.</p>

          <p>You may enter the Study now.</p>
        `);
        return;
      }

      if (!inventory.includes('key')) {
        write(`
          <p>You try the Study door, but it remains locked.</p>

          <p>You do not have the key.</p>
        `);
        return;
      }

      setIsStudyUnlocked(true);

      setInventory(previous =>
        previous.filter(item => item !== 'key')
      );

      discover('study-unlocked', 'Unlocked Lady Gray’s Study', 'Unlocked Study');

      write(`
        <p>You fit the brass key into the Study door.</p>

        <p>The lock turns with a soft, final click.</p>

        <p>The Study is unlocked.</p>

        <p>Try: <strong>go study</strong></p>
      `);
      return;
    }

    if (isTryingTrunk) {
      useItem('hairpins on trunk');
      return;
    }

    write(`
      <p>You are not sure what you mean to unlock.</p>
    `);
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
    const wasConsulted = consultedPeople.includes(key);

    setConsultedPeople(previous =>
      previous.includes(key) ? previous : [...previous, key]
    );

    discover(
      character.clue,
      `Conversation: ${character.displayName || character.name}`,
      character.clueLabel
    );
    discover(
      `spoke-to-${key}`,
      `Conversation: ${character.displayName || character.name}`,
      `Spoke to ${character.displayName || character.name}`
    );

    if (key === 'gray' && location === 'study') {
      if (!isReadyForLadyGray()) {
        write(getLadyGrayGuidance());
        return;
      }

      setFinalMysteryStep('missing-story');
      write(character.intro);
      return;
    }

    if (key === 'reynolds') {
      if (!wasConsulted) {
        write(character.intro);
        return;
      }

      discover(
        'bird-in-hand',
        'Mrs. Reynolds repeated Lady Gray’s clue',
        'A bird in hand'
      );

      write(character.later);
      return;
    }

    if (key === 'spectre') {
      write(character.intro);
      return;
    }

    const paperCluePrelude = getPaperCluePrelude(key);

    if (paperCluePrelude) {
      write(paperCluePrelude);
      return;
    }

    write(character.repeat || 'They have nothing more to say just now.');
  }

  function isTrunkOpen() {
    return (
      isTrunkUnlocked ||
      inventory.includes('manuscript') ||
      Object.values(roomObjects).some(objects => objects.includes('manuscript'))
    );
  }

  function getManuscriptLocationStatus() {
    if (inventory.includes('manuscript')) {
      return 'inventory';
    }

    const roomWithManuscript = Object.entries(roomObjects).find(([, objects]) =>
      objects.includes('manuscript')
    )?.[0];

    return roomWithManuscript || null;
  }

  function answerPaperClues(guess) {
    const hasAllPaperClues = paperClueWords.every(clue =>
      paperClues.includes(clue)
    );

    if (!hasAllPaperClues) {
      write('<p>The paper clues are not all gathered yet.</p>');
      return;
    }

    const guessText = `<p>You arrange the clues as: “${guess}.”</p>`;

    const witnessKey = peopleHere.find(personKey => personKey !== 'reynolds');
    const witness = witnessKey
      ? dialogue[witnessKey].displayName || dialogue[witnessKey].name
      : 'your companion';

    const characterText = `
      <p>“Oh!” exclaims ${witness}. “But what does it mean? Surely not our gracious hostess?”</p>

      <p>“Oddly enough,” you reply, “I can think of several meanings...”</p>
    `;

    if (normalizePaperClueGuess(guess) === paperClueAnswer) {
      discover('paper-clue-answer', 'Solved paper clues', 'Paper clue phrase');

      write(`
        ${guessText}

        <p>The paper slips settle into order: <strong>“BEWARE THE GRAY LADY.”</strong></p>

        ${characterText}
      `);
    } else {
      write(`
        ${guessText}

        <p>No, that doesn't make sense.</p>
      `);
    }
  }

  // function openStudy() {
  //   if (location !== 'greatHall') {
  //     write('Lady Gray’s study opens from the Great Hall. The house is fussy about ceremony.');
  //     return;
  //   }
  //   if (!inventory.includes('brass key')) {
  //     write('The study door is locked.');
  //     return;
  //   }

  //   setLocation('lockedStudy');
  //   setVisitedPlaces(previous => previous.includes('lockedStudy') ? previous : [...previous, 'lockedStudy']);
  //   setVisualText(rooms.lockedStudy.image);
  //   write(rooms.lockedStudy.text);
  // }

  function hasFound(clue) {
    return foundClues.includes(clue);
  }

  function getLadyGrayRemainingTasks() {
    const tasks = [];

    if (!hasFound('paper-clue-answer')) {
      tasks.push({
        label: 'The paper clues are not yet in their proper order.',
        hint: hasAllPaperClues()
          ? 'Arrange the clues into a proper sentence.'
          : 'Speak to guests to gather the slips of paper they graciously share.'
      });
    }

    if (!hasFound('elizabeth-jane-realization')) {
      tasks.push({
        label: 'Elizabeth has not yet received her urgent correspondence.',
        hint: 'Something in the servants’ passage belongs in the drawing room.'
      });
    }

    if (!hasFound('gwendolen-cecily-realization')) {
      tasks.push({
        label: 'Gwendolen has not properly considered Cecily.',
        hint: 'A certain cigarette case should be returned given to her.'
      });
    }

    if (!hasFound('natasha-sonya-realization')) {
      tasks.push({
        label: 'Natasha has not yet understood Sonya’s importance.',
        hint: 'A love letter may be meant for the music room.'
      });
    }

    if (!hasFound('turtle-angela-ring-realization')) {
      tasks.push({
        label: 'Turtle has not yet received Angela’s ring.',
        hint: 'Something is purposefully lost in the garden.'
      });
    }

    if (!hasFound('valjean-sister-realization')) {
      tasks.push({
        label: 'Jeanne Valjean has not recalled how her story began.',
        hint: 'The silver candlesticks should be returned to her.'
      });
    }

    if (!hasFound('wren-consulted')) {
      tasks.push({
        label: 'You’ve not been properly haunted.',
        hint: 'There is someone in the attic who looks like you.'
      });
    }

    if (!hasFound('fanfiction-thread')) {
      tasks.push({
        label: 'The editor’s work has been forgotton.',
        hint: 'The attic trunk is locked, but not every lock wants a key.'
      });
    }

    return tasks;
  }

  function getRandomItems(items, count) {
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const itemCount = Math.min(count, shuffledItems.length);

    return shuffledItems.slice(0, itemCount);
  }

  function getLadyGraySuggestedTasks() {
    return getRandomItems(getLadyGrayRemainingTasks(), 3);
  }

  function isReadyForLadyGray() {
    return getLadyGrayRemainingTasks().length === 0;
  }

  function getLadyGrayGuidance() {
    const suggestedTasks = getLadyGraySuggestedTasks();

    if (suggestedTasks.length === 0) {
      return dialogue.gray.intro;
    }

    const taskList = suggestedTasks
      .map(task => `
        <p><li>
          ${task.label}<br />
          <em>${task.hint}</em>
        </li></p>
      `)
      .join('');

      return `
      <p>“Miss <i>Simone</i> Snow," says Lady Gray, with mischevious emphasis, "I see you have found my manor <i>and</i> my inner sanctum.”</p>
      <p>“I'm sure you're anxious to know why I've invited you, but I fear I must leave you in suspense; the story is not yet complete.”</p>
      <p>“I entreat you to continue your tour of Westmoor, to engage in more dialogue, and to make a few more... <i>revisions</i>.”</p>
      <p>“Consider ${suggestedTasks.length === 1 ? 'this matter' : 'these matters'}.”</p>

      <ul>
        ${taskList}
      </ul>

<p>“If you are still at a loss, you can always consult your <a class="story-link" href="#/hints" style="color: white; font-weight: bold; text-decoration: underline;">research</a>.”</p>      <p>“Return to me when you have finished.”</p>
    `;
  }

  function answerIncludesMissingSister(answer) {
    const normalized = normalize(answer);

    return (
      normalized.includes('sister') ||
      normalized.includes('wren') ||
      normalized.includes('sibling') ||
      normalized.includes('twin')
    );
  }

  function answerFinalMystery(answer) {
    if (!answerIncludesMissingSister(answer)) {
      write(`
        <p>Lady Gray watches you with grave patience.</p>

        <p>“You have heard my clues. What is your birthright? Not a fortune. Not a husband.”</p>

        <p>“A bird in hand,” she says again. “Who has been beside you all along?”</p>
      `);

      return;
    }

    discover('final-mystery-answered', 'Answered Lady Gray’s final question', 'Answered final mystery');
    setFinalMysteryStep('write-ending');

    write(`
      <p>“Yes,” Lady Gray says. “Your sister, Wren.”</p>

      <p>“There was a car accident,” Lady Gray says. “Another late-season Nebraska snow storm.”</p>
      <p>“It's you who are missing. In the waking world, you are in the melodramatic scenario that would give a writer pause.”</p>
      <p>The red roses through the frosted window blur into brake lights.</p>
      <p>“Wren has been by your side, been telling you stories you already knew, only altered. She promoted the sisters in stories that have nearly forgotten them. Sonya beside Natasha. Jane beside Elizabeth. Angela beside Turtle. Jean as Jeanne, with the beloved sister Victor Hugo never even bothered to name!”</p>
      <p>“Wren has been calling you back with her stories.”</p>
      <p>Lady Gray indicates the chair with a sweep of her hand.</p>
      <p>The desk waits. The paper is blank. The pen is in your hand.</p>
      <p>“Sit,” Lady Gray says, “and write the next chapter of your life.”</p>
      <p>Try: <strong>write next chapter</strong></p>
    `);
  }

  function finishStory(input) {
    const normalized = normalize(input);

    const isWriting =
      normalized.includes('write') ||
      normalized.includes('chapter') ||
      normalized.includes('desk') ||
      normalized.includes('sit');

    if (!isWriting) {
      write(`
        <p>The desk waits.</p>

        <p>Lady Gray says, “Not by solving now. By choosing. Sit at the desk. Write.”</p>

        <p>Try: <strong>write chapter</strong></p>
      `);

      return;
    }

    discover('chapter-written', 'Wrote the next chapter', 'Wrote chapter');
    setFinalMysteryStep('complete');
    setVisualImage(`${import.meta.env.BASE_URL}images/hospital.png`)
    write(`
      <p>You sit at the desk.</p>

      <p>For a moment, you do not know how to begin. Then your hand moves.</p>

      <blockquote>
        <p><em>The next chapter begins with waking.</em></p>
      </blockquote>

      <p>The ink darkens. The room loosens around you. Westmoor Hall folds itself away: the fogged windows, the red roses, the silver candlesticks, the impossible snow.</p>

      <p>You wake to white ceiling tiles, the soft mechanical rhythm of a hospital room, and your sister asleep in the chair beside your bed.</p>

      <p>Wren’s hand is wrapped around yours.</p>

      <p>There are flowers on the table. Not roses. Something brighter and less dramatic, with a card tucked among the stems.</p>

      <p><em>From Professor Piper, who expects the next chapter when you are ready.</em></p>

      <p>Wren opens her eyes.</p>

      <p>For once, neither of you says the clever thing first.</p>

      <p>You squeeze her hand.</p>

      <p>And the story goes on.</p>
    `);
  }

  function writeEnding() {
    if (location !== 'lockedStudy') {
      write('The ending must be written in Lady Gray’s study, where the altered pages have gathered.');
      return;
    }

    const missingMilestones = progressMilestones.filter(clue => !foundClues.includes(clue));
    const missingItems = requiredInventoryForEnding.filter(item => !inventory.includes(item));
    if (missingMilestones.length || missingItems.length) {
      write(`The ending resists you. Missing progress: ${missingMilestones.length}. Required objects not carried: ${missingItems.length ? missingItems.join(', ') : 'none'}.`);
      return;
    }

    setLocation('ending');
    setVisualText(rooms.ending.image);
    write('Cath Avery wakes with ink on her hand. Wren is asleep across the room, one page of Cath’s story folded beneath her cheek. On the page, Lady Gray has written: “Revision is not resurrection, but love may learn to ask permission.”');
  }

  if (page === 'intro') {
  return (
    <>
      <main className="intro-page">
        <section className="intro-card">
          <h1>The Westmoor Game</h1>

          <img
            src={`${import.meta.env.BASE_URL}images/westmoor-hall.png`}
            alt="Westmoor Hall"
            className="intro-manor-image"
          />

          <div className="intro-blurb">
            <p>
              Westmoor Hall stands east of the village and west of nothing at all. There is not a moor for 50 miles or... more.
            </p>
            <p>You do not recall why you are here, but at least you are dressed appropriately.<br />
                You wear a pale muslin afternoon dress, and are neatly gloved, of course.<br />
    Your reticule hangs from your wrist containing a handkerchief, three hairpins, and no explanations whatsoever.</p>
            {/* <p>
              Westmoor Hall stands east of the village and west of nothing at all.
              You arrive late, underdressed for certainty and overdressed for explanation.
            </p>

            <p>
              Lady Gray has promised a treasure, the guests are guarding scraps of paper,
              and every familiar story seems to have been revised by an anxious hand.
            </p>

            <p>
              Find what has been rewritten. Ask who is missing. Then decide whether
              the ending is yours to write.
            </p> */}
          </div>

          <button type="button" onClick={startGame}>
            Enter Westmoor Hall
          </button>
        </section>
      </main>

      <Footer goToPage={goToPage} currentPage={page} />
    </>
  );
}

//   if (page === 'about') {
//   return (
//     <>
//       <StaticPage title="About" goToPage={goToPage}>
//         <div className="static-content about-text">
//           <p>
//             <strong>FOR JENNY</strong><br />
//             who did not ask for a puzzle-mystery<br />
//             but got one anyway
//           </p>

//           <h2>The Prompt</h2>

//           <ul>
//             <li>
//               A podcast, podcast transcript, or live performance where characters from one
//               story discuss another story, as part of their ongoing story or musical analysis
//               podcast.
//             </li>

//             <li>
//               A <em>Les Misérables</em> character isekai&apos;d into another world and their
//               confusion at 1) the existence of men and 2) the idea that women are supposed
//               to fall in love with men instead of with other women.
//             </li>

//             <li>
//               <em>Fangirl</em>, and any character from another work writing fic, about their
//               world, about another world, who knows!
//             </li>

//             <li>
//               A note from several years ago titled “solstice swap” that says only:
//               “Gray is Sam Westing.”
//             </li>
//           </ul>

//           <p>
//             I chose <em>Pride and Prejudice</em>, <em>Great Comet</em>, and{' '}
//             <em>Earnest</em> as worlds or works that might be fun for these crossover
//             prompts, but do not consider yourself limited.
//           </p>
//         </div>

//         <h2>Credits</h2>

//         <p>
//           The Westmoor Theme is <a href="https://open.spotify.com/track/4XGgzwM2mBPmru2EBJbvd3?flow_ctx=d3590103-c6a1-4cd5-9121-d5a92615062f%3A1780426499a">a Kanye West Medley by Nicholas Yee.</a> 
//         </p>
//         <p>
//           A credit to Alison Bechdel for <a href="https://en.wikipedia.org/wiki/Bechdel_test">The Bechdel Test</a>, which I wanted this project to ace.
//         </p>
//       </StaticPage>

//       <Footer goToPage={goToPage} currentPage={page}/>
//     </>
//   );
// }

if (page === 'about') {
  return (
    <AboutPage
      StaticPage={StaticPage}
      Footer={Footer}
      goToPage={goToPage}
      currentPage={page}
    />
  );
}

if (page === 'hints') {
  return (
    <HintsPage
      StaticPage={StaticPage}
      Footer={Footer}
      goToPage={goToPage}
      currentPage={page}
    />
  );
}

// if (page === 'hints') {
//   return (
//     <>
//       <StaticPage title="Hints" goToPage={goToPage}>
//         <p>
//           Speak to every guest. Many of them carry something more useful than an answer.
//         </p>

//         <p>
//           Some objects must be taken. Others are meant to be given away.
//         </p>

//         <p>
//           Speak to Mrs. Reynolds.
//         </p>
//         <p>
//           Speak to Elizabeth Bennet.
//         </p>
//         <p>
//           Speak to Gwendolyn Fairfax.
//         </p>
//         <p>
//           Speak to Turtle Wexler.
//         </p>
//         <p>
//           Speak to Jeanne Valjean.
//         </p>
//         <p>
//           Speak to someone in the attic.
//         </p>
//          <p>
//           Give the ??? to Elizabeth Bennet.
//         </p>
//         <p>
//           Give the cigarette case to Gwendolen Fairfax.
//         </p>
//         <p>
//           Give the ??? Turtle Wexler.
//         </p>
//         <p>
//           Give the candlesticks Jeanne Valjean.
//         </p>
//         <p>
//           The first letter of each line of Lady Gray's poem spells CATHWREN
//         </p>
//       </StaticPage>

//       <Footer goToPage={goToPage} />
//     </>
//   );
// }

return (
  <>
    <main>
          <aside className="sidebar" aria-label="Game tracking">
            {/* <section className="side-card manor-thumbnail-card" aria-label="Westmoor Hall">
        <img
          src={`${import.meta.env.BASE_URL}images/westmoor-hall.png`}
          alt="Westmoor Hall"
          className="manor-thumbnail-image"
        />
      </section> */}
      
      {/* <section className="side-card">
        <h2>Reticule</h2>
        {inventory.length ? <ul>{inventory.map(item => <li key={item}><span>{item}</span><button type="button" onClick={() => removeItem(item)}>remove</button></li>)}</ul> : <p>Empty.</p>}
      </section> */}

      <section className="side-card">
        <h2>Reticule</h2>

        {inventory.length === 0 ? (
          <p className="empty-list">Nothing but lint and suspicion.</p>
        ) : (
          <ul>
            {inventory.map(item => (
              <li key={item}>
                {objectDetails[item]?.name || item}
              </li>
            ))}
          </ul>
        )}

        {paperClues.length > 0 && (
          <div className="paper-clues-section">
            <p className="paper-clues-list">
              <strong>Clues:</strong> {paperClues.join(', ')}
            </p>

            {hasAllPaperClues() && (
              <button
                type="button"
                className="small-action-button"
                onClick={() => {
                  setCommand('arrange ');
                  write(`
                    <p>The slips of paper wait to be arranged.</p>

                    <p>Type: <strong>arrange [phrase]</strong></p>
                  `);
                }}
              >
                Arrange
              </button>
            )}
          </div>
        )}
      </section>

      {/* <section className="side-card">
        <h2>Visited</h2>
        <Checklist items={Object.entries(rooms).filter(([key]) => key !== 'ending').map(([key, room]) => [key, room.title])} checked={visitedPlaces} />
      </section> */}

      <section className="side-card sidebar-visual-card" aria-label="Current story image placeholder">
        <h2>{room.title}</h2>
          <img
            src={visualImage}
            alt={rooms[location].title}
            className="visual-image"
          />
        {/* <p>{visualImage}</p> */}
        {/* <p>{visualText}</p> */}
        {/* <button type="button" onClick={startMusic}>Start music</button>
        <button type="button" onClick={stopMusic}>Stop music</button> */}
      </section>

      <section className='music-section'>
        <button
          type="button"
          // className="inventory-button"
          className="music-button"
          onClick={toggleMusic}
        >
          {musicPlaying
            ? 'X Silence the musicians X'
            : '♪ Engage the musicians ♫'}
        </button>
      </section>

      {/* <section className="side-card">
        <h2>People Consulted</h2>
        <Checklist items={Object.entries(dialogue).map(([key, person]) => [key, person.displayName || person.name])} checked={consultedPeople} />
      </section> */}
    </aside>



    <section className="game">
      <header className="game-header">
  <div className="game-header-left">
    <h1>The Westmoor Game</h1>

    <section className="room-grid" aria-label="Current room summary">
      <section>
        <h3>People</h3>
        <p>{roomSummary.people.length ? roomSummary.people.join(' · ') : 'None'}</p>
      </section>

      <section>
        <h3>Objects</h3>
        <p>{roomSummary.objects.length ? roomSummary.objects.join(' · ') : 'None'}</p>
      </section>

      {/* <section>
        <h3>Places</h3> */}
        {/* <p>{roomSummary.exits.length ? roomSummary.exits.join(' · ') : 'None'}</p> */}
      {/* </section> */}
{/* <section>
  <h3>Places</h3>

  <p className="place-list">
    {roomSummary.exits.length ? (
      roomSummary.exits.map((place, index) => (
        <span className="place-item" key={place}>
          {place.replaceAll(' ', '\u00A0')}
          {index < roomSummary.exits.length - 1 && '\u00A0·'}
        </span>
      ))
    ) : (
      'None'
    )}
  </p>
</section> */}

<section>
  <h3>Places</h3>

  <p className="places-wrap">
    {roomSummary.exits.length ? (
      roomSummary.exits.map((place, index) => (
        <React.Fragment key={place}>
          <span className="places-token">
            {place.replaceAll(' ', '\u00A0')}
          </span>

          {index < roomSummary.exits.length - 1 && (
            <>
              <span className="places-dot"> · </span>
              <wbr />
            </>
          )}
        </React.Fragment>
      ))
    ) : (
      'None'
    )}
  </p>
</section>
    </section>
  </div>

  <img
    src={`${import.meta.env.BASE_URL}images/westmoor-hall.png`}
    alt="Westmoor Hall"
    className="game-hall-corner-image"
  />
</header>
      <div className="meter" aria-label={`Story progress ${progress}%`}><span style={{ width: `${progress}%` }}></span></div>
      <p className="progress">Story Progress: {completedProgressMilestones}/{progressMilestones.length}</p>

      <div className="message" aria-live="polite">
        <HtmlText html={message} />
      </div>

      <form
        className="command-form"
        onSubmit={event => {
          event.preventDefault();
          handleCommand(command);
        }}
      >
        <label htmlFor="command">Command</label>

        <input
          id="command"
          autoFocus
          value={command}
          onChange={event => setCommand(event.target.value)}
          placeholder={placeholderText}
        />

        <button className="command-submit" type="submit">
          Enter
        </button>
      </form>


      {/* <form onSubmit={event => { event.preventDefault(); handleCommand(command); }}>
        <label htmlFor="command">Command</label>
        <input id="command" autoFocus value={command} onChange={event => setCommand(event.target.value)} placeholder={placeholderText} />
        <button>Enter</button>
      </form> */}
    </section>
    </main>

    <Footer goToPage={goToPage} currentPage={page}/>
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

function Footer({ goToPage, currentPage }) {
  const footerLinks = [
    ['intro', 'Intro'],
    ['game', 'Game'],
    ['hints', 'Hints'],
    ['about', 'About']
  ];

  return (
    <footer className="site-footer">
      {footerLinks
        .filter(([pageKey]) => pageKey !== currentPage)
        .map(([pageKey, label]) => (
          <button
            key={pageKey}
            type="button"
            onClick={() => goToPage(pageKey)}
          >
            {label}
          </button>
        ))}
    </footer>
  );
}

function Checklist({ items, checked }) {
  return <ul className="checklist">
    {items.map(([key, label]) => <li key={key} className={checked.includes(key) ? 'done' : ''}><span aria-hidden="true">{checked.includes(key) ? '✓' : '□'}</span>{label}</li>)}
  </ul>;
}

const faviconLinks = [
  {
    rel: 'icon',
    type: 'image/png',
    href: 'favicon-96x96.png',
    sizes: '96x96',
  },
  {
    rel: 'icon',
    type: 'image/svg+xml',
    href: 'favicon.svg',
  },
  {
    rel: 'shortcut icon',
    href: 'favicon.ico',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: 'apple-touch-icon.png',
  },
  {
    rel: 'manifest',
    href: 'site.webmanifest',
  },
];

faviconLinks.forEach((attributes) => {
  const link = document.createElement('link');

  Object.entries(attributes).forEach(([key, value]) => {
    link.setAttribute(
      key,
      key === 'href' ? `${import.meta.env.BASE_URL}/favicon/${value}` : value
    );
  });

  document.head.appendChild(link);
});

createRoot(document.getElementById('root')).render(<App />);

// const favicon = document.createElement('link');
// favicon.rel = 'icon';
// favicon.type = 'image/png';
// // favicon.href = '/favicon.png';
// favicon.href = `${import.meta.env.BASE_URL}favicon.png`



// document.head.appendChild(favicon);

// createRoot(document.getElementById('root')).render(<App />);
