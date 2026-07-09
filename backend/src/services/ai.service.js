import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

dotenv.config();

const FALLBACK_PROFILE = (answers) => ({
  listingTypes: ["single-room"],
  priceRange: { min: 0, max: parseInt(answers.budget) || 10000 },
  showPartnerOption: answers.aloneOrPartner === "partner",
  priorityLocalities: [answers.locality],
  feedMessage: "Welcome to NestNagar! Let's find you a great place in Itanagar.",
});

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

const chain = process.env.MISTRAL_API_KEY
  ? onboardingPrompt.pipe(new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: "mistral-small-latest",
      temperature: 0,
      maxRetries: 0,
    })).pipe(new JsonOutputParser())
  : null;

export const generateSeekerProfile = async (answers) => {
  try {
    if (!chain) {
      console.warn("MISTRAL_API_KEY not set — using fallback seeker profile");
      return FALLBACK_PROFILE(answers);
    }
    return await chain.invoke(answers);
  } catch (error) {
    console.error("Error generating seeker profile with Mistral:", error?.message || error);
    return FALLBACK_PROFILE(answers);
  }
};
