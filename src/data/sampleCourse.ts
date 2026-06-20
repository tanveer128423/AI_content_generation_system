import type { Course } from '../types';

/**
 * A fully pre-generated example course used for the zero-friction "See a sample"
 * demo. It contains real lesson content and quiz questions so visitors can
 * experience the full output without entering an API key. Nothing here calls the
 * model — it is static showcase data loaded straight into the workspace.
 */

const SAMPLE_GENERATED_AT = '2025-01-01T00:00:00.000Z';

function lessonContent(body: string): string {
  return body.trim();
}

export const SAMPLE_COURSE: Course = {
  id: 'course_sample_js',
  name: 'JavaScript Fundamentals (Sample)',
  description:
    'A hands-on introduction to modern JavaScript. Go from variables and functions to working with the DOM and asynchronous code, building real intuition along the way. This is a pre-generated sample so you can see exactly what the AI produces.',
  outcomes: [
    'Write clean, modern JavaScript using variables, functions, and control flow.',
    'Work confidently with arrays, objects, and array methods.',
    'Manipulate the DOM and respond to user events.',
    'Understand asynchronous JavaScript with promises and async/await.',
  ],
  modules: [
    {
      id: 'module_sample_1',
      name: 'Getting Started with JavaScript',
      description: 'The core building blocks every JavaScript developer relies on every day.',
      learning_units: [
        {
          id: 'lu_sample_1_1',
          name: 'Variables, Types & Operators',
          description: 'How JavaScript stores data and the primitive types you will use constantly.',
          learner_journey:
            'Learners move from "what is a variable" to confidently choosing let vs const and reasoning about types.',
          duration: 30,
          artifacts: [{ artifact_type: 'video', link: '' }],
          additional_guidance: '',
          generated_at: SAMPLE_GENERATED_AT,
          generated_content: lessonContent(
            `
# Variables, Types & Operators

JavaScript programs are mostly about **storing data** and **transforming it**. Variables are how you give that data a name.

## Declaring variables

Use \`const\` by default, and \`let\` only when the value needs to change. Avoid the old \`var\`.

\`\`\`js
const name = "Ada";      // cannot be reassigned
let score = 0;            // can change later
score = score + 10;
\`\`\`

## Primitive types

JavaScript has a small set of primitive types you will use all the time:

| Type | Example |
| --- | --- |
| String | \`"hello"\` |
| Number | \`42\`, \`3.14\` |
| Boolean | \`true\`, \`false\` |
| Null | \`null\` |
| Undefined | \`undefined\` |

## Operators

Operators transform values:

\`\`\`js
const total = 5 + 3;        // 8  (arithmetic)
const isAdult = age >= 18;  // comparison → boolean
const greeting = "Hi " + name; // string concatenation
\`\`\`

> **Tip:** Prefer \`===\` over \`==\`. The strict equality operator does not perform surprising type coercion.

## Key takeaways

- Reach for \`const\` first, \`let\` when you must reassign.
- Know the primitive types — most bugs come from confusing them.
- Use \`===\` for predictable comparisons.
            `
          ),
          questions: {
            total_questions: 5,
            easy: 2,
            medium: 2,
            hard: 1,
            generated_at: SAMPLE_GENERATED_AT,
            generated_questions: [
              {
                id: 'q_s_1',
                difficulty: 'easy',
                question: 'Which keyword should you use by default for a value that never changes?',
                options: ['var', 'let', 'const', 'static'],
                correct_answer: 2,
                explanation: '`const` declares a binding that cannot be reassigned, making it the safest default.',
              },
              {
                id: 'q_s_2',
                difficulty: 'easy',
                question: 'What is the result of the expression `5 + 3`?',
                options: ['"53"', '8', 'undefined', 'NaN'],
                correct_answer: 1,
                explanation: 'Both operands are numbers, so `+` performs arithmetic addition, giving 8.',
              },
              {
                id: 'q_s_3',
                difficulty: 'medium',
                question: 'Why is `===` generally preferred over `==`?',
                options: [
                  'It is faster to type',
                  'It avoids implicit type coercion',
                  'It works only with numbers',
                  'It is required by the language',
                ],
                correct_answer: 1,
                explanation: '`===` compares value and type without coercion, avoiding surprising results like `0 == ""`.',
              },
              {
                id: 'q_s_4',
                difficulty: 'medium',
                question: 'What type does the comparison `age >= 18` evaluate to?',
                options: ['Number', 'String', 'Boolean', 'Undefined'],
                correct_answer: 2,
                explanation: 'Comparison operators always produce a Boolean (`true` or `false`).',
              },
              {
                id: 'q_s_5',
                difficulty: 'hard',
                question: 'Which statement about `let` and `const` is correct?',
                options: [
                  '`const` variables cannot be reassigned, but objects they hold can still be mutated',
                  '`const` makes objects completely immutable',
                  '`let` and `const` are identical in every way',
                  '`let` cannot be reassigned',
                ],
                correct_answer: 0,
                explanation:
                  '`const` prevents reassignment of the binding, but the contents of a referenced object or array can still change.',
              },
            ],
          },
        },
        {
          id: 'lu_sample_1_2',
          name: 'Functions & Scope',
          description: 'Packaging logic into reusable functions and understanding where variables live.',
          learner_journey: 'Learners write their first functions and understand parameter passing and return values.',
          duration: 35,
          artifacts: [],
          additional_guidance: '',
          generated_at: SAMPLE_GENERATED_AT,
          generated_content: lessonContent(
            `
# Functions & Scope

Functions let you name a piece of logic and run it whenever you need it.

## Declaring functions

\`\`\`js
function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b; // arrow function
\`\`\`

- **Parameters** (\`a\`, \`b\`) are inputs.
- \`return\` sends a value back to the caller.

## Scope

A variable declared inside a function is **not** visible outside it:

\`\`\`js
function greet() {
  const message = "hi";
  return message;
}
// console.log(message) // ❌ ReferenceError
\`\`\`

This is called **lexical scope** — inner code can see outer variables, but not the other way around.

## Key takeaways

- Functions turn repeated logic into a single reusable unit.
- Arrow functions are a concise alternative for short functions.
- Variables are scoped to the block or function they are declared in.
            `
          ),
          questions: {
            total_questions: 5,
            easy: 2,
            medium: 2,
            hard: 1,
            generated_at: SAMPLE_GENERATED_AT,
            generated_questions: [
              {
                id: 'q_s_6',
                difficulty: 'easy',
                question: 'What does the `return` keyword do inside a function?',
                options: [
                  'Prints to the console',
                  'Sends a value back to the caller',
                  'Stops the whole program',
                  'Declares a variable',
                ],
                correct_answer: 1,
                explanation: '`return` ends the function and hands a value back to wherever it was called.',
              },
              {
                id: 'q_s_7',
                difficulty: 'easy',
                question: 'Which of these is a valid arrow function that doubles a number?',
                options: ['const d = n => n * 2', 'function d => n * 2', 'const d = (n) { n * 2 }', 'arrow d(n) = n*2'],
                correct_answer: 0,
                explanation: 'Arrow functions use the `(params) => expression` syntax; a single param needs no parentheses.',
              },
              {
                id: 'q_s_8',
                difficulty: 'medium',
                question: 'What happens if you access a function-scoped variable from outside the function?',
                options: ['It returns undefined', 'It returns null', 'A ReferenceError is thrown', 'It returns 0'],
                correct_answer: 2,
                explanation: 'Variables declared inside a function are not visible outside it, so accessing them throws a ReferenceError.',
              },
              {
                id: 'q_s_9',
                difficulty: 'medium',
                question: 'In `function add(a, b)`, what are `a` and `b` called?',
                options: ['Arguments', 'Parameters', 'Returns', 'Scopes'],
                correct_answer: 1,
                explanation: 'Names in the function definition are parameters; the values passed in when calling are arguments.',
              },
              {
                id: 'q_s_10',
                difficulty: 'hard',
                question: 'What does "lexical scope" mean?',
                options: [
                  'Inner code can access variables from its surrounding (outer) scope',
                  'All variables are global',
                  'Functions cannot access any outside variables',
                  'Scope is decided at runtime by the caller',
                ],
                correct_answer: 0,
                explanation: 'Lexical scope means a function can read variables from the scope where it was defined.',
              },
            ],
          },
        },
      ],
    },
    {
      id: 'module_sample_2',
      name: 'Working with Data',
      description: 'Arrays, objects, and the methods that make data wrangling pleasant.',
      learning_units: [
        {
          id: 'lu_sample_2_1',
          name: 'Arrays & Array Methods',
          description: 'Storing lists of data and transforming them with map, filter, and reduce.',
          learner_journey: 'Learners go from indexing arrays to chaining higher-order methods.',
          duration: 40,
          artifacts: [],
          additional_guidance: '',
          generated_at: SAMPLE_GENERATED_AT,
          generated_content: lessonContent(
            `
# Arrays & Array Methods

Arrays hold ordered lists of values.

\`\`\`js
const scores = [90, 75, 60, 88];
scores[0]; // 90
scores.length; // 4
\`\`\`

## The big three

\`\`\`js
// map: transform every item
const doubled = scores.map(s => s * 2);

// filter: keep items that pass a test
const passing = scores.filter(s => s >= 70);

// reduce: collapse to a single value
const total = scores.reduce((sum, s) => sum + s, 0);
\`\`\`

These methods **do not** mutate the original array — they return a new one, which keeps your code predictable.

## Key takeaways

- Use \`map\` to transform, \`filter\` to select, \`reduce\` to aggregate.
- They return new arrays rather than changing the original.
- Chaining them makes data pipelines readable.
            `
          ),
          questions: {
            total_questions: 5,
            easy: 2,
            medium: 2,
            hard: 1,
            generated_at: SAMPLE_GENERATED_AT,
            generated_questions: [
              {
                id: 'q_s_11',
                difficulty: 'easy',
                question: 'What does `scores.length` return for `[90, 75, 60, 88]`?',
                options: ['3', '4', '88', 'undefined'],
                correct_answer: 1,
                explanation: 'The array has four elements, so `.length` is 4.',
              },
              {
                id: 'q_s_12',
                difficulty: 'easy',
                question: 'Which method transforms every item into a new value?',
                options: ['filter', 'map', 'reduce', 'push'],
                correct_answer: 1,
                explanation: '`map` runs a function on each element and returns a new array of the results.',
              },
              {
                id: 'q_s_13',
                difficulty: 'medium',
                question: 'Which method would you use to keep only scores >= 70?',
                options: ['map', 'reduce', 'filter', 'forEach'],
                correct_answer: 2,
                explanation: '`filter` keeps only the elements for which the callback returns true.',
              },
              {
                id: 'q_s_14',
                difficulty: 'medium',
                question: 'What is the result of `[1, 2, 3].reduce((sum, n) => sum + n, 0)`?',
                options: ['0', '6', '[1,2,3]', 'undefined'],
                correct_answer: 1,
                explanation: 'reduce accumulates: 0+1+2+3 = 6.',
              },
              {
                id: 'q_s_15',
                difficulty: 'hard',
                question: 'Why are map, filter, and reduce considered "non-mutating"?',
                options: [
                  'They return new arrays instead of changing the original',
                  'They delete the original array',
                  'They only work on numbers',
                  'They run faster than loops',
                ],
                correct_answer: 0,
                explanation: 'These methods produce a new array and leave the source array unchanged, improving predictability.',
              },
            ],
          },
        },
        {
          id: 'lu_sample_2_2',
          name: 'Objects & the DOM',
          description: 'Modeling structured data with objects and reading it onto the page.',
          learner_journey: 'Learners connect data objects to elements on a web page.',
          duration: 40,
          artifacts: [],
          additional_guidance: '',
          generated_at: SAMPLE_GENERATED_AT,
          generated_content: lessonContent(
            `
# Objects & the DOM

Objects group related data under named keys.

\`\`\`js
const user = {
  name: "Ada",
  age: 36,
  isAdmin: true,
};

user.name;     // "Ada"
user["age"];   // 36
\`\`\`

## Touching the page

The **DOM** is the browser's live representation of your HTML. You can read and change it:

\`\`\`js
const heading = document.querySelector("h1");
heading.textContent = \`Welcome, \${user.name}!\`;
\`\`\`

## Key takeaways

- Objects model "things" with named properties.
- Access properties with dot or bracket notation.
- \`document.querySelector\` finds elements you can read or update.
            `
          ),
          questions: {
            total_questions: 5,
            easy: 2,
            medium: 2,
            hard: 1,
            generated_at: SAMPLE_GENERATED_AT,
            generated_questions: [
              {
                id: 'q_s_16',
                difficulty: 'easy',
                question: 'How do you access the `name` property of an object `user`?',
                options: ['user->name', 'user.name', 'user::name', 'name(user)'],
                correct_answer: 1,
                explanation: 'Dot notation `user.name` reads the property. Bracket notation `user["name"]` also works.',
              },
              {
                id: 'q_s_17',
                difficulty: 'easy',
                question: 'What does the DOM represent?',
                options: [
                  'The server database',
                  "The browser's live structure of the HTML page",
                  'A JavaScript file',
                  'A CSS stylesheet',
                ],
                correct_answer: 1,
                explanation: 'The DOM (Document Object Model) is the in-memory, live tree of the page you can read and modify.',
              },
              {
                id: 'q_s_18',
                difficulty: 'medium',
                question: 'Which call selects the first `<h1>` element on the page?',
                options: [
                  'document.querySelector("h1")',
                  'document.getElement("h1")',
                  'document.find("h1")',
                  'document.h1()',
                ],
                correct_answer: 0,
                explanation: '`document.querySelector` takes a CSS selector and returns the first matching element.',
              },
              {
                id: 'q_s_19',
                difficulty: 'medium',
                question: 'What does setting `heading.textContent` do?',
                options: [
                  'Deletes the element',
                  'Changes the visible text inside the element',
                  'Adds a new CSS class',
                  'Reloads the page',
                ],
                correct_answer: 1,
                explanation: 'Assigning to `textContent` replaces the text shown inside that element.',
              },
              {
                id: 'q_s_20',
                difficulty: 'hard',
                question: 'Both `user.age` and `user["age"]` work. When is bracket notation specifically required?',
                options: [
                  'When the key is stored in a variable or is not a valid identifier',
                  'Never — dot notation always works',
                  'Only for numbers',
                  'Only inside functions',
                ],
                correct_answer: 0,
                explanation: 'Bracket notation is needed when the property name is dynamic (in a variable) or contains characters not allowed in identifiers.',
              },
            ],
          },
        },
      ],
    },
    {
      id: 'module_sample_3',
      name: 'Asynchronous JavaScript',
      description: 'Handle data that arrives later without freezing the page.',
      learning_units: [
        {
          id: 'lu_sample_3_1',
          name: 'Project: Fetch & Display Data',
          description: 'A hands-on project using promises and async/await to load data from an API.',
          learner_journey: 'Learners build a small feature that fetches and renders remote data.',
          duration: 50,
          artifacts: [{ artifact_type: 'project', link: '' }],
          additional_guidance: '',
          generated_at: SAMPLE_GENERATED_AT,
          generated_content: lessonContent(
            `
# Project: Fetch & Display Data

Real apps load data over the network. That data arrives **later**, so JavaScript uses **promises** to represent "a value that isn't ready yet."

## async / await

\`\`\`js
async function loadUser() {
  try {
    const response = await fetch("https://api.example.com/user/1");
    const user = await response.json();
    console.log(user.name);
  } catch (error) {
    console.error("Failed to load:", error);
  }
}
\`\`\`

- \`await\` pauses until the promise resolves.
- Wrap awaits in \`try/catch\` to handle failures gracefully.

## Your task

1. Fetch a list of items from any public API.
2. Render each item's title into the page.
3. Show a friendly message if the request fails.

## Key takeaways

- Promises model values that arrive later.
- \`async/await\` makes asynchronous code read top-to-bottom.
- Always handle errors so the UI never breaks silently.
            `
          ),
          questions: {
            total_questions: 5,
            easy: 2,
            medium: 2,
            hard: 1,
            generated_at: SAMPLE_GENERATED_AT,
            generated_questions: [
              {
                id: 'q_s_21',
                difficulty: 'easy',
                question: 'What does the `await` keyword do?',
                options: [
                  'Pauses until a promise resolves',
                  'Creates a new variable',
                  'Loops forever',
                  'Prints to the console',
                ],
                correct_answer: 0,
                explanation: '`await` suspends the async function until the awaited promise settles, then returns its value.',
              },
              {
                id: 'q_s_22',
                difficulty: 'easy',
                question: 'Which function is commonly used to make a network request in the browser?',
                options: ['request()', 'fetch()', 'http()', 'load()'],
                correct_answer: 1,
                explanation: 'The built-in `fetch()` function starts an HTTP request and returns a promise.',
              },
              {
                id: 'q_s_23',
                difficulty: 'medium',
                question: 'Why wrap `await` calls in a `try/catch` block?',
                options: [
                  'To make them run faster',
                  'To handle errors when a request fails',
                  'It is required syntax',
                  'To convert them to synchronous code',
                ],
                correct_answer: 1,
                explanation: 'If an awaited promise rejects, the error is thrown; try/catch lets you handle it gracefully.',
              },
              {
                id: 'q_s_24',
                difficulty: 'medium',
                question: 'What does `await response.json()` return?',
                options: [
                  'The raw text only',
                  'A parsed JavaScript value from the JSON body',
                  'The HTTP status code',
                  'A new fetch request',
                ],
                correct_answer: 1,
                explanation: '`.json()` reads the response body and parses it into a JavaScript object/array (also a promise, hence await).',
              },
              {
                id: 'q_s_25',
                difficulty: 'hard',
                question: 'A function marked `async` always returns what?',
                options: ['A string', 'undefined', 'A promise', 'A number'],
                correct_answer: 2,
                explanation: 'An `async` function always returns a promise that resolves to the returned value.',
              },
            ],
          },
        },
      ],
    },
  ],
};
