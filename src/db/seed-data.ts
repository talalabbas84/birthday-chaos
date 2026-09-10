export type SeedChallenge = {
  title: string;
  description: string;
  category: "EASY" | "SOCIAL" | "DANCE" | "TRY_SOMETHING_NEW" | "CHAOS";
  points: number;
  maxCompletions: number;
  requiresPerson: boolean;
  minimumPeople?: number;
  uniquePersonRequired?: boolean;
};

export const SEED_CHALLENGES: SeedChallenge[] = [
  // EASY
  { title: "Meet Someone New", description: "Introduce yourself to someone you've never met.", category: "EASY", points: 25, maxCompletions: 5, requiresPerson: true, uniquePersonRequired: true },
  { title: "Where Are You From?", description: "Learn someone's hometown.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Good Vibes", description: "Give someone a genuine compliment.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Outfit Twins", description: "Find someone wearing the same colour as you.", category: "EASY", points: 25, maxCompletions: 2, requiresPerson: true },
  { title: "Birthday Twins", description: "Find someone born in the same month as you.", category: "EASY", points: 25, maxCompletions: 2, requiresPerson: true },
  { title: "DJ Research", description: "Learn someone's favourite song.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "What's The Connection?", description: "Learn how someone knows the birthday group.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "New Friend Evidence", description: "Take a selfie with someone new.", category: "EASY", points: 50, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Friend Of A Friend", description: "Meet someone through another guest.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Wait, Same", description: "Find something you have in common with someone you've never met before.", category: "EASY", points: 50, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Dance Origin Story 📖", description: "Ask someone what got them into dancing.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Current Obsession 🎵", description: "Ask someone what song they currently have on repeat.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Hidden Talent 👀", description: "Find out someone's random hidden talent.", category: "EASY", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Dream Destination ✈️", description: "Ask someone where they'd travel tomorrow if money didn't matter.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Dance Recommendation 💃", description: "Ask someone which class, social, or festival they'd recommend.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Name Memory Test 🧠", description: "Remember someone's name and say hi to them again later.", category: "EASY", points: 50, maxCompletions: 2, requiresPerson: true },
  { title: "Same Same 🤝", description: "Find someone who shares a hobby with you outside dancing.", category: "EASY", points: 50, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Dance Anniversary 🎂", description: "Find someone who started dancing in the same year as you.", category: "EASY", points: 50, maxCompletions: 2, requiresPerson: true },
  { title: "Shoe Talk 👟", description: "Find someone's dance shoes you like and compliment them.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },
  { title: "Weekend Detective 🕵️", description: "Find out what someone's ideal weekend looks like.", category: "EASY", points: 25, maxCompletions: 3, requiresPerson: true },

  // SOCIAL
  { title: "Human Connector", description: "Introduce two people who haven't met.", category: "SOCIAL", points: 50, maxCompletions: 3, requiresPerson: true, minimumPeople: 2 },
  { title: "Name Collector", description: "Learn three new names.", category: "SOCIAL", points: 50, maxCompletions: 2, requiresPerson: false },
  { title: "Make Someone Laugh", description: "Make someone genuinely laugh.", category: "SOCIAL", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Squad Pic", description: "Take a picture with four people.", category: "SOCIAL", points: 50, maxCompletions: 2, requiresPerson: false },
  { title: "Worlds Collide", description: "Introduce a salsa dancer to someone who doesn't really dance.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: true, minimumPeople: 2 },
  { title: "Bigger Squad", description: "Get five people into a selfie.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: false },
  { title: "Origin Stories", description: "Learn how three different people know the birthday group.", category: "SOCIAL", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "Language Exchange", description: "Find someone who speaks another language and learn one word from them.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: true },
  { title: "Tell Me Something", description: "Learn one interesting thing about someone you've never spoken to before.", category: "SOCIAL", points: 50, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Birthday Detective", description: "Find someone whose birthday is closest to yours.", category: "SOCIAL", points: 50, maxCompletions: 1, requiresPerson: true },
  { title: "The Reconnector 🔄", description: "Talk to someone you know but haven't properly caught up with recently.", category: "SOCIAL", points: 50, maxCompletions: 2, requiresPerson: true },
  { title: "Three-Way Introduction 🤝", description: "Introduce yourself to two people having a conversation.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: true, minimumPeople: 2 },
  { title: "Dance Recommendation Exchange 🎶", description: "Exchange favorite salsa/bachata songs with someone.", category: "SOCIAL", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Hype Person 📣", description: "Give someone genuine encouragement about their dancing.", category: "SOCIAL", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Bring Them In 🫶", description: "Invite someone standing alone into your conversation.", category: "SOCIAL", points: 100, maxCompletions: 2, requiresPerson: true },
  { title: "Unexpected Connection 🔗", description: "Discover that you and someone have a mutual friend.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: true },
  { title: "New Circle 🌎", description: "Spend a few minutes talking with a group you don't normally hang with.", category: "SOCIAL", points: 100, maxCompletions: 2, requiresPerson: true, minimumPeople: 2 },
  { title: "Pass The Introduction ➡️", description: "Meet someone new, then introduce them to another person.", category: "SOCIAL", points: 100, maxCompletions: 2, requiresPerson: true, minimumPeople: 2 },
  { title: "Compliment Delivery 💌", description: "Hear something nice about someone and go tell them.", category: "SOCIAL", points: 75, maxCompletions: 2, requiresPerson: true },
  { title: "Social Butterfly 🦋", description: "Have real conversations with 5 different people tonight.", category: "SOCIAL", points: 150, maxCompletions: 1, requiresPerson: false },

  // DANCE
  { title: "One Full Song", description: "Dance one full song.", category: "DANCE", points: 25, maxCompletions: 5, requiresPerson: false },
  { title: "New Dance Partner", description: "Dance with someone you've never danced with before.", category: "DANCE", points: 50, maxCompletions: 5, requiresPerson: true, uniquePersonRequired: true },
  { title: "You Ask", description: "Ask someone to dance whom you've never asked before.", category: "DANCE", points: 50, maxCompletions: 5, requiresPerson: true, uniquePersonRequired: true },
  { title: "Suzy Q Partners", description: "Do Suzy Qs with someone.", category: "DANCE", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Shine Battle", description: "Have a 10-second shine battle.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true },
  { title: "Three Partners", description: "Dance with three different people.", category: "DANCE", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "Five Partners", description: "Dance with five different people.", category: "DANCE", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Try Something Different", description: "Dance a style you don't normally dance.", category: "DANCE", points: 75, maxCompletions: 2, requiresPerson: false },
  { title: "Steal A Move", description: "Learn a dance move from someone.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true },
  { title: "Professor", description: "Teach someone a dance move.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true },
  { title: "Identity Crisis", description: "Switch lead/follow roles for part of a song.", category: "DANCE", points: 100, maxCompletions: 2, requiresPerson: true },
  { title: "Trio Basic", description: "Get three people doing a basic together.", category: "DANCE", points: 100, maxCompletions: 2, requiresPerson: true, minimumPeople: 2 },
  { title: "Shine Circle", description: "Start or join a small shine circle.", category: "DANCE", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Suzy Q Squad", description: "Get three people doing Suzy Q together.", category: "DANCE", points: 125, maxCompletions: 1, requiresPerson: true, minimumPeople: 2 },
  { title: "Stranger To Dance Partner", description: "Dance with someone you had never spoken to before tonight.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Bachata Stranger 🕺", description: "Dance bachata with someone you've never danced bachata with.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Salsa Stranger 💃", description: "Dance salsa with someone you've never danced salsa with.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true, uniquePersonRequired: true },
  { title: "Style Swap 🔄", description: "Ask your partner to show you one styling idea and try it.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true },
  { title: "Musicality Moment 🎶", description: "Hit a musical break/accent together with your partner.", category: "DANCE", points: 75, maxCompletions: 3, requiresPerson: true },
  { title: "Slow & Fast ⚡", description: "Dance one slower song and one faster song.", category: "DANCE", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "No Comfort Zone 👀", description: "Dance with someone you normally wouldn't think to ask.", category: "DANCE", points: 100, maxCompletions: 2, requiresPerson: true, uniquePersonRequired: true },
  { title: "Your Turn 🎰", description: "Let your partner choose whether you're dancing salsa or bachata.", category: "DANCE", points: 50, maxCompletions: 3, requiresPerson: true },
  { title: "Three New Partners 3️⃣", description: "Dance with 3 people you've never danced with before.", category: "DANCE", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Dance Reunion 🫂", description: "Dance with someone you haven't danced with in a long time.", category: "DANCE", points: 75, maxCompletions: 2, requiresPerson: true },
  { title: "Style Tourist 🌎", description: "Ask someone with a noticeably different dance style to dance.", category: "DANCE", points: 75, maxCompletions: 2, requiresPerson: true },

  // TRY_SOMETHING_NEW
  { title: "First Basic", description: "Learn the salsa basic.", category: "TRY_SOMETHING_NEW", points: 50, maxCompletions: 1, requiresPerson: false },
  { title: "Teach Me Something", description: "Ask someone to teach you a dance move.", category: "TRY_SOMETHING_NEW", points: 50, maxCompletions: 1, requiresPerson: true },
  { title: "Thirty Seconds Of Courage", description: "Dance for at least 30 seconds.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "I Survived", description: "Dance one entire salsa song.", category: "TRY_SOMETHING_NEW", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "Basic + Turn", description: "Learn a basic and right turn.", category: "TRY_SOMETHING_NEW", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Three Teachers", description: "Get three different dancers to teach you three different moves.", category: "TRY_SOMETHING_NEW", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Reverse Uno", description: "Teach a dancer your own completely random dance move.", category: "TRY_SOMETHING_NEW", points: 100, maxCompletions: 1, requiresPerson: true },
  { title: "Three Dance Partners", description: "Dance with three different people.", category: "TRY_SOMETHING_NEW", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Join The Chaos", description: "Join a group dance moment.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "Look At Me Now", description: "Successfully do a basic + turn with a partner.", category: "TRY_SOMETHING_NEW", points: 150, maxCompletions: 1, requiresPerson: true },
  { title: "Other Side 🔄", description: "Try leading if you usually follow, or following if you usually lead.", category: "TRY_SOMETHING_NEW", points: 125, maxCompletions: 1, requiresPerson: true },
  { title: "Bachata Tourist 🌴", description: "If you mostly dance salsa, try a bachata.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "Salsa Tourist 🔥", description: "If you mostly dance bachata, try a salsa.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "Teach Me Your Favorite 🧑‍🏫", description: "Ask someone to teach you their favorite simple move.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: true },
  { title: "Styling Experiment ✨", description: "Try one styling movement you've never used socially before.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: false },
  { title: "Make Something Up 😂", description: "Invent a completely random dance move with someone.", category: "TRY_SOMETHING_NEW", points: 100, maxCompletions: 1, requiresPerson: true },
  { title: "Dance With Confidence 😎", description: "Ask someone to dance before they ask you.", category: "TRY_SOMETHING_NEW", points: 50, maxCompletions: 1, requiresPerson: true },
  { title: "Musicality Experiment 🎵", description: "Pick one instrument and try following it for part of a song.", category: "TRY_SOMETHING_NEW", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "Zero Expectations 🪩", description: "Dance one song where your only goal is to have fun, not dance \"correctly\".", category: "TRY_SOMETHING_NEW", points: 50, maxCompletions: 1, requiresPerson: false },
  { title: "Technique Trade 🤝", description: "Ask someone for one dance tip and give them one thing you like about their dancing.", category: "TRY_SOMETHING_NEW", points: 75, maxCompletions: 1, requiresPerson: true },

  // CHAOS
  { title: "Copy Me", description: "Get three people doing the same dance move.", category: "CHAOS", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "Five Person Selfie", description: "Get five people into one selfie.", category: "CHAOS", points: 100, maxCompletions: 1, requiresPerson: false },
  { title: "Get Up 😂", description: "Get someone who was sitting down to join the dance floor.", category: "CHAOS", points: 100, maxCompletions: 1, requiresPerson: true },
  { title: "Suzy Q Infection", description: "Get three people doing Suzy Q together.", category: "CHAOS", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Evidence Of Chaos", description: "Take a ridiculous photo with six people.", category: "CHAOS", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Five On The Floor", description: "Get five people dancing together.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Group Basic", description: "Start a mini group basic.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Avengers Assemble", description: "Get ten people into one photo.", category: "CHAOS", points: 200, maxCompletions: 1, requiresPerson: false },
  { title: "Matchmaker", description: "Get two people who haven't met before to dance together.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: true, minimumPeople: 2 },
  { title: "Salsa Recruitment", description: "Get dancers and non-dancers doing the basic together.", category: "CHAOS", points: 175, maxCompletions: 1, requiresPerson: false },
  { title: "Dance Cult", description: "Get five people copying the same dance move.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Freestyle Circle", description: "Start a tiny freestyle/shine circle.", category: "CHAOS", points: 175, maxCompletions: 1, requiresPerson: false },
  { title: "Album Cover 📸", description: "Get 5 people together and pose like you're releasing an album tomorrow.", category: "CHAOS", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Corporate Salsa 💼", description: "Get 4 dancers to take the most unnecessarily professional business photo.", category: "CHAOS", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Freeze! 🧊", description: "Get 5 people to simultaneously freeze in ridiculous poses.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Copycat Epidemic 🦠", description: "Start a ridiculous move and convince 4 people to copy it.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
  { title: "Human Train 🚂", description: "Get 5+ willing people moving together in a ridiculous little dance line.", category: "CHAOS", points: 175, maxCompletions: 1, requiresPerson: false },
  { title: "Accidental Choreography 🎬", description: "Get 4 people to repeat the same 3 movements together.", category: "CHAOS", points: 175, maxCompletions: 1, requiresPerson: false },
  { title: "Wrong Genre 😂", description: "Get 3 people to dramatically dance a completely different style for 10 seconds.", category: "CHAOS", points: 125, maxCompletions: 1, requiresPerson: false },
  { title: "Dance Floor Takeover 🚨", description: "Get 8 people involved in the same spontaneous dance moment.", category: "CHAOS", points: 200, maxCompletions: 1, requiresPerson: false },
  { title: "Telenovela Season Finale 🌹", description: "Create an absurd dramatic scene/photo with at least 5 people.", category: "CHAOS", points: 175, maxCompletions: 1, requiresPerson: false },
  { title: "NPC Glitch 🤖", description: "Get 4 people to repeat the exact same movement like the game is broken.", category: "CHAOS", points: 150, maxCompletions: 1, requiresPerson: false },
];

export type SeedVoteQuestion = { title: string; description: string };

export const SEED_VOTE_QUESTIONS: SeedVoteQuestion[] = [
  { title: "Biggest Flirt", description: "Who is the biggest flirt tonight?" },
  { title: "Best Styling", description: "Who has the best dance styling?" },
  { title: "Smells The Best", description: "Extremely important scientific research: who smells the best?" },
  { title: "Talks Too Much While Dancing", description: "Who absolutely refuses to stop talking while dancing? 😂" },
  { title: "Most Chaotic Energy", description: "Who has the most chaotic energy tonight?" },
];
