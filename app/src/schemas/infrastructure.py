from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel

from ..models.infrastructure import (AwsConfig, AzureConfig, DatacenterConfig,
                                     LocationType, OnPremiseConfig)


class InfrastructureBase(BaseModel):
    name: str
    type: LocationType
    customer_id: str
    description: Optional[str] = None
    config: Union[AzureConfig, AwsConfig, DatacenterConfig, OnPremiseConfig]
    is_active: bool = True
    site_id: Optional[str] = None  # Will be required for ON_PREMISE type

    # Custom validator to ensure site_id is provided for ON_PREMISE
    def validate_site_id(self):
        if self.type == LocationType.ON_PREMISE and not self.site_id:
            raise ValueError("site_id is required for on-premise locations")
        return self

class InfrastructureCreate(InfrastructureBase):
    """Schema for creating a new infrastructure location"""
    pass

class InfrastructureUpdate(BaseModel):
    """Schema for updating an existing infrastructure location"""
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Union[AzureConfig, AwsConfig, DatacenterConfig, OnPremiseConfig]] = None
    is_active: Optional[bool] = None
    site_id: Optional[str] = None

class InfrastructureInDB(InfrastructureBase):
    """Schema for infrastructure location responses from the API"""
    id: str

    class Config:
        from_attributes = True
