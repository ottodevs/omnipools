#!/bin/bash

# Start Flow emulator in background
echo "🔧 Starting Flow emulator in background..."

# Check if already running
if nc -z localhost 3569 2>/dev/null; then
    echo "✅ Emulator already running!"
    echo "🔧 gRPC API: localhost:3569"
    echo "🌐 REST API: localhost:8888"
    echo "⚙️ Admin API: localhost:8080"
    exit 0
fi

# Stop any existing emulator and clear ports
echo "🧹 Cleaning up any existing processes..."
flow emulator stop 2>/dev/null || true
lsof -ti:8888 | xargs kill -9 2>/dev/null || true
lsof -ti:3569 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Create flowdb directory if it doesn't exist
mkdir -p flowdb

echo "🚀 Starting emulator in background..."

# Start the emulator in background with simple &
flow emulator start --persist > flowdb/emulator.log 2>&1 &
EMULATOR_PID=$!
echo "Emulator PID: $EMULATOR_PID"

# Wait for emulator to be ready
echo "⏳ Waiting for emulator to be ready..."
for i in {1..20}; do
    # Check if gRPC port is responding (Flow emulator main port)
    if nc -z localhost 3569 2>/dev/null; then
        echo "✅ Emulator is ready! (PID: $EMULATOR_PID)"
        echo $EMULATOR_PID > flowdb/emulator.pid
        echo "📄 Logs: flowdb/emulator.log"
        echo "🔧 gRPC API: localhost:3569"
        echo "🌐 REST API: localhost:8888"
        echo "⚙️ Admin API: localhost:8080"
        exit 0
    fi
    sleep 1
done

echo "❌ Emulator failed to start within 20 seconds"
kill $EMULATOR_PID 2>/dev/null || true
exit 1 