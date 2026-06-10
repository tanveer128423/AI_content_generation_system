/**
 * Save content data to a JSON file
 * @param {Object} data - The data to save
 * @param {string} filename - Optional filename (defaults to content_timestamp.json)
 */
export const saveToFile = (data: any, filename: string | null = null) => {
  try {
    const timestamp = new Date().getTime();
    const fileName = filename || `content_${timestamp}.json`;

    // Update metadata
    const dataToSave = {
      ...data,
      metadata: {
        ...data.metadata,
        updated_at: new Date().toISOString()
      }
    };

    // Convert to JSON string with pretty formatting
    const dataStr = JSON.stringify(dataToSave, null, 2);

    // Create blob
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: fileName,
      message: 'File saved successfully'
    };
  } catch (error: any) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Load content data from a JSON file
 * @param {File} file - The file to load
 * @returns {Promise<Object>} Promise resolving to the loaded data
 */
export const loadFromFile = (file: File) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      if (file.type !== 'application/json') {
        reject(new Error('Invalid file type. Please select a JSON file.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(String(e.target?.result || ''));

          // Validate basic structure for both legacy and hierarchy-based exports.
          const hasLegacyShape = json.metadata && json.course && json.modules && json.prompts;
          const hasHierarchyShape = json.metadata && Array.isArray(json.courses) && json.prompts && json.templates;

          if (!hasLegacyShape && !hasHierarchyShape) {
            reject(new Error('Invalid file structure'));
            return;
          }

          resolve({
            success: true,
            data: json,
            message: 'File loaded successfully'
          });
        } catch {
          reject(new Error('Invalid JSON format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export a specific module or learning unit
 * @param {Object} item - The item to export
 * @param {string} type - Type of export (module, learning_unit, questions)
 * @param {string} name - Name for the file
 */
export const exportItem = (item: any, type: string, name: string) => {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${type}_${name.replace(/\s+/g, '_')}_${timestamp}.json`;

    const dataStr = JSON.stringify(item, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: fileName
    };
  } catch (error: any) {
    console.error('Error exporting item:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Export generated content as markdown
 * @param {string} content - The markdown content
 * @param {string} name - Name for the file
 */
export const exportMarkdown = (content: string, name: string) => {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${name.replace(/\s+/g, '_')}_${timestamp}.md`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: fileName
    };
  } catch (error: any) {
    console.error('Error exporting markdown:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

type WorkflowExportPayload = {
  contentData: any;
  selectedCourseId?: string | null;
  selectedModuleId?: string | null;
  selectedLUId?: string | null;
  selectedNode?: any;
};

/**
 * Export the complete workflow state as a portable JSON file.
 */
export const exportWorkflowState = (
  workflowState: WorkflowExportPayload,
  filename: string | null = null
) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = filename || `content-generation-workflow-${timestamp}.json`;

    const exportData = {
      format: 'content-generation-engine-workflow',
      export_version: '1.0.0',
      exported_at: now.toISOString(),
      workflow: {
        contentData: workflowState.contentData,
        hierarchy: {
          courseCount: Array.isArray(workflowState.contentData?.courses)
            ? workflowState.contentData.courses.length
            : 0,
          moduleCount: Array.isArray(workflowState.contentData?.courses)
            ? workflowState.contentData.courses.reduce(
                (count: number, course: any) => count + (Array.isArray(course?.modules) ? course.modules.length : 0),
                0
              )
            : 0,
          learningUnitCount: Array.isArray(workflowState.contentData?.courses)
            ? workflowState.contentData.courses.reduce(
                (count: number, course: any) =>
                  count +
                  (Array.isArray(course?.modules)
                    ? course.modules.reduce(
                        (moduleCount: number, module: any) =>
                          moduleCount + (Array.isArray(module?.learning_units) ? module.learning_units.length : 0),
                        0
                      )
                    : 0),
                0
              )
            : 0,
        },
      },
      persistedState: {
        selectedCourseId: workflowState.selectedCourseId ?? null,
        selectedModuleId: workflowState.selectedModuleId ?? null,
        selectedLUId: workflowState.selectedLUId ?? null,
        selectedNode: workflowState.selectedNode ?? null,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: fileName,
      message: 'Workflow exported successfully',
    };
  } catch (error: any) {
    console.error('Error exporting workflow state:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
