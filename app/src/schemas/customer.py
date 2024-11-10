# schemas/customer.py
from typing import Optional

from pydantic import BaseModel

from ..models.customer import AddressModel


class CustomerBase(BaseModel):
    name: str
    contact_email: str
    contact_phone: str
    address: Optional[AddressModel] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[AddressModel] = None

class CustomerResponse(CustomerBase):
    id: str

    class Config:
        from_attributes = True
