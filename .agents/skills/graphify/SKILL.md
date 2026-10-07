---
name: graphify
description: Turn codebases, documentation, schemas, and project assets into a queryable knowledge graph. Provides graph extraction, path tracing, architecture inspection, and plain-English code reports without scanning files repeatedly.
---

# Graphify: Codebase Knowledge Graph Skill

Graphify extracts an Abstract Syntax Tree (AST) and semantic relationship graph of your project, creating a queryable map (`graph.json`, `graph.html`, and `GRAPH_REPORT.md`). Use this skill to answer architectural questions, trace dependencies, locate functions, and understand cross-module interactions without consuming excessive tokens on repetitive file searches.

---

## When to Use This Skill

Activate this skill when:
- Exploring or onboarding into a new or complex codebase.
- Asking structural questions: "How does module X connect to module Y?", "What calls function Z?", "Where is authentication handled?".
- Tracing data flows, dependency paths, or impact of refactoring across files.
- Generating or updating an interactive architectural visualization (`graph.html`).
- Creating or refreshing the executive codebase summary (`GRAPH_REPORT.md`).

---

## Core Tooling & Setup

Graphify is powered by the `graphify` CLI (distributed as PyPI package `graphifyy`).

### Installation
If the CLI is not yet installed in the environment:
```bash
# Using uv (recommended)
uv tool install graphifyy

# Or using pip
pip install graphifyy
```

### Initializing / Updating the Graph
Run inside the project root:
```bash
# Extract full codebase graph
graphify extract .

# Or update only changed files
graphify extract . --update

# Generate or refresh report and HTML visualizer
graphify report
```

### Configuration (`.graphifyignore`)
Exclude non-source or high-noise directories in `.graphifyignore` (uses `.gitignore` syntax):
```text
node_modules/
.next/
dist/
build/
coverage/
*.min.js
*.map
.git/
```

---

## Agent Query Workflow

Before executing broad `grep` or `glob` commands across the codebase, check if Graphify data is available in `graph-out/` or project root:

1. **Check for `GRAPH_REPORT.md`**:
   Read this file first for a high-level summary of domains, core abstractions, and key entry points.
2. **Execute Graph Queries**:
   Use CLI queries to retrieve exact subgraphs rather than parsing raw source:
   ```bash
   # Targeted semantic query
   graphify query "How are payments processed and which files are involved?"

   # Trace shortest path / call chain between two symbols or files
   graphify path "CheckoutButton" "MercadoPagoProvider"

   # Explain a specific node and its inbound/outbound relations
   graphify explain "CartContext"
   ```
3. **Relationship Confidence Levels**:
   - **`EXTRACTED`**: Deterministic link derived directly from AST import/call analysis.
   - **`INFERRED`**: Probabilistic relationship derived from semantic naming or context.
   - **`AMBIGUOUS`**: Unresolved reference requiring verification in source files.

---

## Command Reference

| Command | Purpose | Example |
| :--- | :--- | :--- |
| `graphify extract <dir>` | Parse files & build `graph.json` | `graphify extract .` |
| `graphify extract . --update` | Incremental update for modified files | `graphify extract . --update` |
| `graphify query "<prompt>"` | Query relationships for a specific question | `graphify query "user auth flow"` |
| `graphify path "<A>" "<B>"` | Find direct or indirect link between nodes | `graphify path "login" "supabase"` |
| `graphify explain "<node>"` | Detailed summary of inbound/outbound links | `graphify explain "ProductCard"` |
| `graphify hook install` | Install git post-commit hook for auto-sync | `graphify hook install` |

---

## Best Practices
- **Commit `graph.json` and `GRAPH_REPORT.md`**: Keep the graph in version control so that agents and collaborators have instant access to up-to-date structural intelligence.
- **Verify Ambiguities**: If a relationship is tagged `AMBIGUOUS`, verify the actual call in the specified file before making refactoring decisions.
- **Combine with File Reading**: Use Graphify to locate the exact 2-3 files that matter, then use standard file view tools to read only those critical sections.
