from datetime import datetime
from typing import List

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from ..database import get_database
from ..schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate

router = APIRouter()

@router.post("/", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db=Depends(get_database)):
    try:
        # Check if customer already exists with same name and email
        existing_customer = await db.customers.find_one({
            "name": customer.name,
            "contact_email": customer.contact_email
        })

        if existing_customer:
            # Return existing customer if found
            return {
                "id": str(existing_customer["_id"]),
                **{k:v for k,v in existing_customer.items() if k != "_id"}
            }

        # Create new customer if no match found
        customer_dict = customer.model_dump()
        customer_result = await db.customers.insert_one(customer_dict)
        customer_id = str(customer_result.inserted_id)

        # If address exists, create initial site
        if customer.address:
            site_name = f"{customer.name} - Main Site"
            site_data = {
                "name": site_name,
                "address": customer.address.model_dump(),
                "customer_id": customer_id,
                "added": datetime.now(),
                "is_primary": True,
            }
            await db.sites.insert_one(site_data)

        return {
            "id": customer_id,
            **customer_dict
        }
    except Exception as e:
        # If there's an error, try to rollback by deleting the customer
        if 'customer_id' in locals():
            await db.customers.delete_one({"_id": ObjectId(customer_id)})
            await db.sites.delete_many({"customer_id": customer_id})
        raise HTTPException(
            status_code=500,
            detail=f"Error creating customer: {str(e)}"
        )

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(db=Depends(get_database)):
    customers = await db.customers.find().to_list(None)
    return [{"id": str(customer["_id"]), **{k:v for k,v in customer.items() if k != "_id"}} 
            for customer in customers]

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db=Depends(get_database)):
    try:
        customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"id": str(customer["_id"]), **{k:v for k,v in customer.items() if k != "_id"}}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid customer ID format")

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: str, customer: CustomerUpdate, db=Depends(get_database)):
    try:
        # Check if another customer already exists with the same name and email
        if customer.name is not None and customer.contact_email is not None:
            existing_customer = await db.customers.find_one({
                "_id": {"$ne": ObjectId(customer_id)},
                "name": customer.name,
                "contact_email": customer.contact_email
            })
            if existing_customer:
                raise HTTPException(
                    status_code=400,
                    detail="Another customer with the same name and email already exists"
                )

        update_data = {k: v for k, v in customer.dict().items() if v is not None}
        result = await db.customers.update_one(
            {"_id": ObjectId(customer_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        updated_customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
        return {"id": str(updated_customer["_id"]), **{k:v for k,v in updated_customer.items() if k != "_id"}}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid customer ID format")

@router.delete("/{customer_id}")
async def delete_customer(customer_id: str, db=Depends(get_database)):
    """
    Delete a customer by ID.
    """
    try:
        # Delete all sites associated with this customer
        await db.sites.delete_many({"customer_id": customer_id})
        
        # Then delete the customer
        result = await db.customers.delete_one({"_id": ObjectId(customer_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": "Customer and associated sites deleted successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid customer ID")