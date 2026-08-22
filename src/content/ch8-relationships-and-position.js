export default {
  id: "relationships-and-position",
  title: "With, Without, Over and Under",
  subchapters: [
    {
      id: "with-and-without",
      title: "With and Without: Choose the Relationship",
      body: `## English uses one "with"; Japanese chooses the relationship

English puts a preposition **before** its noun: "with a friend", "with a card", "without
sugar". Japanese usually puts a marker **after** the noun instead. Start with the noun,
then say what relationship it has to the action.

### A companion: person + *to (issho ni)*

Use **と** *to* for a person or animal doing something with you. **一緒に** *issho ni*
(together) is optional, but makes the meaning unmistakable.

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 友達と行きます。 | *Tomodachi to ikimasu.* | I will go with a friend. |
| 友達と一緒に食べます。 | *Tomodachi to issho ni tabemasu.* | I will eat together with a friend. |
| 田中さんと話しました。 | *Tanaka-san to hanashimashita.* | I spoke with Tanaka. |

The building blocks stay in front of the final verb:

> **Tomodachi to** + **Kyoto e** + **ikimasu**.
>
> with a friend + to Kyoto + will go

### A tool or method: thing + *de*

When English "with" means **using**, use **で** *de*. This is the same *de* used for a
means of transport.

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| カードで払います。 | *Kaado de haraimasu.* | I will pay with a card. |
| 箸で食べます。 | *Hashi de tabemasu.* | I eat with chopsticks. |
| 電車で行きます。 | *Densha de ikimasu.* | I will go by train. |

Do not use *to* for a tool: *hashi to tabemasu* sounds like you and the chopsticks are
dining companions.

### Without: thing + *nashi de*

**なしで** *nashi de* means "without" or "leaving out". Put the unwanted thing directly
before it.

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 砂糖なしでお願いします。 | *Satou nashi de onegai shimasu.* | Without sugar, please. |
| 氷なしでお願いします。 | *Koori nashi de onegai shimasu.* | No ice, please. |
| 予約なしで入れますか。 | *Yoyaku nashi de hairemasu ka.* | Can we enter without a reservation? |

On menus and labels, **〜なし** alone means "no …". For a careful request, *nashi de
onegai shimasu* is a dependable travel pattern.

### One sentence, several tagged pieces

Each phrase goes before the verb; the particle on its end explains its job:

> 明日、友達と電車で京都へ行きます。
>
> *Ashita, tomodachi to densha de Kyoto e ikimasu.*
>
> Tomorrow + with a friend + by train + to Kyoto + will go.

The neutral order is **time → companion → method → destination → verb**, but the tags do
the real work. Keep the verb last and place each marker immediately after its noun.
`,
      quizTitle: "With or without",
      flashcards: [
        {
          front: "How do you say \"with a friend\"?",
          back: `**友達と** — *tomodachi to*. Add *issho ni* for "together": *Tomodachi to issho ni ikimasu* — "I will go with a friend." The companion comes before *to*.`
        },
        {
          front: "Which Japanese particle translates tool/method \"with\"?",
          back: `Use **で — de**: *kaado de haraimasu* (pay with a card), *hashi de tabemasu* (eat with chopsticks). Use *to* for a companion, not an instrument.`
        },
        {
          front: "What is the travel pattern for \"without X\"?",
          back: `**X nashi de**. A polite request is **X nashi de onegai shimasu**: *Satou nashi de onegai shimasu* — "Without sugar, please." Put X immediately before *nashi de*.`
        },
        {
          front: "Where do companion, method and destination phrases go?",
          back: `They all go **before the final verb**, with their marker directly after the noun: *tomodachi **to*** (with a friend), *densha **de*** (by train), *Kyoto **e*** (to Kyoto), then *ikimasu* (go).`
        }
      ],
      quiz: [
        {
          question: "You will pay with a card. Which sentence is correct?",
          options: [
            "Kaado to haraimasu",
            "Kaado de haraimasu",
            "Kaado ni haraimasu",
            "Kaado nashi de haraimasu"
          ],
          answer: 1,
          explanation: `A card is the **method or tool**, so it takes *de*: **Kaado de haraimasu**. *To* would mark a companion, while *nashi de* means "without a card".`
        },
        {
          question: "Ask politely for coffee without sugar.",
          answer: `**コーヒーは砂糖なしでお願いします。** — *Koohii wa satou nashi de onegai shimasu.*

The thing omitted comes first: *satou* + *nashi de*. In a clear ordering context, the shorter **Satou nashi de onegai shimasu** is natural too.`
        },
        {
          question: "Put these chunks in a neutral order: *ikimasu*, *densha de*, *tomodachi to*, *Kyoto e*.",
          answer: `**友達と電車で京都へ行きます。** — *Tomodachi to densha de Kyoto e ikimasu.*

Companion + method + destination all come before the verb. Other orders can be grammatical because the particles preserve each role, but **ikimasu stays last**.`
        }
      ]
    },
    {
      id: "relative-position",
      title: "Over, Under and Around: Build a Location",
      body: `## Position words are nouns in Japanese

English says "under the table". Japanese builds **"the table's underside"**:

> テーブルの下に
>
> *teeburu no shita ni*
>
> table + *no* + underside + *ni*

This gives one reusable pattern:

> **reference place + no + position word + ni/de**

### The position set

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 上 | *ue* | above / on top of |
| 下 | *shita* | below / under |
| 中 | *naka* | inside |
| 外 | *soto* | outside |
| 前 | *mae* | in front of / before |
| 後ろ | *ushiro* | behind |
| 隣 | *tonari* | next to / neighbouring |
| 横 | *yoko* | beside / at the side of |
| 間 | *aida* | between |
| 近く | *chikaku* | near / nearby |
| 向かい | *mukai* | opposite / across from |
| 周り | *mawari* | around / surrounding |

Attach one to a reference with *no*: *eki no mae* (the station's front), *hoteru no
ushiro* (behind the hotel), *kaban no naka* (inside the bag).

### End with *ni* for existence, *de* for an action

After building the location, choose the final particle by what happens there:

- **に *ni***: something **is/exists** there, usually with *arimasu* or *imasu*.
- **で *de***: someone **does an action** there.

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 椅子の下に鞄があります。 | *Isu no shita ni kaban ga arimasu.* | There is a bag under the chair. |
| 駅の前で待ちます。 | *Eki no mae de machimasu.* | I will wait in front of the station. |
| ホテルの外で食べます。 | *Hoteru no soto de tabemasu.* | I will eat outside the hotel. |

Memory hook: **ni = is there; de = does there**.

### Between, beside and next to

"Between A and B" needs both reference points:

> **A to B no aida ni**
>
> *Ginkou to hoteru no aida ni konbini ga arimasu.*
>
> There is a convenience store between the bank and the hotel.

*Tonari* and *yoko* overlap, but a useful beginner distinction is:

- **隣 *tonari*** — a neighbour in the same general row or category: the next building,
  room, seat or person.
- **横 *yoko*** — physically at the side of something: a chair beside a door, a bag next
  to your feet.

Either will often be understood; the distinction is about viewpoint, not hard geometry.

### Movement through a place uses *o*

The route travelled can take **を *o***:

| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 公園の中を歩きます。 | *Kouen no naka o arukimasu.* | I walk through the park. |
| 橋の上を歩きます。 | *Hashi no ue o arukimasu.* | I walk over/across the bridge. |

Here *o* marks the space traversed. It is the same sound as the object marker, but its job
is "along/through this route".

### Assemble a full sentence

Build each location as one chunk and put it before the verb:

> 明日、駅の前で友達と朝ご飯を食べます。
>
> *Ashita, eki no mae de tomodachi to asa-gohan o tabemasu.*
>
> Tomorrow + in front of the station + with a friend + breakfast + will eat.

Do not translate "over" mechanically. English "over" can mean above (*ue ni*), across a
route (*ue o*), or more than a number (*ijou*). First decide the relationship, then choose
the Japanese pattern.
`,
      quizTitle: "Placing things and actions",
      flashcards: [
        {
          front: "What is the basic pattern for \"under/over/inside X\"?",
          back: `**Reference + no + position word + ni/de**. For example, *teeburu no shita ni* means "under the table" and *kaban no naka ni* means "inside the bag".`
        },
        {
          front: "When does a location end in *ni*, and when in *de*?",
          back: `Use **ni** when something **exists** there: *isu no shita ni kaban ga arimasu*. Use **de** when an **action happens** there: *eki no mae de machimasu*. Memory hook: **ni = is; de = does**.`
        },
        {
          front: "How do you build \"between the bank and the hotel\"?",
          back: `**Ginkou to hoteru no aida** — A + *to* + B + *no aida*. Add *ni* for something located there or *de* for an action there.`
        },
        {
          front: "What is the useful distinction between *tonari* and *yoko*?",
          back: `**Tonari** is a neighbouring member of the same general row or kind (the next building, room, seat or person). **Yoko** is simply at the physical side of something. They overlap, so either is often understandable.`
        },
        {
          front: "Why does \"through the park\" use *o*?",
          back: `With movement, **o** can mark the route traversed: *kouen no naka o arukimasu* — "walk through the park." Likewise *hashi no ue o arukimasu* is "walk over/across the bridge."`
        }
      ],
      quiz: [
        {
          question: "There is a bag under the chair. Which location phrase is correct?",
          options: [
            "Isu ni shita no",
            "Isu no shita ni",
            "Isu de shita o",
            "Shita no isu de"
          ],
          answer: 1,
          explanation: `Build the place as **reference + no + position + ni**: *isu no shita ni*. The full sentence is *Isu no shita ni kaban ga arimasu*.`
        },
        {
          question: "Choose the right ending: *Eki no mae ___ machimasu* (I will wait in front of the station).",
          options: ["ni", "de", "to", "o"],
          answer: 1,
          explanation: `Waiting is an **action happening at the location**, so use *de*: **Eki no mae de machimasu**. Use *ni* with existence: *Eki no mae ni takushii ga imasu*.`
        },
        {
          question: "Translate: \"I will eat with a friend outside the hotel.\"",
          answer: `**ホテルの外で友達と食べます。** — *Hoteru no soto de tomodachi to tabemasu.*

*Hoteru no soto de* builds the place where the action happens; *tomodachi to* marks the companion; *tabemasu* stays at the end.`
        }
      ]
    }
  ]
}
