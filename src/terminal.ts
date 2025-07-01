import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { loadWasm, executeCommand } from './wasm-loader';

// Debug utility - only logs in development
const debug = import.meta.env.DEV ? console.log : () => {};

const terminal = new Terminal({
  cursorBlink: true,
  fontSize: 13,
  fontFamily:
    '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  lineHeight: 1.2,
  letterSpacing: 0,
  allowProposedApi: true,
  convertEol: true,
  theme: {
    background: '#0a0e13',
    foreground: '#b3b1ad',
    cursor: '#ffcc66',
    cursorAccent: '#0a0e13',
    selectionBackground: '#253340',
    black: '#01060e',
    red: '#ea6c73',
    green: '#91b362',
    yellow: '#f9af4f',
    blue: '#53bdfa',
    magenta: '#fae994',
    cyan: '#90e1c6',
    white: '#c7c7c7',
    brightBlack: '#686868',
    brightRed: '#f07178',
    brightGreen: '#c2d94c',
    brightYellow: '#ffb454',
    brightBlue: '#59c2ff',
    brightMagenta: '#ffee99',
    brightCyan: '#95e6cb',
    brightWhite: '#ffffff',
  },
});

const fitAddon = new FitAddon();
const webLinksAddon = new WebLinksAddon();

terminal.loadAddon(fitAddon);
terminal.loadAddon(webLinksAddon);

let currentInput = '';
let cursorPosition = 0;
let commandHistory: string[] = [];
let historyIndex = -1;
let wasmReady = false;

// Authentication state
let isAuthenticating = false;
let pendingAuthCommand = '';
let authenticatedCommands = new Set<string>();
let authSessionTimeout: number | null = null;
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const PASSWORD = 'foo2025'; // Simple demo password

const PROMPT = '\x1b[96mdav\x1b[0m@\x1b[93mportfolio\x1b[0m:\x1b[94m~\x1b[0m$ ';
const AUTH_PROMPT = '\x1b[93mPassword:\x1b[0m ';

function startAuthSession() {
  if (authSessionTimeout) {
    window.clearTimeout(authSessionTimeout);
  }
  authSessionTimeout = window.setTimeout(() => {
    authenticatedCommands.clear();
    terminal.write('\r\n\x1b[33mAuthentication session expired.\x1b[0m');
    writePrompt();
  }, AUTH_TIMEOUT_MS);
}

function isProtectedCommand(command: string): boolean {
  return ['resume'].includes(command.toLowerCase()); // TODO
}

function isAuthenticated(command: string): boolean {
  return authenticatedCommands.has(command.toLowerCase());
}

function authenticateCommand(password: string, command: string): boolean {
  if (password === PASSWORD) {
    authenticatedCommands.add(command.toLowerCase());
    startAuthSession();
    return true;
  }
  return false;
}

function isAltKey(
  ev: KeyboardEvent,
  expectedKey: string,
  expectedKeyCode: number,
): boolean {
  // Debug specific keys
  if (expectedKey === 'f' && (ev.altKey || ev.metaKey)) {
    debug('Checking Alt+F:', {
      altKey: ev.altKey,
      metaKey: ev.metaKey,
      keyCode: ev.keyCode,
      key: ev.key,
      code: ev.code,
      expectedKeyCode,
    });
  }

  // Check multiple ways the Alt/Option key combination might be detected
  const hasModifier = ev.altKey || ev.metaKey;
  const keyMatches =
    ev.keyCode === expectedKeyCode ||
    ev.which === expectedKeyCode ||
    ev.key === expectedKey ||
    ev.key === expectedKey.toUpperCase() ||
    ev.code === `Key${expectedKey.toUpperCase()}` ||
    // Handle special characters produced by Option key
    (ev.altKey &&
      ev.key &&
      ev.key.length === 1 &&
      ev.keyCode === expectedKeyCode);

  return hasModifier && Boolean(keyMatches);
}

function writePrompt() {
  terminal.write('\r\n' + PROMPT);
}

function redrawInputLine() {
  // Save current cursor position
  const savedCursorPos = cursorPosition;

  // Clear the entire line completely
  terminal.write('\r\x1b[2K');

  // Write the prompt and current input
  terminal.write(PROMPT + currentInput);

  // Now position the cursor correctly by moving from the end
  if (savedCursorPos < currentInput.length) {
    const stepsBack = currentInput.length - savedCursorPos;
    terminal.write('\x1b[' + stepsBack + 'D');
  }

  // Restore cursor position variable
  cursorPosition = savedCursorPos;
}

function moveCursorToPosition(newPosition: number) {
  const oldPosition = cursorPosition;
  cursorPosition = Math.max(0, Math.min(newPosition, currentInput.length));

  if (cursorPosition !== oldPosition) {
    if (cursorPosition > oldPosition) {
      // Move cursor right
      const moveRight = cursorPosition - oldPosition;
      terminal.write('\x1b[' + moveRight + 'C');
    } else {
      // Move cursor left
      const moveLeft = oldPosition - cursorPosition;
      terminal.write('\x1b[' + moveLeft + 'D');
    }
  }
}

function moveBackOneWord() {
  if (cursorPosition === 0) return;

  let pos = cursorPosition - 1;
  // Skip whitespace
  while (pos > 0 && currentInput[pos] === ' ') {
    pos--;
  }
  // Find beginning of word
  while (pos > 0 && currentInput[pos] !== ' ') {
    pos--;
  }
  if (currentInput[pos] === ' ') pos++;

  moveCursorToPosition(pos);
}

function moveForwardOneWord() {
  if (cursorPosition >= currentInput.length) return;

  let pos = cursorPosition;
  // Skip current word
  while (pos < currentInput.length && currentInput[pos] !== ' ') {
    pos++;
  }
  // Skip whitespace
  while (pos < currentInput.length && currentInput[pos] === ' ') {
    pos++;
  }

  moveCursorToPosition(pos);
}

function deleteWordBackward() {
  if (cursorPosition === 0) return;

  let pos = cursorPosition - 1;
  // Skip whitespace
  while (pos > 0 && currentInput[pos] === ' ') {
    pos--;
  }
  // Find beginning of word
  while (pos > 0 && currentInput[pos] !== ' ') {
    pos--;
  }
  if (currentInput[pos] === ' ') pos++;

  currentInput =
    currentInput.slice(0, pos) + currentInput.slice(cursorPosition);
  cursorPosition = Math.max(0, Math.min(pos, currentInput.length));
  redrawInputLine();
}

function deleteWordForward() {
  if (cursorPosition >= currentInput.length) return;

  let pos = cursorPosition;
  // Skip current word
  while (pos < currentInput.length && currentInput[pos] !== ' ') {
    pos++;
  }
  // Skip whitespace
  while (pos < currentInput.length && currentInput[pos] === ' ') {
    pos++;
  }

  currentInput =
    currentInput.slice(0, cursorPosition) + currentInput.slice(pos);
  cursorPosition = Math.max(0, Math.min(cursorPosition, currentInput.length));
  redrawInputLine();
}

function deleteToBeginning() {
  // Delete from beginning of line to cursor position
  debug('Before Ctrl+U:', { currentInput, cursorPosition });

  if (cursorPosition > 0) {
    currentInput = currentInput.slice(cursorPosition);
    cursorPosition = 0;
  } else {
    // If already at beginning, clear everything
    currentInput = '';
    cursorPosition = 0;
  }

  debug('After Ctrl+U:', { currentInput, cursorPosition });

  // Use full redraw for Ctrl+U since we're changing content before cursor
  redrawInputLine();
}

function deleteToEnd() {
  currentInput = currentInput.slice(0, cursorPosition);
  cursorPosition = Math.max(0, Math.min(cursorPosition, currentInput.length));

  // Use full redraw
  redrawInputLine();
}

function deleteCharacterForward() {
  if (cursorPosition < currentInput.length) {
    currentInput =
      currentInput.slice(0, cursorPosition) +
      currentInput.slice(cursorPosition + 1);

    // Use full redraw for character deletion to ensure proper rendering
    redrawInputLine();
  }
}

async function processCommand(command: string) {
  const trimmed = command.trim();

  if (!trimmed) {
    writePrompt();
    return;
  }

  // Handle authentication mode
  if (isAuthenticating) {
    const success = authenticateCommand(trimmed, pendingAuthCommand);
    if (success) {
      terminal.write('\x1b[32m✓ Authentication successful\x1b[0m\n\n');
      // Execute the originally requested command
      if (wasmReady) {
        try {
          const response = await executeCommand(pendingAuthCommand);
          terminal.write(response);
        } catch (error) {
          terminal.write(
            '\x1b[31mError executing command: ' + error + '\x1b[0m',
          );
        }
      }
    } else {
      terminal.write('\x1b[31m✗ Authentication failed\x1b[0m');
    }

    // Reset authentication state
    isAuthenticating = false;
    pendingAuthCommand = '';
    writePrompt();
    return;
  }

  // Add to history (but not passwords)
  if (commandHistory[commandHistory.length - 1] !== trimmed) {
    commandHistory.push(trimmed);
  }
  historyIndex = commandHistory.length;

  // Handle built-in commands
  if (trimmed === 'clear') {
    // Clear screen and move cursor to top
    terminal.write('\x1b[2J\x1b[H');
    // Write prompt directly without the extra newline
    terminal.write(PROMPT);
    return;
  }

  if (trimmed === 'reset') {
    // Full reset - clear everything including scrollback
    terminal.reset();
    showWelcome();
    writePrompt();
    return;
  }

  // Check for protected commands
  const [baseCommand] = trimmed.toLowerCase().split(' ');
  if (isProtectedCommand(baseCommand) && !isAuthenticated(baseCommand)) {
    // Start authentication process
    isAuthenticating = true;
    pendingAuthCommand = trimmed;
    terminal.write('\r\n\x1b[33mThis command requires authentication.\x1b[0m');
    terminal.write('\r\n' + AUTH_PROMPT);
    return;
  }

  // Execute command through WASM
  if (wasmReady) {
    try {
      const response = await executeCommand(trimmed);
      terminal.write(response);
    } catch (error) {
      terminal.write(
        '\x1b[31mError executing command: ' + error + '\x1b[0m',
      );
    }
  } else {
    terminal.write(
      '\x1b[33mWASM module not ready yet. Please wait...\x1b[0m',
    );
  }

  writePrompt();
}

function handleKeyPress(key: string, ev: KeyboardEvent) {
  const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

  // Handle Ctrl+C first (works in all modes)
  if (ev.ctrlKey && ev.keyCode === 67) {
    ev.preventDefault();
    
    // If in authentication mode, cancel it
    if (isAuthenticating) {
      isAuthenticating = false;
      pendingAuthCommand = '';
    }
    
    // Reset input state and show new prompt
    currentInput = '';
    cursorPosition = 0;
    writePrompt();
    return;
  }

  // Special handling for authentication mode
  if (isAuthenticating) {
    if (ev.keyCode === 13) {
      // Enter
      if (currentInput.trim() === '') {
        // Cancel authentication on empty password
        terminal.write('\r\n\x1b[33mAuthentication failed.\x1b[0m');
        isAuthenticating = false;
        pendingAuthCommand = '';
        writePrompt();
        return;
      }
      terminal.write('\r\n');
      processCommand(currentInput);
      currentInput = '';
      cursorPosition = 0;
      return;
    } else if (ev.keyCode === 8) {
      // Backspace
      if (currentInput.length > 0 && cursorPosition > 0) {
        currentInput =
          currentInput.slice(0, cursorPosition - 1) +
          currentInput.slice(cursorPosition);
        cursorPosition--;
        terminal.write('\b \b');
      }
      return;
    } else if (printable) {
      // Add character to password but display asterisk
      currentInput =
        currentInput.slice(0, cursorPosition) +
        key +
        currentInput.slice(cursorPosition);
      cursorPosition++;
      terminal.write('*');
      return;
    }
    // Ignore other keys in auth mode
    return;
  }

  // Enhanced debug logging - especially for Alt+F and Ctrl+D
  if (
    ev.altKey ||
    ev.metaKey ||
    ev.ctrlKey ||
    key.length > 1 ||
    ev.keyCode === 68 ||
    ev.keyCode === 70
  ) {
    debug('Key event:', {
      key,
      keyCode: ev.keyCode,
      altKey: ev.altKey,
      metaKey: ev.metaKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      code: ev.code,
      which: ev.which,
      type: ev.type,
    });
  }

  if (ev.keyCode === 13) {
    // Enter
    terminal.write('\r\n');
    processCommand(currentInput);
    currentInput = '';
    cursorPosition = 0;
  } else if (ev.keyCode === 8) {
    // Backspace
    if (currentInput.length > 0 && cursorPosition > 0) {
      currentInput =
        currentInput.slice(0, cursorPosition - 1) +
        currentInput.slice(cursorPosition);
      cursorPosition--;

      // If deleting at the end, use simple backspace
      if (cursorPosition === currentInput.length) {
        terminal.write('\b \b');
      } else {
        // If deleting in middle, use full redraw
        redrawInputLine();
      }
    }
  } else if (ev.keyCode === 37) {
    // Left arrow
    if (cursorPosition > 0) {
      cursorPosition--;
      terminal.write('\x1b[D'); // Move cursor left
    }
  } else if (ev.keyCode === 39) {
    // Right arrow
    if (cursorPosition < currentInput.length) {
      cursorPosition++;
      terminal.write('\x1b[C'); // Move cursor right
    }
  } else if (ev.keyCode === 38) {
    // Up arrow
    navigateToPreviousCommand();
  } else if (ev.keyCode === 40) {
    // Down arrow
    navigateToNextCommand();
  } else if (ev.ctrlKey && ev.keyCode === 80) {
    // Ctrl+P (previous command)
    ev.preventDefault();
    navigateToPreviousCommand();
  } else if (ev.ctrlKey && ev.keyCode === 78) {
    // Ctrl+N (next command)
    ev.preventDefault();
    navigateToNextCommand();
  } else if (ev.ctrlKey && ev.keyCode === 76) {
    // Ctrl+L (clear terminal)
    ev.preventDefault();
    terminal.write('\x1b[2J\x1b[H'); // Clear screen and move cursor to top
    // Write prompt directly without the extra newline
    terminal.write(PROMPT);
    currentInput = '';
    cursorPosition = 0;
  } else if (ev.ctrlKey && ev.keyCode === 65) {
    // Ctrl+A (beginning of line)
    ev.preventDefault();
    moveCursorToPosition(0);
  } else if (ev.ctrlKey && ev.keyCode === 69) {
    // Ctrl+E (end of line)
    ev.preventDefault();
    moveCursorToPosition(currentInput.length);
  } else if (ev.ctrlKey && ev.keyCode === 66) {
    // Ctrl+B (back one character)
    ev.preventDefault();
    if (cursorPosition > 0) {
      cursorPosition--;
      terminal.write('\x1b[D');
    }
  } else if (ev.ctrlKey && ev.keyCode === 70) {
    // Ctrl+F (forward one character)
    ev.preventDefault();
    if (cursorPosition < currentInput.length) {
      cursorPosition++;
      terminal.write('\x1b[C');
    }
  } else if (isAltKey(ev, 'b', 66)) {
    // Alt/Opt+B (back one word)
    ev.preventDefault();
    moveBackOneWord();
  } else if (isAltKey(ev, 'f', 70)) {
    // Alt/Opt+F (forward one word)
    ev.preventDefault();
    moveForwardOneWord();
  } else if (ev.ctrlKey && ev.keyCode === 87) {
    // Ctrl+W (delete word backward)
    ev.preventDefault();
    deleteWordBackward();
  } else if (isAltKey(ev, 'd', 68)) {
    // Alt/Opt+D (delete word forward)
    ev.preventDefault();
    deleteWordForward();
  } else if (ev.ctrlKey && ev.keyCode === 85) {
    // Ctrl+U (delete from cursor to beginning)
    ev.preventDefault();
    deleteToBeginning();
  } else if (ev.ctrlKey && ev.keyCode === 75) {
    // Ctrl+K (delete from cursor to end)
    ev.preventDefault();
    deleteToEnd();
  } else if (ev.ctrlKey && ev.keyCode === 68) {
    // Ctrl+D (delete character forward)
    ev.preventDefault();
    deleteCharacterForward();
  } else if (ev.ctrlKey && ev.shiftKey && ev.keyCode === 66) {
    // Ctrl+Shift+B (alternative back word)
    ev.preventDefault();
    moveBackOneWord();
  } else if (ev.ctrlKey && ev.shiftKey && ev.keyCode === 70) {
    // Ctrl+Shift+F (alternative forward word)
    ev.preventDefault();
    moveForwardOneWord();
  } else if (ev.ctrlKey && ev.shiftKey && ev.keyCode === 68) {
    // Ctrl+Shift+D (alternative delete word forward)
    ev.preventDefault();
    deleteWordForward();
  } else if (ev.keyCode === 9) {
    // Tab
    ev.preventDefault();
    // Simple autocomplete - could be enhanced
    const commands = [
      'help',
      'ls',
      'about',
      'projects',
      'skills',
      'contact',
      'resume',
      'clear',
      'reset',
    ];
    const matches = commands.filter((cmd) => cmd.startsWith(currentInput));
    if (matches.length === 1) {
      const completion = matches[0].slice(currentInput.length);
      currentInput += completion;
      cursorPosition = currentInput.length;
      redrawInputLine();
    }
  } else if (printable) {
    // Insert character at cursor position
    currentInput =
      currentInput.slice(0, cursorPosition) +
      key +
      currentInput.slice(cursorPosition);
    cursorPosition++;

    // For efficiency, if we're at the end, just write the character
    if (cursorPosition === currentInput.length) {
      terminal.write(key);
    } else {
      // If inserting in middle, use full redraw for proper rendering
      redrawInputLine();
    }
  }
}

function navigateToPreviousCommand() {
  if (historyIndex > 0) {
    historyIndex--;
    currentInput = commandHistory[historyIndex];
    cursorPosition = currentInput.length;
    redrawInputLine();
  }
}

function navigateToNextCommand() {
  if (historyIndex < commandHistory.length - 1) {
    historyIndex++;
    currentInput = commandHistory[historyIndex];
  } else {
    historyIndex = commandHistory.length;
    currentInput = '';
  }
  cursorPosition = currentInput.length;
  redrawInputLine();
}

function showWelcome() {
  const welcome = `\x1b[36mWelcome to my interactive portfolio terminal!\x1b[0m

Type '\x1b[33mhelp\x1b[0m' to see available commands or start exploring.
This terminal is powered by Rust WebAssembly for optimal performance.

`;
  terminal.write(welcome);
}

export async function initTerminal() {
  const container = document.getElementById('terminal-container');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  terminal.open(container);
  fitAddon.fit();

  // Focus the terminal
  terminal.focus();

  // Handle resize
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });

  // Handle key input
  terminal.onKey(({ key, domEvent }) => {
    handleKeyPress(key, domEvent);
  });

  // Show welcome message
  showWelcome();

  // Load WASM module
  try {
    await loadWasm();
    wasmReady = true;
    terminal.write('\x1b[32m✓ WASM module loaded successfully\x1b[0m');
  } catch (error) {
    terminal.write(
      '\x1b[31m✗ Failed to load WASM module: ' + error + '\x1b[0m',
    );
  }

  writePrompt();
}
