/**
 * The editorial seed for the aptitude bank.
 *
 * This is the content that used to live in `src/data/aptitudeData.ts` and be
 * imported straight into the React components. The app no longer reads it —
 * every screen queries Postgres — so this file has exactly one consumer,
 * `prisma/seed.ts`, and one job: being the reviewed, version-controlled source
 * that `npm run db:seed` can rebuild the database from.
 *
 * Categories and difficulties stay as display strings here rather than Prisma
 * enum members. The seed maps them (see CATEGORY_BY_LABEL in `seed.ts`), which
 * keeps this file readable by whoever is writing questions and keeps the
 * database enum from leaking into content review.
 */

import type {
  CategoryLabel,
  DifficultyLabel,
  PackDifficultyLabel,
} from "../src/lib/aptitude-labels";

/**
 * Aliases, not fresh unions: the labels are defined once in
 * `src/lib/aptitude-labels.ts` alongside the enum mapping, so a new category
 * cannot be half-added here and forgotten there.
 */
export type QuestionCategory = CategoryLabel;

export interface AptitudeQuestion {
  id: string;
  /** References AptitudeTopic.id. */
  topicId: string;
  category: QuestionCategory;
  topic: string;
  question: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation: string;
  shortcutTip?: string;
  difficulty: DifficultyLabel;
  companyTags: string[];
  formulaUsed?: string;
}

export interface AptitudeTopic {
  id: string;
  name: string;
  category: QuestionCategory;
  iconName: string;
  description: string;
}

export interface CompanyTestPack {
  id: string;
  companyName: string;
  logoColor: string;
  testTitle: string;
  durationMinutes: number;
  /**
   * Which part of the bank each section draws from. The real paper's section
   * name is display text ("Numerical Ability"); the category is what the exam
   * builder actually queries on, so it is stated rather than guessed from the
   * name.
   */
  sections: { name: string; questionCount: number; category: QuestionCategory }[];
  cutoffPercentage: number;
  difficulty: PackDifficultyLabel;
  description: string;
}

export interface FormulaCard {
  id: string;
  category: QuestionCategory;
  topic: string;
  title: string;
  formula: string;
  keyRule: string;
  example: string;
}

export const APTITUDE_TOPICS: AptitudeTopic[] = [
  {
    id: 'profit-loss',
    name: 'Profit & Loss',
    category: 'Quantitative',
    iconName: 'TrendingUp',
    description: 'Cost Price, Selling Price, Marked Price, Discount, and Percentage Profit/Loss.'
  },
  {
    id: 'time-work',
    name: 'Time & Work',
    category: 'Quantitative',
    iconName: 'Clock',
    description: 'Work efficiency, Pipes & Cisterns, Alternate days work, and Men-Days rule.'
  },
  {
    id: 'speed-distance',
    name: 'Speed, Distance & Time',
    category: 'Quantitative',
    iconName: 'Zap',
    description: 'Average speed, Relative speed, Trains crossing platforms, and Boats & Streams.'
  },
  {
    id: 'syllogisms',
    name: 'Syllogisms & Venn Diagrams',
    category: 'Logical Reasoning',
    iconName: 'CheckCircle2',
    description: 'All, Some, No statements, Possibility cases, and Venn diagram logic.'
  },
  {
    id: 'coding-decoding',
    name: 'Coding & Decoding',
    category: 'Logical Reasoning',
    iconName: 'Code',
    description: 'Letter shift codes, Matrix coding, Substitutional coding, and Number patterns.'
  },
  {
    id: 'blood-relations',
    name: 'Blood Relations',
    category: 'Logical Reasoning',
    iconName: 'Users',
    description: 'Family tree diagrams, Coded relations, and Pointing-to-person statements.'
  },
  {
    id: 'error-spotting',
    name: 'Error Spotting & Grammar',
    category: 'Verbal Ability',
    iconName: 'FileText',
    description: 'Subject-verb agreement, Tenses, Prepositions, Modifiers, and Articles.'
  },
  {
    id: 'reading-comprehension',
    name: 'Reading Comprehension',
    category: 'Verbal Ability',
    iconName: 'BookOpen',
    description: 'Tone detection, Passage inference, Main idea, and Vocabulary in context.'
  }
];

export const SAMPLE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: 'q1',
    topicId: 'profit-loss',
    category: 'Quantitative',
    topic: 'Profit & Loss',
    question: 'A trader buys an article for ₹800 and marks it up by 25%. If he offers a discount of 10% on the marked price, what is his net profit percentage?',
    options: ['12.5%', '15%', '10%', '18.5%'],
    correctOption: 0,
    explanation: 'Step 1: Cost Price (CP) = ₹800.\nStep 2: Marked Price (MP) = 800 + (25% of 800) = 800 + 200 = ₹1000.\nStep 3: Selling Price (SP) = 1000 - (10% of 1000) = 1000 - 100 = ₹900.\nStep 4: Net Profit = SP - CP = 900 - 800 = ₹100.\nStep 5: Profit % = (Profit / CP) × 100 = (100 / 800) × 100 = 12.5%.',
    shortcutTip: 'Effective % change formula: A + B + (A×B)/100 = 25 - 10 + (25 × -10)/100 = 15 - 2.5 = +12.5%',
    difficulty: 'Medium',
    companyTags: ['TCS', 'Infosys', 'Wipro'],
    formulaUsed: 'Net % Change = Markup% - Discount% - (Markup × Discount)/100'
  },
  {
    id: 'q2',
    topicId: 'time-work',
    category: 'Quantitative',
    topic: 'Time & Work',
    question: 'A can complete a piece of work in 12 days and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work remains unfinished?',
    options: ['4/9', '5/9', '1/3', '1/2'],
    correctOption: 0,
    explanation: 'Step 1: A\'s 1-day work = 1/12.\nStep 2: B\'s 1-day work = 1/18.\nStep 3: Combined 1-day work = (1/12 + 1/18) = (3 + 2)/36 = 5/36.\nStep 4: Work completed in 4 days = 4 × (5/36) = 20/36 = 5/9.\nStep 5: Remaining work = 1 - 5/9 = 4/9.',
    shortcutTip: 'LCM Method: Total work = LCM(12, 18) = 36 units. Efficiency A = 3 u/day, B = 2 u/day. Combined = 5 u/day. 4 days = 20 units done. Remaining = 16 units. Fraction = 16/36 = 4/9.',
    difficulty: 'Easy',
    companyTags: ['Cognizant', 'Accenture'],
    formulaUsed: 'Remaining Work = 1 - (Days × Combined Efficiency)'
  },
  {
    id: 'q3',
    topicId: 'speed-distance',
    category: 'Quantitative',
    topic: 'Speed, Distance & Time',
    question: 'A train 150 meters long passes a platform 250 meters long in 20 seconds. What is the speed of the train in km/h?',
    options: ['72 km/h', '60 km/h', '54 km/h', '80 km/h'],
    correctOption: 0,
    explanation: 'Step 1: Total distance covered = Train length + Platform length = 150m + 250m = 400 meters.\nStep 2: Time taken = 20 seconds.\nStep 3: Speed in m/s = Distance / Time = 400 / 20 = 20 m/s.\nStep 4: Convert m/s to km/h by multiplying by (18/5):\nSpeed = 20 × (18/5) = 4 × 18 = 72 km/h.',
    shortcutTip: 'Always multiply m/s by 18/5 to get km/h instantly.',
    difficulty: 'Medium',
    companyTags: ['TCS', 'Amazon'],
    formulaUsed: 'Speed (km/h) = Speed (m/s) × (18/5)'
  },
  {
    id: 'q4',
    topicId: 'syllogisms',
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    question: 'Statements: 1. All computers are machines. 2. Some machines are robots.\nConclusions: I. Some computers are robots. II. Some machines are computers.',
    options: ['Only Conclusion I follows', 'Only Conclusion II follows', 'Both I and II follow', 'Neither I nor II follows'],
    correctOption: 1,
    explanation: 'Step 1: Statement 1 (All computers are machines) implies that the set of Computers lies inside Machines. Therefore, some portion of Machines is definitely Computers (Conclusion II is VALID).\nStep 2: Statement 2 (Some machines are robots) does not guarantee an intersection between Computers and Robots (Conclusion I is INVALID).',
    shortcutTip: 'Venn Diagram rule: Universal Affirmative (All A are B) converts directly to Particular Affirmative (Some B are A).',
    difficulty: 'Easy',
    companyTags: ['Infosys', 'Capgemini'],
    formulaUsed: 'Direct Conversion: All A is B => Some B is A'
  },
  {
    id: 'q5',
    topicId: 'blood-relations',
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    question: 'Pointing to a photograph, Rohit said, "She is the daughter of my grandfather\'s only son." How is the girl in the photograph related to Rohit?',
    options: ['Sister', 'Cousin', 'Niece', 'Mother'],
    correctOption: 0,
    explanation: 'Step 1: "My grandfather\'s only son" -> Rohit\'s father (since he has only one son).\nStep 2: "Daughter of Rohit\'s father" -> Rohit\'s sister.\nTherefore, the girl in the photograph is Rohit\'s sister.',
    shortcutTip: 'Decode backward: Grandfather\'s only son = Father -> Daughter of father = Sister.',
    difficulty: 'Medium',
    companyTags: ['Wipro', 'TCS'],
    formulaUsed: 'Family Tree Breakdown'
  },
  {
    id: 'q6',
    topicId: 'error-spotting',
    category: 'Verbal Ability',
    topic: 'Error Spotting',
    question: 'Identify the part containing an error: "Neither the professor (A) / nor the students (B) / was present in the seminar hall (C) / No Error (D)"',
    options: ['Part A', 'Part B', 'Part C', 'Part D'],
    correctOption: 2,
    explanation: 'Step 1: Rule for "Neither... nor": The verb must agree with the subject closest to it.\nStep 2: The subject closest to the verb "was" is "the students" (plural).\nStep 3: Therefore, the plural verb "were" should be used instead of "was". Correct phrase: "were present in the seminar hall".',
    shortcutTip: 'Proximity Rule: Neither A nor B + Verb (verb aligns with B).',
    difficulty: 'Medium',
    companyTags: ['Accenture', 'Cognizant'],
    formulaUsed: 'Proximity Subject-Verb Agreement'
  }
];

export const COMPANY_PACKS: CompanyTestPack[] = [
  {
    id: 'tcs-nqt',
    companyName: 'TCS NQT Cognitive',
    logoColor: '#6C5CE7',
    testTitle: 'TCS National Qualifier Test 2026',
    durationMinutes: 45,
    sections: [
      { name: 'Numerical Ability', questionCount: 12, category: 'Quantitative' },
      { name: 'Reasoning Ability', questionCount: 10, category: 'Logical Reasoning' },
      { name: 'Verbal Ability', questionCount: 8, category: 'Verbal Ability' }
    ],
    cutoffPercentage: 75,
    difficulty: 'Moderate',
    description: 'Standard foundation test covering speed math, analytical logic, and reading comprehension.'
  },
  {
    id: 'infosys-aptitude',
    companyName: 'Infosys Specialist Test',
    logoColor: '#00A8FF',
    testTitle: 'Infosys Online Aptitude & Pseudo Code',
    durationMinutes: 40,
    sections: [
      { name: 'Mathematical Reasoning', questionCount: 10, category: 'Quantitative' },
      { name: 'Logical Ability', questionCount: 10, category: 'Logical Reasoning' },
      { name: 'Verbal Ability', questionCount: 5, category: 'Verbal Ability' }
    ],
    cutoffPercentage: 70,
    difficulty: 'Challenging',
    description: 'High focus on data interpretation, puzzle solving, and verbal reasoning.'
  },
  {
    id: 'accenture-cognitive',
    companyName: 'Accenture Campus Drive',
    logoColor: '#A3CB38',
    testTitle: 'Accenture Cognitive & Assessment',
    durationMinutes: 50,
    sections: [
      { name: 'Critical Reasoning', questionCount: 15, category: 'Logical Reasoning' },
      { name: 'Abstract Reasoning', questionCount: 10, category: 'Logical Reasoning' },
      { name: 'English Ability', questionCount: 10, category: 'Verbal Ability' }
    ],
    cutoffPercentage: 80,
    difficulty: 'Moderate',
    description: 'Evaluates critical thinking, fast problem solving, and grammatical accuracy.'
  },
  {
    id: 'amazon-aptitude',
    companyName: 'Amazon SDE Aptitude',
    logoColor: '#FF9F1A',
    testTitle: 'Amazon Online Technical & Reasoning',
    durationMinutes: 60,
    sections: [
      { name: 'Advanced Quant & Logic', questionCount: 15, category: 'Quantitative' },
      { name: 'Work Style & Logic', questionCount: 15, category: 'Logical Reasoning' }
    ],
    cutoffPercentage: 85,
    difficulty: 'High',
    description: 'Challenging problem-solving questions testing logic, probability, and speed math.'
  }
];

export const FORMULA_CARDS: FormulaCard[] = [
  {
    id: 'f1',
    category: 'Quantitative',
    topic: 'Profit & Loss',
    title: 'Markup & Discount Relation',
    formula: 'Selling Price (SP) = Marked Price (MP) × (100 - Discount%) / 100',
    keyRule: 'Profit % is always calculated on Cost Price (CP), whereas Discount % is always calculated on Marked Price (MP).',
    example: 'CP = 500, MP = 700, Discount = 10%. SP = 700 × 0.9 = 630. Profit = 130.'
  },
  {
    id: 'f2',
    category: 'Quantitative',
    topic: 'Speed, Distance & Time',
    title: 'Relative Speed Formula',
    formula: 'Opposite Direction = Speed₁ + Speed₂ | Same Direction = |Speed₁ - Speed₂|',
    keyRule: 'When two objects move toward each other, add speeds. When moving in the same direction, subtract speeds.',
    example: 'Two trains at 60 km/h and 40 km/h in opposite directions move at 100 km/h relative speed.'
  },
  {
    id: 'f3',
    category: 'Logical Reasoning',
    topic: 'Clocks & Angles',
    title: 'Angle Between Clock Hands',
    formula: 'Angle θ = |30H - (11/2)M|',
    keyRule: 'H represents the hour hand position and M represents minute hand position.',
    example: 'At 4:20 PM: H=4, M=20. θ = |30(4) - (11/2)(20)| = |120 - 110| = 10°.'
  },
  {
    id: 'f4',
    category: 'Quantitative',
    topic: 'Time & Work',
    title: 'Men-Days-Hours Efficiency (MDH Rule)',
    formula: '(M₁ × D₁ × H₁) / W₁ = (M₂ × D₂ × H₂) / W₂',
    keyRule: 'Work (W) is inversely proportional to Men, Days, and Hours.',
    example: '12 men complete 1 work in 6 days. How many men complete 1 work in 4 days? (12×6)/1 = (M₂×4)/1 => M₂ = 18 men.'
  }
];
