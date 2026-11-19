import os, re, hmac, hashlib, secrets, time
from datetime import datetime, date
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient, DESCENDING
from pymongo.errors import PyMongoError
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://127.0.0.1:27017')
DB_NAME = os.getenv('DB_NAME', 'smartbank_ai')
JWT_SECRET = os.getenv('JWT_SECRET', 'change-this-development-secret')
TOKEN_TTL = int(os.getenv('TOKEN_TTL_SECONDS', '86400'))
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=4000)
db = client[DB_NAME]
users = db.users; transactions = db.transactions; expenses = db.expenses; goals = db.goals; alerts = db.fraud_alerts; otp_challenges = db.otp_challenges; reminders = db.reminders
app = FastAPI(title='SmartBank AI API', version='3.0.0')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(','), allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.on_event('startup')
def indexes():
    try:
        client.admin.command('ping')
        users.create_index('email', unique=True); users.create_index('phone', unique=True)
        transactions.create_index([('user_id',1),('created_at',DESCENDING)])
        expenses.create_index([('user_id',1),('created_at',DESCENDING)])
        goals.create_index('user_id')
    except Exception as e: print('MongoDB is not available yet:', e)

def hash_password(p: str, salt: Optional[str]=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', p.encode(), bytes.fromhex(salt), 310000).hex()
    return f'{salt}${digest}'
def verify_password(p, stored):
    try:
        salt, digest = stored.split('$',1)
        return hmac.compare_digest(hash_password(p,salt).split('$',1)[1], digest)
    except Exception: return False
def b64(data: bytes):
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()
def issue_token(uid):
    payload=f'{uid}.{int(time.time())+TOKEN_TTL}'
    sig=hmac.new(JWT_SECRET.encode(),payload.encode(),hashlib.sha256).digest()
    return b64(payload.encode())+'.'+b64(sig)
def current_user(authorization: Optional[str]=Header(None)):
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'Please log in again.')
    import base64
    token=authorization[7:]
    try:
        p,s=token.split('.',1); payload=base64.urlsafe_b64decode(p+'='*((4-len(p)%4)%4)).decode()
        expected=b64(hmac.new(JWT_SECRET.encode(),payload.encode(),hashlib.sha256).digest())
        if not hmac.compare_digest(s,expected): raise ValueError()
        uid,exp=payload.rsplit('.',1)
        if int(exp)<time.time(): raise ValueError()
        user=users.find_one({'_id':ObjectId(uid)})
        if not user: raise ValueError()
        return user
    except Exception: raise HTTPException(401,'Session expired. Please log in again.')
class RegisterIn(BaseModel):
    name:str=Field(min_length=2,max_length=100); email:EmailStr; phone:str=Field(pattern=r'^[6-9]\d{9}$'); dob:str; accountType:str='Savings'; password:str=Field(min_length=8,max_length=128); otp:str=Field(min_length=6,max_length=6)
class LoginIn(BaseModel): email:EmailStr; password:str; otp:str=Field(min_length=6,max_length=6)
class OtpRequest(BaseModel): email:EmailStr; purpose:str; phone:Optional[str]=None
class ResetIn(BaseModel): email:EmailStr; otp:str=Field(min_length=6,max_length=6); new_password:str=Field(min_length=8,max_length=128)
class ReminderIn(BaseModel): title:str=Field(min_length=2,max_length=120); kind:str='Bill'; amount:float=Field(default=0,ge=0,le=10000000); due_date:str; note:str='' 
class TransferIn(BaseModel): name:str; upi:str; amount:float=Field(gt=0,le=1000000); note:str=''
class ExpenseIn(BaseModel): title:str; category:str='Others'; amount:float=Field(gt=0,le=1000000); date:str
class GoalIn(BaseModel): name:str; target:float=Field(gt=0); due:str
class ContributionIn(BaseModel): amount:float=Field(gt=0)
def serialize(doc):
    doc['id']=str(doc.pop('_id')); doc.pop('password_hash',None); doc.pop('user_id',None); return doc

def send_otp_email(email: str, otp: str):
    """SMTP delivery when configured; development mode prints OTP to backend console."""
    import smtplib
    from email.message import EmailMessage
    host=os.getenv('SMTP_HOST'); user=os.getenv('SMTP_USER'); password=os.getenv('SMTP_PASSWORD')
    if host and user and password:
        msg=EmailMessage(); msg['Subject']='Your SmartBank AI verification code'; msg['From']=os.getenv('SMTP_FROM',user); msg['To']=email
        msg.set_content(f'Your SmartBank AI OTP is {otp}. It expires in 5 minutes. Never share this code.')
        with smtplib.SMTP(host,int(os.getenv('SMTP_PORT','587')),timeout=10) as server:
            server.starttls(); server.login(user,password); server.send_message(msg)
    elif os.getenv('OTP_DEV_MODE','true').lower()=='true':
        print(f'[SMARTBANK DEV OTP] {email}: {otp}')
    else:
        raise HTTPException(503,'Email OTP is not configured. Add SMTP settings to backend/.env.')

def consume_otp(email: str, purpose: str, otp: str, phone: Optional[str]=None):
    query={'email':email.lower(),'purpose':purpose,'otp_hash':hashlib.sha256(otp.encode()).hexdigest(),'expires_at':{'$gt':datetime.utcnow()},'used':False}
    if phone: query['phone']=phone
    challenge=otp_challenges.find_one(query)
    if not challenge: raise HTTPException(400,'OTP is invalid or expired. Request a new code.')
    otp_challenges.update_one({'_id':challenge['_id']},{'$set':{'used':True}})

@app.post('/api/auth/otp/request')
def request_otp(data:OtpRequest):
    purpose=data.purpose.lower()
    if purpose not in ('register','login','reset'): raise HTTPException(400,'Unsupported OTP purpose.')
    email=data.email.lower()
    user=users.find_one({'email':email})
    if purpose in ('login','reset') and not user: raise HTTPException(404,'No account found for this email.')
    if purpose=='register':
        if not data.phone or not re.fullmatch(r'[6-9]\d{9}',data.phone): raise HTTPException(400,'Enter a valid 10-digit Indian mobile number.')
        if users.find_one({'$or':[{'email':email},{'phone':data.phone}]}): raise HTTPException(409,'An account with this email or phone already exists.')
    recent=otp_challenges.count_documents({'email':email,'purpose':purpose,'created_at':{'$gt':datetime.utcnow()-__import__('datetime').timedelta(minutes=1)}})
    if recent>=3: raise HTTPException(429,'Too many OTP requests. Wait one minute.')
    otp=f'{secrets.randbelow(1000000):06d}'
    otp_challenges.insert_one({'email':email,'phone':data.phone,'purpose':purpose,'otp_hash':hashlib.sha256(otp.encode()).hexdigest(),'created_at':datetime.utcnow(),'expires_at':datetime.utcnow()+__import__('datetime').timedelta(minutes=5),'used':False})
    try: send_otp_email(email,otp)
    except Exception:
        otp_challenges.update_one({'email':email,'purpose':purpose,'otp_hash':hashlib.sha256(otp.encode()).hexdigest()},{'$set':{'used':True}})
        raise
    return {'message':'Verification code sent to your email. It expires in 5 minutes.','delivery':'email'}

@app.get('/api/health')
def health():
    try: client.admin.command('ping'); return {'status':'ok','database':'connected'}
    except Exception: raise HTTPException(503,'MongoDB is not connected. Start MongoDB and check MONGO_URI.')
@app.post('/api/auth/register')
def register(data:RegisterIn):
    consume_otp(data.email,'register',data.otp,data.phone)
    try:
        if users.find_one({'$or':[{'email':data.email.lower()},{'phone':data.phone}]}): raise HTTPException(409,'An account with this email or phone already exists.')
        user={'name':data.name.strip(),'email':data.email.lower(),'phone':data.phone,'dob':data.dob,'account_type':data.accountType,'password_hash':hash_password(data.password),'balance':84520.0,'created_at':datetime.utcnow()}
        result=users.insert_one(user); user['_id']=result.inserted_id
        return {'message':'Registration successful.','token':issue_token(str(result.inserted_id)),'user':{'name':user['name'],'email':user['email'],'phone':user['phone']}}
    except HTTPException: raise
    except PyMongoError: raise HTTPException(503,'Database unavailable. Check your MongoDB connection.')
@app.post('/api/auth/login')
def login(data:LoginIn):
    try: user=users.find_one({'email':data.email.lower()})
    except PyMongoError: raise HTTPException(503,'Database unavailable. Check your MongoDB connection.')
    if not user or not verify_password(data.password,user['password_hash']): raise HTTPException(401,'Email or password is incorrect.')
    consume_otp(data.email,'login',data.otp)
    return {'message':'Login successful.','token':issue_token(str(user['_id'])),'user':{'name':user['name'],'email':user['email'],'phone':user['phone']}}
@app.post('/api/auth/reset-password')
def reset_password(data:ResetIn):
    consume_otp(data.email,'reset',data.otp)
    users.update_one({'email':data.email.lower()},{'$set':{'password_hash':hash_password(data.new_password),'password_changed_at':datetime.utcnow()}})
    return {'message':'Password reset successfully. Please log in with your new password.'}

@app.get('/api/auth/me')
def me(user=Depends(current_user)): return {'name':user['name'],'email':user['email'],'phone':user['phone'],'accountType':user.get('account_type','Savings')}
@app.get('/api/dashboard')
def dashboard(user=Depends(current_user)):
    uid=str(user['_id']); tx=list(transactions.find({'user_id':uid}).sort('created_at',-1).limit(50)); ex=list(expenses.find({'user_id':uid}).sort('created_at',-1).limit(100)); gs=list(goals.find({'user_id':uid}))
    return {'balance':user.get('balance',84520.0),'transactions':[serialize(x) for x in tx],'expenses':[serialize(x) for x in ex],'goals':[serialize(x) for x in gs]}
@app.get('/api/transactions')
def get_transactions(user=Depends(current_user)):
    return [serialize(x) for x in transactions.find({'user_id':str(user['_id'])}).sort('created_at',-1).limit(500)]
@app.post('/api/transfer')
def transfer(data:TransferIn,user=Depends(current_user)):
    upi=data.upi.strip().lower()
    if not re.fullmatch(r'[a-z0-9._-]{2,}@[a-z0-9]{2,}',upi): raise HTTPException(400,'Enter a valid UPI ID format.')
    assessment=assess_upi(upi,data.amount,data.name)
    risk=assessment['risk']
    if risk=='high':
        alerts.insert_one({'user_id':str(user['_id']),'title':'High-risk UPI ID detected','detail':'; '.join(assessment['reasons']) or f'Transfer to {upi} flagged.','level':'High','risk_score':assessment['risk_score'],'created_at':datetime.utcnow()})
        raise HTTPException(400,'High-risk demo assessment: '+assessment['recommendation'])
    if data.amount>float(user.get('balance',84520)): raise HTTPException(400,'Insufficient demo balance.')
    users.update_one({'_id':user['_id']},{'$inc':{'balance':-data.amount}})
    doc={'user_id':str(user['_id']),'title':f'Transfer to {data.name}','category':'Transfer','date':date.today().isoformat(),'amount':data.amount,'type':'Debit','status':'Completed','upi':upi,'note':data.note,'created_at':datetime.utcnow()}
    transactions.insert_one(doc); return {'message':'Demo transfer completed. No real money moved.','transaction':serialize(doc)}
@app.post('/api/expenses')
def add_expense(data:ExpenseIn,user=Depends(current_user)):
    doc={'user_id':str(user['_id']),'title':data.title,'category':data.category,'amount':data.amount,'date':data.date,'created_at':datetime.utcnow()}; expenses.insert_one(doc)
    transactions.insert_one({'user_id':str(user['_id']),'title':data.title,'category':data.category,'date':data.date,'amount':data.amount,'type':'Debit','status':'Recorded','created_at':datetime.utcnow()})
    return serialize(doc)
@app.delete('/api/expenses/{expense_id}')
def delete_expense(expense_id:str,user=Depends(current_user)):
    try: oid=ObjectId(expense_id)
    except Exception: raise HTTPException(404,'Expense not found.')
    result=expenses.delete_one({'_id':oid,'user_id':str(user['_id'])})
    if not result.deleted_count: raise HTTPException(404,'Expense not found.')
    return {'message':'Expense deleted.'}
@app.get('/api/expenses')
def get_expenses(user=Depends(current_user)): return [serialize(x) for x in expenses.find({'user_id':str(user['_id'])}).sort('created_at',-1)]
@app.post('/api/goals')
def add_goal(data:GoalIn,user=Depends(current_user)):
    doc={'user_id':str(user['_id']),'name':data.name,'target':data.target,'saved':0,'due':data.due,'created_at':datetime.utcnow()}; goals.insert_one(doc); return serialize(doc)
@app.delete('/api/goals/{goal_id}')
def delete_goal(goal_id:str,user=Depends(current_user)):
    try: oid=ObjectId(goal_id)
    except Exception: raise HTTPException(404,'Goal not found.')
    result=goals.delete_one({'_id':oid,'user_id':str(user['_id'])})
    if not result.deleted_count: raise HTTPException(404,'Goal not found.')
    return {'message':'Goal deleted.'}
@app.get('/api/goals')
def get_goals(user=Depends(current_user)): return [serialize(x) for x in goals.find({'user_id':str(user['_id'])})]
@app.post('/api/goals/{goal_id}/contribute')
def contribute(goal_id:str,data:ContributionIn,user=Depends(current_user)):
    try: oid=ObjectId(goal_id)
    except Exception: raise HTTPException(404,'Goal not found.')
    result=goals.update_one({'_id':oid,'user_id':str(user['_id'])},{'$min':{'saved':float('inf')}}) if False else goals.update_one({'_id':oid,'user_id':str(user['_id'])},{'$inc':{'saved':data.amount}})
    if not result.matched_count: raise HTTPException(404,'Goal not found.')
    return serialize(goals.find_one({'_id':oid}))
@app.get('/api/fraud/alerts')
def fraud_alerts(user=Depends(current_user)): return [serialize(x) for x in alerts.find({'user_id':str(user['_id'])}).sort('created_at',-1).limit(100)]
def assess_upi(upi: str, amount: float=0, beneficiary: str=''):
    normalized=upi.strip().lower(); reasons=[]; score=0
    if not re.fullmatch(r'[a-z0-9._-]{2,}@[a-z0-9]{2,}',normalized): score+=60; reasons.append('UPI ID format is invalid')
    if any(word in normalized for word in ('scam','fraud','fake','unknown','test-risk')): score+=70; reasons.append('UPI ID contains a demo high-risk marker')
    if len(normalized)>50: score+=15; reasons.append('Unusually long UPI handle')
    if amount>=50000: score+=20; reasons.append('High-value transfer; verify recipient carefully')
    if not beneficiary.strip(): score+=10; reasons.append('Beneficiary name is missing')
    score=min(score,100); level='High' if score>=60 else ('Medium' if score>=20 else 'Low')
    return {'upi':normalized,'risk_score':score,'risk':level.lower(),'reasons':reasons,'recommendation':'Do not proceed until you independently verify the recipient.' if level=='High' else ('Verify the recipient name and UPI ID before proceeding.' if level=='Medium' else 'The format appears plausible only; this does not verify the account holder.')}

@app.post('/api/fraud/check')
def fraud_check(payload:dict,user=Depends(current_user)):
    result=assess_upi(str(payload.get('upi','')),float(payload.get('amount',0) or 0),str(payload.get('name','')))
    if result['risk'] in ('high','medium'):
        alerts.insert_one({'user_id':str(user['_id']),'title':f"{result['risk'].title()} risk UPI assessment",'detail':'; '.join(result['reasons']) or 'Review recipient details.','level':result['risk'].title(),'upi':result['upi'],'risk_score':result['risk_score'],'created_at':datetime.utcnow()})
    return result

@app.get('/api/reminders')
def get_reminders(user=Depends(current_user)):
    return [serialize(x) for x in reminders.find({'user_id':str(user['_id'])}).sort('due_date',1)]

@app.post('/api/reminders')
def add_reminder(data:ReminderIn,user=Depends(current_user)):
    doc={'user_id':str(user['_id']),'title':data.title,'kind':data.kind,'amount':data.amount,'due_date':data.due_date,'note':data.note,'paid':False,'created_at':datetime.utcnow()}
    result=reminders.insert_one(doc); doc['_id']=result.inserted_id; return serialize(doc)

@app.patch('/api/reminders/{reminder_id}')
def update_reminder(reminder_id:str,payload:dict,user=Depends(current_user)):
    try: oid=ObjectId(reminder_id)
    except Exception: raise HTTPException(404,'Reminder not found.')
    update={}
    if 'paid' in payload: update['paid']=bool(payload['paid'])
    if 'title' in payload and str(payload['title']).strip(): update['title']=str(payload['title']).strip()[:120]
    result=reminders.update_one({'_id':oid,'user_id':str(user['_id'])},{'$set':update})
    if not result.matched_count: raise HTTPException(404,'Reminder not found.')
    return serialize(reminders.find_one({'_id':oid}))

@app.delete('/api/reminders/{reminder_id}')
def delete_reminder(reminder_id:str,user=Depends(current_user)):
    try: oid=ObjectId(reminder_id)
    except Exception: raise HTTPException(404,'Reminder not found.')
    result=reminders.delete_one({'_id':oid,'user_id':str(user['_id'])})
    if not result.deleted_count: raise HTTPException(404,'Reminder not found.')
    return {'message':'Reminder deleted.'}
