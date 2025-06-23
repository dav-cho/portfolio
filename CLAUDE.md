# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive terminal-based portfolio built with Rust WebAssembly and TypeScript. Features a full terminal emulator using xterm.js with command logic implemented in Rust for performance and learning demonstration.

## Development Commands

### Build Commands
- `npm run dev` - Start development server (localhost:5173)
- `npm run build` - Full production build (builds WASM + TypeScript + Vite)
- `npm run build:wasm` - Build only the Rust WASM module
- `npm run preview` - Preview production build locally

### Dependencies
- **@xterm/xterm** - Core terminal emulator functionality
- **@xterm/addon-fit** - Terminal size fitting to container
- **@xterm/addon-web-links** - Clickable links in terminal output
- **wasm-bindgen** - Rust-WASM JavaScript bindings
- **serde/serde_json** - Rust serialization for command responses

### WASM Development Workflow
1. Make changes to Rust code in `rust-commands/src/lib.rs`
2. Run `npm run build:wasm` to compile Rust to WebAssembly
3. WASM files are generated in `src/pkg/` (git ignored)
4. Frontend automatically picks up WASM changes on rebuild

## Architecture

### Core Components
- **Frontend**: TypeScript + Vite + xterm.js terminal emulator
- **Command Logic**: Rust compiled to WebAssembly for browser execution
- **Terminal Interface**: Full-featured terminal with command history, autocomplete, keyboard shortcuts
- **Deployment**: Static hosting on GitHub Pages with automated CI/CD via GitHub Actions

### Key Files
- `src/main.ts` - Application entry point with ASCII logo
- `src/terminal.ts` - Terminal component with xterm.js integration and command handling
- `src/wasm-loader.ts` - WASM module loader and command dispatcher
- `rust-commands/src/lib.rs` - All command handlers implemented in Rust
- `src/pkg/` - Generated WASM files (auto-generated, git ignored)

### Command Architecture
Commands are defined in Rust (`rust-commands/src/lib.rs`) and exposed to JavaScript:
- Each command returns a JSON-serialized `CommandResponse` struct with `success`, `output`, and optional `data` fields
- TypeScript parses responses and applies terminal formatting with color codes
- Commands: `help`, `about`, `projects`, `skills [category]`, `contact`, `resume`, `ls`, `clear`, `reset`
- Built-in commands (`clear`, `reset`) are handled directly in TypeScript for immediate response

### Terminal Features
- Full command history (up/down arrows, Ctrl+P/N)
- Cursor navigation (left/right arrows, Ctrl+A/E for home/end)
- Word movement (Alt+B/F for word jumping)
- Advanced editing (Ctrl+W/U/K for word/line deletion)
- Tab completion for commands
- Command cancellation (Ctrl+C) works in all modes
- Password input masking during authentication
- Mobile-responsive design

## Development Notes

### WASM Integration
- Uses `wasm-pack` to compile Rust to WebAssembly
- WASM module is loaded asynchronously in the browser
- Commands are processed through `executeCommand()` function in `wasm-loader.ts`
- All business logic is implemented in Rust for performance demonstration

### Terminal Implementation
- Uses xterm.js with FitAddon and WebLinksAddon
- Custom Ayu Dark-inspired color theme with bright cyan cursor
- Comprehensive keyboard shortcut support matching bash/zsh conventions
- Complex input handling with cursor positioning, word movement, and line editing
- Supports text insertion at cursor position with proper redraw logic

### Build Configuration
- Vite handles TypeScript compilation and bundling
- WASM files are excluded from Vite optimization to prevent issues
- Manual chunks configuration for xterm.js dependencies
- Static deployment ready with configurable base path

### Performance Considerations
- WASM module loads asynchronously to prevent blocking
- Terminal rendering optimized for complex input scenarios
- Debug logging only enabled in development mode
- Efficient redraw logic: simple character append vs full line redraw based on cursor position

### Content Management
- Portfolio content (about, projects, skills, contact) is hardcoded in Rust functions
- To update personal information, modify the respective `handle_*_command()` functions in `rust-commands/src/lib.rs`
- Remember to rebuild WASM module after content changes with `npm run build:wasm`

### Authentication System
- **Protected Commands**: Currently only `resume` requires password authentication (configurable)
- **Password**: `foo2025` (stored in `PASSWORD` constant in `src/terminal.ts`)
- **Session Management**: 5-minute authentication timeout with automatic cleanup
- **Cancellation Options**:
  - Press Enter with empty password to cancel authentication
  - Use Ctrl+C to cancel authentication and return to normal prompt
- **Security Features**:
  - Password input masking with asterisks during entry
  - Passwords excluded from command history
  - Session-based authentication (commands stay unlocked for 5 minutes)

#### Authentication Flow
1. User attempts protected command (e.g., `resume`)
2. System prompts for password with masked input
3. User can cancel by pressing Enter (empty) or Ctrl+C
4. On success: command executes and user gains 5-minute access
5. On failure: "Authentication failed" message, return to normal prompt
6. Session expires automatically after timeout

#### Terminal Control Features
- **Ctrl+C**: Cancel current command/authentication (works in all modes)
- **Command cancellation**: Clean exit without visual artifacts
- **Input state management**: Proper cleanup of authentication state

#### Modifying Authentication
- **Change password**: Update `PASSWORD` constant in `src/terminal.ts` (line ~64)
- **Add/remove protected commands**: Modify `isProtectedCommand()` function (line ~81)
- **Adjust timeout**: Change `AUTH_TIMEOUT_MS` constant (line ~63)
- **Current protected commands**: Check the `isProtectedCommand()` function for latest list

## Deployment

### GitHub Actions Workflow
- Automated deployment to GitHub Pages on push to `main` branch
- Workflow builds WASM module, installs dependencies, and deploys to GitHub Pages
- Requires Node.js 20 and Rust with `wasm32-unknown-unknown` target
- Build artifacts are uploaded from `./dist` directory

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` directory to your static hosting provider
3. Ensure base path is configured correctly in `vite.config.ts` for your domain