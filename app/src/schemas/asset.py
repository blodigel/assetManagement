from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, model_validator

from ..models.asset import AssetType, HostSpecs, NetworkDeviceSpecs, VmSpecs


class AssetBase(BaseModel):
    hostname: str
    ip_address: str
    asset_type: AssetType
    customer_id: str
    notes: Optional[str] = None
    site_id: Optional[str] = None
    specs: Union[VmSpecs, NetworkDeviceSpecs, HostSpecs]
    added: datetime = datetime.now()
    modified: Optional[datetime] = None

    @model_validator(mode='after')
    def validate_location(self):
        # VMs need infrastructure_location_id in specs
        if self.asset_type == AssetType.VM:
            if not hasattr(self.specs, 'infrastructure_location_id'):
                raise ValueError("VM assets require infrastructure_location_id in specs")
            
        # Physical hardware needs site_id
        if self.asset_type in [AssetType.SWITCH, AssetType.FIREWALL, AssetType.HOST]:
            if not self.site_id:
                raise ValueError(f"{self.asset_type} assets require site_id")

        return self

class AssetCreate(AssetBase):
    pass

class AssetInDB(AssetBase):
    id: str
