/**
 * Interview Question Bank System
 * Contains large question pools and tracking logic
 */

export interface Question {
    id: string;
    text: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tips?: string;
}

export interface QuestionProgress {
    userId: string;
    category: string;
    askedQuestionIds: string[];
    currentSessionQuestions: string[];
    currentQuestionIndex: number;
    lastUpdated: number;
}

// GENERAL INTERVIEW QUESTIONS (60 questions)
export const GENERAL_QUESTIONS: Question[] = [
    // Behavioral Questions
    {
        id: 'gen_001',
        text: 'Tell me about yourself.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Keep it professional. Focus on your career journey, key skills, and what brings you here.'
    },
    {
        id: 'gen_002',
        text: 'Why do you want to work here?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Research the company. Mention specific things that align with your values and goals.'
    },
    {
        id: 'gen_003',
        text: 'What are your greatest strengths?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Pick 2-3 strengths relevant to the role. Give specific examples.'
    },
    {
        id: 'gen_004',
        text: 'What is your greatest weakness?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Be honest but strategic. Show how you\'re working to improve it.'
    },
    {
        id: 'gen_005',
        text: 'Where do you see yourself in 5 years?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show ambition but be realistic. Align your goals with company growth.'
    },
    {
        id: 'gen_006',
        text: 'Tell me about a time you failed.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Use STAR method. Focus on what you learned and how you grew.'
    },
    {
        id: 'gen_007',
        text: 'Describe a situation where you had to work with a difficult colleague.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show emotional intelligence. Focus on communication and resolution.'
    },
    {
        id: 'gen_008',
        text: 'Why are you leaving your current job?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Stay positive. Focus on growth opportunities, not negativity about current role.'
    },
    {
        id: 'gen_009',
        text: 'Tell me about a time you demonstrated leadership.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Leadership isn\'t just managing. Show initiative, influence, and results.'
    },
    {
        id: 'gen_010',
        text: 'How do you handle stress and pressure?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Give concrete examples. Show healthy coping mechanisms and resilience.'
    },
    {
        id: 'gen_011',
        text: 'Describe a time you had to meet a tight deadline.',
        category: 'situational',
        difficulty: 'medium',
        tips: 'Show time management, prioritization, and ability to deliver under pressure.'
    },
    {
        id: 'gen_012',
        text: 'Tell me about a time you went above and beyond.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Show initiative and dedication. Quantify the impact if possible.'
    },
    {
        id: 'gen_013',
        text: 'How do you prioritize tasks when you have multiple deadlines?',
        category: 'situational',
        difficulty: 'medium',
        tips: 'Discuss frameworks (Eisenhower Matrix, urgent vs important). Give examples.'
    },
    {
        id: 'gen_014',
        text: 'Describe a time you had to learn something new quickly.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show adaptability and learning agility. Mention resources you used.'
    },
    {
        id: 'gen_015',
        text: 'Tell me about a time you disagreed with your manager.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show respect and professionalism. Focus on constructive dialogue and outcome.'
    },
    {
        id: 'gen_016',
        text: 'How do you handle constructive criticism?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show openness to feedback and growth mindset. Give a specific example.'
    },
    {
        id: 'gen_017',
        text: 'What motivates you?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Be authentic. Connect your motivations to the role and company mission.'
    },
    {
        id: 'gen_018',
        text: 'Describe your ideal work environment.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Research the company culture first. Show flexibility while being honest.'
    },
    {
        id: 'gen_019',
        text: 'Tell me about a time you had to persuade someone.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show communication skills, empathy, and data-driven decision making.'
    },
    {
        id: 'gen_020',
        text: 'How do you handle feedback that you disagree with?',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show maturity and self-reflection. Explain your thought process.'
    },
    {
        id: 'gen_021',
        text: 'Describe a time you made a mistake at work.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Own it. Focus on accountability, what you learned, and how you prevented recurrence.'
    },
    {
        id: 'gen_022',
        text: 'Tell me about your greatest professional achievement.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Choose something relevant to the role. Quantify the impact and your specific contribution.'
    },
    {
        id: 'gen_023',
        text: 'How do you stay organized?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Mention specific tools, systems, or frameworks you use. Give examples.'
    },
    {
        id: 'gen_024',
        text: 'Describe a time you had to adapt to change.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show flexibility and positive attitude. Explain your adaptation process.'
    },
    {
        id: 'gen_025',
        text: 'What do you do when you don\'t know the answer to something?',
        category: 'situational',
        difficulty: 'medium',
        tips: 'Show resourcefulness, willingness to learn, and humility.'
    },
    {
        id: 'gen_026',
        text: 'Tell me about a time you had to work with limited resources.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show creativity, problem-solving, and ability to deliver despite constraints.'
    },
    {
        id: 'gen_027',
        text: 'How do you build relationships with coworkers?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Show emotional intelligence and collaboration skills. Give specific examples.'
    },
    {
        id: 'gen_028',
        text: 'Describe a time you had to give difficult feedback.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show empathy, directness, and focus on improvement. Explain the outcome.'
    },
    {
        id: 'gen_029',
        text: 'What\'s your approach to teamwork?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Discuss collaboration, communication, and supporting team goals.'
    },
    {
        id: 'gen_030',
        text: 'Tell me about a time you took initiative.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show proactiveness and ownership. Explain the impact of your initiative.'
    },
    {
        id: 'gen_031',
        text: 'How do you handle ambiguity?',
        category: 'situational',
        difficulty: 'hard',
        tips: 'Show comfort with uncertainty. Explain how you gather information and make decisions.'
    },
    {
        id: 'gen_032',
        text: 'Describe your decision-making process.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Walk through your framework. Mention data, stakeholders, and risk assessment.'
    },
    {
        id: 'gen_033',
        text: 'Tell me about a time you had conflicting priorities.',
        category: 'situational',
        difficulty: 'hard',
        tips: 'Show prioritization skills and communication with stakeholders.'
    },
    {
        id: 'gen_034',
        text: 'What role do you usually take in a team?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Be honest but show flexibility. Give examples of different roles you\'ve played.'
    },
    {
        id: 'gen_035',
        text: 'How do you handle repetitive tasks?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Show reliability and also initiative to improve processes.'
    },
    {
        id: 'gen_036',
        text: 'Describe a time you had to meet a goal you didn\'t agree with.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show professionalism and commitment while respectfully sharing concerns.'
    },
    {
        id: 'gen_037',
        text: 'What do you know about our company?',
        category: 'company-specific',
        difficulty: 'easy',
        tips: 'Research thoroughly. Mention recent news, products, culture, and mission.'
    },
    {
        id: 'gen_038',
        text: 'Why should we hire you?',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Summarize your unique value. Connect your skills to their specific needs.'
    },
    {
        id: 'gen_039',
        text: 'How do you handle multitasking?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Be honest about limits. Discuss prioritization and time management strategies.'
    },
    {
        id: 'gen_040',
        text: 'Tell me about a time you improved a process.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show analytical thinking and initiative. Quantify the improvement.'
    },
    {
        id: 'gen_041',
        text: 'What\'s your management style?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Discuss your approach to delegation, feedback, and team development.'
    },
    {
        id: 'gen_042',
        text: 'Describe a time you had to deliver bad news.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show empathy, transparency, and professionalism. Explain how you handled reactions.'
    },
    {
        id: 'gen_043',
        text: 'How do you measure success?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Discuss both quantitative metrics and qualitative factors. Be role-specific.'
    },
    {
        id: 'gen_044',
        text: 'Tell me about a time you exceeded expectations.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Choose a clear example. Explain what the expectations were and how you surpassed them.'
    },
    {
        id: 'gen_045',
        text: 'How do you stay current in your field?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Mention specific resources, courses, communities, or practices.'
    },
    {
        id: 'gen_046',
        text: 'Describe your communication style.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Be self-aware. Discuss how you adapt to different audiences and situations.'
    },
    {
        id: 'gen_047',
        text: 'Tell me about a time you had to collaborate across departments.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show cross-functional skills and ability to navigate different perspectives.'
    },
    {
        id: 'gen_048',
        text: 'What questions do you have for me?',
        category: 'closing',
        difficulty: 'easy',
        tips: 'ALWAYS have questions prepared. Ask about team, growth, challenges, or culture.'
    },
    {
        id: 'gen_049',
        text: 'How do you handle a situation where you don\'t have all the information?',
        category: 'situational',
        difficulty: 'hard',
        tips: 'Show resourcefulness and communication. Explain how you identify gaps and fill them.'
    },
    {
        id: 'gen_050',
        text: 'Tell me about a time you mentored someone.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show investment in others\' growth. Explain your approach and the outcome.'
    },
    {
        id: 'gen_051',
        text: 'How do you handle competing deadlines from different managers?',
        category: 'situational',
        difficulty: 'hard',
        tips: 'Show communication and negotiation skills. Explain prioritization process.'
    },
    {
        id: 'gen_052',
        text: 'Describe a time you had to say no to a request.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show boundary-setting and professionalism. Explain your reasoning.'
    },
    {
        id: 'gen_053',
        text: 'What would your previous manager say about you?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Be honest and positive. Ideally reference actual feedback you\'ve received.'
    },
    {
        id: 'gen_054',
        text: 'How do you approach professional development?',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Show continuous learning mindset. Mention specific goals and actions.'
    },
    {
        id: 'gen_055',
        text: 'Tell me about a time you had to adjust your communication style.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Show emotional intelligence and adaptability. Give specific examples.'
    },
    {
        id: 'gen_056',
        text: 'What\'s the most difficult decision you\'ve had to make at work?',
        category: 'behavioral',
        difficulty: 'hard',
        tips: 'Show decision-making process, consideration of trade-offs, and courage.'
    },
    {
        id: 'gen_057',
        text: 'How do you handle a situation where a project is going off track?',
        category: 'situational',
        difficulty: 'hard',
        tips: 'Show problem-solving, communication, and course-correction abilities.'
    },
    {
        id: 'gen_058',
        text: 'Describe your approach to problem-solving.',
        category: 'behavioral',
        difficulty: 'medium',
        tips: 'Walk through your framework. Mention analysis, creativity, and implementation.'
    },
    {
        id: 'gen_059',
        text: 'Tell me about a time you received recognition for your work.',
        category: 'behavioral',
        difficulty: 'easy',
        tips: 'Show humility while taking credit. Explain what made it meaningful.'
    },
    {
        id: 'gen_060',
        text: 'What salary range are you looking for?',
        category: 'compensation',
        difficulty: 'hard',
        tips: 'Research market rates. Give a range based on your skills and the market.'
    },
];

// FIELD-SPECIFIC QUESTION TEMPLATES
export const FIELD_SPECIFIC_TEMPLATES = {
    'Software Engineering': [
        'Tell me about a challenging bug you debugged.',
        'How do you approach code reviews?',
        'Describe your experience with [specific technology].',
        'How do you stay updated with new technologies?',
        'Walk me through how you would design [system].',
        'Explain your testing philosophy.',
        'Tell me about a time you optimized performance.',
        'How do you handle technical debt?',
        'Describe your experience with version control.',
        'What\'s your approach to documentation?',
    ],
    'Data Science': [
        'Explain a machine learning project you\'ve worked on.',
        'How do you handle missing data?',
        'Describe your experience with [specific ML framework].',
        'How do you validate model performance?',
        'Tell me about a time you presented findings to non-technical stakeholders.',
        'What\'s your approach to feature engineering?',
        'How do you handle imbalanced datasets?',
        'Describe your data cleaning process.',
        'What metrics do you use to evaluate models?',
        'How do you prevent overfitting?',
    ],
    'Marketing': [
        'Describe a successful campaign you\'ve run.',
        'How do you measure marketing ROI?',
        'Tell me about your experience with [platform].',
        'How do you identify target audiences?',
        'Describe your content creation process.',
        'How do you stay on top of marketing trends?',
        'Tell me about a campaign that didn\'t work.',
        'How do you approach A/B testing?',
        'Describe your social media strategy.',
        'How do you collaborate with sales teams?',
    ],
    'Finance': [
        'Walk me through a financial model you\'ve built.',
        'How do you approach financial forecasting?',
        'Describe your experience with [financial software].',
        'How do you handle financial reporting?',
        'Tell me about a time you identified cost savings.',
        'How do you stay compliant with regulations?',
        'Describe your budgeting process.',
        'How do you analyze financial statements?',
        'Tell me about your experience with audits.',
        'How do you communicate financial data to non-finance stakeholders?',
    ],
    'Design (UI/UX)': [
        'Walk me through your design process.',
        'How do you incorporate user feedback?',
        'Describe a design challenge you faced.',
        'How do you balance aesthetics and functionality?',
        'Tell me about your experience with [design tool].',
        'How do you conduct user research?',
        'Describe your approach to accessibility.',
        'How do you handle design critiques?',
        'Tell me about a redesign project.',
        'How do you measure design success?',
    ],
    // Add more fields as needed
};

/**
 * Generate field-specific questions dynamically
 */
export function generateFieldQuestions(field: string): Question[] {
    const templates = FIELD_SPECIFIC_TEMPLATES[field as keyof typeof FIELD_SPECIFIC_TEMPLATES] ||
        FIELD_SPECIFIC_TEMPLATES['Software Engineering']; // Fallback

    return templates.map((text, index) => ({
        id: `${field.toLowerCase().replace(/\s/g, '_')}_${String(index + 1).padStart(3, '0')}`,
        text,
        category: 'field-specific',
        difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
        tips: `Focus on specific examples from your experience in ${field}.`
    }));
}

/**
 * Get all available questions for a category
 */
export function getQuestionBank(category: 'general' | string): Question[] {
    if (category === 'general') {
        return GENERAL_QUESTIONS;
    }
    return generateFieldQuestions(category);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}