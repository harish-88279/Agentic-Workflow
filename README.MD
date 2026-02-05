Check the hosted website  : https://agentic-workflow-git-main-harish-88279s-projects.vercel.app

---

# ⛓️ Agentic Workflow Builder

A powerful, low-code platform for chaining AI agents into complex workflows. Users can design multi-step processes where the output of one AI model serves as the context for the next, complete with automated validation, smart retries, and live execution streaming.

---

---

## ✨ Key Features

### 🧠 Core Functionality

* **Multi-Step Chaining:** Automatically passes context from Step 1 → Step 2.
* **Smart Context Extraction:** Intelligently extracts code blocks from AI responses to keep context clean for subsequent steps.
* **Completion Criteria:** Define success using **Simple Text** checks or **Regex Patterns** (e.g., `/def \w+/` to ensure a function was defined).
* **Model Agnostic:** Support for multiple models (Kimi, GPT-4o Mini) via the Unbound API.
* **⚡ Real-Time Streaming:** Uses Server-Sent Events (SSE) to show step-by-step progress, "Executing..." states, and results instantly without page reloads.

### 🏆 Bonus Features (Advanced)
* **🔄 Deployed in vercel**

* **🔄 Self-Correcting Retries:** If a step fails validation, the system auto-retries with a "System Prompt" that explicitly explains *why* it failed, forcing the AI to fix its own mistake.
* **🛠️ Configurable Retry Budgets:** Users can set custom retry limits per step directly in the UI.
* **💾 Auto-Persistence:** Workflows and logs are saved to `localStorage` (survives refreshes) and a PostgreSQL database (Neon).
* **⬇️ Export to JSON:** Share and backup workflows with a single click.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Stream API, LocalStorage
* **Backend:** Node.js, Express, Server-Sent Events (SSE)
* **Database:** PostgreSQL (Neon Cloud), Prisma ORM
* **AI Integration:** Unbound Security API
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v18+)
* PostgreSQL Database URL (e.g., from Neon.tech)
* Unbound API Key

### 1. Clone the Repository

```bash
git clone https://github.com/harish-88279/Agentic-Workflow.git
cd agentic-workflow

```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file and add:
# DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
# UNBOUND_API_KEY="your_key_here"
# UNBOUND_API_URL="https://api.unbound.net"
# PORT=3001

# Run Database Migrations
npx prisma generate
npx prisma db push

# Start Server
npm start

```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file and add:
# REACT_APP_API_URL="http://localhost:3001/api"

# Start React App
npm start

```

*Access the app at `http://localhost:3000*`

---

## 📖 API Documentation

The backend exposes a RESTful API with streaming capabilities.

### 1. Execute Workflow (Streaming)

**POST** `/api/run-workflow`

* **Description:** Runs a workflow and streams updates line-by-line (NDJSON).
* **Body:**
```json
{
  "name": "Code Generator",
  "steps": [
    { "id": 1, "model": "kimi-k2p5", "prompt": "Write a python script", "criteria": "def main", "retryLimit": 3 }
  ]
}

```
* **Response:** Stream of JSON events (`STEP_START`, `STEP_COMPLETE`, etc.).

### 2. Get History

**GET** `/api/workflows`

* **Description:** Fetches past runs and their execution logs from Postgres.


### 3. Delete Workflow

**DELETE** `/api/workflows/:id`

* **Description:** Permanently removes a workflow and its logs.

---

## 🧪 Example Workflow (Try this!)

**Goal:** Create a secure password generator and verify it.

**Step 1:**

* **Model:** `kimi-k2p5`
* **Prompt:** "Write a Python function called `generate_password` that returns a random string with special characters."
* **Criteria:** `/def generate_password/`

**Step 2:**

* **Model:** `kimi-k2p5`
* **Prompt:** "Write a Unit Test using `unittest` for the code above."
* **Criteria:** `import unittest`

**Step 3:**

* **Model:** `kimi-k2-instruct`
* **Prompt:** "Critique the security of the code above. Suggest one improvement."
* **Criteria:** `security`

---
