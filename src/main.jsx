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
  wren: 'A Spectre'
};

const rooms = {
  greatHall: {
    title: 'Great Hall',
    aliases: ['hall', 'great hall', 'center hall', 'entry', 'foyer'],
    image: `${import.meta.env.BASE_URL}images/great-hall.png`,
    text: `<p>The Great Hall is spread before you, its twin staircases curving upward beneath a delicate chandelier.<br />
  Portraits watch from either wall.<br/ > A polished compass rose is set into the floor, directing you everywhere all at once.</p>`,
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
    text: `<p>The library smells of leather, ink, and... ramen noodles?</p> <p>The bookshelves have been helpfully labeled; you spy both <em>Romance</em> and <em>Fanfiction</em>.`,
    exits: { 'Upper Landing': 'upperLanding' },
    objects: ['newspaper', 'book'],
    people: ['turtle']
  },
  musicRoom: {
    title: 'Music Room',
    aliases: ['music room', 'ballroom', 'comet room'],
    image: `${import.meta.env.BASE_URL}images/music-room.png`,
    text: `<p>A square pianoforte repeats one unfinished phrase whenever no one is looking.</p> <p>The invisible hand at the keys is more mysterious than musical.</p>`,
    exits: { 'Upper Landing': 'upperLanding' },
    objects: ['sheet music', 'cigarette case'],
    people: ['natasha']
  },
  garden: {
    title: 'Garden',
    aliases: ['garden', 'rose garden'],
    image: `${import.meta.env.BASE_URL}images/rose-garden.png`,
    text: `<p>The Garden blooms out of season, full of bright red roses.</p> <p>...Tea roses, first bred in 1867. Is it not 1811?<br /> The Garden blooms out of time...</p> <p>The fountain is dry, the path is wet - and holds two sets of identical footprints.</p>`,
    exits: { 'Orangery': 'orangery' },
    objects: ['ring'],
    people: ['valjean']
  },
  orangery: {
    title: 'Orangery',
    aliases: ['orangery', 'conservatory', 'greenhouse', 'glasshouse'],
    image: `${import.meta.env.BASE_URL}images/orangery.png`,
    text: `<p>The citrus fruits glow upon the boughs all around, their scents upon the air.</p>  
    <p>The air...has a surprising chill. Outside, a view into the rose garden.<br />  
    Snow is falling, slowly wiping color from the world.</p>  
    <p>You notice words are evaporating from the condensation on the glass:<br />  
    <em>"WAKE"</em></p>`,
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
    text: `<p>The attic is a Gothic cliché: sloped ceiling, narrow bed, cracked basin, and cobwebs arranged almost theatrically.</p>
    <p>A blanket lies twisted on the bed, as though some pale, doomed child has only just been carried off.</p>`,
    exits: { 'Servants’ Passage': 'servantsPassage' },
    objects: ['trunk'],
    people: ['spectre']
  },
  study: {
    title: 'Lady Gray’s Study',
    aliases: ['study', 'locked study'],
    image: `${import.meta.env.BASE_URL}images/study.png`,
    text: `<p>Behind the locked door is a modern study. A laptop, an ergonomic chair... and a quill pen.</p>`,
    exits: { 'Great Hall': 'greatHall' },
    objects: [],
    people: ['gray']
  }
};

const objectDetails = {
  'invitation': {
    text: `<p>Your invitation has fallen from your gloved hand to the marble floor.<br /> At least, you presume it is yours.</p>
    <p>The invitation requests “<em>Miss</em> Simon<em>e</em> Snow” at Westmoor Hall. </p>
    <p>A second pen has inserted the address and the "E". Some conscientious proofreader, perhaps?</p>
    <p>That name is more familiar than your own.</p>`, 
    clue: 'false-name',
    clueLabel: 'False-name invitation',
  },
  'cigarette case': {
    text: '<p>When you open the  cigarette case you see it is engraved:</p> <p><i>"‘From little Cecily with her fondest love."</i></p>',
    clue: 'earnest-revision',
    clueLabel: 'Earnest false identity',
  },
  'ring': {
    text: `<p>Something sparkles in the grass.</p>
    <p>Looking down, you see a diamond ring. An engagement ring, perhaps.</p>
    <p>It is undeniably lovely but its shine is strangely cold, somehow.</p>`,  
    clue: 'engagement-ring',
    clueLabel: 'engagement-ring',
  },
  'correspondence': {
    text: `<p>This letter is from Jane Bennet.</p> <p>Courtesy argues against reading it.<br /> The hurried hand, however, argues more persuasively that you should find its intended recipient.</p>
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
    text: `<p>The trunk is old, heavy, and locked.</p>`,
    clue: 'examined-trunk',
    clueLabel: 'Examined trunk',
  },
  'book': {
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
    text: `<p>Two large candlesticks of massive silver stand on a narrow mahogany table.<br />  
    They have been polished; you can see yourself reflected in each.</p>`,
    clue: 'miserables-revision',
    clueLabel: 'Valjean candlestick',
  },
  'hand mirror': {
    text: `<p>Your hair is is dressed à la grecque, but your face is unexpectedly ashen.</p>  
    <p>The mirror reflects the orange trees, the steamed glass, and a woman standing behind you.<br />  
    When you turn, no one is there.</p>`,
    clue: 'wrong-reflection',
    clueLabel: 'Wrong reflection',
  },
  'manuscript': {
     text: `<p><em>Carry On, Simon</em>: the magnum opus of your college years.</p>
     <p>A story inside a story - it’s been a while since you’ve written "Simon Snow" fanfiction.</p></p>

  <p>You have written original books since then, with the mentorship of your Creative Writing professor Gray Piper, but this is the work that made you a writer first.</p>


  <p>This manuscript bears the marks of your sister's red pen;<br /> some classic copyediting marks, but many of her own design, intelligible only to you two.</p>`,
  clue: 'fanfiction-thread',
    clueLabel: 'Carry On manuscript',
  },
  'handkerchief': {
    text: `<p>The small white handkerchief is monogrammed in red with the initials <em>C.A.</em></p>`,
    clue: 'examined-handkerchief',
    clueLabel: 'Examined handkerchief',
  },
  'hairpins': {
    text: `<p>Three hairpins, plain and practical.</p>
    <p>These hairpins are no doubt meant to keep a respectable coiffure in place, but they look sturdy enough to assist in something less respectable.</p>`,
    clue: 'examined-hairpins',
    clueLabel: 'Examined hairpins',
  },
  'key': {
    text: '<p>A tarnished brass key, befitting an old house with old secrets.<br />Good manners would forbid a guest from taking it.<br />But then, good manners are for people who know why they have been invited.</p>',
    clue: 'study-key',
    clueLabel: 'Study key',
  },
  'newspaper': {
    text: `<p>Not just any newspaper – The New York Times. First published 1851. An anchronism.</p>  
    <p>The newspaper is folded open to a story:</p>  
    <p><i>"Emerging Novelist Critically Injured in Winter Car Crash"</i></p> 
    <p>Car. Another anachronism.</p>  
    <p>The print fades before your eyes as though obscured by snow.</p>`,
    clue: 'gray-lady-newspaper',
    clueLabel: 'Gray Lady newspaper',
  },
  'love letter': {
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
  }
};

const paperClueAnswer = 'attendthegraylady';
const paperClueWords = ['AT', 'TEND', 'THE', 'GRAY', 'LADY'];
const totalPaperClues = 5;

const dialogue = {
  reynolds: {
    name: cast.reynolds,
    aliases: ['reynolds', 'mrs reynolds', 'housekeeper'],
    intro: '“Welcome Miss Snow. Although I fear if you have arrived here, that means someone is missing.”',
    later: '<p>“Since you missed luncheon, Miss Snow, the mistress says I am to give you a clue of your own.</p> <p>She said: ‘A bird in the hand.’</p> <p>Unfortunately I was given no bird for you nor any further instructions.”</p>',
    clue: 'reynolds-warning',
    clueLabel: 'Reynolds warning'
  },
  gray: {
    name: cast.gray,
    aliases: ['gray', 'lady gray', 'grey', 'lady grey'],
    image: 'IMAGE PLACEHOLDER: Lady Gray Westmoor — silver silk, black gloves, cane across her knees.',
    intro: `<p>“Lady Gray wears a gown that has made several concessions to the 21st century. She is half Regency mistress and half contemporary academic; somehow both warm and imperious.<br/>Her hazel eyes twinkle behind rainbow-patterned glasses. Her sleeves are rolled to the forearm, revealing the edge of a tattoo, and her fingers are stained with ink.</p> <p>“A bird in the hand,” she says. “What does that mean to you?“<p> “A bird in the hand is worth two... somewhere,“ you stammer in reply.</p> <p>“Good!“ encourages Lady Gray. “Do you know who is missing from your story?”</p>`,
    later: `<p>“Lady Gray wears a gown that has made several concessions to the 21st century. She is half Regency mistress and half contemporary academic; somehow both warm and imperious.<br/>Her hazel eyes twinkle behind rainbow-patterned glasses. Her sleeves are rolled to the forearm, revealing the edge of a tattoo, and her fingers are stained with ink.</p> <p>“A bird in the hand,” she says. “What does that mean to you?“<p> “A bird in the hand is worth two... somewhere,“ you stammer in reply.</p> <p>“Good!“ encourages Lady Gray. “Do you know who is missing from your story?”</p>`,
    clue: 'gray-warning',
    clueLabel: 'Lady Gray’s warning'
  },
  elizabeth: {
    name: cast.elizabeth,
    aliases: ['elizabeth', 'lizzy', 'elizabeth bennet', 'bennet'],
    intro: 'Elizabeth Bennet studies you with amused suspicion. “The house is full of people being improved against their will. I cannot recommend it.”',
    later: 'Elizabeth says, “A misunderstanding can be instructive. A rewriting is only rude.”',
    clue: 'elizabeth-consulted',
    clueLabel: 'Elizabeth on rude revision',
    paperClue: 'LADY',
    repeat: '<p>Elizabeth says, “If my sister Jane were here, she would find some charitable explanation for all of this.<br /> My own prejudices, I confess, can discover nothing but a great deal of officious interference.”</p>'
  },
  gwendolen: {
    name: cast.gwendolen,
    aliases: ['gwendolen', 'gwendolen fairfax', 'fairfax'],
    intro: 'Gwendolen Fairfax snaps the cigarette case shut. “I am prepared to forgive a false name. I am not prepared to forgive bad editing.”',
    later: 'Gwendolen says, “Someone has mistaken complication for wit. A common but devastating error.”',
    clue: 'gwendolen-consulted',
    clueLabel: 'Gwendolen on false names',
    paperClue: 'GRAY',
    repeat: '<p>Gwendolen says, “I adore a mystery! This one, however, has the grave defect of concealing things and making me search them out.”</p>'
  },
  natasha: {
    name: cast.natasha,
    aliases: ['natasha', 'natasha rostova', 'rostova', 'natalie', 'natalia'],
    intro: `“I have been like you. I have felt the absence of one I love.  
    And I too have been very ill. Heartsick, ashamed, and pale as a winter sky.  
    I yearn for a kind word, or better yet a love letter,  
    a love letter,  
    a love letter...”`,
    later: 'Natasha says, “Whoever changed it did not understand that sorrow is not the same thing as an ending.”',
    clue: 'natasha-consulted',
    clueLabel: 'Natasha on forgiveness',
    paperClue: 'AT',
    repeat: `Natasha says, “<p>I have been like you.</p> <p>I have felt the absence of one I love.<br />  
    And I too have been very ill.<br />  Heartsick, ashamed, and pale as a winter sky.<br />   
    <p>I yearn for a kind word, or better yet a love letter,<br />   
    a love letter,<br />   
    a love letter...”</p>`
  },
  turtle: {
    name: cast.turtle,
    aliases: ['turtle', 'turtle wexler', 'wexler', 'tabitha', 'tabitha wexler'],
    intro: 'Turtle Wexler waves the envelope. “The clues are inconsistent. That means either the puzzle is bad, or someone tampered with the rules.”',
    later: 'Turtle says, “I like games. I hate being played.”',
    clue: 'turtle-consulted',
    clueLabel: 'Turtle on bad rules',
    paperClue: 'THE',
    repeat: '<p>Turtle says, “Being underestimated is only annoying until you realize it means everyone keeps showing you their cards.”</p>'
  },
  valjean: {
    name: cast.valjean,
    aliases: ['jeanne', 'jeanne valjean', 'valjean'],
    intro: "Jeanne Valjean says, “I am not who you would expect to see here, nor as you may expect to see me. I took another name to survive. But at least I wrote my own story. I was Monsieur Madeleine, in reverence to Mary Magdalene; a sainted testament to second chances. It's all the more fitting considering I am a woman. Perhaps these candlesticks can shine some light upon the mysteries in your life.”",    
    later: 'Jeanne Valjean says, “Mercy changes a life. Control merely disguises itself as mercy.”',
    clue: 'valjean-consulted',
    clueLabel: 'Valjean on mercy',
    paperClue: 'TEND',
    repeat: `<p>Jeanne Valjean says, “I am not who you would expect to see here, nor as you may expect to see me.</p> <p>I took another name to survive. I was Monsieur Madeleine, in reverence to Mary Magdalene; a sainted testament to second chances. That is all the more fitting considering I am a woman.”</p>`
  },
  spectre: {
    name: cast.wren,
    aliases: ['spectre', 'the spectre', 'girl', 'wren', 'ghost'],
    intro: '<p>The Spectre looks like you if you, if you were cast Fantine, with her short hair and gray tatters.</p> <p>“If I’m going to change the stories,” she says, “then I figure the least I can do is make you Simon, in a way.<br /> It’s a shame he doesn’t have a sister. It’s not like I can be Baz!” She makes a face.</br> “That’d be too weird.” ',
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
  'gray-lady-newspaper',
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

const progressBarMilestones = progressMilestones.filter(
  milestone => !['final-mystery-answered', 'chapter-written'].includes(milestone)
);

const TEST_ENDGAME = false;

function TEST_getFullProgressState() {
  return {
    location: 'study',
    inventory: ['handkerchief', 'hairpins'],
    paperClues: [...paperClueWords],
    foundClues: [...progressBarMilestones],
    clueSources: Object.fromEntries(
      progressBarMilestones.map(clue => [
        clue,
        {
          source: 'TEST',
          label: clue
        }
      ])
    ),
    visitedPlaces: Object.keys(rooms),
    hasHeardPaperClueRule: true,
    consultedPeople: [
      'reynolds',
      'elizabeth',
      'gwendolen',
      'natasha',
      'turtle',
      'valjean',
      'spectre',
    ],
    isTrunkUnlocked: true,
    isStudyUnlocked: true,
  };
}

// const requiredInventoryForEnding = ['westing envelope', 'silver candlestick', 'twin notebook page', 'rewritten page'];

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
  const testState = TEST_ENDGAME ? TEST_getFullProgressState() : null;

  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    return hash || 'intro';
  });
  const [location, setLocation] = useState(testState?.location || START_ROOM);
  const [inventory, setInventory] = useState(testState?.inventory || ['handkerchief', 'hairpins',]);
  const [paperClues, setPaperClues] = useState(testState?.paperClues || []);
  const [roomObjects, setRoomObjects] = useState(() => Object.fromEntries(Object.entries(rooms).map(([key, room]) => [key, [...room.objects]])));
  const [roomPeople, setRoomPeople] = useState(() =>
    Object.fromEntries(
      Object.entries(rooms).map(([key, room]) => [key, [...room.people]])
    )
  );
  const [foundClues, setFoundClues] = useState(testState?.foundClues || []);
  const [clueSources, setClueSources] = useState(testState?.clueSources || {});
  const [visitedPlaces, setVisitedPlaces] = useState(testState?.visitedPlaces || [START_ROOM]);
  const [hasHeardPaperClueRule, setHasHeardPaperClueRule] = useState(testState?.hasHeardPaperClueRule || false);
  const [consultedPeople, setConsultedPeople] = useState(testState?.consultedPeople || []);
  const [visualText, setVisualText] = useState(testState ? rooms.study.image : rooms[START_ROOM].image);
  const [visualImage, setVisualImage] = useState(testState ? rooms.study.image : rooms[START_ROOM].image);
  const [message, setMessage] = useState(START_MESSAGE);
  const [command, setCommand] = useState('');
  const [isTrunkUnlocked, setIsTrunkUnlocked] = useState(testState?.isTrunkUnlocked || false);
  const [isStudyUnlocked, setIsStudyUnlocked] = useState(testState?.isStudyUnlocked || false);
  const [placeholderExamples, setPlaceholderExamples] = useState([]);
  const [finalMysteryStep, setFinalMysteryStep] = useState(null);
  const [finalMysteryMistakes, setFinalMysteryMistakes] = useState(0);
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const room = rooms[location];
  const visibleObjects = roomObjects[location] || [];
  const peopleHere = roomPeople[location] || [];
  const completedProgressMilestones = foundClues.filter(clue => progressBarMilestones.includes(clue)).length;
  const progress = Math.round((completedProgressMilestones / progressBarMilestones.length) * 100);
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
    My clue is "AT". I don’t know what it could mean.”`,

    valjean:
      `<p>“Miss Snow, welcome. We were sorry to miss you at luncheon.<br />  
      Lady Gray gave a curious speech. She said:<br />`  + formattedPoem + `<p>Then she distributed slips of paper to the guests. She says we will rediscover a treasure.<br />  
      My clue is "TEND." As the shepherd tends his flock.”</p>`,

    turtle:
      `<p>“Simone Snow! You missed lunch. I guess I'll catch you up.<br />  
      Lady Gray said we would "rediscover a treasure," whatever that means.<br />  
      Then she read us a poem. It was very old-fashioned; like her I guess. It went:<br />` + formattedPoem +
      `<p>Then she handed everybody a clue on a little piece of paper. Now everybody has one except you, I guess.<br />  
      Mine is "THE" - How useless.”</p>`,

    gwendolen:
      `<p>“Miss Snow, there you are. It is a pity you missed luncheon; there was such an excitement!<br />  
    Lady Gray told us we would rediscover a treasure. She read us a poem.<br /> I shall tell you all! She said:<br />` + formattedPoem +  `<p>Then Lady Gray distributed paper clues to all the guests. I consider the entire arrangement wonderfully dramatic.  
    But mine says "GRAY" how literally dull.<br /> I imagine you haven’t a clue of your own. Well, now you have mine, so that's a start.”</p>`
  };

  const paperClueKnownRules = {
    elizabeth:
      `<p>“Miss Snow,” Elizabeth says, “what do you make of our luncheon entertainment?”</p>

      <p>“It seems the hostess much enjoys having the advantage of her guests! Perhaps we can outwit her with our combined efforts.”</p>

      <p>“I should tell you, my clue is <strong>“LADY”</strong>. I cannot pretend it makes the matter clearer.”</p>`,

    natasha:
      `<p>“Miss Snow,” Natasha says, “you have heard about the luncheon? About Lady Gray’s poem and the treasure?”</p>

      <p>“Then I will not tell it all again, though I could. I keep repeating the lines in my head.”</p>

      <p>“My clue is <strong>“AT”</strong>. I don’t know what it could mean.”</p>`,

    valjean:
      `<p>“God keep you, Miss Snow,” Jeanne Valjean says. “You have heard, I trust, what happened at luncheon.”</p>
      <p>I think it is only right to tell you; my clue is "TEND." As the shepherd tends his flock.”</p>`,

    turtle:
      `<p>“Simone!” exclaims Turtle in greeting. ”So you already heard about lunch? Good. That saves time.”</p>

      <p>“Lady Gray made a speech, read a poem, promised treasure, blah, blah, blah.”</p>

      <p>“My clue is <strong>“THE”</strong>. It isn't a stock ticker, unfortunately.”</p>`,

    gwendolen:
      `<p>“Miss Snow,” Gwendolen says, “what do you think of Lady Gray’s theatrical little luncheon?”</p>

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
    if (TEST_ENDGAME) {
      goToPage('game');
      return;
    }

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

  function getRoomTitle(roomKey) {
    if (roomKey === 'study' && finalMysteryStep === 'complete') {
      return 'Saint Scholastica Hospital';
    }

    return rooms[roomKey].title;
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

    if (finalMysteryStep === 'poem-answer') {
      answerLadyGrayPoem(verb === 'answer' ? remainder : text);
      setCommand('');
      return;
    }

    if (finalMysteryStep === 'poem-acrostic-answer') {
      answerLadyGrayAcrostic(verb === 'answer' ? remainder : text);
      setCommand('');
      return;
    }

    if (finalMysteryStep === 'missing-story') {
      answerFinalMystery(verb === 'answer' ? remainder : text);
      setCommand('');
      return;
    }

    if (finalMysteryStep === 'write-ending') {
      finishStory(text);
      setCommand('');
      return;
    }

    if (verb === 'hint' || verb === 'hints') {
      goToPage('hints');
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
    - hint<br />
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
      return `<p>Mrs. Reynolds waits beside the foot of the stairs, composed as any housekeeper in a great estate ought to be.</p>`;
    }

    if (roomKey === 'drawingRoom') {
      const hasElizabeth = hasPerson('elizabeth');
      const hasGwendolen = hasPerson('gwendolen');

      if (hasElizabeth && hasGwendolen) {
        return `<p>Elizabeth Bennet and Gwendolen Fairfax should be divided by time but are certainly united by tea.</p> <p>Miss Bennet listens to Miss Fairfax with every appearance of polite amusement,<br /> however not, perhaps, for the reasons Gwendolen would wish.</p>`;
      }

      if (hasElizabeth) {
        return `<p>Elizabeth Bennet remains by the tea service, looking as if a study of the room has confirmed several of her private opinions.</p>`;
      }

      if (hasGwendolen) {
        return `<p>Gwendolen Fairfax sits in elegant possession of the conversation, whether or not anyone is there to attend to it.</p>`;      }

      return '';
    }

    if (roomKey === 'musicRoom' && hasPerson('natasha')) {
      return `<p>Natasha Rostova gazes distantly out the window, as if she can see the moon in the afternoon sky.</p>`;
    }

    if (roomKey === 'library' && hasPerson('turtle')) {
      return `<p>Tabitha Wexler, alias "Turtle", sits at a chessboard, moving pieces for both players.<br />
      Her gown is plausibly Regency; her signature braid is not.</p>`
    }

    if (roomKey === 'garden' && hasPerson('valjean')) {
      return `<p>Jeanne Valjean sits upon a stone seat; also out of time (though not by much.)<br /> Not the man you would expect to see; a woman.<br /> Beside her is a worn satchel, as though at any moment she may depart.</p>`
    }

    if (roomKey === 'attic' && hasPerson('spectre')) {
      return `A gray woman lingers in the room, but several inches off the ground.<br /> You do not fear her, although she is transparent and has your face.</p>`;
    }

    if (roomKey === 'study' && hasPerson('gray')) {
      return `<p>Lady Gray waits beside the writing desk, as though she has been expecting you to arrive at precisely this paragraph.</p>`;
    }

    return '';
  }

  function goTo(placeInput) {
    const requested = findRoomKey(placeInput);

    if (!requested) {
      write(`“${placeInput || 'That'}” is not a place you can go from here.`);
      return;
    }

    if (requested === location) {
      write(`<p>You are already in the ${getRoomTitle(location)}.</p>`);
      return;
    }

    const exitMatch = Object.values(room.exits).includes(requested);

    if (!exitMatch) {
      write(`You cannot reach the ${getRoomTitle(requested)} from here.`);
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

        <p>“Cecily,” Gwendolen says. “Cecily is a very sweet name, and she is quite, quite perfect.”</p>
        <p>In my acquisition of the all-important Earnest it appears I have gained something more precious: a sister.<p> <p>I shall try to bear this with the dignity such good fortune deserves.”</p>

        <p>Gwendolen walks away from you carrying the cigarette case rather tenderly.<br /> She disappears as though she has walked into the wings.</p>`);

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
      She was not the obstacle to my love story. Her love kept me alive.<br />  
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

        <p>“This is my sister Angela’s,” Turtle says.</p>
        
        <p>“Everybody kept acting like this was the ultimate prize. For Pretty Angela. Engaged Angela. Perfect Angela. She won.”<br/>
        Turlea closes her fist around the ring.</p>

        <p>“Angela almost blew up her own life because since she'd won, her life was already over.</p>
   
        <p>“I realized I wasn't the only Wexler sister who was being underestimated. Now Angela can go to medical school, and this ring can go back to Denton.”<br />
        <p>“Her life will be harder now, sure, but now she knows I’ve always got her back.”<br />
        <p>“Next time she decides to blow up her life, we'll blow it up together.”</p>

        <p>Turle makes disconcerting eye contact with you and whispers:</p>
        <p><i>BOOM.</i></p>

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
      My story began not with my love for Cosette, not with the love of the Bishop, but with my love for my sister.</p>
      <p>Victor Hugo thinks that, in his agony, a man would forget his family.<br /> 
      I do not believe a man would forget. And I know a <i>sister</i> never would.</p>
      <p>I was given these candlesticks to light my way once, and I will use them again now.<br /> 
      <p>I will find my sister and her family. I will raise us all to the light.”</p>
      <p>Jeanne Valjean takes up the candlesticks and walks down the garden path. For a moment the silver catches the light; then she is gone.</p>`);

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
    write(`Removed from reticule: ${found}. It is now in ${getRoomTitle(location)}.`);
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
      if (!['greatHall', 'study'].includes(location)) {
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

      setFinalMysteryStep('poem-answer');
      setFinalMysteryMistakes(0);
      write(getLadyGrayPoemQuestion());
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
        'A bird in the hand'
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
      <p>“Oh!” exclaims ${witness}. “But what does it mean??”</p>

      <p>“Oddly enough,” you reply, “I can think of several meanings...”</p>
    `;

    if (normalizedGuess === 'attendtheladygray') {
      write(`
        ${guessText}

        <p>The words nearly arrange themselves into sense.</p>

        <p><strong>“ATTEND THE LADY GRAY”</strong> is plausible, perhaps even polite. But something suggests a slightly different order.</p>

        <p>Try again.</p>
      `);
      return;
    }

    if (normalizePaperClueGuess(guess) === paperClueAnswer) {
      discover('paper-clue-answer', 'Solved paper clues', 'Paper clue phrase');

      write(`
        ${guessText}

        <p>The paper slips settle into order: <strong>“ATTEND THE GRAY LADY.”</strong></p>

        ${characterText}
      `);
    } else {
      write(`
        ${guessText}

        <p>No, that doesn't make sense.</p>
      `);
    }
  }

  function hasFound(clue) {
    return foundClues.includes(clue);
  }

  function getLadyGrayRemainingTasks() {
    const tasks = [];

    if (!hasFound('paper-clue-answer')) {
      tasks.push({
        label: 'The guests’ clues are not yet in their proper order.',
        hint: hasAllPaperClues()
          ? 'Arrange the clues into a proper sentence.'
          : 'Speak to guests to gather the slips of paper they graciously share.'
      });
    }

    if (!hasFound('bird-in-hand')) {
      tasks.push({
        label: 'You’ve not received a clue of your own.',
        hint: 'Speak to Mrs. Reynolds again in the Great Hall.'
      });
    }

    if (!hasFound('gray-lady-newspaper')) {
      tasks.push({
        label: 'You have not seen the Gray Lady in the library.',
        hint: 'Examine the newspaper to learn more about the unusual weather.'
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
        hint: 'A certain cigarette case should be given to her.'
      });
    }

    if (!hasFound('natasha-sonya-realization')) {
      tasks.push({
        label: 'Natasha has not yet understood her friend’s importance.',
        hint: 'There is a love letter in the Drawing Room.'
      });
    }

    if (!hasFound('turtle-angela-ring-realization')) {
      tasks.push({
        label: 'Turtle should be given something that will only be returned.',
        hint: 'Something was purposefully lost in the garden.'
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

  function getLadyGrayPoemQuestion() {
    return `
      <p>Lady Gray wears a gown that has made several concessions to the 21st century.<br /> She is half Regency mistress and half contemporary academic; somehow both warm and imperious.<br />
      Her hazel eyes twinkle behind rainbow-patterned glasses.<br /> From beneath her sleeve peeks the edge of a tattoo, and her fingers are stained with ink.</p>
      
      <p>“Simone!” she cries.“So glad you could <i>attend</i>.”<br />
      “You have found the answer in my poem, I hope.”</p>

      “Yes.” you reply. “The birthright of each guest. A forgotten treasure within each story.”</p>
      <p>“Their sisters.”</p>

      <p>Lady Gray smiles wryly. “Yes. You have found the meaning. But!”<br />
        “With another read, do you know the <i>answer</i>? Eight letters.”</p>

      <p>Try: <strong>answer [eight letters]</strong></p>
    `;
  }

  function advanceToBirdInHandQuestion() {
    setFinalMysteryStep('missing-story');
    setFinalMysteryMistakes(0);
  }

  function answerLadyGrayPoem(answer) {
    const normalizedAnswer = normalize(answer).replace(/\s+/g, '');

    if (normalizedAnswer === 'cathwren') {
      write(`
        <p>You answer, “CATHWREN.”</p>

        <p>Lady Gray smiles. “Yes. Cath and Wren. One name made of two names; two sisters made into one answer.”</p>

        <p>“Knowing that,” she says, “what does <em>a bird in the hand</em> mean?”</p><p> “A bird in the hand is worth two... somewhere...,“ you stammer in reply.</p> <p>“Good!“ encourages Lady Gray. “Do you know who is missing from your story?”</p>`
      );

      advanceToBirdInHandQuestion();
      return;
    }

    if (normalizedAnswer.includes('firstletter') && normalizedAnswer.includes('sentence')) {
      write(`
        <p>You say, “Type the first letter of each sentence.”</p>

        <p>Lady Gray smiles. “Just so. And what do those first letters spell?”</p>

        <p>Try: <strong>answer [eight letters]</strong></p>
      `);

      setFinalMysteryStep('poem-acrostic-answer');
      return;
    }

    write(`
      <p>You answer, “${answer}.”</p>

      <p>Lady Gray considers how best to correct you.</p>

      <p>“If you are still at a loss, you can always consult your <a class="story-link" href="#/hints" style="color: white; font-weight: bold; text-decoration: underline;">research</a>.”</p>

      <p>“If I tell you to look for an acrostic, what do you see?”</p>

      <p>Try: <strong>answer [eight letters]</strong></p>
    `);

    setFinalMysteryStep('poem-acrostic-answer');
  }

  function answerLadyGrayAcrostic(answer) {
    const normalizedAnswer = normalize(answer).replace(/\s+/g, '');

    if (normalizedAnswer === 'cathwren') {
      write(`
        <p>You answer, “CATHWREN.”</p>

        <p>Lady Gray smiles. “Yes. Cath and Wren. One name made of two names; two sisters made into one answer.”</p>

        <p>“Knowing that,” she says, “what does <em>a bird in the hand</em> mean?”</p>
      `);
    } else {
      write(`
        <p>You answer, “${answer}.”</p>

        <p>Lady Gray shakes her head, not unkindly.</p>

        <p>“The answer is <strong>CATHWREN</strong>.”</p>

        <p>“Knowing that,” she says, “what does <em>a bird in the hand</em> mean?”</p>
      `);
    }

    advanceToBirdInHandQuestion();
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
    function revealFinalMystery() {
      discover('final-mystery-answered', 'Answered Lady Gray’s final question', 'Answered final mystery');
      setFinalMysteryStep('write-ending');
      setFinalMysteryMistakes(0);

      write(`
        <p>“The answer is the second, the bird, your twin sister, <i>Wren</i>,” says Lady Gray.</p>

        <p>“You are, of course, novelist Cath Avery, twin sister to Wren Avery.</p>
        <p>“There was a car accident,” Lady Gray says. “Another late-season Nebraska snow storm.”</p>
        <p>“It's you who are missing. In the waking world, you are in the kind of melodramatic scenario that would make a writer wince.”</p>
        <p>The red roses through the frosted window blur into brake lights.</p>
        <p>“Wren has been by your side, telling you stories you know by heart. But!<br /> Ever the editor, she has altered them.<br /> She promoted the sisters in stories that have undervalued them.<br /> Sonya beside Natasha. Jane beside Elizabeth. Angela beside Turtle. Jean as Jeanne, with the beloved sister Victor Hugo never even bothered to name!”</p>
        <p>“Wren has been calling you back with her stories.”</p>

        <p>Lady Gray indicates the chair with a sweep of her hand.</p>
        <p>The desk waits. The paper is blank. Lady Gray holds out her quill pen.</p>
        <p>“Sit,” Lady Gray says, “and write the next chapter of your life.”</p>
        <p>Try: <strong>write next chapter</strong></p>
      `);
    }

    if (answerIncludesMissingSister(answer)) {
      revealFinalMystery();
      return;
    }

    const nextMistakeCount = finalMysteryMistakes + 1;

    if (nextMistakeCount >= 3) {
      revealFinalMystery();
      return;
    }

    setFinalMysteryMistakes(nextMistakeCount);

    write(`
      <p>Lady Gray regards you patiently.</p>

      <p>“Not quite,” she says. “The key is that there are two. And you are one of two.”</p>

      <p>“A bird in the hand,” she says again. “Who has been beside you all along?”</p>

      <p>${3 - nextMistakeCount} ${3 - nextMistakeCount === 1 ? 'guess remains' : 'guesses remain'}.</p>
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
        <p>The paper waits.</p>

        <p>Lady Gray says, “There are no more riddles. Just write.”</p>

        <p>Try: <strong>write next chapter</strong></p>
      `);

      return;
    }

    discover('chapter-written', 'Wrote the next chapter', 'Wrote chapter');
    setFinalMysteryStep('complete');
    setVisualImage(`${import.meta.env.BASE_URL}images/hospital.png`)
    write(`
      <p>You sit at the desk.</p>

      <p>For a moment, you do not know how to begin. Then, you do.</p>

      <blockquote>
        <p><em>The snow stopped before morning.</em></p>
      </blockquote>

      <p>Westmoor Hall closes itself like a book: the fogged windows, the red roses, the silver candlesticks, the impossible snow all fold back into the pages.</p>
      
      <p>Darkness expands in the center of your vision, as though you are tumbling into the inkwell.</p>
      
      <p>You wake to white ceiling tiles, the soft mechanical rhythms of a hospital room, and your sister asleep in the chair beside your bed.</p>
      
      <p>Wren’s hand is wrapped around yours.</p>

      <p>There are flowers on the table. White and red roses, with a card tucked among the stems.</p>

      <p><em>From Professor Piper, who expects the next chapter when you are ready.</em></p>

      <p>Wren opens her eyes.</p>

      <p>For once, neither of you says the clever thing first.</p>

      <p>You squeeze her hand.</p>

      <p>And the story goes on.</p>
    `);
  }

  function writeEnding() {
    if (location !== 'study') {
      write('The ending must be written in Lady Gray’s study, where the altered pages have gathered.');
      return;
    }

    if (!isReadyForLadyGray()) {
      write(getLadyGrayGuidance());
      return;
    }

    setFinalMysteryStep('poem-answer');
    setFinalMysteryMistakes(0);
    write(getLadyGrayPoemQuestion());
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
              Westmoor Hall stands east of the village and west of nothing at all.<br/ > 
              There is not a moor for 50 miles or... more.
            </p>
            <p>You know <i>when</i> it must be: all candles, carriages, and careful manners.<br />
            It is impossibly early for you to be here but, all the same, you know you are late.</p>
            <p>You do not recall <i>why</i> you are here, but at least you are dressed appropriately.<br />
                You wear a pale muslin afternoon dress, and are neatly gloved, of course.<br />
    Your reticule hangs from your wrist containing a handkerchief, three hairpins, and no explanations whatsoever.</p>
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

return (
  <>
    <main>
          <aside className="sidebar" aria-label="Game tracking">


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

        {foundClues.includes('bird-in-hand') && (
          <div className="paper-clues-section">
            <p className="paper-clues-list">
              <strong>Your clue:</strong> A bird in the hand
            </p>
          </div>
        )}

        {paperClues.length > 0 && (
          <div className="paper-clues-section">
            <p className="paper-clues-list">
              <strong>Guests' clues:</strong>{' '}
              {foundClues.includes('paper-clue-answer') ? (
                <span style={{ fontWeight: 'bold' }}>
                  ATTEND THE GRAY LADY
                </span>
              ) : (
                paperClues.join(', ')
              )}
            </p>

            {hasAllPaperClues() && !foundClues.includes('paper-clue-answer') && (
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

      <section className="side-card sidebar-visual-card" aria-label="Current story image placeholder">
        <h2>{getRoomTitle(location)}</h2>
          <img
            src={visualImage}
            alt={rooms[location].title}
            className="visual-image"
          />
      </section>

      <section className='music-section'>
        <button
          type="button"
          className="music-button"
          onClick={toggleMusic}
        >
          {musicPlaying
            ? 'X Silence the musicians X'
            : '♪ Engage the musicians ♫'}
        </button>
      </section>
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
      <p className="progress">Story Progress: {completedProgressMilestones}/{progressBarMilestones.length}</p>

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
