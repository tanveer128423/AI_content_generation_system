import Handlebars from 'handlebars';
import type { TemplateData } from '../ai/types';

// Register custom helpers
Handlebars.registerHelper('add', function(a: unknown, b: unknown) {
  // simple numeric add helper — coerce to numbers when possible
  const na = Number(a as any);
  const nb = Number(b as any);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return String(a) + String(b);
  return na + nb;
});

Handlebars.registerHelper('eq', function(a: unknown, b: unknown) {
  return a === b;
});

Handlebars.registerHelper('gt', function(a: unknown, b: unknown) {
  return Number(a as any) > Number(b as any);
});

Handlebars.registerHelper('lt', function(a: unknown, b: unknown) {
  return Number(a as any) < Number(b as any);
});

/**
 * Compiles a Handlebars template string with provided data
 * @param {string} templateString - The Handlebars template
 * @param {Object} data - Data to compile the template with
 * @returns {string} Compiled template result
 */
/**
 * Compile a Handlebars template string with provided data.
 * - Keeps template compilation isolated so prompts remain testable.
 */
export function compileTemplate(templateString: string, data: TemplateData): string {
  try {
    if (!templateString) {
      console.warn('⚠️ Handlebars: template string is empty');
      return '';
    }

    

    const safeData: TemplateData = {
      courseName: '',
      description: '',
      duration: '',
      artifacts: [],
      additionalGuidance: '',
      ...(data || {})
    };

    

    // Compile the template
    const template = Handlebars.compile(templateString, { strict: false });

    // Execute the compiled template with data
    const result = template(safeData);
    return result;
  } catch (error) {
    console.error('❌ Handlebars compile error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) console.error(error.stack);
    // Fail safe: return empty string on any compilation/runtime error
    return '';
  }
}

/**
 * Register a custom Handlebars helper
 * @param {string} name - Helper name
 * @param {Function} helper - Helper function
 */
export function registerHelper(name: string, helper: Handlebars.HelperDelegate) {
  Handlebars.registerHelper(name, helper);
}

/**
 * Register a Handlebars partial
 * @param {string} name - Partial name
 * @param {string} template - Partial template
 */
export function registerPartial(name: string, template: string) {
  Handlebars.registerPartial(name, template);
}

export { Handlebars };
