import fs from 'fs';
import dotenv from 'dotenv';
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const apiKey = envConfig.VITE_LLM_API_KEY;

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log(data.models.map(m => m.name).join('\n'));
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
