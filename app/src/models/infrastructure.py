from enum import Enum

from pydantic import BaseModel


class LocationType(str, Enum):
    AZURE = "azure"
    AWS = "aws"
    ON_PREMISE = "on_premise"
    DATACENTER = "datacenter"

class AzureConfig(BaseModel):
    subscription_id: str
    resource_group: str
    region: str

class AwsConfig(BaseModel):
    region: str
    vpc_id: str

class DatacenterConfig(BaseModel):
    name: str

class OnPremiseConfig(BaseModel):
    location: str

class InfrastructureLocation(BaseModel):
    name: str
    type: LocationType
    customer_id: str
    description: str | None = None
    config: AzureConfig | AwsConfig | DatacenterConfig | OnPremiseConfig
    is_active: bool = True
