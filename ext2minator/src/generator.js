'use strict';

/**
 * Outputs a string of length "size".
 *
 * @param {Integer} size
 * @return A string of length "size".
 */
function generateString(size) {
    // Number of text blocks to choose from:
    var options = 3;

    if (size === 0)
        return '';

    // Random number to decide which block of text to pick from:
    var selection = Math.floor(Math.random() * options);

    var present = getSelection(selection);
    while (present.length < size){
        present += getSelection(selection);
    }

    return present.substring(0, size);
}

/**
 * Returns a preset string corresponding to "options".
 *
 * @param {Integer} options
 * @return A preset string.
 */
function getSelection(options){
    var present = '';

    switch (options) {
        case 0:
            present = "Lorem ipsum dolor sit amet, consectetur adipiscing \
elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi \
ut aliquip ex ea commodo consequat. Duis aute irure dolor in \
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla \
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa \
qui officia deserunt mollit anim id est laborum\n";
            break;
        case 1:
            present = "`When I'M a Duchess,' she said to herself, (not in a \
very hopeful tone though), `I won't have any pepper in my kitchen AT ALL. \
Soup does very well without--Maybe it's always pepper that makes people \
hot-tempered,' she went on, very much pleased at having found out a new \
kind of rule, `and vinegar that makes them sour--and camomile that makes \
them bitter--and--and barley-sugar and such things that make children \
sweet-tempered. I only wish people knew that: then they wouldn't be so \
stingy about it, you know--'\n";
            break;
        case 2:
            present='Once upon a midnight dreary, while I pondered, weak and \
weary,\n\
Over many a quaint and curious volume of forgotten lore—\n\
While I nodded, nearly napping, suddenly there came a tapping,\n\
As of some one gently rapping, rapping at my chamber door.\n\
“`Tis some visitor,” I muttered, “tapping at my chamber door—\n\
Only this and nothing more.”\n\
\n\
Ah, distinctly I remember it was in the bleak December;\n\
And each separate dying ember wrought its ghost upon the floor.\n\
Eagerly I wished the morrow;—vainly I had sought to borrow\n\
From my books surcease of sorrow—sorrow for the lost Lenore—\n\
For the rare and radiant maiden whom the angels name Lenore—\n\
Nameless here for evermore.\n\
\n\
And the silken, sad, uncertain rustling of each purple curtain\n\
Thrilled me—filled me with fantastic terrors never felt before;\n\
So that now, to still the beating of my heart, I stood repeating\n\
“Tis some visitor entreating entrance at my chamber door—\n\
Some late visitor entreating entrance at my chamber door;—\n\
This it is and nothing more.”\n\
\n\
Presently my soul grew stronger; hesitating then no longer,\n\
“Sir,” said I, “or Madam, truly your forgiveness I implore;\n\
But the fact is I was napping, and so gently you came rapping,\n\
And so faintly you came tapping, tapping at my chamber door,\n\
That I scarce was sure I heard you”—here I opened wide the door;—\n\
Darkness there and nothing more.\n\
\n\
Deep into that darkness peering, long I stood there wondering, fearing,\n\
Doubting, dreaming dreams no mortal ever dared to dream before;\n\
But the silence was unbroken, and the stillness gave no token,\n\
And the only word there spoken was the whispered word, “Lenore?”\n\
This I whispered, and an echo murmured back the word, “Lenore!”—\n\
Merely this and nothing more.\n\
\n\
Back into the chamber turning, all my soul within me burning,\n\
Soon again I heard a tapping somewhat louder than before.\n\
“Surely,” said I, “surely that is something at my window lattice;\n\
Let me see, then, what thereat is, and this mystery explore—\n\
Let my heart be still a moment and this mystery explore;—\n\
`Tis the wind and nothing more!”\n\
\n\
Open here I flung the shutter, when, with many a flirt and flutter,\n\
In there stepped a stately Raven of the saintly days of yore;\n\
Not the least obeisance made he; not a minute stopped or stayed he;\n\
But, with mien of lord or lady, perched above my chamber door—\n\
Perched upon a bust of Pallas just above my chamber door—\n\
Perched, and sat, and nothing more.\n\
\n\
Then this ebony bird beguiling my sad fancy into smiling,\n\
By the grave and stern decorum of the countenance it wore,\n\
“Though thy crest be shorn and shaven, thou,” I said, “art sure no craven,\n\
Ghastly grim and ancient Raven wandering from the Nightly shore—\n\
Tell me what thy lordly name is on the Night’s Plutonian shore!”\n\
Quoth the Raven “Nevermore.”\n\
\n\
Much I marvelled this ungainly fowl to hear discourse so plainly,\n\
Though its answer little meaning—little relevancy bore;\n\
For we cannot help agreeing that no living human being\n\
Ever yet was blessed with seeing bird above his chamber door—\n\
Bird or beast upon the sculptured bust above his chamber door,\n\
With such name as “Nevermore.”\n\
\n\
But the Raven, sitting lonely on the placid bust, spoke only\n\
That one word, as if his soul in that one word he did outpour.\n\
Nothing farther then he uttered—not a feather then he fluttered—\n\
Till I scarcely more than muttered “Other friends have flown before—\n\
On the morrow he will leave me, as my Hopes have flown before.”\n\
Then the bird said “Nevermore.”\n\
\n\
Startled at the stillness broken by reply so aptly spoken,\n\
“Doubtless,” said I, “what it utters is its only stock and store\n\
Caught from some unhappy master whom unmerciful Disaster\n\
Followed fast and followed faster till his songs one burden bore—\n\
Till the dirges of his Hope that melancholy burden bore\n\
Of ‘Never—nevermore’.”\n\
\n\
But the Raven still beguiling all my fancy into smiling,\n\
Straight I wheeled a cushioned seat in front of bird, and bust and door;\n\
Then, upon the velvet sinking, I betook myself to linking\n\
Fancy unto fancy, thinking what this ominous bird of yore—\n\
What this grim, ungainly, ghastly, gaunt, and ominous bird of yore\n\
Meant in croaking “Nevermore.”\n\
\n\
This I sat engaged in guessing, but no syllable expressing\n\
To the fowl whose fiery eyes now burned into my bosom’s core;\n\
This and more I sat divining, with my head at ease reclining\n\
On the cushion’s velvet lining that the lamp-light gloated o’er,\n\
But whose velvet-violet lining with the lamp-light gloating o’er,\n\
She shall press, ah, nevermore!\n\
\n\
Then, methought, the air grew denser, perfumed from an unseen censer\n\
Swung by Seraphim whose foot-falls tinkled on the tufted floor.\n\
“Wretch,” I cried, “thy God hath lent thee—by these angels he hath sent \
thee\n\
Respite—respite and nepenthe from thy memories of Lenore;\n\
Quaff, oh quaff this kind nepenthe and forget this lost Lenore!”\n\
Quoth the Raven “Nevermore.”\n\
\n\
“Prophet!” said I, “thing of evil!—prophet still, if bird or devil!—\n\
Whether Tempter sent, or whether tempest tossed thee here ashore,\n\
Desolate yet all undaunted, on this desert land enchanted—\n\
On this home by Horror haunted—tell me truly, I implore—\n\
Is there—is there balm in Gilead?—tell me—tell me, I implore!”\n\
Quoth the Raven “Nevermore.”\n\
\n\
“Prophet!” said I, “thing of evil!—prophet still, if bird or devil!\n\
By that Heaven that bends above us—by that God we both adore—\n\
Tell this soul with sorrow laden if, within the distant Aidenn,\n\
It shall clasp a sainted maiden whom the angels name Lenore—\n\
Clasp a rare and radiant maiden whom the angels name Lenore.”\n\
Quoth the Raven “Nevermore.”\n\
\n\
“Be that word our sign of parting, bird or fiend!” I shrieked, \
upstarting—\n\
“Get thee back into the tempest and the Night’s Plutonian shore!\n\
Leave no black plume as a token of that lie thy soul hath spoken!\n\
Leave my loneliness unbroken!—quit the bust above my door!\n\
Take thy beak from out my heart, and take thy form from off my door!”\n\
Quoth the Raven “Nevermore.”\n\
\n\
And the Raven, never flitting, still is sitting, still is sitting\n\
On the pallid bust of Pallas just above my chamber door;\n\
And his eyes have all the seeming of a demon’s that is dreaming,\n\
And the lamp-light o’er him streaming throws his shadow on the floor;\n\
And my soul from out that shadow that lies floating on the floor\n\
Shall be lifted—nevermore!;\n'
            break;
        // This shouldn't happen unless 'options' or 'selection' is off:
        default:
            present = "Someone messed something up.\n"
    }
    return present;
}
