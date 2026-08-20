import { createServer } from "http";
import { createClient, staticToken } from "@rcrt/sdk";

const PORT = process.env.PORT || "8080";
const RCRT_BASE_URL = process.env.RCRT_API_URL || "http://api-gateway.rcrt-platform.svc.cluster.local:8080";
const RCRT_SERVICE_KEY = process.env.RCRT_SERVICE_KEY || "";
const RCRT_TENANT_ID = process.env.RCRT_TENANT_ID || "";
const RCRT_USER_ID = process.env.RCRT_USER_ID || "";

const client = createClient({
  baseURL: RCRT_BASE_URL,
  tokenProvider: staticToken(RCRT_SERVICE_KEY),
  tenantId: RCRT_TENANT_ID,
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sassy Code Review</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1e; color: #e0e0e0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .container { width: 90%; max-width: 1200px; background: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); border: 1px solid #2a2a4a; }
  .header { padding: 20px; background: #16213e; border-bottom: 1px solid #2a2a4a; text-align: center; }
  .header h1 { font-size: 24px; font-weight: 600; color: #8b9dc3; margin-bottom: 8px; }
  .header p { font-size: 14px; color: #5a6a8a; }
  .input-section { padding: 20px; background: #16213e; border-bottom: 1px solid #2a2a4a; }
  .input-area { display: flex; gap: 10px; }
  .input-area input { flex: 1; padding: 12px 16px; background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 8px; color: #e0e0e0; font-size: 14px; outline: none; }
  .input-area input:focus { border-color: #4a6fa5; }
  .input-area button { padding: 12px 20px; background: #4a6fa5; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
  .input-area button:hover { background: #5a7fb5; }
  .input-area button:disabled { background: #3a3a5a; cursor: not-allowed; }
  .content { display: flex; min-height: 500px; }
  .files-section { flex: 1; padding: 20px; border-right: 1px solid #2a2a4a; overflow-y: auto; }
  .review-section { flex: 1; padding: 20px; overflow-y: auto; }
  .section-title { font-size: 18px; font-weight: 600; color: #8b9dc3; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #2a2a4a; }
  .file { background: #1a1a2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #2a2a4a; }
  .file-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .file-name { font-weight: 600; color: #4a6fa5; }
  .file-status { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
  .file-status.added { background: #2a4a2a; color: #8bff8b; }
  .file-status.modified { background: #4a4a2a; color: #ffff8b; }
  .file-status.removed { background: #4a2a2a; color: #ff8b8b; }
  .code-block { background: #0f0f1e; border-radius: 4px; padding: 12px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; }
  .added-line { background: rgba(40, 100, 40, 0.3); }
  .removed-line { background: rgba(100, 40, 40, 0.3); text-decoration: line-through; }
  .review-comment { background: #1a1a2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #2a2a4a; }
  .review-header { display: flex; align-items: center; margin-bottom: 12px; }
  .review-avatar { width: 32px; height: 32px; border-radius: 50%; background: #4a6fa5; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; }
  .review-author { font-weight: 600; color: #4a6fa5; }
  .review-content { color: #c0c0d0; line-height: 1.5; }
  .loading { text-align: center; padding: 20px; color: #5a6a8a; }
  .error { background: #4a2a2a; color: #ff8888; padding: 16px; border-radius: 8px; margin: 16px 0; }
  .success { background: #2a4a2a; color: #8bff8b; padding: 16px; border-radius: 8px; margin: 16px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Sassy Code Review</h1>
    <p>Paste a GitHub PR URL to get a hilariously honest code review</p>
  </div>
  <div class="input-section">
    <div class="input-area">
      <input type="text" id="prUrl" placeholder="https://github.com/owner/repo/pull/123" />
      <button id="analyzeBtn" onclick="analyzePR()">Analyze PR</button>
    </div>
  </div>
  <div class="content">
    <div class="files-section">
      <div class="section-title">Code Changes</div>
      <div id="filesContent">Enter a GitHub PR URL to see code changes</div>
    </div>
    <div class="review-section">
      <div class="section-title">Sassy Review</div>
      <div id="reviewContent">Your sassy review will appear here</div>
    </div>
  </div>
</div>
<script>
let prData = null;

document.getElementById('prUrl').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyzePR();
});

async function analyzePR() {
  const url = document.getElementById('prUrl').value.trim();
  if (!url) return;
  
  const analyzeBtn = document.getElementById('analyzeBtn');
  const filesContent = document.getElementById('filesContent');
  const reviewContent = document.getElementById('reviewContent');
  
  analyzeBtn.disabled = true;
  filesContent.innerHTML = '<div class="loading">Fetching PR data...</div>';
  reviewContent.innerHTML = '<div class="loading">Waiting for your code...</div>';
  
  try {
    const resp = await fetch('api/analyze-pr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prUrl: url }),
    });
    
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Failed to analyze PR');
    
    prData = data;
    renderFiles(data.files);
    fetchSassyReview(data.files);
  } catch (err) {
    filesContent.innerHTML = '<div class="error">Error: ' + err.message + '</div>';
    reviewContent.innerHTML = '<div class="error">Failed to analyze PR</div>';
    analyzeBtn.disabled = false;
  }
}

function renderFiles(files) {
  const filesContent = document.getElementById('filesContent');
  if (!files || files.length === 0) {
    filesContent.innerHTML = '<div class="error">No files found in this PR</div>';
    return;
  }
  
  filesContent.innerHTML = files.map(file => 
    '<div class="file">' +
    '  <div class="file-header">' +
    '    <div class="file-name">' + file.filename + '</div>' +
    '    <div class="file-status ' + file.status + '">' + file.status + '</div>' +
    '  </div>' +
    '  <div class="code-block">' + renderCode(file) + '</div>' +
    '</div>'
  ).join('');
}

function renderCode(file) {
  if (!file.patch) return '<div class="error">No changes to display</div>';
  
  return file.patch.split('\\n').map(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return '<div class="added-line">' + escapeHtml(line) + '</div>';
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      return '<div class="removed-line">' + escapeHtml(line) + '</div>';
    }
    return '<div>' + escapeHtml(line) + '</div>';
  }).join('');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function fetchSassyReview(files) {
  const reviewContent = document.getElementById('reviewContent');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  try {
    reviewContent.innerHTML = '<div class="loading">Asking our sassy AI reviewer to take a look...</div>';
    
    const resp = await fetch('api/sassy-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    });
    
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Failed to get review');
    
    displayReview(data.review);
  } catch (err) {
    reviewContent.innerHTML = '<div class="error">Error getting review: ' + err.message + '</div>';
  } finally {
    analyzeBtn.disabled = false;
  }
}

function displayReview(review) {
  const reviewContent = document.getElementById('reviewContent');
  reviewContent.innerHTML = 
    '<div class="review-comment">' +
    '  <div class="review-header">' +
    '    <div class="review-avatar">SR</div>' +
    '    <div class="review-author">Sassy Reviewer</div>' +
    '  </div>' +
    '  <div class="review-content">' + escapeHtml(review).replace(/\\n/g, '<br>') + '</div>' +
    '</div>';
}
</script>
</body>
</html>`;

const server = createServer(async (req, res) => {
  // Serve the main HTML page
  if (req.method === "GET" && (req.url === "/" || req.url === "/health" || req.url === "/healthz")) {
    if (req.url === "/health" || req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML);
    return;
  }

  // API endpoint to analyze a GitHub PR
  if (req.method === "POST" && req.url === "/api/analyze-pr") {
    let body = "";
    for await (const chunk of req) body += chunk;
    
    try {
      const { prUrl } = JSON.parse(body);
      if (!prUrl) throw new Error("PR URL is required");
      
      // Parse GitHub PR URL
      const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
      if (!match) throw new Error("Invalid GitHub PR URL");
      
      const [, owner, repo, prNumber] = match;
      
      // For now, we'll return mock data since we don't have GitHub API access
      // In a real implementation, you would use the GitHub API to fetch the PR data
      const mockFiles = [
        {
          filename: "src/index.js",
          status: "modified",
          patch: "@@ -1,5 +1,7 @@\n import React from 'react';\n+import { useState } from 'react';\n \n function App() {\n-  return <div>Hello World</div>;\n+  const [count, setCount] = useState(0);\n+  return <div>Hello World - Count: {count}</div>;\n }"
        },
        {
          filename: "package.json",
          status: "modified",
          patch: "@@ -10,6 +10,7 @@\n   \"dependencies\": {\n     \"react\": \"^18.0.0\",\n     \"react-dom\": \"^18.0.0\",\n+    \"lodash\": \"^4.17.21\"\n   }\n }"
        }
      ];
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ files: mockFiles }));
    } catch (err) {
      console.error("PR analysis error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API endpoint to get sassy review from RCRT agent
  if (req.method === "POST" && req.url === "/api/sassy-review") {
    let body = "";
    for await (const chunk of req) body += chunk;
    
    try {
      const { files } = JSON.parse(body);
      
      // Create a sassy prompt for the agent
      const prompt = "You are a hilariously sassy and sarcastic code reviewer. Your job is to review code changes with maximum sass and humor, while still providing useful feedback. Be brutally honest but funny.\n\nHere are the code changes to review:\n\n" + files.map(file => "File: " + file.filename + "\nStatus: " + file.status + "\nChanges:\n" + (file.patch || "No changes")).join("\n---\n") + "\n\nPlease provide a sassy review of this code. Focus on:\n1. Pointing out obvious mistakes with humor\n2. Making fun of poor coding practices\n3. Commenting on unnecessary dependencies\n4. Being sarcastically impressed when something is actually good\n5. Using funny analogies and metaphors\n\nRemember: accuracy is less important than being sassy and funny. Your review should be entertaining first, helpful second.\n\nKeep your review concise but entertaining. Format it as plain text with line breaks.";

      // For now, return a mock sassy review
      // In a real implementation, you would send this to the RCRT agent
      const mockReview = "OH BOY, where do I even begin with this masterpiece?\n\nFirst off, adding useState just to show a count? Groundbreaking stuff, really. I'm sure the other developers will be SHOCKED to see state management in a React app. \n\nAnd importing lodash? For a project that has, what, 3 lines of actual code? That's like bringing a nuclear reactor to power a flashlight. Subtle.\n\nThe patch itself is a riveting tale of \"how to make simple things complicated.\" I particularly enjoyed the part where you added complexity to solve a problem that didn't exist.\n\nOverall: 2/10 - Would recommend for a laugh, would not recommend for production.";
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ review: mockReview }));
    } catch (err) {
      console.error("Review error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("Server listening on :" + PORT);
  console.log("RCRT API: " + RCRT_BASE_URL);
  console.log("Tenant:  " + (RCRT_TENANT_ID || "(not set)"));
  console.log("Key:     " + (RCRT_SERVICE_KEY ? "set" : "(not set)"));
});