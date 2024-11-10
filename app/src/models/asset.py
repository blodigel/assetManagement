# app/models/asset.py
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class AssetType(str, Enum):
    HOST = "host"
    SWITCH = "switch"
    FIREWALL = "firewall"
    VM = "vm"

class VmSpecs(BaseModel):
    cpu_cores: int
    ram_gb: int
    os: str
    os_version: str
    infrastructure_location_id: str    # Reference to where it's hosted
    vm_id: str | None = None          # ID in the cloud platform (if applicable)

class NetworkDeviceSpecs(BaseModel):
    manufacturer: str
    model: str

class HostSpecs(BaseModel):
    manufacturer: str
    cpu_cores: int
    ram_gb: int
