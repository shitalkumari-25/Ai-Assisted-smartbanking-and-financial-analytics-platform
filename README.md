# 💳 AI-Assisted Smart Banking and Financial Analytics Platform

### Smarter Banking | Safer Transactions | Better Financial Management

## 📌 Project Overview

AI-Assisted Smart Banking and Financial Analytics Platform (SmartBank AI) is a web-based financial management prototype designed to make banking activities more convenient, organised, and security-aware.

The platform combines modern web technologies with AI-assisted development to demonstrate digital banking features, financial tracking, and fraud awareness in one place.

## 🎯 Project Objectives

- Simplify everyday financial management.
- Provide a centralised financial dashboard.
- Demonstrate secure user authentication workflows.
- Identify potentially suspicious UPI IDs through risk assessment.
- Help users track expenses and financial commitments.
- Improve awareness of digital payment scams.

## ✨ Key Features

### 1. User Authentication
- Login and registration interface.
- Email or phone number-based authentication.
- Demo OTP verification.

### 2. Smart Financial Dashboard
- Overview of financial activities.
- Financial information and transaction summaries.

### 3. Digital Money Transfer
- Simulated money transfer functionality.
- Transaction details and history.

### 4. AI-Assisted Fraud Detection
- UPI ID pattern-based risk assessment.
- Fraud awareness and alert interface.
- Scam detection support.

### 5. Expense Management
- Track and organise expenses.
- Monitor financial activities.

### 6. EMI and Bill Reminders
- Record EMI and bill payment details.
- Track upcoming payment dates.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend development |
| TypeScript | Frontend programming |
| HTML and CSS | Structure and styling |
| Python | Backend programming |
| FastAPI | Backend API development |
| MongoDB | Database |
| Vite | Frontend development server |
| VS Code | Development environment |

## 🏗️ System Architecture

The application follows a frontend-backend architecture.

**User → React Frontend → FastAPI Backend → MongoDB Database**

The frontend provides the user interface, the backend handles application logic and API requests, and MongoDB stores supported application records.

## ⚙️ Installation and Setup

### Prerequisites
- Python
- Node.js and npm
- MongoDB (if database connectivity is configured)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/shitalkumari-25/Ai-Assisted-smartbanking-and-financial-analytics-platform.git
```

### Step 2: Open the Project

```bash
cd Ai-Assisted-smartbanking-and-financial-analytics-platform
```

### Step 3: Install Backend Dependencies

Open the backend folder:

```bash
cd backend
```

Install dependencies using the available requirements file:

```bash
pip install -r requirements.txt
```

### Step 4: Start the Backend

```bash
python -m uvicorn main:app --reload
```

### Step 5: Install Frontend Dependencies

Open another terminal in the frontend folder (the folder containing `package.json`):

```bash
npm install
```

### Step 6: Run the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal.

*Note: Follow the actual folder structure and environment configuration of your downloaded project. The commands may need adjustment if your backend or frontend files are arranged differently.*

## 🔐 Important Project Limitations

- OTP verification is demonstrated in development/demo mode and does not represent real SMS or email delivery.
- Money transfers are simulated; no actual money is transferred.
- UPI risk assessment uses prototype-level checks and does not verify the real bank account holder or live UPI status.
- Fraud alerts and scam detection are educational prototype features, not guaranteed real-time fraud prevention.
- This project is not connected to a live banking system.

## 🚀 Future Scope

- Integration with authorised banking and payment APIs.
- Real email and SMS OTP verification.
- Advanced AI-based fraud detection.
- Real-time UPI verification.
- Automated EMI and bill notifications.
- Mobile application development.
- Enhanced financial analytics and reporting.

## 👩‍💻 Project Information

**Project Title:** AI-Assisted Smart Banking and Financial Analytics Platform

**Developed by:** Shital Kumari

**Enrollment Number:** 2503A520R2

**Domain:** Artificial Intelligence and Financial Technology

## 📄 Conclusion

SmartBank AI demonstrates how modern web technologies and AI-assisted development can be used to create a unified financial management platform. It provides a foundation for exploring smarter banking interfaces, financial tracking, and digital fraud awareness.

---

### SmartBank AI
**Smarter Banking, Better Financial Management.**
