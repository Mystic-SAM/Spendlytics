export const reportInsightPrompt = ({
  totalIncome,
  totalExpenses,
  totalInvestement,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  totalInvestement: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) => {
  const categoryList = Object.entries(categories)
    .map(
      ([name, { amount, percentage }]) =>
        `- ${name}: ${amount} (${percentage}%)`,
    )
    .join("\n");

  return `
  You are a friendly and smart financial coach, not a robot.

  Your job is to give **exactly 3 or 4 good short insights** to the user based on their data that feel like you're talking to them directly.

  Each insight should reflect the actual data and sound like something a smart money coach would say based on the data — short, clear, and practical.

  🧾 Report for: ${periodLabel}
  - Total Income: ₹${totalIncome.toFixed(2)}
  - Total Expenses: ₹${totalExpenses.toFixed(2)}
  - Total Investment: ₹${totalInvestement.toFixed(2)}
  - Available Balance: ₹${availableBalance.toFixed(2)}
  - Savings Rate: ${savingsRate}%

  Top Expense Categories:
  ${categoryList}

  📌 Guidelines:
  - Keep each insight to one short, realistic, personalized, natural sentence
  - Use conversational language, correct wordings & Avoid sounding robotic, or generic
  - Include specific data when helpful and comma to amount
  - Be encouraging if user spent less than they earned
  - Format your response **exactly** like this:

  ["Insight 1", "Insight 2", "Insight 3"]

  ✅ Example:
  [
    "Nice! You kept ₹7,458 after expenses — that’s solid breathing room.",
    "You spent the most on 'Meals' this period — 32%. Maybe worth keeping an eye on.",
    "You stayed under budget this time. That's a win — keep the momentum"
  ]

  ⚠️ Output only a **JSON array of 3/4 strings**. Do not include any explanation, markdown, or notes.
  `.trim();
};
