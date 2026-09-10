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
];

export type SeedVoteQuestion = { title: string; description: string };

export const SEED_VOTE_QUESTIONS: SeedVoteQuestion[] = [
  { title: "Biggest Flirt", description: "Who is the biggest flirt tonight?" },
  { title: "Best Styling", description: "Who has the best dance styling?" },
  { title: "Smells The Best", description: "Extremely important scientific research: who smells the best?" },
  { title: "Talks Too Much While Dancing", description: "Who absolutely refuses to stop talking while dancing? 😂" },
  { title: "Most Chaotic Energy", description: "Who has the most chaotic energy tonight?" },
];
