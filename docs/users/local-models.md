# Using Local Models with Qwen Code

Qwen Code now supports **local model inference** using Ollama or vLLM, allowing you to run completely offline without cloud dependencies.

## Quick Start

### 1. Install and Setup Ollama (Recommended)

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Pull Qwen3-Coder Model

```bash
# Recommended: 14B model (best balance)
ollama pull qwen3-coder:14b

# Alternatives:
ollama pull qwen3-coder:7b     # Faster, less memory
ollama pull qwen3-coder:32b    # Best quality, requires GPU
ollama pull qwen3-coder:7b-q4  # Quantized, minimal resources
```

### 3. Configure Qwen Code for Local Use

#### Option A: Environment Variables (Recommended)

```bash
# Add to .qwen/.env or export in your shell
export OPENAI_API_KEY="local"
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_MODEL="qwen3-coder:14b"
```

#### Option B: Settings File

Create or edit `.qwen/settings.json`:

```json
{
  "authType": "openai",
  "baseUrl": "http://localhost:11434/v1",
  "model": "qwen3-coder:14b"
}
```

### 4. Run Qwen Code

```bash
cd your-project/
qwen
```

Qwen Code will automatically detect and use your local Ollama server!

## Configuration Options

### Using vLLM (Advanced)

For maximum performance with GPU acceleration:

```bash
# Install vLLM
pip install vllm

# Start vLLM server
vllm serve Qwen/Qwen3-Coder-14B --port 8000

# Configure Qwen Code
export OPENAI_BASE_URL="http://localhost:8000/v1"
export OPENAI_MODEL="Qwen/Qwen3-Coder-14B"
```

### Offline Mode

Prevent fallback to cloud providers:

```bash
export OFFLINE_MODE="true"
```

Or in `.qwen/settings.json`:

```json
{
  "offlineMode": true
}
```

## Model Recommendations

| Model               | Size   | RAM Required | Use Case                         |
| ------------------- | ------ | ------------ | -------------------------------- |
| `qwen3-coder:7b`    | ~4GB   | 8GB RAM      | Laptops, quick responses         |
| `qwen3-coder:14b`   | ~8GB   | 16GB RAM     | **Recommended** - Best balance   |
| `qwen3-coder:32b`   | ~20GB  | 32GB RAM     | Maximum quality, needs GPU       |
| `qwen3-coder:7b-q4` | ~2.5GB | 4GB RAM      | Minimal resources, still capable |

## Performance Tips

### GPU Acceleration

Ollama automatically uses GPU if available:

- **NVIDIA**: CUDA support (automatic)
- **Apple Silicon**: Metal support (automatic)
- **AMD**: ROCm support (configure manually)

Check GPU usage:

```bash
# While running Qwen Code
nvidia-smi  # NVIDIA GPUs
```

### Speed Expectations

| Hardware       | Tokens/Second |
| -------------- | ------------- |
| GPU (RTX 4090) | 40-60 tok/s   |
| GPU (RTX 3060) | 20-30 tok/s   |
| Apple M2 Pro   | 15-25 tok/s   |
| CPU only       | 3-8 tok/s     |

### Memory Optimization

Use quantized models for limited RAM:

```bash
# 4-bit quantization (recommended for laptops)
ollama pull qwen3-coder:14b-q4

# 8-bit quantization (better quality)
ollama pull qwen3-coder:14b-q8
```

## Troubleshooting

### Issue: "Ollama not running"

**Solution:**

```bash
# Check if Ollama is running
ollama list

# Start Ollama service (if needed)
ollama serve
```

### Issue: "Model not found"

**Solution:**

```bash
# Pull the model first
ollama pull qwen3-coder:14b

# List available models
ollama list
```

### Issue: Slow responses

**Possible causes:**

1. Using CPU instead of GPU
2. Model too large for available RAM (use smaller/quantized model)
3. Other apps consuming resources

**Check resources:**

```bash
# Monitor Ollama
ollama ps

# Check system resources
htop  # Linux/macOS
taskmgr  # Windows
```

### Issue: "Cannot connect to localhost:11434"

**Solutions:**

1. Ensure Ollama is running: `ollama serve`
2. Check port not blocked by firewall
3. Try explicit IP: `http://127.0.0.1:11434/v1`

## Advanced Configuration

### Custom Base URL

For remote Ollama server:

```bash
export OPENAI_BASE_URL="http://192.168.1.100:11434/v1"
```

### Multiple Models

Switch models easily:

```bash
# Use different model
export OPENAI_MODEL="qwen3-coder:32b"
qwen
```

### Hybrid Setup (Local + Cloud Fallback)

Use local when available, cloud as backup:

```bash
# Don't set OFFLINE_MODE
# Configure both local and cloud
export OPENAI_BASE_URL="http://localhost:11434/v1"
# Keep OPENAI_API_KEY for cloud fallback
```

## Environment Variables Reference

| Variable          | Purpose                          | Default  | Example                     |
| ----------------- | -------------------------------- | -------- | --------------------------- |
| `OPENAI_BASE_URL` | Local server URL                 | -        | `http://localhost:11434/v1` |
| `OPENAI_MODEL`    | Model to use                     | -        | `qwen3-coder:14b`           |
| `OPENAI_API_KEY`  | API key (use "local" for Ollama) | -        | `local`                     |
| `OFFLINE_MODE`    | Block cloud access               | `false`  | `true`                      |
| `LOCAL_PROVIDER`  | Provider type                    | `ollama` | `ollama`, `vllm`, `custom`  |

## Comparing Local vs Cloud

| Aspect       | Local (Ollama)                | Cloud (Qwen OAuth)        |
| ------------ | ----------------------------- | ------------------------- |
| **Speed**    | Depends on hardware           | Fast (optimized servers)  |
| **Privacy**  | ✅ Fully private              | ⚠️ Data sent to cloud     |
| **Cost**     | ✅ Free (electricity only)    | ✅ 2000 req/day free tier |
| **Internet** | ✅ Works offline              | ❌ Requires connection    |
| **Setup**    | Moderate (install & download) | Easy (browser auth)       |
| **Quality**  | Same model quality            | Same model quality        |

## Next Steps

- **Check if working**: Run `qwen -p "Hello, are you running locally?"`
- **Optimize performance**: Try different quantization levels
- **Explore features**: All Qwen Code features work with local models!

## Support

- **Ollama docs**: https://github.com/ollama/ollama
- **vLLM docs**: https://docs.vllm.ai
- **Report issues**: https://github.com/QwenLM/qwen-code/issues
