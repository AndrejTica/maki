from typing import Annotated, Literal, Sequence, Union
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, except_, select
from fastapi.middleware.cors import CORSMiddleware

sqlite_url = f"sqlite:///datadb.db"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


class Data(SQLModel, table=True):
    # name: Literal["temp", "co2"] = Field(index=True)
    id: int = Field(default=None, primary_key=True)
    value: float = Field(default=None, index=True)
    time: str | None = Field(default=None, index=True)


def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield
    

SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI(lifespan=lifespan)

origins = [
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8080/data",
    "http://127.0.0.1:8080/data/all",
    "http://127.0.0.1:9000",
    "http://127.0.0.1:9000/data",
    "http://127.0.0.1:9000/data/all",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_index():
    return "Hello World"

@app.post("/data/")
def create_data(data: Data, session: SessionDep) -> Data:
    data.time = datetime.now().strftime("%H:%M:%S")
    session.add(data)
    session.commit()
    session.refresh(data)
    return data

@app.get("/data/all")
def read_data_all(session: SessionDep) -> Sequence[Data]:
    data = session.exec(select(Data)).all()
    return data 

@app.get("/data/")
def read_data(session: SessionDep) -> Data | None:
    try:
        data = session.exec(select(Data)).all()[-1]
    except IndexError:
        print("No data!")
        return None
    return data 

@app.delete("/data/all")
def delete_all_data(session: SessionDep) -> None:
    for x in session.exec(select(Data)).all():
        statement = select(Data).where(Data.id == x.id)
        results = session.exec(statement)
        data = results.one()
        print(f"Data: {data} will be deleted")
        session.delete(data)
    session.commit()
