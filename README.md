# ⚡ GSTAutopilot

**The ultimate AI-powered invoicing engine for Indian small businesses and freelancers.**

GSTAutopilot is a stateless, high-performance web application designed to simplify GST compliance. It automates the complex parts of invoicing—like SAC code detection and tax splitting—so business owners can focus on what they do best.

![GSTAutopilot Preview](https://via.placeholder.com/1200x600?text=GSTAutopilot+Premium+Dashboard+Preview)

---

## ✨ Key Features

- **🤖 AI-Powered SAC Detection**: Just describe your service, and our Gemini 2.5 AI will instantly find the correct 6-digit SAC code for you.
- **📄 GST-Compliant PDF Generation**: Generate professional, beautiful invoices with automated CGST, SGST, and IGST splitting.
- **📊 Session-Based Dashboard**: Track your invoicing activity in real-time with dynamic charts and metrics (privacy-focused, no database required).
- **📥 GSTR-1 Ready Exports**: Export your monthly invoices directly into the official GSTN-compliant B2B JSON format.
- **🛡️ Strictly Deterministic**: Built-in validation for 37 Indian States/UTs and real-time GSTIN checksum verification.
- **💎 Premium UX**: A sleek, responsive interface built with Tailwind CSS and shadcn/ui.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Visuals**: Recharts & Lucide Icons

### Backend
- **Runtime**: Node.js (Express + TypeScript)
- **AI**: Google Gemini AI (Gemini 2.5 Pro)
- **PDF Engine**: PDFKit
- **Logging**: Pino
- **Security**: Helmet, CORS, and Rate Limiting

### Shared Package
- **Validation**: Shared Zod schemas for both frontend and backend.
- **Data**: Hardcoded Indian State codes and GST meta-data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm or pnpm
- A [Google AI API Key](https://aistudio.google.com/) (for SAC detection)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JayantOlhyan/GSTAutopilot.git
   cd GSTAutopilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   **In `backend/`:**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

   **In `frontend/`:**
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Running the App

Run both frontend and backend simultaneously using workspaces:

```bash
# Start Backend
npm run dev --workspace=gstautopilot-backend

# Start Frontend
npm run dev --workspace=gstautopilot-frontend
```

---

## 🏗️ Project Structure

```text
├── shared/          # Shared Zod schemas and TypeScript types
├── backend/         # Express API & stateless services (AI, PDF, GSTR)
└── frontend/        # React + Vite application
```

---

## 🛡️ Privacy & Security

GSTAutopilot is designed to be **stateless**. 
- Your business data is saved to your browser's `localStorage`.
- Your generated invoices are kept in `sessionStorage` and cleared when you close the tab.
- We **never** log PII (like GSTINs) to our servers.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built for the future of Indian Business by [Jayant Olhyan](https://github.com/JayantOlhyan)**
