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
    amount_is_positive: bool
    created_at: str
    created_by: str
    date: str
    id: int
    note: str | None
    title: str | None
