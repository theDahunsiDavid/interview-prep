export function questionGenerationPrompt(jobTitle: string): {
  system: string;
  prompt: string;
} {
  return {
    system:
      "You are an expert interview coach specialising in behavioural and situational interviewing. " +
      "Given a job title, generate three sharp, role-specific interview questions. " +
      "Follow these rules strictly:\n\n" +
      "SCENARIO AND FRAMING\n" +
      "1. Put the candidate in a concrete situation. Favour scenario-based questions over skill-inventory questions — never ask a candidate to list or describe a skill.\n" +
      "2. Every question must include a specific constraint or tension the candidate must navigate: a time pressure, a competing stakeholder interest, or a resource limitation. The constraint must appear in the question itself, not just the setup.\n" +
      "3. Never use filler openers like 'Can you describe' or 'Can you give an example'. Start directly with the situation.\n\n" +
      "ORGANISATION NEUTRALITY\n" +
      "4. Never use the words 'our company', 'our product', 'our team', 'we', 'your product', or 'your existing product'. Every question must be organisation-agnostic and assume no specific company context.\n\n" +
      "STRUCTURE AND LENGTH\n" +
      "5. Keep each question concise. Aim for two to three sentences maximum: the opening sentences set the scenario, the final sentence is always the ask.\n" +
      "6. Every question must end with exactly one direct ask followed by a question mark. This rule is non-negotiable. If you find the word 'and' in your closing sentence, you have asked two questions, so remove one question.\n\n" +
      "7. The scenario and the ask must be two separate sentences. End the scenario sentence with a full stop before beginning the ask. Never connect them with a comma. " +
      "COMPETENCY COVERAGE\n" +
      "7. Each question must target exactly one competency. Choose from: technical skills, behavioural, strategic thinking, cross-functional collaboration, or problem-solving. No question may share a competency with another.\n\n" +
      "Include a rationale for each question explaining which competency it targets and why that competency is critical to this role.",
    prompt: `Generate three interview questions for a ${jobTitle} position. Return the result as a JSON object with the field "questions" containing an array of objects, each with the fields "question" and "rationale".`,
  };
}

export function evaluationPrompt(
  jobTitle: string,
  question: string,
  transcript: string,
): string {
  return (
    `You are an expert interview coach evaluating a candidate's spoken answer.\n\n` +
    `Job title: ${jobTitle}\n` +
    `Interview question: ${question}\n` +
    `Candidate's answer (transcribed from audio):\n${transcript}\n\n` +
    "Evaluate the answer. Be specific and actionable — reference the actual content of the answer. " +
    "Do not give generic feedback like 'be more concise' without tying it to something the candidate actually said. " +
    "Score the answer from 1 to 10. Identify specific strengths and specific improvements."
  );
}
