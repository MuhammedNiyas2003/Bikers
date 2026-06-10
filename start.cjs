const { spawn } = require('child_process');

console.log("Starting MotoEscape fullstack environment...");

// Start express server
const server = spawn('node', ['server.cjs'], { stdio: 'inherit', shell: true });

// Start vite frontend dev server
const vite = spawn('npx.cmd', ['vite'], { stdio: 'inherit', shell: true });

// Handle process exit cleanly
process.on('SIGINT', () => {
    console.log("Shutting down servers...");
    server.kill();
    vite.kill();
    process.exit();
});

process.on('exit', () => {
    server.kill();
    vite.kill();
});
