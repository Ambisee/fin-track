import pydantic


# Pydantic models
class UserViewModel(pydantic.BaseModel):
    id: str
    email: str
    username: str
    allow_report: bool
    currency_name: str


class EntryModel(pydantic.BaseModel):
    amount: float
    is_positive: bool
    created_by: str
    date: str
    id: int
    note: str | None
    category: str
