# SmartBank AI — Phase 4

Phase 4 extends Phase 3 with email OTP authentication, password reset, recipient risk scoring and bill/EMI reminders. The existing Phase 2 UI layout and dashboard navigation are retained.

## Run
1. Extract this folder and open it in VS Code.
2. Start MongoDB.
3. Backend terminal: `cd backend`, create/activate `.venv`, run `python -m pip install -r requirements.txt`, copy `.env.example` to `.env`, then `python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`.
4. Frontend terminal: `cd frontend`, `npm install`, `npm run dev`; open the Vite URL.
5. API docs: http://127.0.0.1:8000/docs

## Email OTP setup
For development, `OTP_DEV_MODE=true` prints the 6-digit OTP in the backend terminal. For actual email delivery, set `OTP_DEV_MODE=false` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. OTP expires after 5 minutes; requests are throttled. SMS OTP is not activated because no SMS provider credentials were supplied.

## New features / API
- `POST /api/auth/otp/request` purposes: `register`, `login`, `reset`
- `POST /api/auth/register` and `/api/auth/login` require OTP
- `POST /api/auth/reset-password`
- `POST /api/fraud/check`: heuristic score, risk level, reasons and advice
- `GET/POST /api/reminders`, `PATCH/DELETE /api/reminders/{id}`

## Fraud detection limitations
The UPI check is an educational heuristic based on syntax, obvious test-risk words, beneficiary details and transfer amount. It cannot query NPCI, banks or a trusted UPI directory and cannot establish whether an account is genuine. A low score is not proof of safety. Verify recipient name and UPI ID in your payment app before sending.

## Reminder limitations
Reminders are saved in MongoDB and can be viewed/marked paid in API docs. This phase does not send push notifications or background scheduled messages.

## Security warning
This is a student demonstration, not a production banking system. Do not use real banking credentials, real money or sensitive personal data. Use HTTPS, strong secrets, production-grade OTP provider, rate limiting, audit logs, CSRF protections and independent security review before any deployment.
