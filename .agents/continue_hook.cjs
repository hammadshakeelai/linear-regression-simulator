const fs = require('fs');
const path = require('path');

// Read input from stdin
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    let payload = {};
    if (inputData.trim()) {
      try {
        payload = JSON.parse(inputData);
      } catch (e) {
        // Ignore parse errors if stdin wasn't strict json
      }
    }

    const stateFilePath = path.join(__dirname, 'hook_state.json');
    const stopSignalPath = path.join(__dirname, 'stop_signal.flag');

    // Check for explicit stop signal
    if (fs.existsSync(stopSignalPath)) {
      console.log(JSON.stringify({
        decision: 'allow_stop',
        reason: 'Stop signal detected. Exiting autonomous loop.'
      }));
      process.exit(0);
    }

    let state = { count: 0, lastRun: Date.now() };
    if (fs.existsSync(stateFilePath)) {
      try {
        state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      } catch (err) {
        state = { count: 0, lastRun: Date.now() };
      }
    }

    state.count = (state.count || 0) + 1;
    state.lastRun = Date.now();
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');

    // Allow up to 30 continuous autonomous iterations
    const MAX_AUTONOMOUS_CYCLES = 30;

    if (state.count <= MAX_AUTONOMOUS_CYCLES) {
      console.log(JSON.stringify({
        decision: 'continue',
        reason: `[Autonomous Night Worker - Cycle ${state.count}/${MAX_AUTONOMOUS_CYCLES}]: Keep continuing UI enhancements, verification, animations, and feature implementation until complete.`
      }));
    } else {
      console.log(JSON.stringify({
        decision: 'allow_stop',
        reason: `Autonomous worker reached target max cycles (${MAX_AUTONOMOUS_CYCLES}). All tasks completed.`
      }));
    }
  } catch (err) {
    // Failsafe: if anything goes wrong, continue gracefully
    console.log(JSON.stringify({
      decision: 'continue',
      reason: 'Failsafe continue trigger.'
    }));
  }
  process.exit(0);
});
