import init, {
  init as wasmInit,
  handle_help_command,
  handle_ls_command,
  handle_about_command,
  handle_projects_command,
  handle_skills_command,
  handle_contact_command,
  handle_resume_command,
  handle_unknown_command,
} from './pkg/portfolio_commands.js';

// Debug utility - only logs in development
const debug = import.meta.env.DEV ? console.log : () => {};

let wasmModule: any = null;

export async function loadWasm(): Promise<void> {
  try {
    wasmModule = await init();
    wasmInit(); // Call the init function from our Rust module
    debug('WASM module loaded successfully');
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    throw error;
  }
}

interface CommandResponse {
  success: boolean;
  output: string;
  data?: any;
}

function parseResponse(response: string): CommandResponse {
  try {
    return JSON.parse(response);
  } catch {
    // Fallback for plain string responses
    return {
      success: true,
      output: response,
    };
  }
}

export async function executeCommand(input: string): Promise<string> {
  if (!wasmModule) {
    throw new Error('WASM module not loaded');
  }

  const [command, ...args] = input.toLowerCase().trim().split(' ');

  let response: string;

  try {
    switch (command) {
      case 'help':
        response = handle_help_command();
        break;

      case 'ls':
        response = handle_ls_command();
        break;

      case 'about':
        response = handle_about_command();
        break;

      case 'projects':
        response = handle_projects_command();
        break;

      case 'skills':
        response = handle_skills_command(args[0] || null);
        break;

      case 'contact':
        response = handle_contact_command();
        break;

      case 'resume':
        response = handle_resume_command();
        break;

      default:
        response = handle_unknown_command(command);
        break;
    }

    const parsed = parseResponse(response);
    return formatOutput(parsed);
  } catch (error) {
    return `\x1b[31mError: ${error}\x1b[0m`;
  }
}

function formatOutput(response: CommandResponse): string {
  if (!response.success) {
    return `\x1b[91m${response.output}\x1b[0m`;
  }

  // Add some basic formatting to make output more readable
  let formatted = response.output;

  // Color formatting for certain patterns with improved colors
  formatted = formatted
    .replace(/•/g, '\x1b[96m•\x1b[0m') // Bright cyan bullets
    .replace(/📧|💼|🐙|🌐|📍|🎯|💼|📄|👀/g, '\x1b[93m$&\x1b[0m') // Bright yellow emojis
    .replace(/Available commands:/g, '\x1b[92mAvailable commands:\x1b[0m') // Bright green headers
    .replace(/Technical Skills:/g, '\x1b[92mTechnical Skills:\x1b[0m')
    .replace(/My Projects:/g, '\x1b[92mMy Projects:\x1b[0m')
    .replace(/Contact Information:/g, '\x1b[92mContact Information:\x1b[0m')
    .replace(/Resume:/g, '\x1b[92mResume:\x1b[0m')
    .replace(
      /(Programming Languages:|Cloud & Infrastructure:|Databases:|Frameworks & Libraries:|Tools:)/g,
      '\x1b[94m$1\x1b[0m',
    ); // Blue for subcategories

  return formatted;
}
