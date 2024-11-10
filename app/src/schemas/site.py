from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from ..models.site import AddressModel


class SiteBase(BaseModel):
    name: str
    address: Optional[AddressModel] = None
    customer_id: str
    added: datetime = datetime.now()
    modified: Optional[datetime] = None
    notes: Optional[str] = None
    is_primary: bool = False  # Add this field


class SiteCreate(SiteBase):
    """Schema for creating a new customer"""
    pass

class SiteUpdate(SiteBase):
    """Schema for updating an existing customer"""
    name: Optional[str] = None
    address: Optional[AddressModel] = None


class SiteInDB(SiteBase):
    """Schema for customer responses from the API"""
    id: str

    class Config:
        from_attributes = True
