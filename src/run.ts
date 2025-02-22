import * as fs from 'fs/promises';
import * as readline from 'readline';

import { deepResearch, writeFinalReport } from './deep-research';
import { generateFeedback } from './feedback';
import { OutputManager } from './output-manager';

const output = new OutputManager();

// Helper function for consistent logging
function log(...args: any[]) {
  output.log(...args);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

// run the agent
async function run() {
  // Get initial query
  const initialQuery = await askQuestion('What would you like to research? ');

  // Get breath and depth parameters
  const breadth =
    parseInt(
      await askQuestion(
        'Enter research breadth (recommended 2-10, default 4): ',
      ),
      10,
    ) || 4;
  const depth =
    parseInt(
      await askQuestion('Enter research depth (recommended 1-5, default 2): '),
      10,
    ) || 2;

  log(`Creating research plan...`);

  // Generate follow-up questions
  const followUpQuestions = await generateFeedback({
    query: initialQuery,
  });

  log(
    '\nTo better understand your research needs, please answer these follow-up questions:',
  );

  // Collect answers to follow-up questions
  const answers: string[] = [];
  for (const question of followUpQuestions) {
    const answer = await askQuestion(`\n${question}\nYour answer: `);
    answers.push(answer);
  }

  // Combine all information for deep research
  const combinedQuery = `
Initial Query: ${initialQuery}
Follow-up Questions and Answers:
${followUpQuestions.map((q: string, i: number) => `Q: ${q}\nA: ${answers[i]}`).join('\n')}
`;

  log('\nResearching your topic...');

  log('\nStarting research with progress tracking...\n');
  
  const { learnings, visitedUrls } = await deepResearch({
    query: combinedQuery,
    breadth,
    depth,
    onProgress: (progress) => {
      output.updateProgress(progress);
    },
  });

  log(`\n\nLearnings:\n\n${learnings.join('\n')}`);
  log(
    `\n\nVisited URLs (${visitedUrls.length}):\n\n${visitedUrls.join('\n')}`,
  );
  log('Writing final report...');

  const report = await writeFinalReport({
    prompt: combinedQuery,
    learnings,
    visitedUrls,
  });

  // Save report to file
  await fs.writeFile('output.md', report, 'utf-8');

  console.log(`\n\nFinal Report:\n\n${report}`);
  console.log('\nReport has been saved to output.md');
  rl.close();
}

async function main() {
  console.log("Starting research...");
  await run();
}

// Handle process signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing cleanup...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Performing cleanup...');
  process.exit(0);
});

// Start the application
main().catch(error => {
  console.error('Error in main:', error);
  process.exit(1);
});