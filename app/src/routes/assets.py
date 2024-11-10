from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from ..database import get_database
from ..models.asset import AssetType
from ..schemas.asset import AssetBase, AssetCreate, AssetInDB

router = APIRouter(prefix="/assets")

@router.get("", response_model=List[AssetInDB])
async def get_assets(
    customer_id: Optional[str] = None,
    asset_type: Optional[AssetType] = None,
    db=Depends(get_database)
):
    """Get assets with optional filtering"""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    if asset_type:
        query["asset_type"] = asset_type.value
    
    print(f"Query: {query}")  # Debug print
    
    assets = await db.assets.find(query).to_list(None)
    return [{"id": str(asset["_id"]), **{k:v for k,v in asset.items() if k != "_id"}} 
            for asset in assets]

@router.get("/{asset_id}", response_model=AssetInDB)
async def get_asset(asset_id: str, db=Depends(get_database)):
    """Get a single asset by ID"""
    try:
        asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"id": str(asset["_id"]), **{k:v for k,v in asset.items() if k != "_id"}}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid asset ID format")

@router.post("", response_model=AssetInDB)
async def create_asset(asset: AssetCreate, db=Depends(get_database)):
    """Create a new asset"""
    try:
        # Verify customer exists
        customer = await db.customers.find_one({"_id": ObjectId(asset.customer_id)})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # For physical hardware, verify site belongs to customer
        if asset.site_id:
            site = await db.sites.find_one({"_id": ObjectId(asset.site_id)})
            if not site or site["customer_id"] != asset.customer_id:
                raise HTTPException(status_code=404, detail="Site not found or doesn't belong to customer")

        # Create asset
        asset_dict = asset.model_dump()
        result = await db.assets.insert_one(asset_dict)
        return {"id": str(result.inserted_id), **asset_dict}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@router.put("/{asset_id}", response_model=AssetInDB)
async def update_asset(asset_id: str, asset: AssetBase, db=Depends(get_database)):
    """Update an asset"""
    try:
        result = await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": asset.model_dump()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        updated_asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
        return {"id": asset_id, **{k:v for k,v in updated_asset.items() if k != "_id"}}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid asset ID format")

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, db=Depends(get_database)):
    """Delete an asset"""
    try:
        result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"message": "Asset deleted successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid asset ID format")

@router.get("/site/{site_id}", response_model=List[AssetInDB])
async def get_assets_by_site(site_id: str, db=Depends(get_database)):
    """Get all assets for a specific site"""
    try:
        assets = await db.assets.find({"site_id": site_id}).to_list(None)
        return [{
            "id": str(asset["_id"]), 
            **{k:v for k,v in asset.items() if k != "_id"}
        } for asset in assets]
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid site ID format")
