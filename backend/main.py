# pulling in the heavy lifters for the server and db
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import databases
import sqlalchemy

# hook this up to your local postgres (your server and password to it)
DATABASE_URL = "postgresql://postgres:TUTAJ_WPISZ_HASLO@localhost/kocia_baza"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

app = FastAPI()

# letting our react app talk to this server without browser security throwing a fit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# shaping the data we expect to get from the frontend
class SessionComplete(BaseModel):
    user_id: int
    duration_minutes: int
    earned_coins: int

# spinning up the database connection when the server starts
@app.on_event("startup")
async def startup():
    await database.connect()

# tearing it down nicely when the server stops
@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# fetching the user's current coin stash
@app.get("/user/{user_id}")
async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = :user_id"
    user = await database.fetch_one(query=query, values={"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user

# adding a finished session to history and making it rain coins
@app.post("/session/complete")
async def complete_session(session: SessionComplete):
    # save the session log
    query_session = """
        INSERT INTO sessions (user_id, mode, duration_minutes, earned_coins)
        VALUES (:user_id, 'work', :duration_minutes, :earned_coins)
    """
    await database.execute(query=query_session, values=session.dict())
    
    # bump up the user's bank account
    query_user = "UPDATE users SET coins = coins + :earned_coins WHERE id = :user_id"
    await database.execute(query=query_user, values={"earned_coins": session.earned_coins, "user_id": session.user_id})
    
    return {"status": "success"}