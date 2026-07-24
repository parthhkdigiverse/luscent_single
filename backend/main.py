import os
import sys
import random
import httpx
from datetime import datetime, timezone
from typing import List, Optional

# Add the directory containing this file to Python's path so local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, status, Body, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from database import users_collection, products_collection, orders_collection, contacts_collection, coupons_collection, settings_collection, content_collection
from schemas import (
    UserCreate, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest,
    ProductResponse, OrderCreate, OrderResponse,
    ContactCreate, ContactResponse, CouponBase, CouponResponse,
    SettingsBase, SettingsResponse, ContentBlockBase, ContentBlockResponse,
    ProductCreate, ProductUpdate, OrderStatusUpdate
)
from auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_user_optional, get_admin_user

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
load_dotenv(env_path)
load_dotenv()

app = FastAPI(title="Luscentglow API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed Data (Matches frontend/src/data/products.js)
SEED_PRODUCTS = [
    {
        "id": "sunscreen",
        "slug": "sunscreen",
        "name": "Ultra Light Sunscreen SPF 50+",
        "category": "sunscreen",
        "price": 690.0,
        "rating": 4.8,
        "netVolume": "50 mL (1.7 fl oz)",
        "subtitle": "Powerful Protection — Non-Greasy Formula",
        "badge": "SPF 50+ PA++++",
        "themeColor": "brand-accent",
        "keyActives": [
            "2% Niacinamide",
            "Vitamin E",
            "Zinc Oxide",
            "Titanium Dioxide",
            "Licorice (Glycyrrhiza Glabra) Extract"
        ],
        "benefits": [
            "Prevents sunburn",
            "Keeps skin healthy & safe",
            "Reduces tanning & dark spots",
            "Protects from UV rays"
        ],
        "howToUse": [
            "Apply on clean, dry skin",
            "Use the right amount",
            "Apply 15–20 minutes before sun exposure",
            "Massage gently",
            "Reapply every 2–3 hours",
            "Use daily"
        ],
        "ingredients": "Water, EDTA 2Na, Glycerin, Stearic Acid, Microwax Ewax, Glyceryl Mono Stearate SE, Cetostearyl Alcohol, Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Benzophenone-3, Butylene Glycol, Phospholipid, Zinc Oxide, Titanium Dioxide, Isopropyl Myristate, Niacinamide, Caprylic/Capric Triglyceride, Dimethicone, Vitamin E Acetate, Glycyrrhiza Glabra (Licorice) Extract, Ethylhexylglycerin, Phenoxyethanol",
        "tags": ["Weightless Daily Protection", "Non-Greasy"],
        "images": [
            "/images/sunscreen.png",
            "/images/sunscreen_back.png",
            "/images/sunscreen_texture.png",
            "/images/sunscreen.png"
        ]
    },
    {
        "id": "face-wash",
        "slug": "face-wash",
        "name": "Bright Skin Face Wash",
        "category": "face-wash",
        "price": 395.0,
        "rating": 4.8,
        "netVolume": "100 mL",
        "subtitle": "Effective Gentle Care — Deep Cleansing Formula",
        "badge": "For All Skin Types",
        "themeColor": "brand-secondary",
        "keyActives": [
            "Salicylic Acid",
            "Niacinamide",
            "Alpha Arbutin",
            "Glycolic Acid"
        ],
        "benefits": [
            "For All Skin Types",
            "Fragrance Free",
            "Daily Use",
            "Deeply Cleanses & Brightens"
        ],
        "howToUse": [
            "Wet Face",
            "Massage Gently",
            "Rinse Well"
        ],
        "ingredients": "Water, Glycerin, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Coco Diethanolamine, Coco Glucoside, Niacinamide, Alpha Arbutin, Glycyrrhiza Glabra (Licorice Extract), Carica Papaya (Papaya Extract), Salicylic Acid, Glycolic Acid, Aloe Barbadensis Extract, D-Panthenol, Allantoin, Disodium EDTA, PEG-150 Distearate, DMDM Hydantoin, Fragrance, Citric Acid",
        "caution": [
            "For external use only",
            "Avoid contact with eyes",
            "Discontinue use if irritation occurs",
            "Keep out of reach of children"
        ],
        "tags": ["For All Skin Types", "Fragrance Free", "Daily Use"],
        "images": [
            "/images/facewash.png",
            "/images/facewash_back.png",
            "/images/facewash_texture.png",
            "/images/facewash.png"
        ]
    },
    {
        "id": "combo",
        "slug": "combo",
        "name": "The Glow Duo (Combo)",
        "category": "combo",
        "price": 999.0,
        "rating": 3.5,
        "originalPrice": 1085.0,
        "savings": 86.0,
        "netVolume": "50 mL + 100 mL",
        "subtitle": "Complete Daily Ritual — Powerful Protection & Effective Gentle Care",
        "badge": "Best Value",
        "themeColor": "brand-dark",
        "keyActives": [
            "2% Niacinamide",
            "Salicylic Acid",
            "Alpha Arbutin",
            "Zinc Oxide",
            "Vitamin E",
            "Glycolic Acid"
        ],
        "benefits": [
            "Complete Daily skincare ritual",
            "Maximum protection & gentle wash",
            "Saves ₹86 over individual prices",
            "Dermatologist approved actives"
        ],
        "howToUse": [
            "Cleanse face thoroughly with Bright Skin Face Wash",
            "Pat dry and follow with skincare routine",
            "Apply Ultra Light Sunscreen SPF 50+ generously before going out"
        ],
        "ingredients": "Refer to individual product ingredient lists.",
        "tags": ["Bestseller", "Daily Routine Set", "Complete Care"],
        "images": [
            "/images/combo.png",
            "/images/sunscreen.png",
            "/images/facewash.png",
            "/images/combo.png"
        ]
    }
]

@app.on_event("startup")
async def startup_event():
    # Ensure collections and indexes exist
    try:
        await users_collection.create_index("email", unique=True)
        await orders_collection.create_index("order_number", unique=True)
        print("MongoDB users and orders collection indexes initialized.")
    except Exception as e:
        print("Index creation warning:", e)

    # Seed products if empty
    count = await products_collection.count_documents({})
    if count == 0:
        await products_collection.insert_many(SEED_PRODUCTS)
        print("Database seeded with default products.")
    else:
        # Migrate existing products to set category field if missing
        await products_collection.update_many({"id": "sunscreen", "category": {"$exists": False}}, {"$set": {"category": "sunscreen"}})
        await products_collection.update_many({"id": "face-wash", "category": {"$exists": False}}, {"$set": {"category": "face-wash"}})
        await products_collection.update_many({"id": "combo", "category": {"$exists": False}}, {"$set": {"category": "combo"}})

    # Seed coupons if empty
    coupon_count = await coupons_collection.count_documents({})
    if coupon_count == 0:
        default_coupon = {
            "code": "GLOW10",
            "discount_type": "percent",
            "value": 10.0,
            "min_purchase": 0.0,
            "buy_qty": 0,
            "get_qty": 0,
            "target_product_id": None,
            "description": "10% off storewide!",
            "is_active": True
        }
        await coupons_collection.insert_one(default_coupon)
        print("Database seeded with default coupons.")

# --- Authentication Routes ---
@app.post("/api/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate):
    existing = await users_collection.find_one({"email": user_in.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = get_password_hash(user_in.password)
    user_dict = {
        "email": user_in.email,
        "name": user_in.name,
        "password": hashed,
        "created_at": datetime.now(timezone.utc)
    }
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return user_dict

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Extra login JSON route for easy call from fetch
@app.post("/api/auth/login-json", response_model=Token)
async def login_json(body: dict = Body(...)):
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    from datetime import timedelta
    expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    await users_collection.update_one(
        {"email": req.email},
        {"$set": {"reset_otp": otp, "reset_otp_expiry": expiry}}
    )
    
    return {
        "message": f"Reset OTP sent! Use verification code: {otp}",
        "otp": otp
    }

@app.post("/api/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    saved_otp = user.get("reset_otp")
    expiry = user.get("reset_otp_expiry")
    
    if not saved_otp or saved_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid verification OTP.")
    
    if not expiry or expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification OTP has expired. Please request a new one.")
    
    hashed_pwd = get_password_hash(req.new_password)
    await users_collection.update_one(
        {"email": req.email},
        {
            "$set": {"password": hashed_pwd},
            "$unset": {"reset_otp": "", "reset_otp_expiry": ""}
        }
    )
    
    return {"message": "Password reset successfully! You can now log in with your new password."}


# --- Products Routes ---
@app.get("/api/products", response_model=List[ProductResponse])
async def get_products():
    cursor = products_collection.find({})
    products = []
    async for document in cursor:
        products.append(document)
    return products

@app.get("/api/products/{slug_or_id}", response_model=ProductResponse)
async def get_product(slug_or_id: str):
    product = await products_collection.find_one({"$or": [{"id": slug_or_id}, {"slug": slug_or_id}]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# --- Orders Routes ---
@app.post("/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_in: OrderCreate, current_user: Optional[dict] = Depends(get_current_user_optional)):
    # Calculate order number
    order_number = f"LG-{random.randint(100000, 999999)}"
    
    order_dict = order_in.dict()
    order_dict["order_number"] = order_number
    order_dict["user_id"] = current_user["email"] if current_user else None
    order_dict["status"] = "pending"
    order_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await orders_collection.insert_one(order_dict)
    order_dict["_id"] = result.inserted_id
    return order_dict

@app.get("/api/orders", response_model=List[OrderResponse])
async def get_orders(current_user: dict = Depends(get_current_user)):
    cursor = orders_collection.find({"user_id": current_user["email"]})
    orders = []
    async for document in cursor:
        orders.append(document)
    return orders


# --- Contact Routes ---
@app.post("/api/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(contact_in: ContactCreate):
    contact_dict = contact_in.dict()
    contact_dict["created_at"] = datetime.now(timezone.utc)
    result = await contacts_collection.insert_one(contact_dict)
    contact_dict["_id"] = result.inserted_id
    return contact_dict


# --- Admin Routes ---
@app.get("/api/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_admin_user)):
    users_count = await users_collection.count_documents({"is_deleted": {"$ne": True}})
    deleted_users_count = await users_collection.count_documents({"is_deleted": True})
    products_count = await products_collection.count_documents({})
    orders_count = await orders_collection.count_documents({"is_deleted": {"$ne": True}})
    deleted_orders_count = await orders_collection.count_documents({"is_deleted": True})
    
    # Calculate revenue
    pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": None, "total": {"$sum": "$totalPrice"}}}
    ]
    cursor = orders_collection.aggregate(pipeline)
    total_revenue = 0
    async for result in cursor:
        total_revenue = result.get("total", 0)
        
    return {
        "users": users_count,
        "deleted_users": deleted_users_count,
        "products": products_count,
        "orders": orders_count,
        "deleted_orders": deleted_orders_count,
        "revenue": round(float(total_revenue or 0), 2)
    }

@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_admin_users(current_user: dict = Depends(get_admin_user)):
    cursor = users_collection.find({})
    users = []
    async for document in cursor:
        users.append(document)
    return users

@app.put("/api/admin/users/{user_id}/soft-delete")
async def soft_delete_admin_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User soft deleted successfully"}

@app.put("/api/admin/users/{user_id}/restore")
async def restore_admin_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_deleted": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User restored successfully"}

@app.delete("/api/admin/users/{user_id}")
async def hard_delete_admin_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User permanently deleted"}

@app.get("/api/admin/orders", response_model=List[OrderResponse])
async def get_admin_orders(current_user: dict = Depends(get_admin_user)):
    cursor = orders_collection.find({})
    orders = []
    async for document in cursor:
        orders.append(document)
    return orders

@app.put("/api/admin/orders/{order_id}/soft-delete")
async def soft_delete_admin_order(order_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await orders_collection.update_one({"_id": ObjectId(order_id)}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order soft deleted successfully"}

@app.put("/api/admin/orders/{order_id}/restore")
async def restore_admin_order(order_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await orders_collection.update_one({"_id": ObjectId(order_id)}, {"$set": {"is_deleted": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order restored successfully"}

@app.delete("/api/admin/orders/{order_id}")
async def hard_delete_admin_order(order_id: str, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    result = await orders_collection.delete_one({"_id": ObjectId(order_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order permanently deleted"}

@app.put("/api/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, body: OrderStatusUpdate, current_user: dict = Depends(get_admin_user)):
    from bson import ObjectId
    status_val = body.status
    if not status_val:
        raise HTTPException(status_code=400, detail="Status value required")
    
    # Check if order exists first
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # If shipping, trigger Delhivery shipment booking
    if status_val == "shipped":
        if order:
            db_settings = await settings_collection.find_one({})
            delhivery_token = db_settings.get("delhivery_api_token") if db_settings else None
            delhivery_env = db_settings.get("delhivery_env", "sandbox") if db_settings else "sandbox"
            delhivery_warehouse = db_settings.get("delhivery_warehouse", "Luscentglow Warehouse") if db_settings else "Luscentglow Warehouse"
            
            awb = None
            if delhivery_token and delhivery_token != "mock_token":
                delhivery_url = (
                    "https://track.delhivery.com/api/cmu/create.json" 
                    if delhivery_env == "production" 
                    else "https://staging-express.delhivery.com/api/cmu/create.json"
                )
                
                shipment_data = {
                    "shipments": [
                        {
                            "name": order.get("name"),
                            "add": order.get("address"),
                            "phone": order.get("phone"),
                            "pin": order.get("pincode"),
                            "payment_mode": "COD" if order.get("paymentMethod") == "cod" else "Prepaid",
                            "order": order.get("order_number"),
                            "amount": order.get("totalPrice"),
                            "cod_amount": order.get("totalPrice") if order.get("paymentMethod") == "cod" else 0
                        }
                    ],
                    "pickup_location": {
                        "name": delhivery_warehouse
                    }
                }
                
                try:
                    import json
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            delhivery_url,
                            headers={"Authorization": f"Token {delhivery_token}"},
                            data={"format": "json", "data": json.dumps(shipment_data)}
                        )
                        if response.status_code == 200:
                            res_json = response.json()
                            
                            # Delhivery API might return 200 OK but with an error flag inside the JSON
                            if not res_json.get("success", True) or "error" in res_json:
                                error_msg = res_json.get("error")
                                if not error_msg:
                                    import json as json_lib
                                    error_msg = json_lib.dumps(res_json)
                                raise HTTPException(status_code=400, detail=f"Delhivery Booking Failed: {error_msg}")
                                
                            packages = res_json.get("packages", [])
                            if packages:
                                # Sometimes package status might indicate error
                                if packages[0].get("status") == "Fail":
                                    err_msg = packages[0].get("remarks", ["Unknown error"])[0]
                                    raise HTTPException(status_code=400, detail=f"Delhivery Booking Failed: {err_msg}")
                                    
                                awb = packages[0].get("waybill")
                        else:
                            # HTTP error from Delhivery
                            err_text = response.text
                            raise HTTPException(status_code=400, detail=f"Delhivery API Error ({response.status_code}): {err_text}")
                            
                except HTTPException:
                    raise  # Re-raise HTTP exceptions to bubble up to the client
                except Exception as e:
                    print("Delhivery Booking Error:", str(e))
                    raise HTTPException(status_code=500, detail=f"Failed to connect to Delhivery API: {str(e)}")
            
            # Fallback AWB if mock token
            if not awb:
                awb = "DLV" + "".join([str(random.randint(0, 9)) for _ in range(10)])
                
            await orders_collection.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {"tracking_number": awb, "carrier": "Delhivery"}}
            )
            
    # Finally, update the status in DB now that shipping hasn't thrown an error
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status_val}}
    )
            
    return {"message": "Status updated successfully"}

@app.post("/api/admin/products")
async def create_admin_product(body: ProductCreate, current_user: dict = Depends(get_admin_user)):
    product_id = body.id
    if not product_id:
        raise HTTPException(status_code=400, detail="Product ID required")
        
    # Check if exists
    exists = await products_collection.find_one({"id": product_id})
    if exists:
        raise HTTPException(status_code=400, detail="Product ID already exists")
        
    await products_collection.insert_one(body.dict())
    return {"message": "Product created successfully"}

@app.put("/api/admin/products/{product_id}")
async def update_admin_product(product_id: str, body: ProductUpdate, current_user: dict = Depends(get_admin_user)):
    body_dict = body.dict(exclude_unset=True)
    body_dict.pop("_id", None)
    result = await products_collection.update_one(
        {"id": product_id},
        {"$set": body_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}

@app.delete("/api/admin/products/{product_id}")
async def delete_admin_product(product_id: str, current_user: dict = Depends(get_admin_user)):
    result = await products_collection.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@app.post("/api/admin/login")
async def admin_login(body: dict = Body(...)):
    username = body.get("username")
    password = body.get("password")
    
    expected_user = os.getenv("ADMIN_USERNAME", "admin")
    expected_pass = os.getenv("ADMIN_PASSWORD", "adminsecret")
    
    if username == expected_user and password == expected_pass:
        token = create_access_token(data={"sub": username, "role": "admin"})
        return {"success": True, "token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

# --- Coupon Routes ---
@app.get("/api/admin/coupons", response_model=List[CouponResponse])
async def list_admin_coupons(current_user: dict = Depends(get_admin_user)):
    cursor = coupons_collection.find({})
    results = []
    async for doc in cursor:
        results.append(doc)
    return results

@app.post("/api/admin/coupons")
async def create_admin_coupon(body: CouponBase, current_user: dict = Depends(get_admin_user)):
    code_upper = body.code.upper()
    exists = await coupons_collection.find_one({"code": code_upper})
    if exists:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_dict = body.dict()
    coupon_dict["code"] = code_upper
    await coupons_collection.insert_one(coupon_dict)
    return {"message": "Coupon created successfully"}

@app.put("/api/admin/coupons/{code}")
async def update_admin_coupon(code: str, body: CouponBase, current_user: dict = Depends(get_admin_user)):
    code_upper = code.upper()
    body_dict = body.dict()
    body_dict.pop("_id", None)
    body_dict["code"] = body_dict["code"].upper()
    
    result = await coupons_collection.update_one(
        {"code": code_upper},
        {"$set": body_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon updated successfully"}

@app.delete("/api/admin/coupons/{code}")
async def delete_admin_coupon(code: str, current_user: dict = Depends(get_admin_user)):
    code_upper = code.upper()
    result = await coupons_collection.delete_one({"code": code_upper})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted successfully"}

@app.get("/api/coupons", response_model=List[CouponResponse])
async def list_public_coupons():
    cursor = coupons_collection.find({"is_active": True})
    results = []
    async for doc in cursor:
        results.append(doc)
    return results

@app.get("/api/coupons/{code}", response_model=CouponResponse)
async def validate_coupon(code: str):
    code_upper = code.upper()
    coupon = await coupons_collection.find_one({"code": code_upper})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if not coupon.get("is_active", True):
        raise HTTPException(status_code=400, detail="Coupon is expired or inactive")
    return coupon

# --- Content Blocks CMS Routes (Public) ---
@app.get("/api/content")
async def get_all_content():
    """Returns all content blocks for frontend rendering."""
    blocks = await content_collection.find({}).to_list(100)
    result = {}
    for block in blocks:
        result[block["section_key"]] = block["content"]
    return result

@app.get("/api/content/{section_key}")
async def get_content_block(section_key: str):
    """Returns a single content block by section key."""
    block = await content_collection.find_one({"section_key": section_key})
    if not block:
        return {"section_key": section_key, "content": None}
    return {"section_key": block["section_key"], "content": block["content"]}

# --- Content Blocks CMS Routes (Admin) ---
@app.get("/api/admin/content")
async def get_admin_content(current_user: dict = Depends(get_admin_user)):
    """Returns all content blocks with IDs for admin management."""
    blocks = await content_collection.find({}).to_list(100)
    for b in blocks:
        b["_id"] = str(b["_id"])
    return blocks

@app.put("/api/admin/content/{section_key}")
async def upsert_content_block(section_key: str, body: dict = Body(...), current_user: dict = Depends(get_admin_user)):
    """Create or update a content block."""
    content = body.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="Missing 'content' field")
    from pymongo.errors import DocumentTooLarge
    try:
        result = await content_collection.update_one(
            {"section_key": section_key},
            {"$set": {"section_key": section_key, "content": content}},
            upsert=True
        )
    except DocumentTooLarge:
        raise HTTPException(status_code=413, detail="The uploaded images are too large. Please compress them to be under 10MB in total before saving.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"message": f"Content block '{section_key}' saved successfully"}

import shutil

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public", "images", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/admin/upload")
async def upload_image(file: UploadFile = File(...), replace_path: Optional[str] = Form(None), current_user: dict = Depends(get_admin_user)):
    if replace_path and replace_path.startswith("/images/"):
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public", replace_path.lstrip("/"))
        url = replace_path
    else:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        url = f"/images/uploads/{file.filename}"
        
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": url}
@app.delete("/api/admin/content/{section_key}")
async def delete_content_block(section_key: str, current_user: dict = Depends(get_admin_user)):
    """Delete a content block."""
    result = await content_collection.delete_one({"section_key": section_key})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Content block '{section_key}' not found")
    return {"message": f"Content block '{section_key}' deleted"}

# --- Integrations Settings Routes ---
@app.get("/api/admin/settings", response_model=SettingsResponse)
async def get_admin_settings(current_user: dict = Depends(get_admin_user)):
    settings = await settings_collection.find_one({})
    if not settings:
        return {
            "cashfree_app_id": "",
            "cashfree_secret_key": "",
            "cashfree_env": "sandbox",
            "delhivery_api_token": "",
            "delhivery_env": "sandbox",
            "delhivery_warehouse": "Luscentglow Warehouse",
            "social_instagram": "",
            "social_facebook": "",
            "social_twitter": "",
            "social_youtube": ""
        }
    return settings

@app.get("/api/settings/public")
async def get_public_settings():
    settings = await settings_collection.find_one({})
    if not settings:
        return {
            "social_instagram": "",
            "social_facebook": "",
            "social_twitter": "",
            "social_youtube": ""
        }
    return {
        "social_instagram": settings.get("social_instagram", ""),
        "social_facebook": settings.get("social_facebook", ""),
        "social_twitter": settings.get("social_twitter", ""),
        "social_youtube": settings.get("social_youtube", "")
    }

@app.post("/api/admin/settings")
async def save_admin_settings(body: SettingsBase, current_user: dict = Depends(get_admin_user)):
    await settings_collection.delete_many({}) # Keep only 1 active settings record
    await settings_collection.insert_one(body.dict())
    return {"message": "Settings saved successfully"}

# --- Cashfree PG Session Route ---
@app.post("/api/orders/cashfree-session")
async def create_cashfree_session(body: dict = Body(...)):
    order_amount = body.get("amount")
    customer_name = body.get("name")
    customer_phone = body.get("phone")
    customer_email = body.get("email")
    order_id = body.get("order_id", "LG-" + str(random.randint(100000, 999999)))
    
    # Sanitize phone number to meet Cashfree's strict 10-digit requirements
    clean_phone = "".join([char for char in str(customer_phone) if char.isdigit()])
    if len(clean_phone) != 10:
        clean_phone = "9999999999"
    
    # Load settings
    db_settings = await settings_collection.find_one({})
    cf_app_id = db_settings.get("cashfree_app_id") if db_settings else None
    cf_secret = db_settings.get("cashfree_secret_key") if db_settings else None
    cf_env = db_settings.get("cashfree_env", "sandbox") if db_settings else "sandbox"
    
    # Fallback to Sandbox default mock keys if not configured in Settings
    if not cf_app_id or not cf_secret:
        cf_app_id = "TEST10313028cf5cf01309f4b3ab5b82031301"
        cf_secret = "cfsk_ma_sbox_4771744cb44274c5d4efd559812b1d03_9da30514"
        cf_env = "sandbox"
        
    cf_url = (
        "https://api.cashfree.com/pg/orders"
        if cf_env == "production"
        else "https://sandbox.cashfree.com/pg/orders"
    )
    
    headers = {
        "x-client-id": cf_app_id,
        "x-client-secret": cf_secret,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
    }
    
    return_url = body.get("return_url", os.getenv("FRONTEND_URL", f"http://localhost:{os.getenv('FRONTEND_PORT', '5173')}") + "/checkout")
    
    payload = {
        "order_amount": float(order_amount),
        "order_currency": "INR",
        "order_id": order_id,
        "customer_details": {
            "customer_id": "cust_" + clean_phone,
            "customer_phone": clean_phone,
            "customer_email": customer_email or "guest@luscentglow.com",
            "customer_name": customer_name
        },
        "order_meta": {
            "return_url": return_url
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(cf_url, json=payload, headers=headers)
            if res.status_code == 200:
                res_data = res.json()
                return {
                    "payment_session_id": res_data.get("payment_session_id"),
                    "order_id": order_id,
                    "cf_order_id": res_data.get("cf_order_id"),
                    "mode": cf_env
                }
            else:
                raise HTTPException(status_code=res.status_code, detail=f"Cashfree API Error: {res.text}")
    except HTTPException as he:
        raise he
    except Exception as e:
        # Fallback Mock Session if call fails or sandbox API down
        return {
            "payment_session_id": "mock_session_id_" + "".join([str(random.randint(0, 9)) for _ in range(8)]),
            "order_id": order_id,
            "cf_order_id": "mock_cf_" + order_id,
            "mode": cf_env,
            "is_mock": True
        }

@app.get("/api/orders/track/{identifier}")
async def track_order_public(identifier: str):
    # Try searching by order_number
    order = await orders_collection.find_one({"order_number": identifier})
    if not order:
        # Try searching by tracking_number
        order = await orders_collection.find_one({"tracking_number": identifier})
        
    if not order:
        raise HTTPException(status_code=404, detail="Order or tracking number not found")
        
    return {
        "order_number": order.get("order_number"),
        "status": order.get("status", "pending"),
        "carrier": order.get("carrier"),
        "tracking_number": order.get("tracking_number"),
        "created_at": order.get("created_at"),
        "items": [
            {
                "name": item.get("name"),
                "quantity": item.get("quantity")
            } for item in order.get("items", [])
        ]
    }

# --- Serve Frontend in Production ---
if os.getenv("APP_ENV") == "production":
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/dist")
    if os.path.exists(dist_path):
        app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
        
        @app.exception_handler(404)
        async def custom_404_handler(request: Request, __):
            if request.url.path.startswith("/api/"):
                return {"detail": "Not Found"}
            return FileResponse(os.path.join(dist_path, "index.html"))
    else:
        print(f"Warning: Production mode enabled but {dist_path} does not exist. Please build the frontend.")




