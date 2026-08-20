# Sassy Code Review Website

A website that lets you paste a link to a GitHub PR and get a sassy code review from an AI agent.

## Features

- Paste a GitHub PR URL to analyze
- Fetches the full code changes from the PR
- Displays files and code blocks in a user-friendly interface
- Sends the code to an RCRT agent for a sassy code review
- Shows the humorous review comments from the agent

## Deployment

This service is designed to be deployed on the RCRT platform using the manifest.json file.

## Development

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Visit http://localhost:8080

## RCRT SDK Integration

This service uses the @rcrt/sdk to communicate with the RCRT platform and its agents.