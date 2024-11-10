from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from ..database import get_database
from ..models.infrastructure import LocationType
from ..schemas.infrastructure import (InfrastructureCreate, InfrastructureInDB,
                                      InfrastructureUpdate)

router = APIRouter()

@router.post("/", response_model=InfrastructureInDB)
async def create_infrastructure(
    infrastructure: InfrastructureCreate,
    db=Depends(get_database)
):
    try:
        # Validate customer exists
        customer_id = ObjectId(infrastructure.customer_id)
        customer = await db.customers.find_one({"_id": customer_id})
        if not customer:
            raise HTTPException(
                status_code=404,
                detail=f"Customer with ID {infrastructure.customer_id} not found"
            )

        # Validate site_id for on-premise locations
        if infrastructure.type == LocationType.ON_PREMISE:
            if not infrastructure.site_id:
                raise HTTPException(
                    status_code=400,
                    detail="site_id is required for on-premise locations"
                )
            try:
                site_id = ObjectId(infrastructure.site_id)
                site = await db.sites.find_one({"_id": site_id})
                if not site:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Site with ID {infrastructure.site_id} not found"
                    )
                # Verify site belongs to the customer
                if site.get('customer_id') != infrastructure.customer_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Site does not belong to the specified customer"
                    )
            except InvalidId:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid site_id format: {infrastructure.site_id}"
                )

        infra_dict = infrastructure.model_dump()
        result = await db.infrastructure.insert_one(infra_dict)
        return {"id": str(result.inserted_id), **infra_dict}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid customer_id format: {infrastructure.customer_id}"
        )

@router.get("/", response_model=List[InfrastructureInDB])
async def get_infrastructure(
    customer_id: Optional[str] = None,
    site_id: Optional[str] = None,
    location_type: Optional[LocationType] = None,
    db=Depends(get_database)
):
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    if site_id:
        query["site_id"] = site_id
    if location_type:
        query["type"] = location_type

    infrastructure = await db.infrastructure.find(query).to_list(None)
    return [
        {
            "id": str(infra["_id"]), 
            **{k:v for k,v in infra.items() if k != "_id"}
        }
        for infra in infrastructure
    ]

@router.put("/{infrastructure_id}", response_model=InfrastructureInDB)
async def update_infrastructure(
    infrastructure_id: str,
    infrastructure: InfrastructureUpdate,
    db=Depends(get_database)
):
    try:
        # First get the existing infrastructure
        existing = await db.infrastructure.find_one({"_id": ObjectId(infrastructure_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Infrastructure location not found")

        update_data = {k: v for k, v in infrastructure.model_dump().items() if v is not None}

        # If updating site_id for on-premise location, validate it
        if ('type' in update_data and update_data['type'] == LocationType.ON_PREMISE) or \
           (existing['type'] == LocationType.ON_PREMISE):
            if 'site_id' in update_data:
                try:
                    site_id = ObjectId(update_data['site_id'])
                    site = await db.sites.find_one({"_id": site_id})
                    if not site:
                        raise HTTPException(
                            status_code=404,
                            detail=f"Site with ID {update_data['site_id']} not found"
                        )
                    # Verify site belongs to the customer
                    if site.get('customer_id') != existing['customer_id']:
                        raise HTTPException(
                            status_code=400,
                            detail="Site does not belong to the specified customer"
                        )
                except InvalidId:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid site_id format: {update_data['site_id']}"
                    )

        result = await db.infrastructure.update_one(
            {"_id": ObjectId(infrastructure_id)},
            {"$set": update_data}
        )
        
        updated = await db.infrastructure.find_one({"_id": ObjectId(infrastructure_id)})
        return {"id": str(updated["_id"]), **{k:v for k,v in updated.items() if k != "_id"}}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid infrastructure_id format: {infrastructure_id}"
        )

@router.delete("/{infrastructure_id}")
async def delete_infrastructure(infrastructure_id: str, db=Depends(get_database)):
    try:
        result = await db.infrastructure.delete_one({"_id": ObjectId(infrastructure_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Infrastructure location not found")
        return {"message": "Infrastructure location deleted successfully"}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid infrastructure_id format: {infrastructure_id}"
        )
