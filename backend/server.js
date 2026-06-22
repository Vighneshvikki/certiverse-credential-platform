import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay client if keys are provided and not placeholders
const hasValidKeys = process.env.RAZORPAY_KEY_ID && 
                     process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder' &&
                     process.env.RAZORPAY_KEY_SECRET &&
                     process.env.RAZORPAY_KEY_SECRET !== 'placeholder_secret';

let razorpayClient = null;
if (hasValidKeys) {
  try {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay Client initialized successfully (Test/Live Mode).');
  } catch (err) {
    console.error('Error initializing Razorpay Client:', err.message);
  }
} else {
  console.log('Razorpay keys not configured or using placeholders. Falling back to sandbox/mock payment pathway.');
}

// Enable CORS and parse JSON request bodies
app.use(cors());
app.use(express.json());

// In-memory quiz sessions store
const sessions = {};

// Categories Database
const categories = [
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'HTML, CSS, modern JavaScript (ES6+), and React frontend concepts.',
    icon: 'Code',
    questionCount: 5,
    duration: '5 mins'
  },
  {
    id: 'dbms',
    name: 'Database Management Systems (DBMS)',
    description: 'Relational databases, SQL queries, normalization, ACID properties, and indexing.',
    icon: 'Database',
    questionCount: 5,
    duration: '5 mins'
  },
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Process management, CPU scheduling, memory management, and deadlocks.',
    icon: 'Cpu',
    questionCount: 5,
    duration: '5 mins'
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence & ML',
    description: 'Neural networks, search algorithms, machine learning basics, and NLP concepts.',
    icon: 'Brain',
    questionCount: 5,
    duration: '5 mins'
  },
  {
    id: 'aptitude',
    name: 'Quantitative Aptitude',
    description: 'Logical reasoning, speed & distance, work & time problems, and sequences.',
    icon: 'TrendingUp',
    questionCount: 5,
    duration: '5 mins'
  }
];

// Questions Database
const questions = {
  'web-dev': [
    {
      id: 0,
      question: 'Which HTTP status code represents "Internal Server Error"?',
      options: ['400 Bad Request', '403 Forbidden', '404 Not Found', '500 Internal Server Error'],
      correctAnswer: 3,
      explanation: 'The 500 Internal Server Error is a generic error message, given when an unexpected condition was encountered and no more specific message is suitable.'
    },
    {
      id: 1,
      question: 'What is the purpose of the CSS "box-sizing: border-box" property?',
      options: [
        'Includes padding and border in the element\'s total width and height',
        'Excludes padding and border from the total width and height calculation',
        'Applies a default reset to all outer margins',
        'Forces the element to behave as an inline-block container'
      ],
      correctAnswer: 0,
      explanation: 'With box-sizing: border-box, the width and height properties include content, padding, and border, making layout sizing much more predictable.'
    },
    {
      id: 2,
      question: 'In React, which hook is primarily used to perform side effects in functional components?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 1,
      explanation: 'The useEffect hook lets you perform side effects (such as data fetching, subscriptions, or manual DOM updates) in React functional components.'
    },
    {
      id: 3,
      question: 'Which of the following JavaScript array methods returns a new array containing only elements that pass a specified test?',
      options: ['map()', 'filter()', 'reduce()', 'find()'],
      correctAnswer: 1,
      explanation: 'The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.'
    },
    {
      id: 4,
      question: 'What does DOM stand for in Web Development?',
      options: ['Document Object Model', 'Data Object Management', 'Detailed Object Mapping', 'Document Oriented Module'],
      correctAnswer: 0,
      explanation: 'DOM stands for Document Object Model. It is a programming interface for web documents, representing the page so that programs can change the document structure, style, and content.'
    }
  ],
  'dbms': [
    {
      id: 0,
      question: 'Which normal form is specifically concerned with eliminating transitive dependencies?',
      options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
      correctAnswer: 2,
      explanation: 'Third Normal Form (3NF) requires the table to be in 2NF and that no non-primary-key column is transitively dependent on the primary key.'
    },
    {
      id: 1,
      question: 'What does the "A" in ACID database transaction properties stand for?',
      options: ['Authority', 'Agreement', 'Atomicity', 'Availability'],
      correctAnswer: 2,
      explanation: 'Atomicity guarantees that each transaction is treated as a single "unit", which either succeeds completely or fails completely.'
    },
    {
      id: 2,
      question: 'Which SQL clause is used to filter group summary records AFTER a GROUP BY operation has occurred?',
      options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
      correctAnswer: 1,
      explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions. HAVING filters rows after grouping.'
    },
    {
      id: 3,
      question: 'What type of join returns all rows from the left table, and the matched rows from the right table (with NULLs if no match)?',
      options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
      correctAnswer: 1,
      explanation: 'A LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and matching records from the right table. Non-matching right side values are returned as NULL.'
    },
    {
      id: 4,
      question: 'What is a foreign key in a database schema?',
      options: [
        'A key containing alphanumeric characters for web encryption',
        'A primary key from another table that links the two tables together',
        'A key generated automatically by the server during records insertion',
        'A secondary key used for indexing and optimizing range scans'
      ],
      correctAnswer: 1,
      explanation: 'A foreign key is a column or group of columns in a relational database table that provides a link between data in two tables, referencing the primary key of another table.'
    }
  ],
  'os': [
    {
      id: 0,
      question: 'What is a deadlock in Operating Systems?',
      options: [
        'A process executing in an infinite loop due to programmer error',
        'A hardware failure that halts the CPU execution immediately',
        'A state where a set of processes are blocked because each is holding a resource and waiting for another resource held by some other process',
        'A memory leak that forces the operating system to shut down services'
      ],
      correctAnswer: 2,
      explanation: 'A deadlock happens when processes are stuck in a circular wait, where each holds a resource the other needs, and neither can proceed.'
    },
    {
      id: 1,
      question: 'Which CPU scheduling algorithm is non-preemptive and processes threads in the exact order they arrive?',
      options: ['First-Come, First-Served (FCFS)', 'Round Robin (RR)', 'Shortest Remaining Time First (SRTF)', 'Priority Preemptive'],
      correctAnswer: 0,
      explanation: 'First-Come, First-Served (FCFS) is the simplest non-preemptive scheduling algorithm, scheduling processes in order of their arrival in the ready queue.'
    },
    {
      id: 2,
      question: 'What is "thrashing" in virtual memory systems?',
      options: [
        'High CPU utilization due to intensive compute threads',
        'Excessive paging activity where the system spends more time swapping page blocks in and out of disk than executing processes',
        'An optimization technique that increases hard drive read throughput',
        'A mechanism that deletes temporary browser caching systems'
      ],
      correctAnswer: 1,
      explanation: 'Thrashing occurs when the virtual memory subsystem is in a constant state of paging (moving memory blocks to/from swap files), resulting in close to zero useful CPU work.'
    },
    {
      id: 3,
      question: 'Which system call is used in Unix-like operating systems to spawn a child process that is a duplicate of the parent?',
      options: ['fork()', 'exec()', 'wait()', 'exit()'],
      correctAnswer: 0,
      explanation: 'The fork() system call creates a new process (child process) by duplicating the calling process (parent process).'
    },
    {
      id: 4,
      question: 'What is the primary function of the Page Table in virtual memory systems?',
      options: [
        'To store the files directories and access permissions',
        'To map the virtual memory addresses of a process to physical memory addresses',
        'To schedule thread contexts across available physical CPU cores',
        'To cache network databases and files inside RAM modules'
      ],
      correctAnswer: 1,
      explanation: 'The page table is a data structure used by a virtual memory system in an OS to store the mapping between virtual addresses and physical addresses.'
    }
  ],
  'ai': [
    {
      id: 0,
      question: 'What is the fundamental building block of an Artificial Neural Network, designed to simulate a biological neuron?',
      options: ['Neuron (Perceptron)', 'Synapse', 'Activation Coefficient', 'Feedback Loop'],
      correctAnswer: 0,
      explanation: 'The perceptron (or neuron) is the basic unit of an artificial neural network. It takes inputs, weighs them, sums them, applies an activation function, and outputs a signal.'
    },
    {
      id: 1,
      question: 'Which search algorithm expands the shallowest nodes first and is guaranteed to find the shortest path in an unweighted graph?',
      options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'A* Search', 'Greedy Best-First Search'],
      correctAnswer: 1,
      explanation: 'Breadth-First Search (BFS) explores the graph layer by layer, meaning it will always find the path with the fewest edges (shortest path) first in an unweighted graph.'
    },
    {
      id: 2,
      question: 'What does NLP stand for in Artificial Intelligence?',
      options: ['Natural Language Processing', 'Network Level Protocol', 'Neural Logic Programming', 'Numerical Linear Prediction'],
      correctAnswer: 0,
      explanation: 'NLP stands for Natural Language Processing, a field of AI that focuses on enabling computers to understand, interpret, and generate human language.'
    },
    {
      id: 3,
      question: 'In machine learning, what is "overfitting"?',
      options: [
        'A scenario where the model performs exceptionally on training data but fails to generalize to unseen test data',
        'A scenario where the model fails to learn patterns even on the training data',
        'A configuration error where the neural network contains too few layers to capture parameters',
        'A training process that completes too fast due to sparse datasets'
      ],
      correctAnswer: 0,
      explanation: 'Overfitting occurs when a machine learning model learns the noise and details of the training data to the extent that it negatively impacts its performance on new, unseen data.'
    },
    {
      id: 4,
      question: 'Which of the following is a reinforcement learning algorithm based on learning value functions?',
      options: ['Q-Learning', 'Linear Regression', 'K-Means Clustering', 'Support Vector Machines (SVM)'],
      correctAnswer: 0,
      explanation: 'Q-learning is a model-free reinforcement learning algorithm to learn the quality of actions telling an agent what action to take under what circumstances.'
    }
  ],
  'aptitude': [
    {
      id: 0,
      question: 'A train 150m long passes a telegraph pole in 15 seconds. What is the speed of the train in km/h?',
      options: ['30 km/h', '36 km/h', '45 km/h', '54 km/h'],
      correctAnswer: 1,
      explanation: 'Speed = Distance / Time = 150m / 15s = 10 m/s. To convert m/s to km/h, multiply by 18/5. So, 10 * (18 / 5) = 36 km/h.'
    },
    {
      id: 1,
      question: 'If 5 men or 9 women can complete a piece of work in 19 days, how many days will it take for 3 men and 6 women to complete the same work?',
      options: ['10 days', '12 days', '15 days', '18 days'],
      correctAnswer: 2,
      explanation: '5 men = 9 women work output. Thus 1 man = 1.8 women. 3 men = 3 * 1.8 = 5.4 women. Total workers = 3 men + 6 women = 5.4 + 6 = 11.4 women. Days needed = (9 women * 19 days) / 11.4 women = 15 days.'
    },
    {
      id: 2,
      question: 'A person crosses a 600-meter long street in exactly 5 minutes. What is his speed in kilometers per hour (km/h)?',
      options: ['3.6 km/h', '5.4 km/h', '7.2 km/h', '8.6 km/h'],
      correctAnswer: 2,
      explanation: 'Speed = 600m / (5 * 60)s = 600 / 300 = 2 m/s. Converting to km/h: 2 * 18/5 = 7.2 km/h.'
    },
    {
      id: 3,
      question: 'What is the next number in the arithmetic pattern: 2, 6, 12, 20, 30, ...?',
      options: ['38', '40', '42', '44'],
      correctAnswer: 2,
      explanation: 'The differences between consecutive terms are increasing consecutive even numbers: 6-2 = 4, 12-6 = 6, 20-12 = 8, 30-20 = 10. The next difference is 12, so the next term is 30 + 12 = 42.'
    },
    {
      id: 4,
      question: 'The average of 5 consecutive numbers is 20. What is the largest of these 5 numbers?',
      options: ['20', '21', '22', '24'],
      correctAnswer: 2,
      explanation: 'Let the consecutive numbers be x-2, x-1, x, x+1, x+2. Their average is x = 20. The numbers are 18, 19, 20, 21, 22. The largest is 22.'
    }
  ]
};

// API: GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// API: GET /api/questions/:category
// CRITICAL: We omit the 'correctAnswer' and 'explanation' fields from the client
// payload to prevent inspect-element cheating during the test.
app.get('/api/questions/:category', (req, res) => {
  const categoryId = req.params.category;
  const categoryQuestions = questions[categoryId];

  if (!categoryQuestions) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Map to exclude correctAnswer and explanation
  const safeQuestions = categoryQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json(safeQuestions);
});

// API: POST /api/submit
// Evaluates the user's responses, creates a quiz session record in-memory,
// and returns the initial calculated score summary.
app.post('/api/submit', (req, res) => {
  const { category, answers, userName } = req.body;

  if (!category || !answers) {
    return res.status(400).json({ error: 'Category and answers are required' });
  }

  const categoryQuestions = questions[category];
  if (!categoryQuestions) {
    return res.status(404).json({ error: 'Category not found' });
  }

  let score = 0;
  const totalQuestions = categoryQuestions.length;

  // Grade user's answers
  categoryQuestions.forEach((q) => {
    const userAns = answers[q.id];
    if (userAns !== undefined && Number(userAns) === q.correctAnswer) {
      score++;
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

  // Store user session in-memory
  sessions[sessionId] = {
    id: sessionId,
    userName: userName || 'Successful Graduate',
    category,
    answers,
    score,
    totalQuestions,
    percentage,
    paid: false,
    createdAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  res.json({
    sessionId,
    score,
    totalQuestions,
    percentage,
    paid: false
  });
});

// API: POST /api/payment/simulate
// Simulates payment processing. Once verified, marks the session as paid
// and releases the premium report containing correct answers, explanations, and certificate metadata.
// Helper to compile the premium assessment report and generate verification credentials
function getUnlockedSessionResult(session) {
  const categoryQuestions = questions[session.category];
  const breakdown = categoryQuestions.map(q => {
    const userAnsIndex = session.answers[q.id];
    const isCorrect = userAnsIndex !== undefined && Number(userAnsIndex) === q.correctAnswer;
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      userAnswer: userAnsIndex !== undefined ? Number(userAnsIndex) : null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    };
  });

  const verificationHash = 'QM-' + session.category.toUpperCase().replace('-', '') + '-' + Math.floor(100000 + Math.random() * 900000);

  return {
    userName: session.userName,
    categoryName: categories.find(c => c.id === session.category)?.name || session.category,
    score: session.score,
    totalQuestions: session.totalQuestions,
    percentage: session.percentage,
    date: session.createdAt,
    verificationHash,
    breakdown
  };
}

// API: POST /api/payment/simulate
// Simulates payment processing. Once verified, marks the session as paid
// and releases the premium report containing correct answers, explanations, and certificate metadata.
app.post('/api/payment/simulate', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = sessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Update session status to paid (unlocked)
  session.paid = true;

  res.json({
    success: true,
    result: getUnlockedSessionResult(session)
  });
});

// API: POST /api/payment/razorpay/order
// Generates an official Razorpay order (or falls back to mock order if keys are not present)
app.post('/api/payment/razorpay/order', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = sessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const amountInPaise = 2900; // ₹29.00 INR = 2900 Paise

  if (razorpayClient) {
    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${sessionId}`,
        payment_capture: 1
      };

      const order = await razorpayClient.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        isMock: false
      });
    } catch (err) {
      console.error('Razorpay Order Creation Error:', err);
      // Fallback to mock order on API error to maintain execution safety
    }
  }

  // Fallback / Mock mode when keys are missing or API fails
  const mockOrderId = `order_mock_${Math.random().toString(36).substr(2, 9)}`;
  res.json({
    success: true,
    orderId: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    isMock: true
  });
});

// API: POST /api/payment/razorpay/verify
// Cryptographically verifies Razorpay checkout payment signatures and unlocks credentials on success
app.post('/api/payment/razorpay/verify', (req, res) => {
  const { 
    sessionId, 
    razorpay_payment_id, 
    razorpay_order_id, 
    razorpay_signature,
    isMock 
  } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = sessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (isMock) {
    // Verified via simulation sandbox path
    session.paid = true;
    return res.json({
      success: true,
      result: getUnlockedSessionResult(session)
    });
  }

  // Real cryptographic signature check using key secret
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'Payment signature secret key is not configured.' });
  }

  try {
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      session.paid = true;
      res.json({
        success: true,
        result: getUnlockedSessionResult(session)
      });
    } else {
      res.status(400).json({ error: 'Cryptographic signature mismatch. Verification failed.' });
    }
  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ error: 'Internal signature verification error' });
  }
});


// Start listening
app.listen(PORT, () => {
  console.log(`QuizMint Backend running on http://localhost:${PORT}`);
});
