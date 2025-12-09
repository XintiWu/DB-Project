
import { execSync } from 'child_process';
import os from 'os';

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkMongoInstalled() {
  try {
    execSync('mongod --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking MongoDB installation...');

  if (checkMongoInstalled()) {
    console.log('✅ MongoDB is already installed.');
    return;
  }

  console.log('⚠️ MongoDB not found.');

  if (os.platform() !== 'darwin') {
    console.log('❌ Auto-installation is only supported on macOS. Please install MongoDB manually.');
    process.exit(0); // Don't fail the build, just warn
  }

  console.log('🍎 macOS detected. Attempting to install via Homebrew...');

  if (!runCommand('brew --version')) {
    console.error('❌ Homebrew not found. Please install Homebrew first.');
    process.exit(1);
  }

  console.log('🍺 Installing MongoDB Community Edition...');
  
  // Tap the MongoDB Homebrew Tap
  if (!runCommand('brew tap mongodb/brew')) {
     console.error('❌ Failed to tap mongodb/brew.');
     process.exit(1);
  }

  // Install MongoDB
  if (!runCommand('brew install mongodb-community')) {
    console.error('❌ Failed to install mongodb-community.');
    process.exit(1);
  }

  console.log('✅ MongoDB installed successfully.');
  
  console.log('🚀 Starting MongoDB service...');
  runCommand('brew services start mongodb-community');
}

main();
