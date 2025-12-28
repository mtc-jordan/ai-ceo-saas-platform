"""
Goal Tracking & OKRs Database Models
"""
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum


class GoalLevel(str, enum.Enum):
    COMPANY = "company"
    DEPARTMENT = "department"
    TEAM = "team"
    INDIVIDUAL = "individual"


class GoalStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    BEHIND = "behind"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class KeyResultType(str, enum.Enum):
    PERCENTAGE = "percentage"
    NUMBER = "number"
    CURRENCY = "currency"
    BOOLEAN = "boolean"
    MILESTONE = "milestone"


class Goal(Base):
    """Main Goal/Objective model"""
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Goal details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Enum(GoalLevel), default=GoalLevel.TEAM)
    status = Column(Enum(GoalStatus), default=GoalStatus.DRAFT)
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, nullable=True)
    team_id = Column(Integer, nullable=True)
    
    # Alignment - parent goal for cascading
    parent_goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    
    # Timeline
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Progress
    progress = Column(Float, default=0.0)  # 0-100
    confidence = Column(Float, default=0.5)  # 0-1 confidence score
    
    # Metadata
    tags = Column(JSON, default=list)
    priority = Column(Integer, default=2)  # 1=Critical, 2=High, 3=Medium, 4=Low
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    key_results = relationship("KeyResult", back_populates="goal", cascade="all, delete-orphan")
    child_goals = relationship("Goal", backref="parent_goal", remote_side=[id])
    check_ins = relationship("GoalCheckIn", back_populates="goal", cascade="all, delete-orphan")


class KeyResult(Base):
    """Key Result model - measurable outcomes for goals"""
    __tablename__ = "key_results"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    
    # Key Result details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    result_type = Column(Enum(KeyResultType), default=KeyResultType.PERCENTAGE)
    
    # Measurement
    start_value = Column(Float, default=0.0)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String(50), nullable=True)  # e.g., "$", "%", "users"
    
    # Progress
    progress = Column(Float, default=0.0)  # 0-100
    weight = Column(Float, default=1.0)  # Weight for goal progress calculation
    
    # Owner
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    goal = relationship("Goal", back_populates="key_results")
    updates = relationship("KeyResultUpdate", back_populates="key_result", cascade="all, delete-orphan")


class KeyResultUpdate(Base):
    """Track updates to key results over time"""
    __tablename__ = "key_result_updates"

    id = Column(Integer, primary_key=True, index=True)
    key_result_id = Column(Integer, ForeignKey("key_results.id"), nullable=False)
    
    # Update details
    previous_value = Column(Float, nullable=False)
    new_value = Column(Float, nullable=False)
    note = Column(Text, nullable=True)
    
    # Who made the update
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    key_result = relationship("KeyResult", back_populates="updates")


class GoalCheckIn(Base):
    """Regular check-ins for goals"""
    __tablename__ = "goal_check_ins"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    
    # Check-in details
    status = Column(Enum(GoalStatus), nullable=False)
    confidence = Column(Float, nullable=False)  # 0-1
    notes = Column(Text, nullable=True)
    blockers = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)
    
    # Who made the check-in
    checked_in_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    goal = relationship("Goal", back_populates="check_ins")


class OKRCycle(Base):
    """OKR Cycles (Quarterly, Annual, etc.)"""
    __tablename__ = "okr_cycles"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Cycle details
    name = Column(String(100), nullable=False)  # e.g., "Q1 2025", "FY 2025"
    description = Column(Text, nullable=True)
    
    # Timeline
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
