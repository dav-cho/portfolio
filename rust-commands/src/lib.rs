use std::collections::HashMap;

use serde::Serialize;
use wasm_bindgen::prelude::*;

// Import the `console.log` function from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro for easier console logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize)]
struct CommandResponse {
    success: bool,
    output: String,
    data: Option<serde_json::Value>,
}

impl CommandResponse {
    fn success(output: String) -> Self {
        Self {
            success: true,
            output,
            data: None,
        }
    }

    fn with_data(output: String, data: serde_json::Value) -> Self {
        Self {
            success: true,
            output,
            data: Some(data),
        }
    }
}

#[wasm_bindgen]
pub fn init() {
    console_log!("Portfolio WASM module initialized!");
}

#[wasm_bindgen]
pub fn handle_help_command() -> String {
    let response = CommandResponse::success(
        "Terminal Commands & Shortcuts:\n\
         \n\
         Portfolio Pages:\n\
         • about    - Learn about David Cho\n\
         • contact  - Get in touch\n\
         • projects - View my projects\n\
         • skills   - Technical skills\n\
         • resume   - Download resume\n\
         \n\
         Terminal Commands:\n\
         • help     - Show this help\n\
         • ls       - List all pages\n\
         • clear    - Move prompt to top (keep history)\n\
         • reset    - Full reset (clear history)\n\
         \n\
         Keyboard Shortcuts:\n\
         \n\
         Navigation:\n\
         • ↑ / Ctrl+P    - Previous command\n\
         • ↓ / Ctrl+N    - Next command\n\
         • ← / Ctrl+B    - Move cursor left\n\
         • → / Ctrl+F    - Move cursor right\n\
         • Ctrl+A        - Beginning of line\n\
         • Ctrl+E        - End of line\n\
         • Alt+B / Ctrl+Shift+B - Back one word\n\
         • Alt+F / Ctrl+Shift+F - Forward one word\n\
         \n\
         Editing:\n\
         • Tab              - Autocomplete command\n\
         • Backspace        - Delete character backward\n\
         • Ctrl+D           - Delete character forward\n\
         • Ctrl+W           - Delete word backward\n\
         • Alt+D / Ctrl+Shift+D - Delete word forward\n\
         • Ctrl+U           - Delete to beginning\n\
         • Ctrl+K           - Delete to end\n\
         • Ctrl+L           - Clear to top"
            .to_string(),
    );

    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating help".to_string())
}

#[wasm_bindgen]
pub fn handle_ls_command() -> String {
    let response = CommandResponse::success(
        "Available portfolio pages:\n\
         \n\
         • about    - Learn about David Cho\n\
         • contact  - Get in touch\n\
         • projects - View my projects\n\
         • skills   - Technical skills\n\
         • resume   - Download resume\n\
         \n\
         Type 'help' for commands and shortcuts."
            .to_string(),
    );

    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating page list".to_string())
}

#[wasm_bindgen]
pub fn handle_about_command() -> String {
    let response = CommandResponse::success(
        "\
        Innovative and self-motivated software engineer with 3+ years of professional experience building\n\
        high-performance data pipelines, real-time processing systems, data quality frameworks and backend\n\
        services. Proven track record optimizing data infrastructure and system architecture with\n\
        demonstrated results including 70% storage reduction and 25% cost savings. Strong background in\n\
        financial technology, backend development, distributed systems and production infrastructure\n\
        supporting mission-critical business decisions.\
        ".to_string()
    );

    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating about info".to_string())
}

#[wasm_bindgen]
pub fn handle_contact_command() -> String {
    let response = CommandResponse::success(
        "Contact Information:\n\
         \n\
         🌐 Website:  https://davcho.com/\n\
         \n\
         Feel free to reach out for opportunities or collaboration!"
            .to_string(),
    );

    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating contact info".to_string())
}

#[wasm_bindgen]
pub fn handle_projects_command() -> String {
    let projects = serde_json::json!([
        {
            "name": "Shoepreme",
            "description": "A sneaker based e-commerce site with a fully functional Stripe payment
                            system. Built using a MERN stack in a team of three while adhering to a
                            feature-based Git flow.",
            "tech": ["MongoDB", "Express", "React", "Node.js", "Stripe"],
        },
        {
            "name": "book.pile",
            "description": "A reader’s handy book search resource.",
            "tech": ["React", "Material UI", "Google Books API"],
        },
        {
            "name": "Key Smash",
            "description": "An interactive typing test game.",
            "tech": ["HTML", "CSS", "JavaScript"],
        },
    ]);

    let output = "<projects>".to_string();

    let response = CommandResponse::with_data(output, projects);
    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating projects".to_string())
}

#[wasm_bindgen]
pub fn handle_skills_command(category: Option<String>) -> String {
    let skills = HashMap::from([
        (
            "languages",
            (
                "Programming Languages",
                vec!["Python", "Go", "TypeScript", "JavaScript", "Rust"],
            ),
        ),
        (
            "cloud",
            (
                "Cloud & Infrastructure",
                vec![
                    "Docker",
                    "Kubernetes",
                    "Amazon Web Services (AWS)",
                    "Helm",
                    "Prometheus",
                    "Grafana",
                    "Linux",
                ],
            ),
        ),
        (
            "infra",
            (
                "Cloud & Infrastructure",
                vec![
                    "Docker",
                    "Kubernetes",
                    "Amazon Web Services (AWS)",
                    "Helm",
                    "Prometheus",
                    "Grafana",
                    "Linux",
                ],
            ),
        ),
        (
            "databases",
            (
                "Databases",
                vec!["SQL", "PostgreSQL", "MongoDB", "Firebase"],
            ),
        ),
        (
            "frameworks",
            (
                "Frameworks & Libraries",
                vec!["Pandas", "NumPy", "React", "Next.js", "Node.js", "Django"],
            ),
        ),
        (
            "libraries",
            (
                "Frameworks & Libraries",
                vec!["Pandas", "NumPy", "React", "Next.js", "Node.js", "Django"],
            ),
        ),
        ("tools", ("Tools", vec!["Git", "GitHub", "GitLab", "Jira"])),
    ]);

    let output = match category.as_deref() {
        Some("all") => {
            let mut sections = vec![];
            for cat in ["languages", "cloud", "databases", "frameworks", "tools"] {
                if let Some((title, vals)) = skills.get(cat) {
                    sections.push(format!(
                        "{}:\n\
                         • {}",
                        title,
                        vals.join("\n• ")
                    ));
                }
            }
            sections.join("\n")
        }
        Some(cat) => {
            if let Some((title, techs)) = skills.get(cat) {
                format!(
                    "{}:\n\
                     • {}",
                    title,
                    techs.join("\n• ")
                )
            } else {
                "Unknown skill category. Use 'skills all' for all skills.".to_string()
            }
        }
        _ => "Use 'skills <category>' for detailed view:\n\
             • skills all                    - All skills\n\
             • skills languages              - Programming languages\n\
             • skills cloud | infra          - Cloud & Infrastructure\n\
             • skills frameworks | libraries - Frameworks & Libraries\n\
             • skills databases              - Databases\n\
             • skills tools                  - Tools"
            .to_string(),
    };

    let response = CommandResponse::success(output);
    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating skills".to_string())
}

#[wasm_bindgen]
pub fn handle_resume_command() -> String {
    let response = CommandResponse::success("Resume:".to_string());

    serde_json::to_string(&response).unwrap_or_else(|_| "Error generating resume info".to_string())
}

#[wasm_bindgen]
pub fn handle_unknown_command(command: &str) -> String {
    let response = CommandResponse::success(format!(
        "Command '{}' not found. Type 'help' for available commands.",
        command
    ));

    serde_json::to_string(&response)
        .unwrap_or_else(|_| "Error generating error message".to_string())
}
