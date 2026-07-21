from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
from bson import ObjectId
from datetime import datetime

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda val: str(val)
            )
        )

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# Product Schemas
class ProductBase(BaseModel):
    id: str  # Custom string identifier (e.g. 'sunscreen')
    slug: str
    name: str
    category: str
    price: float
    rating: float = 5.0
    originalPrice: Optional[float] = None
    savings: Optional[float] = None
    netVolume: str
    subtitle: str
    badge: Optional[str] = None
    themeColor: str
    keyActives: List[str]
    benefits: List[str]
    howToUse: List[str]
    ingredients: str
    caution: Optional[List[str]] = None
    tags: List[str]
    images: List[str]

class ProductResponse(ProductBase):
    db_id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    originalPrice: Optional[float] = None
    savings: Optional[float] = None
    netVolume: Optional[str] = None
    subtitle: Optional[str] = None
    badge: Optional[str] = None
    themeColor: Optional[str] = None
    keyActives: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    howToUse: Optional[List[str]] = None
    ingredients: Optional[str] = None
    caution: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None

# Order Schemas
class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    image: str

class OrderCreate(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    paymentMethod: str
    totalPrice: float
    items: List[OrderItem]
    couponApplied: Optional[str] = None
    discountAmount: Optional[float] = 0.0

class OrderResponse(OrderCreate):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    order_number: str
    user_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class OrderStatusUpdate(BaseModel):
    status: str

# Contact Schemas
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(ContactCreate):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# Coupon Schemas
class CouponBase(BaseModel):
    code: str
    discount_type: str  # "percent", "fixed", "buy_x_get_y"
    value: float  # e.g., 10.0 for 10% off or 100.0 for ₹100 off
    min_purchase: Optional[float] = 0.0
    buy_qty: Optional[int] = 0
    get_qty: Optional[int] = 0
    target_product_id: Optional[str] = None # For Buy X Get Y
    description: str
    is_active: bool = True

class CouponResponse(CouponBase):
    db_id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# Settings Schemas
class SettingsBase(BaseModel):
    cashfree_app_id: str
    cashfree_secret_key: str
    cashfree_env: str = "sandbox"  # sandbox or production
    delhivery_api_token: str
    delhivery_env: str = "sandbox"  # sandbox or production

class SettingsResponse(SettingsBase):
    db_id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# Content Block Schemas (CMS)
class ContentBlockBase(BaseModel):
    section_key: str  # e.g. "hero_slides", "testimonials", "faq_categories", etc.
    content: Any  # flexible dict/list structure per section

class ContentBlockResponse(ContentBlockBase):
    db_id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
