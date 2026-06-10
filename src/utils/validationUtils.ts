/**
 * Validate course data
 * @param {Object} course - Course object to validate
 * @returns {Object} Validation result
 */
export const validateCourse = (course: any) => {
  const errors: string[] = [];

  if (!course.name || course.name.trim() === '') {
    errors.push('Course name is required');
  }

  if (!course.outcomes || course.outcomes.length === 0) {
    errors.push('At least one course outcome is required');
  }

  if (!course.hld || course.hld.trim() === '') {
    errors.push('Course HLD (High-Level Description) is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate module data
 * @param {Object} module - Module object to validate
 * @returns {Object} Validation result
 */
export const validateModule = (module: any) => {
  const errors: string[] = [];

  if (!module.name || module.name.trim() === '') {
    errors.push('Module name is required');
  }

  if (!module.description || module.description.trim() === '') {
    errors.push('Module description is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate learning unit data
 * @param {Object} lu - Learning unit object to validate
 * @returns {Object} Validation result
 */
export const validateLearningUnit = (lu: any) => {
  const errors: string[] = [];

  if (!lu.name || lu.name.trim() === '') {
    errors.push('Learning unit name is required');
  }

  if (!lu.description || lu.description.trim() === '') {
    errors.push('Learning unit description is required');
  }

  if (!lu.learner_journey || lu.learner_journey.trim() === '') {
    errors.push('Learner journey is required');
  }

  if (!lu.duration || lu.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }

  if (lu.artifacts && lu.artifacts.length > 0) {
    lu.artifacts.forEach((artifact: any, index: number) => {
      if (!artifact.artifact_type || artifact.artifact_type.trim() === '') {
        errors.push(`Artifact ${index + 1}: Type is required`);
      }
      if (!artifact.link || artifact.link.trim() === '') {
        errors.push(`Artifact ${index + 1}: Link is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate question configuration
 * @param {Object} config - Question configuration object
 * @returns {Object} Validation result
 */
export const validateQuestionConfig = (config: any) => {
  const errors: string[] = [];

  if (!config.total_questions || config.total_questions <= 0) {
    errors.push('Total questions must be greater than 0');
  }

  if (config.easy < 0) {
    errors.push('Easy questions count cannot be negative');
  }

  if (config.medium < 0) {
    errors.push('Medium questions count cannot be negative');
  }

  if (config.hard < 0) {
    errors.push('Hard questions count cannot be negative');
  }

  const sum = config.easy + config.medium + config.hard;
  if (sum !== config.total_questions) {
    errors.push(`Question distribution (${sum}) must equal total questions (${config.total_questions})`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate generated question
 * @param {Object} question - Question object to validate
 * @returns {Object} Validation result
 */
export const validateQuestion = (question: any) => {
  const errors: string[] = [];

  if (!question.question || question.question.trim() === '') {
    errors.push('Question text is required');
  }

  if (!question.options || question.options.length !== 4) {
    errors.push('Exactly 4 options are required');
  } else {
    question.options.forEach((option: any, index: number) => {
      if (!option || option.trim() === '') {
        errors.push(`Option ${index + 1} is required`);
      }
    });
  }

  if (question.correct_answer < 0 || question.correct_answer > 3) {
    errors.push('Correct answer must be between 0 and 3');
  }

  if (!question.explanation || question.explanation.trim() === '') {
    errors.push('Explanation is required');
  }

  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate JSON structure
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} Validation result with parsed data
 */
export const validateJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      valid: true,
      data: parsed
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message
    };
  }
};
