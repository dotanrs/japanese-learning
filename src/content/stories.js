// Short dialogue stories. Every one is built around a turn — a pun, a
// reversal, a literal reading — so it pays off in six to nine lines.
//
// Each line is { speaker?, jp, romaji, en }. A line without a speaker is
// narration. `jp` is what speech synthesis reads aloud, so it holds only the
// sentence — the speaker label lives outside it. `catch` explains the turn in
// English and stays hidden until the reader asks for it.
//
// Grammar is kept to what the course teaches: -masu forms, plain particles,
// no keigo beyond the set phrases from Chapter 6.
export default {
  id: 'stories',
  title: 'Short Stories',
  intro:
    'Seven very short stories, almost all dialogue, each with a sting in the tail. ' +
    'Tap any sentence to see the English. Play a line, or let the whole story run.',
  stories: [
    {
      id: 'hashi',
      title: 'Do Not Cross This Bridge',
      jpTitle: 'このはしわたるな',
      icon: '🌉',
      blurb: 'A famous Ikkyū riddle. Eight lines, one pun.',
      cast: 'Ikkyū, a boy monk · a guard',
      lines: [
        {
          jp: '一休さんは、小さな橋の前に立ちました。',
          romaji: 'Ikkyuu-san wa, chiisana hashi no mae ni tachimashita.',
          en: 'Ikkyū stopped in front of a small bridge.',
        },
        {
          jp: '立て札に「このはしわたるな」と書いてあります。',
          romaji: 'Tatefuda ni "kono hashi wataru na" to kaite arimasu.',
          en: 'A sign read: "Do not cross this bridge."',
        },
        {
          speaker: 'Guard',
          jp: '読めますか。この橋を渡ってはいけません。',
          romaji: 'Yomemasu ka. Kono hashi o watatte wa ikemasen.',
          en: 'Can you read? You must not cross this bridge.',
        },
        {
          speaker: 'Ikkyū',
          jp: 'はい、読めます。',
          romaji: 'Hai, yomemasu.',
          en: 'Yes, I can read.',
        },
        {
          jp: 'そう言って、一休さんは橋の真ん中を歩いて渡りました。',
          romaji: 'Sou itte, Ikkyuu-san wa hashi no man-naka o aruite watarimashita.',
          en: 'Saying that, Ikkyū walked across the middle of the bridge.',
        },
        {
          speaker: 'Guard',
          jp: 'こら。渡るなと書いてありますよ。',
          romaji: 'Kora. Wataru na to kaite arimasu yo.',
          en: 'Hey! It says do not cross!',
        },
        {
          speaker: 'Ikkyū',
          jp: 'はい。だから、端は渡りませんでした。',
          romaji: 'Hai. Dakara, hashi wa watarimasen deshita.',
          en: "Yes. That's why I didn't cross the edge.",
        },
      ],
      catch:
        'Written in kana, はし *hashi* is two words: 橋 (bridge) and 端 (edge). ' +
        'Read the second way, the sign forbids only the edges — so the middle was ' +
        'never off limits.',
    },
    {
      id: 'byoubu',
      title: 'The Tiger in the Screen',
      jpTitle: '屏風の虎',
      icon: '🐯',
      blurb: 'Ikkyū is handed an impossible job, and accepts it.',
      cast: 'The shogun · Ikkyū',
      lines: [
        {
          jp: '将軍が一休さんを呼びました。',
          romaji: 'Shougun ga Ikkyuu-san o yobimashita.',
          en: 'The shogun summoned Ikkyū.',
        },
        {
          speaker: 'Shogun',
          jp: 'この屏風の虎が、毎晩出てきて困ります。',
          romaji: 'Kono byoubu no tora ga, maiban dete kite komarimasu.',
          en: 'The tiger in this screen comes out every night and troubles me.',
        },
        {
          speaker: 'Shogun',
          jp: '縛ってください。',
          romaji: 'Shibatte kudasai.',
          en: 'Tie it up, please.',
        },
        {
          speaker: 'Ikkyū',
          jp: 'わかりました。縄を貸してください。',
          romaji: 'Wakarimashita. Nawa o kashite kudasai.',
          en: 'Understood. Please lend me a rope.',
        },
        {
          jp: '一休さんは縄を持って、屏風の前に座りました。',
          romaji: 'Ikkyuu-san wa nawa o motte, byoubu no mae ni suwarimashita.',
          en: 'Ikkyū took the rope and sat down in front of the screen.',
        },
        {
          speaker: 'Ikkyū',
          jp: '準備ができました。では、虎を出してください。',
          romaji: 'Junbi ga dekimashita. Dewa, tora o dashite kudasai.',
          en: "I'm ready. Now please drive the tiger out.",
        },
        {
          speaker: 'Shogun',
          jp: '絵の虎は出せません。',
          romaji: 'E no tora wa dasemasen.',
          en: "I can't make a painted tiger come out.",
        },
        {
          speaker: 'Ikkyū',
          jp: '出てこない虎は、縛れません。',
          romaji: 'Dete konai tora wa, shibaremasen.',
          en: "A tiger that doesn't come out can't be tied up.",
        },
      ],
      catch:
        'Ikkyū never argues that the task is impossible. He agrees to it completely, ' +
        'and hands back the half that was impossible all along.',
    },
    {
      id: 'hae',
      title: 'The Fly in the Soup',
      jpTitle: 'スープの中のハエ',
      icon: '🍲',
      blurb: 'A complaint, handled with total professionalism.',
      cast: 'A customer · a waiter',
      lines: [
        {
          speaker: 'Customer',
          jp: 'すみません。スープにハエが入っています。',
          romaji: 'Sumimasen. Suupu ni hae ga haitte imasu.',
          en: "Excuse me. There's a fly in my soup.",
        },
        {
          speaker: 'Waiter',
          jp: '少々お待ちください。',
          romaji: 'Shoushou omachi kudasai.',
          en: 'One moment, please.',
        },
        {
          jp: '店員は小さい声で言いました。',
          romaji: "Ten'in wa chiisai koe de iimashita.",
          en: 'The waiter said, in a small voice:',
        },
        {
          speaker: 'Waiter',
          jp: 'お客様、大きい声で言わないでください。',
          romaji: 'Okyaku-sama, ookii koe de iwanaide kudasai.',
          en: "Sir, please don't say it so loudly.",
        },
        {
          speaker: 'Customer',
          jp: 'なぜですか。',
          romaji: 'Naze desu ka.',
          en: 'Why?',
        },
        {
          speaker: 'Waiter',
          jp: 'みんなが一つ欲しくなりますから。',
          romaji: 'Minna ga hitotsu hoshiku narimasu kara.',
          en: 'Because everyone will want one.',
        },
      ],
      catch:
        'The waiter never denies the fly. He reclassifies it — from a mistake into ' +
        'the house speciality, in short supply.',
    },
    {
      id: 'itai',
      title: 'It Hurts When I Press',
      jpTitle: '押すと痛いです',
      icon: '🩺',
      blurb: 'A thorough examination reaches a diagnosis.',
      cast: 'A patient · a doctor',
      lines: [
        {
          speaker: 'Patient',
          jp: '先生、ここを押すと痛いです。',
          romaji: 'Sensei, koko o osu to itai desu.',
          en: 'Doctor, when I press here it hurts.',
        },
        {
          speaker: 'Doctor',
          jp: 'ここもですか。',
          romaji: 'Koko mo desu ka.',
          en: 'Here too?',
        },
        {
          speaker: 'Patient',
          jp: 'はい、そこも痛いです。',
          romaji: 'Hai, soko mo itai desu.',
          en: 'Yes, that hurts too.',
        },
        {
          speaker: 'Doctor',
          jp: 'じゃあ、ここはどうですか。',
          romaji: 'Jaa, koko wa dou desu ka.',
          en: 'And how about here?',
        },
        {
          speaker: 'Patient',
          jp: 'そこも痛いです。とても心配です。',
          romaji: 'Soko mo itai desu. Totemo shinpai desu.',
          en: "That hurts too. I'm very worried.",
        },
        {
          speaker: 'Doctor',
          jp: 'わかりました。私の指が折れていますね。',
          romaji: 'Wakarimashita. Watashi no yubi ga orete imasu ne.',
          en: 'I see. My finger is broken.',
        },
      ],
      catch:
        'Every answer was true, and every answer was about the doctor. The pain ' +
        'followed the hand doing the pressing, not the body being pressed.',
    },
    {
      id: 'kagi',
      title: 'Where Is the Key?',
      jpTitle: '鍵はどこですか',
      icon: '🔑',
      blurb: 'A search conducted in the best available conditions.',
      cast: 'A man · a friend',
      lines: [
        {
          jp: '男が街灯の下で何かを探しています。',
          romaji: 'Otoko ga gaitou no shita de nanika o sagashite imasu.',
          en: 'A man is looking for something under a streetlight.',
        },
        {
          speaker: 'Friend',
          jp: '何を探しているんですか。',
          romaji: 'Nani o sagashite iru n desu ka.',
          en: 'What are you looking for?',
        },
        {
          speaker: 'Man',
          jp: '家の鍵をなくしました。',
          romaji: 'Ie no kagi o nakushimashita.',
          en: 'I lost my house key.',
        },
        {
          jp: '二人で三十分探しました。',
          romaji: 'Futari de sanjuppun sagashimashita.',
          en: 'The two of them searched for thirty minutes.',
        },
        {
          speaker: 'Friend',
          jp: '本当にここでなくしましたか。',
          romaji: 'Hontou ni koko de nakushimashita ka.',
          en: 'Did you really lose it here?',
        },
        {
          speaker: 'Man',
          jp: 'いいえ、家の中でなくしました。',
          romaji: 'Iie, ie no naka de nakushimashita.',
          en: 'No, I lost it inside the house.',
        },
        {
          speaker: 'Friend',
          jp: 'じゃあ、なぜここを探すんですか。',
          romaji: 'Jaa, naze koko o sagasu n desu ka.',
          en: 'Then why are we searching here?',
        },
        {
          speaker: 'Man',
          jp: 'ここのほうが明るいですから。',
          romaji: 'Koko no hou ga akarui desu kara.',
          en: "Because it's brighter here.",
        },
      ],
      catch:
        'He is not searching where the key is. He is searching where searching is ' +
        'easy — which is a different task with the same name.',
    },
    {
      id: 'onaji',
      title: 'The Same as That, Please',
      jpTitle: '同じものをください',
      icon: '🍜',
      blurb: 'A textbook restaurant phrase, taken at its word.',
      cast: 'A tourist · a waiter',
      lines: [
        {
          speaker: 'Tourist',
          jp: 'すみません、おすすめは何ですか。',
          romaji: 'Sumimasen, osusume wa nan desu ka.',
          en: 'Excuse me, what do you recommend?',
        },
        {
          speaker: 'Waiter',
          jp: '今日は、これがおすすめです。',
          romaji: 'Kyou wa, kore ga osusume desu.',
          en: 'Today, this is our recommendation.',
        },
        {
          speaker: 'Tourist',
          jp: 'でも、あの人が食べているものが美味しそうです。',
          romaji: 'Demo, ano hito ga tabete iru mono ga oishisou desu.',
          en: "But what that person is eating looks delicious.",
        },
        {
          speaker: 'Tourist',
          jp: '同じものをください。',
          romaji: 'Onaji mono o kudasai.',
          en: 'The same as that, please.',
        },
        {
          speaker: 'Waiter',
          jp: 'かしこまりました。少々お待ちください。',
          romaji: 'Kashikomarimashita. Shoushou omachi kudasai.',
          en: 'Certainly. One moment, please.',
        },
        {
          jp: '三十分待ちました。何も来ません。',
          romaji: 'Sanjuppun machimashita. Nani mo kimasen.',
          en: 'Thirty minutes passed. Nothing came.',
        },
        {
          speaker: 'Tourist',
          jp: 'すみません、私の料理はまだですか。',
          romaji: 'Sumimasen, watashi no ryouri wa mada desu ka.',
          en: 'Excuse me, is my food not ready yet?',
        },
        {
          speaker: 'Waiter',
          jp: 'あのお客様がもう一度注文するまで、お待ちください。',
          romaji: 'Ano okyaku-sama ga mou ichido chuumon suru made, omachi kudasai.',
          en: 'Please wait until that customer orders again.',
        },
      ],
      catch:
        '同じもの *onaji mono* means "the same thing" — and the waiter heard it as the ' +
        'same plate, not another one like it. The phrase is real and useful; the ' +
        'reading is not the one you wanted.',
    },
    {
      id: 'soudesuka',
      title: 'Is That So?',
      jpTitle: 'そうですか',
      icon: '🌾',
      blurb: 'A Zen story in which one line does all the work.',
      cast: 'A villager · a monk',
      lines: [
        {
          jp: '村の人が、お坊さんの家に来ました。',
          romaji: 'Mura no hito ga, obousan no ie ni kimashita.',
          en: "A villager came to the monk's house.",
        },
        {
          speaker: 'Villager',
          jp: 'この子はあなたの子だと、娘が言っています。',
          romaji: 'Kono ko wa anata no ko da to, musume ga itte imasu.',
          en: 'My daughter says this child is yours.',
        },
        {
          speaker: 'Monk',
          jp: 'そうですか。',
          romaji: 'Sou desu ka.',
          en: 'Is that so?',
        },
        {
          jp: 'お坊さんは赤ちゃんを育てました。一年たちました。',
          romaji: 'Obousan wa akachan o sodatemashita. Ichinen tachimashita.',
          en: 'The monk raised the baby. A year passed.',
        },
        {
          speaker: 'Villager',
          jp: '本当の父親がわかりました。すみませんでした。',
          romaji: 'Hontou no chichioya ga wakarimashita. Sumimasen deshita.',
          en: 'We have found the real father. I am sorry.',
        },
        {
          speaker: 'Monk',
          jp: 'そうですか。',
          romaji: 'Sou desu ka.',
          en: 'Is that so?',
        },
      ],
      catch:
        'The same three words answer the accusation and the apology. Nothing in the ' +
        'monk moved either time — which is the entire story, told twice.',
    },
  ],
}
