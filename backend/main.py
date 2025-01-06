from typing import Annotated, Literal, Sequence, TypeVar, Union, dataclass_transform
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.middleware.cors import CORSMiddleware

sqlite_url = f"sqlite:///datadb.db"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


class Data(SQLModel, table=True):
    __tablename__ = "Data"
    id: int = Field(default=None, primary_key=True)
    type: str = Field(default=None, index=True)
    value: float = Field(default=None, index=True)
    time: str | None = Field(default=None, index=True)
    day: int | None = Field(default=None, index=True)
    month: int | None = Field(default=None, index=True)
    year: int | None = Field(default=None, index=True)

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

# def calc_average(data_type: Literal["temp", "co2"], session: SessionDep) -> float:
#     statement = select(Data).where(Data.type == data_type)
#     return session.exec(statement).all()

def commit_and_add_time(session: SessionDep, data: Data) -> None:
    data.time = datetime.now().strftime("%H:%M:%S")
    data.day = datetime.now().day
    data.month = datetime.now().month
    data.year = datetime.now().year
    session.add(data)
    session.commit()
    session.refresh(data)

@app.get("/")
async def read_index():
    return "Hello World"

@app.post("/data/")
def create_data(data: Data, session: SessionDep) -> Data:
    commit_and_add_time(session, data)
    return data 

@app.get("/data/{data_type}/{date}/all")
def read_data_all(data_type: Literal["temp", "co2"], date: str, session: SessionDep) -> Sequence[Data]:
    day: int = int(date.split("-")[2])
    month: int = int(date.split("-")[1])
    year: int = int(date.split("-")[0])
    statement = (
        select(Data)
        .where(Data.type == data_type)
        .where(Data.year == year)
        .where(Data.month == month)
        .where(Data.day == day)
    )
    return session.exec(statement).all()

@app.get("/data/{data_type}/{date}")
def read_data(data_type: Literal["temp", "co2"], date: str, session: SessionDep) -> Data | None:
    try:
        day: int = int(date.split("-")[2])
        month: int = int(date.split("-")[1])
        year: int = int(date.split("-")[0])
        statement = (
            select(Data)
            .where(Data.type == data_type)
            .where(Data.year == year)
            .where(Data.month == month)
            .where(Data.day == day)
        )
        data = session.exec(statement).all()[-1]
    except IndexError:
        print("No data!")
        return None
    return data 

@app.delete("/data/{data_type}/all")
def delete_all_data(data_type: Literal["temp", "co2"], session: SessionDep) -> None:
    """Delete all data of the specified type ('temp' or 'co2')."""
    statement = select(Data).where(Data.type == data_type)
    results = session.exec(statement).all()
    for data in results:
        print(f"Data: {data} will be deleted")
        session.delete(data)
    session.commit()
