from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from ..database import get_database
from ..schemas.site import SiteBase, SiteCreate, SiteInDB, SiteUpdate

router = APIRouter()

@router.post("/", response_model=SiteInDB)
async def create_site(site: SiteCreate, db=Depends(get_database)):
    # Verify customer
    try:
        customer_id = ObjectId(site.customer_id)
        customer = await db.customers.find_one({"_id": customer_id})
        if not customer:
            raise HTTPException(
                status_code=404,
                detail=f"Customer with ID {site.customer_id} not found"
            )

        # Check if this is the first site for the customer
        existing_sites = await db.sites.count_documents({"customer_id": site.customer_id})
        if existing_sites == 0:
            # If this is the first site, don't create it as it was already created with the customer
            raise HTTPException(
                status_code=400,
                detail="First site is automatically created with customer. Please edit the existing site instead."
            )

        # For additional sites, use the format "CustomerName - SiteName"
        site_dict = site.model_dump()
        combined_name = f"{customer['name']} - {site_dict['name']}"

        # Check if site with this name already exists
        existing_site = await db.sites.find_one({
            "name": combined_name,
            "customer_id": site.customer_id
        })
        if existing_site:
            raise HTTPException(
                status_code=400,
                detail=f"Site with name '{combined_name}' already exists for this customer"
            )

        site_dict["name"] = combined_name
        result = await db.sites.insert_one(site_dict)
        return {"id": str(result.inserted_id), **site_dict}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid customer_id format: {site.customer_id}"
        )

@router.get("/", response_model=List[SiteInDB])
async def get_sites(
    customer_id: Optional[str] = None,
    db=Depends(get_database)
):
    """
    Get all sites, optionally filtered by customer_id
    """
    query = {}
    if customer_id:  # Only add customer_id to query if it's provided
        try:
            query["customer_id"] = customer_id
        except InvalidId:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid customer_id format: {customer_id}"
            )

    sites = await db.sites.find(query).to_list(None)
    return [
        {
            "id": str(site["_id"]), 
            **{k:v for k,v in site.items() if k != "_id"}
        }
        for site in sites
    ]

@router.put("/{site_id}", response_model=SiteInDB)
async def update_site(site_id: str, site: SiteBase, db=Depends(get_database)):
    try:
        # Get the customer name
        customer_id = ObjectId(site.customer_id)
        customer = await db.customers.find_one({"_id": customer_id})
        if not customer:
            raise HTTPException(
                status_code=404,
                detail=f"Customer with ID {site.customer_id} not found"
            )

        # Update site with combined name
        site_dict = site.model_dump()
        combined_name = f"{customer['name']} - {site_dict['name']}"

        # Check if another site with this name exists (excluding current site)
        existing_site = await db.sites.find_one({
            "name": combined_name,
            "customer_id": site.customer_id,
            "_id": {"$ne": ObjectId(site_id)}
        })
        if existing_site:
            raise HTTPException(
                status_code=400,
                detail=f"Another site with name '{combined_name}' already exists for this customer"
            )

        site_dict["name"] = combined_name
        result = await db.sites.update_one(
            {"_id": ObjectId(site_id)},
            {"$set": site_dict}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Site not found")
        return {"id": site_id, **site_dict}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid ID format"
        )

@router.delete("/{site_id}")
async def delete_site(site_id: str, db=Depends(get_database)):
    try:
        # Check if this is the only site for the customer
        site = await db.sites.find_one({"_id": ObjectId(site_id)})
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")

        site_count = await db.sites.count_documents({"customer_id": site["customer_id"]})
        if site_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the only site for a customer. Delete the customer instead."
            )

        result = await db.sites.delete_one({"_id": ObjectId(site_id)})
        return {"message": "Site deleted successfully"}
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid site_id format: {site_id}"
        )