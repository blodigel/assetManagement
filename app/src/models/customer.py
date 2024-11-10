from typing import Optional

from fastapi.datastructures import Address
from pydantic import BaseModel


class AddressModel(BaseModel):
    country: str
    city: str
    street_address: str
    postal_code: str


class CustomerModel(BaseModel):
    name: str
    contact_email: str
    contact_phone: str
    address: Optional[AddressModel] = None
    customer_id: str

