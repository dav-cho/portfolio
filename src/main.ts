import './style.css'
import { initTerminal } from './terminal'

// Set up the ASCII logo in the header
const asciiLogo = `██████╗  █████╗ ██╗   ██╗   ██████╗██╗  ██╗ ██████╗ 
██╔══██╗██╔══██╗██║   ██║  ██╔════╝██║  ██║██╔═══██╗
██║  ██║███████║██║   ██║  ██║     ███████║██║   ██║
██║  ██║██╔══██║╚██╗ ██╔╝  ██║     ██╔══██║██║   ██║
██████╔╝██║  ██║ ╚████╔╝██╗╚██████╗██║  ██║╚██████╔╝
╚═════╝ ╚═╝  ╚═╝  ╚═══╝ ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ `

document.querySelector<HTMLDivElement>('#ascii-logo')!.textContent = asciiLogo

// Initialize the terminal
initTerminal();