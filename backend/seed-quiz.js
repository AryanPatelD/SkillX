const db = require('./src/models');

const seedQuizData = async () => {
    try {
        const QuizCategory = db.QuizCategory;
        const QuizQuestion = db.QuizQuestion;

        // Check if data already exists
        const existingCategories = await QuizCategory.findAll();
        if (existingCategories.length > 0) {
            console.log('Quiz data already seeded');
            return;
        }

        // Create categories
        const cpp = await QuizCategory.create({
            name: 'C++',
            description: 'Test your C++ programming knowledge',
        });

        const math = await QuizCategory.create({
            name: 'Mathematics',
            description: 'Test your mathematics knowledge',
        });

        const gk = await QuizCategory.create({
            name: 'General Knowledge',
            description: 'Test your general knowledge',
        });

        // C++ Questions (5 easy, 4 medium, 1 hard)
        const cppQuestions = [
            // Easy
            {
                categoryId: cpp.id,
                question: 'What is the correct syntax to include a standard library in C++?',
                option_a: '#include <iostream>',
                option_b: 'import iostream',
                option_c: 'using iostream',
                option_d: 'include iostream',
                correct_answer: 'A',
                difficulty_level: 'Easy',
            },
            {
                categoryId: cpp.id,
                question: 'Which of the following is the correct way to declare a variable in C++?',
                option_a: 'int x;',
                option_b: 'x int;',
                option_c: '(int) x;',
                option_d: 'int: x;',
                correct_answer: 'A',
                difficulty_level: 'Easy',
            },
            {
                categoryId: cpp.id,
                question: 'What is the output of: cout << 5 + 3 * 2;',
                option_a: '16',
                option_b: '11',
                option_c: '13',
                option_d: '14',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: cpp.id,
                question: 'Which keyword is used to define a function in C++?',
                option_a: 'function',
                option_b: 'void',
                option_c: 'def',
                option_d: 'func',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: cpp.id,
                question: 'What does "cout" stand for in C++?',
                option_a: 'Console output',
                option_b: 'Character output',
                option_c: 'Code output',
                option_d: 'Command output',
                correct_answer: 'A',
                difficulty_level: 'Easy',
            },
            // Medium
            {
                categoryId: cpp.id,
                question: 'What is the difference between "cin" and "scanf"?',
                option_a: 'cin is faster than scanf',
                option_b: 'cin is object-oriented while scanf is C-style',
                option_c: 'scanf is more secure',
                option_d: 'There is no difference',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            {
                categoryId: cpp.id,
                question: 'Which of the following is NOT a valid access modifier in C++?',
                option_a: 'public',
                option_b: 'private',
                option_c: 'protected',
                option_d: 'global',
                correct_answer: 'D',
                difficulty_level: 'Medium',
            },
            {
                categoryId: cpp.id,
                question: 'What is the purpose of the "virtual" keyword in C++?',
                option_a: 'To declare a virtual function for polymorphism',
                option_b: 'To create a new variable',
                option_c: 'To enhance performance',
                option_d: 'To prevent compilation errors',
                correct_answer: 'A',
                difficulty_level: 'Medium',
            },
            {
                categoryId: cpp.id,
                question: 'Which operator is used to access members of a class through a pointer?',
                option_a: '.',
                option_b: '->',
                option_c: '::',
                option_d: '&',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            // Hard
            {
                categoryId: cpp.id,
                question: 'What is the time complexity of searching an element in a binary search tree in the worst case?',
                option_a: 'O(log n)',
                option_b: 'O(n)',
                option_c: 'O(n^2)',
                option_d: 'O(1)',
                correct_answer: 'B',
                difficulty_level: 'Hard',
            },
        ];

        // Mathematics Questions (5 easy, 4 medium, 1 hard)
        const mathQuestions = [
            // Easy
            {
                categoryId: math.id,
                question: 'What is the value of 7 + 8?',
                option_a: '14',
                option_b: '15',
                option_c: '16',
                option_d: '17',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: math.id,
                question: 'What is 10 × 5?',
                option_a: '40',
                option_b: '45',
                option_c: '50',
                option_d: '55',
                correct_answer: 'C',
                difficulty_level: 'Easy',
            },
            {
                categoryId: math.id,
                question: 'Solve: 20 ÷ 4',
                option_a: '4',
                option_b: '5',
                option_c: '6',
                option_d: '7',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: math.id,
                question: 'What is the square root of 144?',
                option_a: '10',
                option_b: '11',
                option_c: '12',
                option_d: '13',
                correct_answer: 'C',
                difficulty_level: 'Easy',
            },
            {
                categoryId: math.id,
                question: 'What is 2^3?',
                option_a: '6',
                option_b: '8',
                option_c: '10',
                option_d: '12',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            // Medium
            {
                categoryId: math.id,
                question: 'Solve: 3x + 5 = 20',
                option_a: 'x = 3',
                option_b: 'x = 5',
                option_c: 'x = 7',
                option_d: 'x = 9',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            {
                categoryId: math.id,
                question: 'What is the area of a rectangle with length 5 and width 3?',
                option_a: '8',
                option_b: '15',
                option_c: '16',
                option_d: '20',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            {
                categoryId: math.id,
                question: 'If x^2 = 16, what is x?',
                option_a: '2',
                option_b: '3',
                option_c: '4',
                option_d: '5',
                correct_answer: 'C',
                difficulty_level: 'Medium',
            },
            {
                categoryId: math.id,
                question: 'What is the derivative of x^2?',
                option_a: 'x',
                option_b: '2x',
                option_c: 'x^2',
                option_d: '2x^2',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            // Hard
            {
                categoryId: math.id,
                question: 'What is the sum of the first 100 natural numbers?',
                option_a: '5000',
                option_b: '5050',
                option_c: '5100',
                option_d: '5150',
                correct_answer: 'B',
                difficulty_level: 'Hard',
            },
        ];

        // General Knowledge Questions (5 easy, 4 medium, 1 hard)
        const gkQuestions = [
            // Easy
            {
                categoryId: gk.id,
                question: 'What is the capital of France?',
                option_a: 'London',
                option_b: 'Paris',
                option_c: 'Berlin',
                option_d: 'Madrid',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: gk.id,
                question: 'Who was the first President of India?',
                option_a: 'Jawaharlal Nehru',
                option_b: 'Dr. Rajendra Prasad',
                option_c: 'Sardar Vallabhbhai Patel',
                option_d: 'Lal Bahadur Shastri',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: gk.id,
                question: 'Which planet is known as the Red Planet?',
                option_a: 'Venus',
                option_b: 'Mars',
                option_c: 'Jupiter',
                option_d: 'Saturn',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            {
                categoryId: gk.id,
                question: 'What is the largest ocean on Earth?',
                option_a: 'Atlantic Ocean',
                option_b: 'Indian Ocean',
                option_c: 'Pacific Ocean',
                option_d: 'Arctic Ocean',
                correct_answer: 'C',
                difficulty_level: 'Easy',
            },
            {
                categoryId: gk.id,
                question: 'In which year did India become independent?',
                option_a: '1945',
                option_b: '1947',
                option_c: '1950',
                option_d: '1952',
                correct_answer: 'B',
                difficulty_level: 'Easy',
            },
            // Medium
            {
                categoryId: gk.id,
                question: 'Who wrote the Indian Constitution?',
                option_a: 'Dr. B.R. Ambedkar',
                option_b: 'Jawaharlal Nehru',
                option_c: 'Mahatma Gandhi',
                option_d: 'Sardar Patel',
                correct_answer: 'A',
                difficulty_level: 'Medium',
            },
            {
                categoryId: gk.id,
                question: 'What is the smallest country in the world by area?',
                option_a: 'Monaco',
                option_b: 'Vatican City',
                option_c: 'San Marino',
                option_d: 'Liechtenstein',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            {
                categoryId: gk.id,
                question: 'Which is the longest river in the world?',
                option_a: 'Amazon',
                option_b: 'Nile',
                option_c: 'Yangtze',
                option_d: 'Mississippi',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            {
                categoryId: gk.id,
                question: 'How many strings does a standard violin have?',
                option_a: '3',
                option_b: '4',
                option_c: '5',
                option_d: '6',
                correct_answer: 'B',
                difficulty_level: 'Medium',
            },
            // Hard
            {
                categoryId: gk.id,
                question: 'Which country was the first to legalize same-sex marriage?',
                option_a: 'Canada',
                option_b: 'Netherlands',
                option_c: 'Sweden',
                option_d: 'Spain',
                correct_answer: 'B',
                difficulty_level: 'Hard',
            },
        ];

        // Bulk create all questions
        await QuizQuestion.bulkCreate([...cppQuestions, ...mathQuestions, ...gkQuestions]);

        console.log('✅ Quiz data seeded successfully!');
    } catch (err) {
        console.error('Error seeding quiz data:', err);
    }
};

module.exports = seedQuizData;
