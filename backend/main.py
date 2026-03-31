from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import databases
import sqlalchemy


DATABASE_URL = "postgresql://postgres:45179MrNo@localhost/pomodoro_kotki"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionComplete(BaseModel):
    user_id: int
    duration_minutes: int
    earned_coins: int

class BuyItem(BaseModel):
    user_id: int
    item_name: str
    price: int

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/user/{user_id}")
async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = :user_id"
    user = await database.fetch_one(query=query, values={"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/session/complete")
async def complete_session(session: SessionComplete):
    query_session = """
        INSERT INTO sessions (user_id, mode, duration_minutes, earned_coins)
        VALUES (:user_id, 'work', :duration_minutes, :earned_coins)
    """
    await database.execute(query=query_session, values=session.dict())
    
    query_user = "UPDATE users SET coins = coins + :earned_coins WHERE id = :user_id"
    await database.execute(query=query_user, values={"earned_coins": session.earned_coins, "user_id": session.user_id})
    return {"status": "success"}

@app.post("/shop/buy")
async def buy_item(data: BuyItem):
    user_query = "SELECT coins FROM users WHERE id = :user_id"
    user = await database.fetch_one(query=user_query, values={"user_id": data.user_id})
    
    if user['coins'] < data.price:
        raise HTTPException(status_code=400, detail="Za mało monet!")
        
    update_coins = "UPDATE users SET coins = coins - :price WHERE id = :user_id"
    await database.execute(query=update_coins, values={"price": data.price, "user_id": data.user_id})
    
    insert_item = "INSERT INTO inventory (user_id, item_name) VALUES (:user_id, :item_name)"
    await database.execute(query=insert_item, values={"user_id": data.user_id, "item_name": data.item_name})
    
    return {"status": "success", "remaining_coins": user['coins'] - data.price}