import React, { useMemo, useState, useEffect, useRef } from 'react';
import { HintsPage } from './components/HintsPage';
import { createRoot } from 'react-dom/client';
import './styles.css';
// import { startMusic, stopMusic } from "./music";

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
  unlock: 'use',
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
      'Servants\' Passage': 'servantsPassage',
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
    text: 'The upper landing looks down upon the Great Hall. From here the house seems less like a home than a set of shelves for stories.',
    exits: {
      'Great Hall': 'greatHall',
      'Music Room': 'musicRoom',
      'Library': 'library',
      'Servants\' Passage': 'servantsPassage',
      // 'East Wing': 'eastWing',
      // 'West Wing': 'westWing',
      // 'North Gallery': 'northGallery',
      // 'Attic': 'attic'
    },
    objects: ['candlesticks'],
    people: []
  },
  // eastWing: {
  drawingRoom: {
    // title: 'East Wing Drawing Room',
    title: 'Drawing Room',
    // aliases: ['east wing', 'drawing room', 'east drawing room'],
    aliases: ['drawing room'],
    // image: 'IMAGE PLACEHOLDER: East Wing — white tea table, sofa, embroidery basket, and a chair set slightly apart.',
    image: `${import.meta.env.BASE_URL}images/drawing-room.png`,
    text: '<p>A tea service waits for twice as many guests as could possibly be present in the house.</p>',
    exits: { 'Great Hall': 'greatHall' },
    objects: ['love letter'],
    people: ['gwendolen', 'elizabeth']
  },
  // westWing: {
  library: {
    // title: 'West Wing Library',
    title: 'Library',
    // aliases: ['west wing', 'library', 'west library'],
    aliases: ['library'],
    // image: 'IMAGE PLACEHOLDER: West Wing Library — legal ledgers, family trees, and a locked white glass bookcase.',
    image: `${import.meta.env.BASE_URL}images/library.png`,
    text: 'The library smells of leather, ink, and... cup noodles? Someone has sorted the shelves into Romance, Revolution, Inheritance, and Fanfiction.',
    exits: { 'Upper Landing': 'upperLanding' },
    // objects: ['darcy letter', 'westing envelope', 'newspaper'],
    objects: ['newspaper', 'book'],
    people: ['turtle']
    // people: ['turtle', 'thenardierOne', 'thenardierTwo']
  },
  musicRoom: {
    title: 'Music Room',
    aliases: ['music room', 'ballroom', 'comet room'],
    // image: 'IMAGE PLACEHOLDER: Music Room — chandelier, abandoned sheet music, comet painted across the white ceiling.',
    image: `${import.meta.env.BASE_URL}/images/music-room.png`,
    text: 'A piano repeats one unfinished phrase whenever no one is looking. The ceiling comet seems to have been painted over another sky.',
    exits: { 'Great Hall': 'greatHall'},
    objects: ['sheet music', 'cigarette case'],
    people: ['natasha']
  },
  garden: {
    title: 'Garden',
    aliases: ['garden', 'rose garden'],
    // image: 'IMAGE PLACEHOLDER: South Garden — wet gravel paths, white roses, locked gate, moonlit fountain.',
    image: `${import.meta.env.BASE_URL}images/rose-garden.png`,
    text: `<p>The Garden blooms out of season, full of bright red roses.<br /> Tea roses, first bred in 1867. Is it not 1811?<br /> The Garden blooms out of time.<br /> The fountain is dry, the path is wet - and holds two sets of identical footprints.</p>`,
    exits: { 'Orangery': 'orangery' },
    objects: ['ring'],
    people: ['valjean']
  },
  orangery: {
    title: 'Orangery',
    aliases: ['orangery', 'conservatory', 'greenhouse', 'glasshouse'],
    // image: 'IMAGE PLACEHOLDER: Orangery — white orange blossoms, tall windows, citrus trees in painted tubs, a writing desk hidden behind leaves.',
    image: `${import.meta.env.BASE_URL}images/orangery.png`,
    // image: `${import.meta.env.BASE_URL}orangery-snow.png`,
    text: `<p>The citrus fruits glow upon the boughs all around, their scents upon the air.<br />  
    The air...has a surprising chill. Outside, a view into the rose garden.<br />  
    Snow is falling, slowly wiping color from the world.<br />  
    You notice words are evaporating from the condensation on the glass:<br />  
    <em>"WAKE"</em>`,
    exits: { 'Great Hall': 'greatHall', 'Garden': 'garden'},
    objects: ['hand mirror'],
    // objects: ['notebook', 'hand mirror'],
    people: []
  },  
  // northGallery: {
  //   title: 'North Gallery',
  //   aliases: ['north gallery', 'gallery', 'portrait gallery'],
  //   image: 'IMAGE PLACEHOLDER: North Gallery — portraits of women whose faces flicker between painted and blank.',
  //   // text: 'Portraits line the North Gallery. In one are seated two young women in red mantuas, holding fast to one another. They have differing expressions and yet they share a face. One holds a goblet, the other a pen.',
  //   exits: { 'Upper Landing': 'upperLanding', 'Attic': 'attic' },
  //   objects: ['blank portrait'],
  //   people: ['wren']
  // },
  servantsPassage: {
    title: 'Servants\' Passage',
    aliases: ['servants passage', 'servants hall', 'passage', 'corridor', 'servants\' passage', 'servants\' hall'],
    // image: 'IMAGE PLACEHOLDER: Servants Passage — bells, narrow stairs, laundry basket full of crossed-out pages.',
    image: `${import.meta.env.BASE_URL}images/servants-passage.png`,
    text: 'The servants\' passage runs behind the formal rooms. Here the house drops its manners and shows its seams.',
    exits: { 'Great Hall': 'greatHall', 'Upper Landing': 'upperLanding', 'Attic': 'attic' },
    // objects: ['rewritten page'],
    objects: ['key', 'correspondence'],
    people: []
  },
  attic: {
    title: 'Attic',
    aliases: ['attic', 'upper room', 'nursery'],
    // image: 'IMAGE PLACEHOLDER: Attic — trunks, school papers, theater costumes, and a cracked dorm-room mirror.',
    image: `${import.meta.env.BASE_URL}images/attic.png`,
    text: 'The attic should belong to the house, but it has the air of a dorm room after finals: books open, clothes abandoned, pages everywhere.',
    exits: { 'Servants\' Passage': 'servantsPassage' },
    objects: ['trunk'],
    // objects: ['carry on manuscript'],
    people: ['spectre']
  },
  study: {
    title: 'Lady Gray’s Locked Study',
    aliases: ['study', 'locked study', 'lady gray study'],
    // image: 'IMAGE PLACEHOLDER: Locked Study — gray desk, seven labeled drawers, manuscript pages pinned like evidence.',
    image: `${import.meta.env.BASE_URL}images/study.png`,
    text: 'Behind the locked door is a modern study. A laptop, an ergonomic chair. Leaning on her desk with a modern nonchalance is Lady Gray.',
    exits: { 'Great Hall': 'greatHall' },
    // objects: ['final manuscript'],
    objects: [],
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
    text: `<p>The invitation requests “Miss Simon<em>e</em> Snow” at Westmoor Hall. <br />A second hand has inserted the "E". Some conscientious proofreading assistant, no doubt.<br />
    That name is more familiar than your own.</p>`, 
    // <p>You do not recall why you are here, but at least you are dressed appropriately.<br />
    // You wear a pale muslin afternoon dress, and are neatly gloved.  
    // Your reticule hangs from your wrist containing a handkerchief, three hairpins, and no explanations whatsoever.</p>`,
    clue: 'false-name',
    clueLabel: 'False-name invitation',
    requiresPossession: false
  },
  'cigarette case': {
    image: 'IMAGE PLACEHOLDER: Silver cigarette case engraved “From little Cecily, with her fondest love.”',
    // text: 'The cigarette case should explain a false identity, but the inscription has been revised three times. Gwendolen has underlined “fondest” in offended pencil.',
    text: '<p>When you open the  cigarette case you see it is engraved:</p> <p><i>"‘From little Cecily with her fondest love."</i></p>',
    clue: 'earnest-revision',
    clueLabel: 'Earnest false identity',
    requiresPossession: false
  },
  'ring': {
    image: 'IMAGE PLACEHOLDER: An invitation addressed to “Miss Simone Snow,” the ink changing midway through.',
    text: `<p>Something sparkles in the grass.<br />
    Looking down, you see a diamond ring. An engagement ring, perhaps.<br />
    It is undeniably lovely but its shine is strangely cold, somehow.</p>`,  
    clue: 'engagement-ring',
    clueLabel: 'engagement-ring',
    requiresPossession: false
  },
  'correspondence': {
    image: 'IMAGE PLACEHOLDER: Long folded letter beginning “Be not alarmed, madam,” with later sentences crossed out.',
    text: `I am truly glad, dearest Lizzy, that you have been spared something of these distressing scenes; but now, as the first shock is over, shall I own that I long for your return? I am not so selfish, however, as to press for it, if inconvenient. Adieu. I take up my pen again to do what I have just told you I would not, but circumstances are such, that I cannot help earnestly begging you all to come here as soon as possible.`,
    clue: 'pride-revision',
    clueLabel: 'Pride and Prejudice letter',
    requiresPossession: false
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
    // requiresPossession: false
  },
  'trunk': {
    image: 'IMAGE PLACEHOLDER: A heavy old trunk in the attic, its lock scratched by many failed attempts.',
    text: `<p>The trunk is old, heavy, and locked.</p>`,
    // <p>The lock is small enough that a proper key almost feels like the wrong idea.</p>,
    clue: null,
    clueLabel: null,
    requiresPossession: false
  },
  'book': {
    image: 'IMAGE PLACEHOLDER: Westing-style envelope with chess notation, stock ticker marks, and a clue cut in half.',
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
    requiresPossession: false
  },
  'candlesticks': {
    image: 'IMAGE PLACEHOLDER: Pair of silver candlesticks, one real and one only sketched in pencil.',
    text: `<p>Two large candlesticks of massive silver stand on a narrow mahogany table.<br />  
    They have been polished; you can see yourself reflected in each.</p>`,
    clue: 'miserables-revision',
    clueLabel: 'Valjean candlestick',
    requiresPossession: false
  },
  'hand mirror': {
    image: 'IMAGE PLACEHOLDER: A silver hand mirror on the Orangery writing desk, its glass dark around the edges.',
    text: `<p>Your hair is is dressed à la grecque, but your face is unexpectedly ashen.</p>  
    <p>The mirror reflects the orange trees, the steamed glass, and a woman standing behind you.<br />  
    When you turn, no one is there.</p>`,
    clue: 'wrong-reflection',
    clueLabel: 'Wrong reflection',
    requiresPossession: false
  },
  'manuscript': {
    image: 'IMAGE PLACEHOLDER: Fanfiction manuscript titled Carry On, with “Simone Snow” written over another name.',
    text: '<p>A story inside a story - it\'s been a while since you\'ve written "Simon Snow" fanfiction.</p> <p>This manuscript bears the marks of your sister\'s red pen;<br /> some classic copyediting marks but many of her own design, intelligible only to you two.',
    clue: 'fanfiction-thread',
    clueLabel: 'Carry On manuscript',
    requiresPossession: false
  },
  'handkerchief': {
    image: 'IMAGE PLACEHOLDER: A neatly folded white handkerchief, monogrammed in an unfamiliar hand.',
    text: `<p>The small white handkerchief is embroidered in red with <em>C.A.</em>.</p>`,
    clue: null,
    clueLabel: null,
    requiresPossession: false
  },
  'hairpins': {
    image: 'IMAGE PLACEHOLDER: Three dark hairpins tucked into the lining of a reticule.',
    text: `<p>Three hairpins, plain and practical.</p>
    <p>These hairpins are no doubt meant to keep a respectable coiffure in place, but they look sturdy enough to assist in something less respectable.</p>`,
    clue: null,
    clueLabel: null,
    requiresPossession: false
  },
  'key': {
    image: 'IMAGE PLACEHOLDER: Brass key tagged “Lady Gray’s Study,” casting two shadows.',
    text: '<p>A tarnished brass key, befitting an old house with old secrets.<br />Good manners would forbid a guest from taking it.<br />But then, good manners are for people who know why they have been invited.</p>',
    clue: 'study-key',
    clueLabel: 'Study key',
    requiresPossession: false
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
    requiresPossession: false
  },
'love letter': {
  image: 'IMAGE PLACEHOLDER: A love letter folded into the sheet music, its seal cracked and its signature blurred.',
  text: `<p>You blush to read the note signed by Sonya:</p> 
  <blockquote>
  <p>I will stand in the dark for you.<br /> 
  I will hold you back by force.<br />  
  I will stand here outside your door.<br />  
  I won't see you disgraced.<br />  
  I will protect your name and your heart.</p>
  </blockquote>
  <p>Here, surely, is a love letter.</p>`,
  clue: 'love-letter',
  clueLabel: 'Natasha love letter',
  requiresPossession: false
},
  'final manuscript': {
    image: 'IMAGE PLACEHOLDER: Final manuscript pages, some careful, some reckless, all waiting for an ending.',
    text: '',
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
    // later: `“Since you missed the luncheon the mistress says I am meant to give you a clue of your own, whatever that means.  
    // She says "A bird in the hand." I hope it means something to you, as it mean nought to me.”`,
    later: '<p>“Since you missed luncheon, Miss Snow, the mistress says I am to give you a clue of your own.</p> <p>She said: ‘A bird in the hand.’</p> <p>Unfortunately I was given no bird for you nor any further instructions.”</p>',
    clue: 'reynolds-warning',
    clueLabel: 'Reynolds warning'
  },
  gray: {
    name: cast.gray,
    aliases: ['gray', 'lady gray', 'westmere', 'lady gray westmere'],
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
  spectre: {
    name: cast.wren,
    aliases: ['ghost', 'girl', 'wren', 'spectre'],
    image: 'IMAGE PLACEHOLDER: The haunting girl — seen in a mirror, almost the protagonist, almost not.',
    intro: '<p>A gray woman lingers in the room.<br /> You do not fear her, although she is transparent and has your face.</p><p>“If I’m going to change the stories,” she says, “then I figure the least I can do is make you Simon.<br /> It’s a shame he doesn’t have a sister. It\'s not like I can be Baz!” She makes a face.</br> “That\'d be too weird.” ',
    // intro: 'The haunting girl appears at the end of the gallery. She has the wrong stillness for a ghost. “You were taking too long,” she says, then vanishes.',
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
  const progress = Math.round((foundClues.filter(clue => requiredClues.includes(clue)).length / requiredClues.length) * 100);
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
      Lady Gray told us we would discover a treasure.<br />
      She read us the queerest poem. Shall I tell you?”</p>
      ${formattedPoem}
      <p>“Then she gave each of us a slip of paper.<br /> A clue, she says, although to what mystery no one can agree.<br />
      <p>My clue is <strong>“LADY”</strong>. Doesn't quite narrow anything down.”</p>`,

    natasha:
      `<p>“Miss Snow! We were wondering when you would arrive.<br />   
    It's a pity you missed luncheon; the oddest thing happened.<br />  
    Lady Gray read us a poem at luncheon.<br /> I shall tell you all! She said we would discover a treasure!<br /> She said:<br />` + formattedPoem +  `<p>Then she gave us each a clue. I think they must belong together somehow.<br />  
    My clue is "BE". I take this word to heart. To be can be quite painful, especially when you feel your life is over.”`,

    valjean:
      `<p>“Miss Snow, welcome. We were sorry to miss you at luncheon.<br />  
      Lady Gray gave a curious speech. She said:<br />`  + formattedPoem + `<p>Then she distributed slips of paper to the guests. She says we will discover a treasure.<br />  
      Mine clue is "WARE." A reference to my garment business, perhaps.”</p>`,

    turtle:
      `<p>“Simone Snow! You missed lunch. I guess I'll catch you up.<br />  
      Lady Gray said we would "discover a treasure."<br />  
      Then she read us a poem. It was very old-fashioned; like her I guess. It went:<br />` + formattedPoem +
      `<p>Then she handed everybody a clue on a little piece of paper. Now everybody has one except you, I guess.<br />  
      Mine is "THE" - How useless.<br />    
      You were late and you haven't seen Lady Gray? That's either rude or suspicious.”</p>`,

    gwendolen:
      `<p>“Miss Snow, there you are. It is a pity you missed luncheon; there was such an excitement!<br />  
    Lady Gray told us we would discover a treasure. She read us a poem. I shall tell you all! She said:<br />` + formattedPoem +  `<p>Then Lady Gray distributed paper clues to all the guests. I consider the entire arrangement wonderfully dramatic.  
    But mine says "GRAY" how literally dull. Don't you have one? Perhaps not yet. Well, now you have mine, so that's a start.”</p>`,

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
      const addedCommands = hasAllPaperClues()
        ? `
          arrange [phrase]  
        `
        : '';

      write(`<h4>Commands:</h4>

        <p>- place name<br />
        - go [place]<br />
        - speak [person]<br />
        - take [object]<br />
        - examine [object]<br />
        - remove [object]<br />
        - inventory<br />
        ${addedCommands}</p>
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
    } else if (verb === 'use') {
      useItem(remainder); } 
    else if (verb === 'examine') {
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
    return `<p>Turtle Wexler has made herself at home among the shelves, which the shelves appear to resent.</p>`;
  }

  if (roomKey === 'garden' && hasPerson('valjean')) {
    return `Jeanne Valjean sits upon a stone seat; also out of time (though not by much.) Not the man you would expect to see; a woman. Beside her is a bag, as though at any time she may depart. Curious.`
    // return `<p>Jeanne Valjean sits upon a stone seat with the guarded patience of someone prepared to depart at any moment.</p>`;
  }

  if (roomKey === 'attic' && hasPerson('spectre')) {
    return `<p>A gray woman lingers near the trunks, transparent and somehow familiar.</p>`;
  }

  if (roomKey === 'study' && hasPerson('gray')) {
    return `<p>Lady Gray waits beside the writing desk, as though she has been expecting you to arrive at precisely this paragraph.</p>`;
  }

  return '';
}

  function goTo(placeInput) {
    const requested = findRoomKey(placeInput);
    if (!requested) {
      write(`No place named “${placeInput || 'there'}” comes into focus.`);
      return;
    }

    if (requested === 'study' && !isStudyUnlocked) {
      write(`
        <p>The Study door is locked.</p>`

        // <p>The brass plate beneath the handle is worn bright, as if many hands have tried it before yours.</p>

        // <p>Perhaps you could <strong>unlock study with brass key</strong>.</p>
      );

      setVisualImage(`${import.meta.env.BASE_URL}images/door.png`);
      return;
    }

    const exitMatch = Object.values(room.exits).includes(requested);
    if (!exitMatch) {
      write(`You cannot reach the ${rooms[requested].title} from here.`);
      return;
    }

    setLocation(requested);
    setVisitedPlaces(previous => previous.includes(requested) ? previous : [...previous, requested]);
    // setVisualText(rooms[requested].image);
    // console.log(rooms[requested].image)
    setVisualImage(rooms[requested].image);
    write(getRoomText(requested));
  }

  function takeItem(noun) {
    const found = findObject(noun, visibleObjects);
    if (!found) {
      write(`No object matching “${noun || 'that'}” is here.`);
      return;
    }

    if (found === 'trunk') {
      if (!isTrunkUnlocked) {
        write(`
          <p>The trunk is locked.</p>

          <p>The brass key does not look as if it belongs to this sort of lock.</p>

          <p>Perhaps you could <strong>use</strong> something else.</p>
        `);
        return;
      }

      write(`
        <p>You try to lift the trunk.</p>

        <p>It does not so much as dignify the attempt by shifting.</p>

        <p>The trunk is unlocked now, but it is far too heavy to carry.</p>
      `);
      return;
    }

    addItem(found);
    setRoomObjects(previous => ({
      ...previous,
      [location]: previous[location].filter(object => object !== found)
    }));

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
      completeGift(item, characterKey);

      discover(
        'elizabeth-jane-realization',
        'Gave Jane’s correspondence to Elizabeth',
        'Elizabeth remembers Jane'
      );

      write(`
        <p>You give the correspondence to Elizabeth Bennet.</p>

        <p>She receives it with composure, but the instant she recognizes the hand, all irony leaves her face.</p>

        <p>“Jane,” she says softly.</p>

        <p>She reads quickly at first, then more slowly, as if each line requires the courtesy of being believed.</p>

        <p>“I have been very proud of my discernment,” Elizabeth says. “But it is possible to observe every folly in a room and still overlook the person who loves you best.”</p>

        <p>She folds the letter with great care.</p>

        <p>“Jane is not merely the gentle sister who waits at home. She is the reason there is a home to return to.”</p>
      `);

      return;
    }

    if (characterKey === 'gwendolen' && item === 'cigarette case') {
      completeGift(item, characterKey);
      // setVisualText(dialogue.natasha.image);

      discover(
        'gwendolyn-cecily-realization',
        'Gave Cecily cigarette case to Gwendolen',
        'Gwendolen remembers Cecily'
      );

      write(`<p>You give the cigarette case to Gwedolen.</p>

        <p>“Something something Cecily is my sister</p>”`);

      return;
    }

    if (characterKey === 'natasha' && item === 'love letter') {
      completeGift(item, characterKey);
      // setVisualText(dialogue.natasha.image);

      discover(
        'natasha-sonya-realization',
        'Gave Sonya’s love letter to Natasha',
        'Natasha remembers Sonya'
      );

      write(`<p>You give the love letter to Natasha.<br />

      She reads the letter once quickly, then again, with care.</p>  
      <p>“This is not from Anatole,” she says.<br />

      “No. Of course it is not.<br />  
      My cousin. My friend. My sister.<br />  
      Sonya loved me before the comet, before the ball, before any man. <br /> 
      She was not the obstacle to my love story. She was the person trying to keep me alive inside it.\n  
      She is my dearest treasure, and the author of my future.”</p>`);

      return;
    }

    if (characterKey === 'turtle' && item === 'ring') {
      completeGift(item, characterKey);

      discover(
        'turtle-angela-ring-realization',
        'Gave engagement ring to Turtle',
        'Turtle understands Angela'
      );

      write(`
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
      `);

      return;
    }

    if (characterKey === 'valjean' && item === 'candlesticks') {
      completeGift(item, characterKey);

      discover(
        'valjean-sister-realization',
        'Gave candlesticks to Valjean',
        'Valjean remembers sister'
      );

      write(`<p>Valjeanne takes the candlesticks carefully, as if they weigh even more than silver.</p>

      <p>“Everyone remembers Cosette, the child I saved.\n  
      But no one remembers the child I *tried* to save. My sister's child.\n  
      And before all that, there was my sister.</p>

      <p>I stole bread for her and her children. She is the beginning of my story.\n  
      Not my love for Cosette. Not the love of the Bishop. My love for her.\n
      Hugo thinks that in his agony a man would forget his family. I do not believe that.\n  
      And I know a sister never would.\n
      I was given these candlesticks to light my way once, then I will use them now.\n  
      I will find my sister’s family. I will raise us all to the light.”</p>`);

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
    // setVisualText(detail.image);
    // ToDo deprecate required posession?
    if (detail.requiresPossession && !inventory.includes(found)) {
      // write(`${detail.text} You will need to take it before this clue can be used.`);
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
      normalized.includes('trunk') || location === 'attic';

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

      write(`
        <p>You fit the brass key into the Study door.</p>

        <p>The lock turns with a soft, final click.</p>

        <p>The Study is unlocked.</p>

        <p>Try: <strong>go study</strong></p>
      `);
      return;
    }

    if (!isTryingTrunk) {
      write(`<p>Use what, and on what?</p>`);
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
      write(`
        <p>You try the brass key in the trunk lock.</p>

        <p>It will not turn. This key belongs to a more formal door.</p>

        <p>The little trunk lock wants something thinner.</p>

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

    write(`
      <p>The trunk is locked.</p>

      <p>The brass key seems too large for it.</p>

      <p>Perhaps you could <strong>use</strong> something </strong>on trunk</strong>.</p>
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

    setConsultedPeople(previous =>
      previous.includes(key) ? previous : [...previous, key]
    );

    discover(
      character.clue,
      `Conversation: ${character.displayName || character.name}`,
      character.clueLabel
    );

    if (key === 'gray' && location === 'study') {
      setFinalMysteryStep('missing-story');

      write(character.intro);

      return;
    }

    let response = foundClues.length >= 3 ? character.later : character.intro;

    if (key !== 'reynolds' && !hasHeardPaperClueRule) {
      response = paperClueRules[key] || response;
      setHasHeardPaperClueRule(true);
    }

 if (character.paperClue && !paperClues.includes(character.paperClue)) {
  addPaperClue(character.paperClue);

  const paperCluesAfterNewClue = [...paperClues, character.paperClue];

  const hasAllPaperCluesNow = paperClueWords.every(clue =>
    paperCluesAfterNewClue.includes(clue)
  );

  if (hasAllPaperCluesNow) {
    response += `
      <p>The slips of paper shift in your reticule.</p>

      <p>Taken in order, they say very little. Taken otherwise, they seem almost willing to confess.</p>

      <p>What phrase do they form?</p>

      <p>Try: <strong>arrange [phrase]</strong></p>
    `;
  }
}

    write(response);
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
    <p>Try: <strong>write chapter</strong></p>
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

      <Footer goToPage={goToPage} currentPage={page}/>
    </>
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
              <strong>Paper clues:</strong> {paperClues.join(', ')}
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
      {/* <div className="game-header">
        <h1>The Westmoor Game</h1>

        <img
          src={`${import.meta.env.BASE_URL}images/westmoor-hall.png`}
          alt="Westmoor Hall"
          className="game-hall-corner-image"
        />
      </div> */}
      {/* <h2>{room.title}</h2> */}
      {/* <HtmlText html={getRoomText(location)} className="room-text" /> */}

      <div className="meter" aria-label={`Mystery progress ${progress}%`}><span style={{ width: `${progress}%` }}></span></div>
      <p className="progress">Clues: {foundClues.filter(clue => requiredClues.includes(clue)).length}/{requiredClues.length}</p>

      <div className="message" aria-live="polite">
        {/* <ReactMarkdown>{message}</ReactMarkdown> */}
        <HtmlText html={message} />
      </div>


      <form onSubmit={event => { event.preventDefault(); handleCommand(command); }}>
        <label htmlFor="command">Command</label>
        <input id="command" autoFocus value={command} onChange={event => setCommand(event.target.value)} placeholder={placeholderText} />
        <button>Enter</button>
      </form>
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
