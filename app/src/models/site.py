
import datetime
from typing import Optional

from pydantic import BaseModel


class AddressModel(BaseModel):
    country: str  
    city: str
    street_address: str
    postal_code: str

class SiteModel(BaseModel):
    name: str
    address: Optional[AddressModel] = None
    customer_id: str

