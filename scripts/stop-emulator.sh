#!/bin/bash

# Stop Flow emulator
echo "🛑 Stopping Flow emulator..."

# Kill by PID if available
if [ -f flowdb/emulator.pid ]; then
    PID=$(cat flowdb/emulator.pid)
    kill $PID 2>/dev/null || true
    rm -f flowdb/emulator.pid
fi

# Also try the flow command
flow emulator stop 2>/dev/null || true

# Kill any remaining flow emulator processes
pkill -f "flow emulator" 2>/dev/null || true

echo "✅ Emulator stopped" 