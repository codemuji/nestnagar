import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  modelName: "mistral-tiny", // or "mistral-small-latest", "mistral-medium-latest"
  temperature: 0,
});

const parser = new JsonOutputParser();

const onboardingPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are a housing assistant for Itanagar, Arunachal Pradesh, India.
A user has just answered these onboarding questions to find accommodation.
Based on their answers, categorize their needs and return a JSON object with:
- listingTypes: Array of strings ("pg", "single-room", "flat")
- priceRange: Object with "min" and "max" numbers
- showPartnerOption: Boolean
- priorityLocalities: Array of strings (neighborhoods in Itanagar like 'Naharlagun', 'Ganga Market', 'E-Sector', etc.)
- feedMessage: A short, personalized welcome sentence for their home screen.

Return ONLY a valid JSON object.`],
  ["user", "Purpose: {purpose}, Budget: {budget}, Locality: {locality}, Move-in date: {moveInDate}, Looking: {aloneOrPartner}"],
]);

const chain = onboardingPrompt.pipe(model).pipe(parser);

export const generateSeekerProfile = async (answers) => {
  try {
    const { purpose, budget, locality, moveInDate, aloneOrPartner } = answers;
    
    const response = await chain.invoke({
      purpose,
      budget,
      locality,
      moveInDate,
      aloneOrPartner,
    });

    return response;
  } catch (error) {
    console.error("Error generating seeker profile with Mistral:", error);
    // Fallback profile if AI fails
    return {
      listingTypes: ["single-room"],
      priceRange: { min: 0, max: parseInt(answers.budget) || 10000 },
      showPartnerOption: answers.aloneOrPartner === "partner",
      priorityLocalities: [answers.locality],
      feedMessage: "Welcome to NestNagar! Let's find you a great place in Itanagar.",
    };
  }
};
