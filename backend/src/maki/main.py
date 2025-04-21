from typing import Annotated, Literal, Optional, Sequence, TypeVar, Union, dataclass_transform
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
    "http://127.0.0.1:8000",
    "http://127.0.0.1:9000",
    "http://64.226.123.247:9000",
    "http://64.227.114.35:9000",
    "http://localhost:9000",
    "http://localhost:8080",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calc_average(data: Sequence[Data]) -> float:
    data_len: int = len(data)
    data_acc: float = 0.0
    for value in data:
        data_acc = data_acc + float(value.value)
    final_average = data_acc / data_len
    return final_average 

def commit_and_add_time(session: SessionDep, data: Data) -> None:
    data.time = datetime.now().strftime("%H:%M:%S")
    data.day = datetime.now().day
    data.month = datetime.now().month
    data.year = datetime.now().year
    session.add(data)
    session.commit()
    session.refresh(data)

def get_data(session: Session, data_type: Literal["temp", "co2"] | None, date: str | None) -> Sequence[Data]:
    if not data_type and not date:
        statement = (
            select(Data)
        )
        return session.exec(statement).all()
    elif data_type and not date:
        statement = (
            select(Data)
            .where(Data.type == data_type)
        )
        return session.exec(statement).all()
    elif data_type and date:
        statement = (
            select(Data)
            .where(Data.type == data_type)
            .where(Data.year == int(date.split("-")[0]))
            .where(Data.month == int(date.split("-")[1]))
            .where(Data.day == int(date.split("-")[2]))
        )
        return session.exec(statement).all()
    elif not data_type and date:
        statement = (
            select(Data)
            .where(Data.year == int(date.split("-")[0]))
            .where(Data.month == int(date.split("-")[1]))
            .where(Data.day == int(date.split("-")[2]))
        )
        return session.exec(statement).all()    
    raise RuntimeError("this should not happen")


@app.get("/")
async def read_index():
    return "Hello World"

@app.post("/data/")
def create_data(data: Data, session: SessionDep) -> Data:
    commit_and_add_time(session, data)
    return data 

@app.get("/data/{data_type}/{date}/{operator}")
@app.get("/data/{data_type}/{date}")
def data(data_type: Literal["temp", "co2"], 
             session: SessionDep, 
             date: str, 
             operator: Literal["all", "average"] | None = None) -> Sequence[Data] | Data | float | None:
    try:
        data: Sequence[Data] = get_data(session, data_type, date)
    except IndexError:
        print(f"No data for the date {date}!")
        return None
    if operator == "average":
        return calc_average(data)
    return data if operator == "all" else data[-1]

# @app.delete("/data/{data_type}/{date}/")
# @app.delete("/data/")
# def delete_all_data(session: Session,
#              data_type: Literal["temp", "co2"] | None = None, 
#              date: str | None = None) -> None:
#     """Delete all data of the specified type ('temp' or 'co2')."""
#     statement = select(Data).where(Data.type == data_type if data_type)
#     results = session.exec(statement).all()
#     for data in results:
#         print(f"Data: {data} will be deleted")
#         session.delete(data)
#     session.commit()

@app.delete("/data/{data_type}/{date}")
def delete_data(data_type: Literal["temp", "co2"], date: str, session: SessionDep) -> None:
    """Delete specified data of the specified type ('temp' or 'co2'), for a specific date."""
    results: Sequence[Data] = get_data(session, data_type, date)
    for data in results:
        print(f"Data: {data} will be deleted")
        session.delete(data)
    session.commit()
