"""
Document Management Models
Handles document storage, versioning, sharing, and AI analysis
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base


class DocumentType(str, enum.Enum):
    CONTRACT = "contract"
    REPORT = "report"
    PRESENTATION = "presentation"
    SPREADSHEET = "spreadsheet"
    POLICY = "policy"
    MEETING_NOTES = "meeting_notes"
    FINANCIAL = "financial"
    LEGAL = "legal"
    HR = "hr"
    MARKETING = "marketing"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    ARCHIVED = "archived"
    DELETED = "deleted"


class SharePermission(str, enum.Enum):
    VIEW = "view"
    COMMENT = "comment"
    EDIT = "edit"
    ADMIN = "admin"


class Document(Base):
    """Main document entity with metadata and current version reference"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Basic info
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), default=DocumentType.OTHER)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # File info
    file_name = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(20), nullable=False)
    
    # Storage
    storage_path = Column(String(1000), nullable=False)  # S3 or local path
    thumbnail_path = Column(String(1000), nullable=True)
    
    # Version tracking
    current_version = Column(Integer, default=1)
    
    # AI Analysis
    ai_summary = Column(Text, nullable=True)
    ai_key_points = Column(JSON, nullable=True)  # List of key points
    ai_entities = Column(JSON, nullable=True)  # Extracted entities (dates, amounts, names)
    ai_classification = Column(JSON, nullable=True)  # AI-determined categories
    ai_sentiment = Column(String(50), nullable=True)
    ai_analyzed_at = Column(DateTime, nullable=True)
    
    # Metadata
    tags = Column(JSON, default=list)  # List of tags
    custom_metadata = Column(JSON, default=dict)  # Custom key-value pairs
    
    # Access control
    is_confidential = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=False)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Audit
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # Relationships
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    shares = relationship("DocumentShare", back_populates="document", cascade="all, delete-orphan")
    comments = relationship("DocumentComment", back_populates="document", cascade="all, delete-orphan")
    activities = relationship("DocumentActivity", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    """Track all versions of a document"""
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    version_number = Column(Integer, nullable=False)
    
    # File info for this version
    file_name = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(1000), nullable=False)
    
    # Change info
    change_summary = Column(Text, nullable=True)
    
    # Audit
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="versions")


class DocumentShare(Base):
    """Share documents with users or external parties"""
    __tablename__ = "document_shares"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    # Share target (either user or external email)
    shared_with_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shared_with_email = Column(String(255), nullable=True)  # For external sharing
    
    # Permissions
    permission = Column(SQLEnum(SharePermission), default=SharePermission.VIEW)
    
    # Security
    share_token = Column(String(100), unique=True, nullable=True)  # For external links
    expires_at = Column(DateTime, nullable=True)
    password_hash = Column(String(255), nullable=True)  # Optional password protection
    
    # Access tracking
    access_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Audit
    shared_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    document = relationship("Document", back_populates="shares")


class DocumentComment(Base):
    """Comments and annotations on documents"""
    __tablename__ = "document_comments"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    # Comment content
    content = Column(Text, nullable=False)
    
    # Position (for annotations)
    page_number = Column(Integer, nullable=True)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    
    # Threading
    parent_comment_id = Column(Integer, ForeignKey("document_comments.id"), nullable=True)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Audit
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="comments")


class DocumentActivity(Base):
    """Audit log for document activities"""
    __tablename__ = "document_activities"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    # Activity info
    action = Column(String(50), nullable=False)  # created, viewed, downloaded, edited, shared, etc.
    description = Column(Text, nullable=True)
    
    # Context
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Audit
    performed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    performed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="activities")


class DocumentFolder(Base):
    """Organize documents into folders"""
    __tablename__ = "document_folders"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Hierarchy
    parent_folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)
    path = Column(String(1000), nullable=False)  # Full path like /root/subfolder/current
    
    # Settings
    is_private = Column(Boolean, default=False)
    color = Column(String(20), nullable=True)  # For UI display
    icon = Column(String(50), nullable=True)
    
    # Audit
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
