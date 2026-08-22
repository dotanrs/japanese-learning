const puzzles = {
  id: 'sentence-builder',
  title: 'Sentence Builder',
  intro:
    'Put the Japanese word groups into one natural order. Hover or focus a tile for its meaning, then check your sentence to unlock the grammar behind it.',
  puzzles: [
    {
      id: 'morning-coffee',
      title: 'Morning coffee',
      icon: '☕',
      prompt: 'I drink coffee every morning.',
      pieces: [
        { id: 'topic', jp: 'わたしは', romaji: 'watashi wa', en: 'I / as for me' },
        { id: 'time', jp: 'まいあさ', romaji: 'maiasa', en: 'every morning' },
        { id: 'object', jp: 'コーヒーを', romaji: 'koohii o', en: 'coffee (object)' },
        { id: 'verb', jp: 'のみます', romaji: 'nomimasu', en: 'drink' },
      ],
      scrambled: ['object', 'verb', 'topic', 'time'],
      answer: ['topic', 'time', 'object', 'verb'],
      acceptedAnswers: [
        ['topic', 'time', 'object', 'verb'],
        ['time', 'topic', 'object', 'verb'],
      ],
      pattern: 'Topic + time + object + verb',
      explanation:
        'は (wa) marks わたし as the topic. The time word まいあさ needs no particle, を marks coffee as the direct object, and the action のみます comes last. Japanese time phrases can also lead the sentence, so “まいあさ わたしは …” is accepted too.',
    },
    {
      id: 'station',
      title: 'Find the station',
      icon: '🚉',
      prompt: 'Where is the train station?',
      pieces: [
        { id: 'topic', jp: 'えきは', romaji: 'eki wa', en: 'the station / as for the station' },
        { id: 'where', jp: 'どこ', romaji: 'doko', en: 'where' },
        { id: 'question', jp: 'ですか', romaji: 'desu ka', en: 'is it? (polite question)' },
      ],
      scrambled: ['question', 'topic', 'where'],
      answer: ['topic', 'where', 'question'],
      pattern: 'Topic + question word + ですか',
      explanation:
        'えき is introduced as the topic with は. The missing information, どこ (where), sits where the answer would go, and ですか closes the sentence politely: です links the topic to the answer and か turns it into a question.',
    },
    {
      id: 'ramen',
      title: 'Ramen stop',
      icon: '🍜',
      prompt: 'I will eat ramen at the restaurant.',
      pieces: [
        { id: 'place', jp: 'レストランで', romaji: 'resutoran de', en: 'at the restaurant' },
        { id: 'object', jp: 'ラーメンを', romaji: 'raamen o', en: 'ramen (object)' },
        { id: 'verb', jp: 'たべます', romaji: 'tabemasu', en: 'eat / will eat' },
      ],
      scrambled: ['verb', 'object', 'place'],
      answer: ['place', 'object', 'verb'],
      pattern: 'Place of action + object + verb',
      explanation:
        'で marks the restaurant as the place where the action happens. を marks ramen as what is eaten, and たべます comes last. The polite non-past form can mean either “eat” or “will eat”; context supplies the future meaning here.',
    },
    {
      id: 'kyoto',
      title: 'Kyoto tomorrow',
      icon: '🚄',
      prompt: 'Tomorrow I will go to Kyoto by train.',
      pieces: [
        { id: 'time', jp: 'あした', romaji: 'ashita', en: 'tomorrow' },
        { id: 'means', jp: 'でんしゃで', romaji: 'densha de', en: 'by train' },
        { id: 'destination', jp: 'きょうとに', romaji: 'Kyouto ni', en: 'to Kyoto' },
        { id: 'verb', jp: 'いきます', romaji: 'ikimasu', en: 'go / will go' },
      ],
      scrambled: ['destination', 'verb', 'time', 'means'],
      answer: ['time', 'means', 'destination', 'verb'],
      acceptedAnswers: [
        ['time', 'means', 'destination', 'verb'],
        ['time', 'destination', 'means', 'verb'],
      ],
      pattern: 'Time + means + destination + movement verb',
      explanation:
        'あした sets the time without a particle. で marks the means of travel, に marks Kyoto as the destination, and the movement verb いきます finishes the thought. The train and destination phrases may trade places, so both natural versions are accepted.',
    },
    {
      id: 'tickets',
      title: 'Two tickets',
      icon: '🎫',
      prompt: 'Please give me two tickets.',
      pieces: [
        { id: 'object', jp: 'きっぷを', romaji: 'kippu o', en: 'tickets (object)' },
        { id: 'quantity', jp: 'にまい', romaji: 'nimai', en: 'two flat items' },
        { id: 'request', jp: 'ください', romaji: 'kudasai', en: 'please give me' },
      ],
      scrambled: ['request', 'quantity', 'object'],
      answer: ['object', 'quantity', 'request'],
      pattern: 'Object + quantity/counter + ください',
      explanation:
        'を marks tickets as the thing requested. にまい means “two” with まい, the counter for flat objects such as tickets, and normally follows the counted item. ください comes last to make the polite request “please give me …”.',
    },
    {
      id: 'did-not-understand',
      title: 'Lost in translation',
      icon: '💬',
      prompt: 'I did not understand Japanese.',
      pieces: [
        { id: 'language', jp: 'にほんごが', romaji: 'nihongo ga', en: 'Japanese (thing understood)' },
        { id: 'verb', jp: 'わかりませんでした', romaji: 'wakarimasen deshita', en: 'did not understand' },
      ],
      scrambled: ['verb', 'language'],
      answer: ['language', 'verb'],
      pattern: 'Thing understood + が + negative-past verb',
      explanation:
        'With わかる, Japanese marks the thing that is understood with が, not を. わかりません is “do not understand”; adding でした makes that polite negative form past: “did not understand.” The speaker is clear from context and can be omitted.',
    },
    {
      id: 'photo',
      title: 'A photo here',
      icon: '📷',
      prompt: 'May I take a picture here?',
      pieces: [
        { id: 'place', jp: 'ここで', romaji: 'koko de', en: 'here (place of action)' },
        { id: 'object', jp: 'しゃしんを', romaji: 'shashin o', en: 'a picture (object)' },
        { id: 'permission-action', jp: 'とっても', romaji: 'tottemo', en: 'even if I take' },
        { id: 'permission', jp: 'いいですか', romaji: 'ii desu ka', en: 'is it okay?' },
      ],
      scrambled: ['permission', 'object', 'place', 'permission-action'],
      answer: ['place', 'object', 'permission-action', 'permission'],
      pattern: 'Place + object + て-form + もいいですか',
      explanation:
        'で marks where the action happens and を marks what is taken. とって is the て-form of とる (to take); adding もいいですか literally asks “is it okay even if I take it?” Together, て-form + もいいですか is the standard way to ask permission.',
    },
    {
      id: 'hotel',
      title: 'Hotel location',
      icon: '🏨',
      prompt: 'The hotel is near the station.',
      pieces: [
        { id: 'topic', jp: 'ホテルは', romaji: 'hoteru wa', en: 'the hotel / as for the hotel' },
        { id: 'reference', jp: 'えきの', romaji: 'eki no', en: 'of the station / station’s' },
        { id: 'location', jp: 'ちかくに', romaji: 'chikaku ni', en: 'nearby / in the vicinity' },
        { id: 'exists', jp: 'あります', romaji: 'arimasu', en: 'exists / is (inanimate)' },
      ],
      scrambled: ['location', 'exists', 'reference', 'topic'],
      answer: ['topic', 'reference', 'location', 'exists'],
      pattern: 'Topic + reference の + location に + あります',
      explanation:
        'ホテル is the topic. えきの modifies ちかく, giving “the station’s vicinity,” and に marks that as the hotel’s location. あります is used for the existence or location of an inanimate thing; a person or animal would use います.',
    },
    {
      id: 'rainy-taxi',
      title: 'Rainy taxi',
      icon: '☔',
      prompt: 'Because it is raining, I will go by taxi.',
      pieces: [
        { id: 'weather', jp: 'あめが', romaji: 'ame ga', en: 'rain (subject)' },
        { id: 'reason', jp: 'ふっていますから', romaji: 'futte imasu kara', en: 'because it is falling' },
        { id: 'means', jp: 'タクシーで', romaji: 'takushii de', en: 'by taxi' },
        { id: 'verb', jp: 'いきます', romaji: 'ikimasu', en: 'go / will go' },
      ],
      scrambled: ['means', 'reason', 'verb', 'weather'],
      answer: ['weather', 'reason', 'means', 'verb'],
      pattern: 'Reason + から + main action',
      explanation:
        'あめ is the subject of ふっています, “is falling,” so it takes が. から attaches to that complete reason and means “because.” The result follows: タクシーで uses で to mark the means of travel, and いきます supplies the final action.',
    },
    {
      id: 'souvenir',
      title: 'Family souvenir',
      icon: '🎁',
      prompt: 'I want to buy a small souvenir for my family.',
      pieces: [
        { id: 'recipient', jp: 'かぞくに', romaji: 'kazoku ni', en: 'for my family' },
        { id: 'adjective', jp: 'ちいさい', romaji: 'chiisai', en: 'small' },
        { id: 'object', jp: 'おみやげを', romaji: 'omiyage o', en: 'souvenir (object)' },
        { id: 'desire', jp: 'かいたいです', romaji: 'kaitai desu', en: 'want to buy' },
      ],
      scrambled: ['desire', 'object', 'recipient', 'adjective'],
      answer: ['recipient', 'adjective', 'object', 'desire'],
      pattern: 'Recipient + adjective + object + ～たいです',
      explanation:
        'に marks the family as the intended recipient. The い-adjective ちいさい goes directly before the noun it describes, おみやげ; を then marks that noun phrase as the object. Replacing ます in かいます with たいです produces かいたいです, “want to buy.”',
    },
  ],
}

export default puzzles
