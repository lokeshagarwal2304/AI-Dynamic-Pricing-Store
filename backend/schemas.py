from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# Product schemas (extending existing)
class ProductBase(BaseModel):
    product_name: str
    category: str
    base_price: float
    inventory_level: int
    competitor_avg_price: float
    sales_last_30_days: int
    rating: float
    review_count: int
    season: str
    brand_tier: str
    material_cost: float
    target_price: float
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[float] = None
    inventory_level: Optional[int] = None
    competitor_avg_price: Optional[float] = None
    sales_last_30_days: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    season: Optional[str] = None
    brand_tier: Optional[str] = None
    material_cost: Optional[float] = None
    target_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    product_id: int
    is_active: bool
    created_at: datetime
    predicted_price: Optional[float] = None
    confidence: Optional[float] = None

    class Config:
        from_attributes = True

# Cart schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    added_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_amount: float

# Order schemas
class OrderCreate(BaseModel):
    shipping_address: str
    payment_method: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time: float
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: str
    payment_method: str
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# Review schemas
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

# Search and filter schemas
class ProductFilter(BaseModel):
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    brand_tier: Optional[str] = None
    season: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "popularity"  # popularity, price_low, price_high, rating, newest
    page: Optional[int] = 1
    limit: Optional[int] = 20

# Dashboard schemas
class DashboardStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    recent_orders: List[OrderResponse]
    top_products: List[ProductResponse]

# Prediction input (keeping existing structure)
class ProductInput(BaseModel):
    product_name: str
    category: str
    base_price: float
    inventory_level: int
    competitor_avg_price: float
    sales_last_30_days: int
    rating: float
    review_count: int
    season: str
    brand_tier: str
    material_cost: float

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    price_change_percentage: float
    recommendation: str

class ModelMetrics(BaseModel):
    mse: float
    rmse: float
    r2_score: float
    model_type: str
    training_samples: int
    feature_importance: dict