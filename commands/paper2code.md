---
description: Transform ML research papers into working code repositories using Paper2Code (PaperCoder) multi-agent pipeline.
agents: ["paper2code-engineer"]
---

# Paper2Code Command

**Activates:** `paper2code-engineer` agent

## Usage
```
/paper2code "path/to/paper.pdf"                    # PDF input (auto-convert)
/paper2code "path/to/paper.json"                   # JSON input (S2ORC format)
/paper2code "path/to/paper.tex" --latex            # LaTeX source input
/paper2code "path/to/paper.pdf" --evaluate          # PDF + evaluation
/paper2code "path/to/paper.pdf" --debug             # PDF + auto-debugging
/paper2code "path/to/paper.pdf" --vllm              # PDF + local model
/paper2code "path/to/paper.pdf" --pdf-method simple # PDF + simple text extraction
/paper2code "path/to/paper.pdf" --pdf-method s2orc  # PDF + high-quality parsing
/paper2code list                                     # List completed conversions
/paper2code status <paper_name>                      # Check conversion status
/paper2code eval <paper_name>                        # Evaluate existing conversion
```

## ⚠️ Important

This command will **WAIT** for your explicit confirmation before running the pipeline.

## What Happens

1. **Validate Input** - Check paper file format and dependencies
2. **Configure Pipeline** - Set model, backend, output directories
3. **Run 3-Stage Pipeline**:
   - Stage 1: Planning (architecture, task list, config)
   - Stage 2: Analysis (per-file logic analysis)
   - Stage 3: Code generation (working Python files)
4. **Generate reproduce.sh** - Setup and execution script
5. **[Optional] Debug** - Auto-fix execution errors
6. **[Optional] Evaluate** - Score 1-5 with model-based evaluation
7. **Report Results** - Show output structure, costs, and quality metrics

## Pipeline Stages

### Stage 0: Preprocessing (JSON only)
- Clean S2ORC JSON (remove citations, references, equations)
- Extract structured content

### Stage 1: Planning
- Overall plan: Extract methodology, datasets, hyperparameters
- Architecture design: Generate Mermaid class/sequence diagrams
- Logic design: Create task list with dependency ordering
- Config extraction: Generate config.yaml with hyperparameters

### Stage 2: Analysis
- Per-file deep logic analysis
- Context-aware implementation details
- API specifications and data structures

### Stage 3: Coding
- Generate Python files in dependency order
- Use previously written files as context
- Create reproduce.sh for environment setup

### Stage 4: Debugging (Optional)
- Run generated code
- Capture execution errors
- Apply SEARCH/REPLACE patches automatically

### Stage 5: Evaluation (Optional)
- Reference-free: Score based on paper alignment
- Reference-based: Compare with gold standard if available
- Output: Score 1-5 with critique list

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--model` | o3-mini | LLM model (OpenAI) |
| `--vllm-model` | deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct | Local model |
| `--backend` | openai | openai or vllm |
| `--output-dir` | outputs/<paper_name> | Artifacts directory |
| `--repo-dir` | outputs/<paper_name>_repo | Final repository |
| `--evaluate` | false | Run evaluation |
| `--debug` | false | Auto-debug errors |
| `--latex` | false | Input is LaTeX source |
| `--pdf-method` | auto | PDF conversion: auto, s2orc, simple |

## Output Structure
```
outputs/<paper_name>/
├── planning_artifacts/          # Plans, architecture, config
├── analyzing_artifacts/         # Per-file analysis
├── coding_artifacts/            # Generated code
├── planning_trajectories.json   # Full conversation history
├── planning_config.yaml         # Training configuration
└── accumulated_cost.json        # Cost tracking

outputs/<paper_name>_repo/       # Working repository
├── <generated Python files>
└── reproduce.sh                 # Setup and run script
```

## Supported Input Formats

### PDF (Recommended for convenience)
- Direct PDF input with automatic conversion
- Two extraction modes:
  - **High-quality**: s2orc-doc2json + Grobid (structured extraction)
  - **Simple**: PyMuPDF text extraction (fast, no setup required)
- Use: `/paper2code "paper.pdf"`
- Use: `/paper2code "paper.pdf" --pdf-method simple`

### S2ORC JSON (Recommended for quality)
- Convert PDF to JSON using s2orc-doc2json
- Place in examples/ directory
- Use: /paper2code "examples/paper.json"

### LaTeX Source
- Direct .tex file input
- Use: /paper2code "paper.tex" --latex

## Cost Estimates
- **o3-mini**: $0.50-$0.70 per run
- **o4-mini**: $0.40-$0.60 per run
- **gpt-4o**: $2.00-$4.00 per run
- **vLLM (local)**: Free (requires GPU)

## Examples

### Convert Transformer Paper
```
/paper2code "examples/Transformer_cleaned.json"
```

### Full Pipeline with Evaluation
```
/paper2code "examples/Transformer_cleaned.json" --evaluate --debug
```

### Use Local Model (vLLM)
```
/paper2code "examples/Transformer_cleaned.json" --vllm
```

### Check Status
```
/paper2code status Transformer
```

### Evaluate Existing Conversion
```
/paper2code eval Transformer
```

## Quality Gates
- Planning completeness: All 4 artifacts generated
- Analysis coverage: Every file analyzed
- Code generation: All files produced
- Evaluation score: ≥ 3.0/5.0 (configurable)
- Execution: reproduce.sh runs without errors

## Prerequisites
```bash
# Install dependencies
cd C:\Users\amazon\paper2code-repo
pip install -r requirements.txt

# Set API key (OpenAI backend)
export OPENAI_API_KEY="your-key"

# Or use vLLM (local backend)
# Requires GPU and vLLM installation
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| JSON parse errors | Automatic 4-level fallback |
| API rate limits | Retry with backoff |
| Code execution errors | Run with --debug |
| Low evaluation score | Review planning artifacts |
| High costs | Use o3-mini or vLLM backend |

## See Also
- Agent: `@paper2code-engineer`
- Repository: `C:\Users\amazon\paper2code-repo`
- Paper: ICLR 2026 "Paper2Code: Automating Code Generation from Scientific Papers"
- GitHub: https://github.com/going-doer/paper2code
