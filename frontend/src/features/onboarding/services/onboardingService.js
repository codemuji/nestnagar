import API from '../../../services/api';

/**
 * Updates the seeker profile and triggers the AI categorization
 * @param {Object} seekerProfile - The answers from the 5-step onboarding
 */
export const completeOnboarding = async (seekerProfile) => {
  const response = await API.put('/auth/update-me', { seekerProfile });
  return response.data;
};
