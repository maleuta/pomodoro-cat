# 🐾 Pomodoro Cat

A desktop Pomodoro Timer application with gamification elements. It helps you maintain focus during study or work sessions by featuring a virtual cat assistant and a reward system (coins) for completing your tasks.

## Features
* **Compact Interface (Widget):** The application runs in a standalone, borderless window that stays "Always on Top" of your screen.
* **Customizable Modes:** Built-in time presets (e.g., 25/5, 50/10) and adjustable session repetitions (sets).
* **Gamification:** Earn virtual coins for every minute of focused work.
* **Cozy Animations:** The virtual cat changes its state (Idle, Working, Sleeping) depending on the active timer mode.

## Tech Stack
* **Frontend:** React + CSS
* **Desktop Environment:** Electron
* **Backend:** Python + FastAPI
* **Database:** PostgreSQL

---

## How to run locally?

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (includes npm)
* [Python 3.x](https://www.python.org/)
* [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/pomodoro-cat.git](https://github.com/YOUR_USERNAME/pomodoro-cat.git)
cd pomodoro-cat
```

### 2. Database Setup
Create a PostgreSQL database named kocia_baza.
Execute the SQL script provided in the backend/init.sql file to create the necessary tables.


### 3. Backend Setup (FastAPI)
Navigate to the backend directory, install the dependencies, and start the server:

1 terminal:
```Bash
cd backend
pip install -r requirements.txt
```

⚠️ Important: Before running the server, open main.py and replace the DATABASE_URL placeholder with your actual PostgreSQL credentials.

```
uvicorn main:app --reload
```

### 4. Frontend & Electron Setup (React)
Open a new terminal window, navigate to the frontend directory, install the required packages, and launch the desktop application:

2 terminal:
```Bash
cd frontend
npm run dev
```

3 terminal:
```Bash
cd frontend
npm install
npm run start-app
```
