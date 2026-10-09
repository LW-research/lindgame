#!/bin/bash
# ====================================================================
# Catch! Teenieping Magic Academy - 1-Click Game & Server Launcher
# Double-click this file in Finder to launch both server and game page!
# ====================================================================
cd "$(dirname "$0")"

# Priority 1: Configured dev conda environment
if [ -n "$CONDA_PREFIX" ] && [ -x "$CONDA_PREFIX/bin/python" ]; then
    PYTHON_CMD="$CONDA_PREFIX/bin/python"
elif [ -x "$HOME/miniconda3/envs/py312_rsrch/bin/python" ]; then
    PYTHON_CMD="$HOME/miniconda3/envs/py312_rsrch/bin/python"
else
    # Priority 2: Check any Python on this Mac that has edge-tts installed
    PYTHON_CMD=""
    for cand in python3 \
                "$HOME/miniconda3/envs/py312_rsrch/bin/python" \
                "$HOME/miniconda3/bin/python" \
                "$HOME/miniforge3/bin/python" \
                "$HOME/opt/anaconda3/bin/python" \
                /opt/homebrew/bin/python3 \
                /usr/local/bin/python3; do
        if command -v "$cand" &>/dev/null || [ -x "$cand" ]; then
            if "$cand" -c "import edge_tts" &>/dev/null 2>&1; then
                PYTHON_CMD="$cand"
                break
            fi
        fi
    done

    # Priority 3: Standard system python3 or python
    if [ -z "$PYTHON_CMD" ]; then
        if command -v python3 &>/dev/null; then
            PYTHON_CMD="python3"
        elif command -v python &>/dev/null; then
            PYTHON_CMD="python"
        fi
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo "============================================================"
    echo "⚠️ Python was not found on this Mac."
    echo "✨ Opening game directly in your default browser..."
    echo "============================================================"
    open index.html
    exit 0
fi

echo "============================================================"
echo "💖 Starting Catch! Teenieping Magic Academy (캐치! 티니핑)"
echo "🌐 Server running at http://localhost:8642"
echo "✨ Opening game in your default browser..."
echo "💡 Keep this window open while playing. Close it when you're done!"
echo "============================================================"
echo ""

exec "$PYTHON_CMD" server.py
