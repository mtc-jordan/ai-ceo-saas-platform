"""
Document Management API Endpoints
Handles document CRUD, versioning, sharing, and AI analysis
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

router = APIRouter()


# ============== Pydantic Schemas ==============

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: str = "other"
    tags: List[str] = []
    is_confidential: bool = False

class DocumentCreate(DocumentBase):
    folder_id: Optional[int] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    document_type: Optional[str] = None
    tags: Optional[List[str]] = None
    is_confidential: Optional[bool] = None
    status: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    status: str
    file_name: str
    file_size: int
    file_size_formatted: str
    mime_type: str
    current_version: int
    ai_summary: Optional[str] = None
    ai_key_points: Optional[List[str]] = None
    ai_sentiment: Optional[str] = None
    created_by: str
    created_at: str
    updated_at: str

class DocumentVersionResponse(BaseModel):
    version_number: int
    file_name: str
    file_size: int
    change_summary: Optional[str] = None
    created_by: str
    created_at: str

class DocumentShareCreate(BaseModel):
    shared_with_user_id: Optional[int] = None
    shared_with_email: Optional[str] = None
    permission: str = "view"
    expires_in_days: Optional[int] = 30
    password: Optional[str] = None

class DocumentShareResponse(BaseModel):
    id: int
    shared_with: Optional[str] = None
    shared_with_email: Optional[str] = None
    permission: str
    share_link: Optional[str] = None
    expires_at: Optional[str] = None
    access_count: int
    shared_by: str
    created_at: str

class DocumentAnalysisResponse(BaseModel):
    summary: str
    key_points: List[str]
    entities: dict
    classification: dict
    sentiment: dict
    action_items: List[str]
    risk_indicators: List[str]
    analyzed_at: str

class FolderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_folder_id: Optional[int] = None
    color: Optional[str] = None

class FolderResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    path: str
    document_count: int
    created_at: str


# ============== Helper Functions ==============

def format_file_size(size_bytes: int) -> str:
    """Format file size for display"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


# ============== Mock Data ==============

from app.services.document_service import get_mock_documents, get_mock_document_versions, get_mock_document_shares


# ============== Document Endpoints ==============

@router.get("/", response_model=dict)
async def list_documents(
    search: Optional[str] = None,
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    tags: Optional[str] = None,
    folder_id: Optional[int] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20
):
    """List all documents with filtering and pagination"""
    documents = get_mock_documents()
    
    # Apply filters
    if search:
        search_lower = search.lower()
        documents = [d for d in documents if search_lower in d["title"].lower() or search_lower in (d.get("description") or "").lower()]
    
    if document_type:
        documents = [d for d in documents if d["document_type"] == document_type]
    
    if status:
        documents = [d for d in documents if d["status"] == status]
    
    if tags:
        tag_list = tags.split(",")
        documents = [d for d in documents if any(t in d.get("tags", []) for t in tag_list)]
    
    # Format response
    formatted_docs = []
    for doc in documents:
        formatted_docs.append({
            **doc,
            "file_size_formatted": format_file_size(doc["file_size"])
        })
    
    return {
        "documents": formatted_docs,
        "total": len(formatted_docs),
        "page": page,
        "page_size": page_size,
        "total_pages": (len(formatted_docs) + page_size - 1) // page_size
    }


@router.get("/stats", response_model=dict)
async def get_document_stats():
    """Get document statistics"""
    documents = get_mock_documents()
    
    total_size = sum(d["file_size"] for d in documents)
    
    type_counts = {}
    for doc in documents:
        doc_type = doc["document_type"]
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
    
    status_counts = {}
    for doc in documents:
        status = doc["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_documents": len(documents),
        "total_size": total_size,
        "total_size_formatted": format_file_size(total_size),
        "by_type": type_counts,
        "by_status": status_counts,
        "confidential_count": sum(1 for d in documents if d.get("is_confidential")),
        "recent_uploads": 3,
        "pending_review": status_counts.get("pending_review", 0)
    }


@router.post("/", response_model=dict)
async def create_document(document: DocumentCreate):
    """Create a new document (metadata only, file upload separate)"""
    return {
        "id": 6,
        "message": "Document created successfully",
        "title": document.title,
        "status": "draft"
    }


@router.post("/upload", response_model=dict)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    description: Optional[str] = None,
    document_type: Optional[str] = None,
    tags: Optional[str] = None,
    folder_id: Optional[int] = None,
    is_confidential: bool = False
):
    """Upload a new document file"""
    # In production, this would save to S3/storage
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    return {
        "id": 6,
        "message": "Document uploaded successfully",
        "title": title or file.filename,
        "file_name": file.filename,
        "file_size": file_size,
        "file_size_formatted": format_file_size(file_size),
        "mime_type": file.content_type,
        "status": "draft",
        "ai_analysis_status": "pending"
    }


@router.get("/{document_id}", response_model=dict)
async def get_document(document_id: int):
    """Get document details"""
    documents = get_mock_documents()
    document = next((d for d in documents if d["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        **document,
        "file_size_formatted": format_file_size(document["file_size"]),
        "versions": get_mock_document_versions(document_id),
        "shares": get_mock_document_shares(document_id)
    }


@router.put("/{document_id}", response_model=dict)
async def update_document(document_id: int, update: DocumentUpdate):
    """Update document metadata"""
    return {
        "id": document_id,
        "message": "Document updated successfully",
        "updated_fields": [k for k, v in update.dict().items() if v is not None]
    }


@router.delete("/{document_id}", response_model=dict)
async def delete_document(document_id: int, permanent: bool = False):
    """Delete a document (soft delete by default)"""
    return {
        "id": document_id,
        "message": "Document deleted successfully" if permanent else "Document moved to trash",
        "permanent": permanent
    }


# ============== Version Endpoints ==============

@router.get("/{document_id}/versions", response_model=dict)
async def get_document_versions(document_id: int):
    """Get all versions of a document"""
    versions = get_mock_document_versions(document_id)
    return {
        "document_id": document_id,
        "versions": versions,
        "total_versions": len(versions)
    }


@router.post("/{document_id}/versions", response_model=dict)
async def upload_new_version(
    document_id: int,
    file: UploadFile = File(...),
    change_summary: Optional[str] = None
):
    """Upload a new version of a document"""
    content = await file.read()
    file_size = len(content)
    
    return {
        "document_id": document_id,
        "version_number": 4,
        "message": "New version uploaded successfully",
        "file_name": file.filename,
        "file_size": file_size,
        "change_summary": change_summary
    }


@router.get("/{document_id}/versions/{version_number}/download", response_model=dict)
async def download_version(document_id: int, version_number: int):
    """Get download URL for a specific version"""
    return {
        "document_id": document_id,
        "version_number": version_number,
        "download_url": f"/api/v1/documents/{document_id}/versions/{version_number}/file",
        "expires_in": 3600
    }


@router.post("/{document_id}/versions/{version_number}/restore", response_model=dict)
async def restore_version(document_id: int, version_number: int):
    """Restore a previous version as the current version"""
    return {
        "document_id": document_id,
        "restored_version": version_number,
        "new_version_number": 5,
        "message": f"Version {version_number} restored as new current version"
    }


# ============== Sharing Endpoints ==============

@router.get("/{document_id}/shares", response_model=dict)
async def get_document_shares(document_id: int):
    """Get all shares for a document"""
    shares = get_mock_document_shares(document_id)
    return {
        "document_id": document_id,
        "shares": shares,
        "total_shares": len(shares)
    }


@router.post("/{document_id}/shares", response_model=dict)
async def share_document(document_id: int, share: DocumentShareCreate):
    """Share a document with a user or external email"""
    share_token = "abc123xyz789"
    
    return {
        "id": 3,
        "document_id": document_id,
        "message": "Document shared successfully",
        "share_link": f"https://app.aiceo.com/shared/{share_token}" if share.shared_with_email else None,
        "shared_with_email": share.shared_with_email,
        "shared_with_user_id": share.shared_with_user_id,
        "permission": share.permission,
        "expires_in_days": share.expires_in_days
    }


@router.delete("/{document_id}/shares/{share_id}", response_model=dict)
async def revoke_share(document_id: int, share_id: int):
    """Revoke a document share"""
    return {
        "document_id": document_id,
        "share_id": share_id,
        "message": "Share revoked successfully"
    }


# ============== AI Analysis Endpoints ==============

@router.post("/{document_id}/analyze", response_model=dict)
async def analyze_document(document_id: int):
    """Trigger AI analysis for a document"""
    # In production, this would queue the analysis job
    return {
        "document_id": document_id,
        "message": "AI analysis started",
        "status": "processing",
        "estimated_time": "30 seconds"
    }


@router.get("/{document_id}/analysis", response_model=dict)
async def get_document_analysis(document_id: int):
    """Get AI analysis results for a document"""
    documents = get_mock_documents()
    document = next((d for d in documents if d["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": document_id,
        "summary": document.get("ai_summary"),
        "key_points": document.get("ai_key_points", []),
        "entities": {
            "dates": ["Q4 2024", "December 2024"],
            "amounts": ["$12.5M", "23%", "18%"],
            "people": ["Sarah Johnson"],
            "companies": ["TechCorp"],
            "locations": []
        },
        "classification": {
            "primary_type": document.get("document_type"),
            "secondary_types": ["quarterly", "financial"],
            "confidence": 0.95
        },
        "sentiment": {
            "overall": document.get("ai_sentiment", "neutral"),
            "score": 0.85,
            "reasoning": "Document shows positive financial performance and growth metrics"
        },
        "action_items": [
            "Review Q1 2025 projections",
            "Schedule board presentation"
        ],
        "risk_indicators": [],
        "analyzed_at": "2024-12-20T14:45:00Z"
    }


@router.post("/{document_id}/summarize", response_model=dict)
async def summarize_document(document_id: int, max_length: int = 200):
    """Generate a summary of the document"""
    documents = get_mock_documents()
    document = next((d for d in documents if d["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": document_id,
        "summary": document.get("ai_summary", "Summary not available"),
        "word_count": len(document.get("ai_summary", "").split()),
        "generated_at": datetime.utcnow().isoformat()
    }


# ============== Folder Endpoints ==============

@router.get("/folders/", response_model=dict)
async def list_folders(parent_id: Optional[int] = None):
    """List all folders"""
    folders = [
        {
            "id": 1,
            "name": "Financial Reports",
            "description": "Quarterly and annual financial documents",
            "path": "/Financial Reports",
            "document_count": 12,
            "color": "#10B981",
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "id": 2,
            "name": "Contracts",
            "description": "Legal agreements and contracts",
            "path": "/Contracts",
            "document_count": 8,
            "color": "#6366F1",
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "id": 3,
            "name": "Board Materials",
            "description": "Board meeting documents and presentations",
            "path": "/Board Materials",
            "document_count": 15,
            "color": "#F59E0B",
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "id": 4,
            "name": "HR & Policies",
            "description": "Employee handbooks and company policies",
            "path": "/HR & Policies",
            "document_count": 6,
            "color": "#EC4899",
            "created_at": "2024-01-15T10:00:00Z"
        }
    ]
    
    return {
        "folders": folders,
        "total": len(folders)
    }


@router.post("/folders/", response_model=dict)
async def create_folder(folder: FolderCreate):
    """Create a new folder"""
    return {
        "id": 5,
        "message": "Folder created successfully",
        "name": folder.name,
        "path": f"/{folder.name}"
    }


@router.put("/folders/{folder_id}", response_model=dict)
async def update_folder(folder_id: int, folder: FolderCreate):
    """Update a folder"""
    return {
        "id": folder_id,
        "message": "Folder updated successfully",
        "name": folder.name
    }


@router.delete("/folders/{folder_id}", response_model=dict)
async def delete_folder(folder_id: int, move_documents_to: Optional[int] = None):
    """Delete a folder"""
    return {
        "id": folder_id,
        "message": "Folder deleted successfully",
        "documents_moved_to": move_documents_to
    }


# ============== Activity & Audit Endpoints ==============

@router.get("/{document_id}/activity", response_model=dict)
async def get_document_activity(document_id: int, limit: int = 50):
    """Get activity log for a document"""
    activities = [
        {
            "action": "viewed",
            "description": "Document viewed",
            "performed_by": "John Smith",
            "performed_at": "2024-12-23T14:30:00Z"
        },
        {
            "action": "shared",
            "description": "Shared with investor@venture.com",
            "performed_by": "Sarah Johnson",
            "performed_at": "2024-12-21T09:00:00Z"
        },
        {
            "action": "version_uploaded",
            "description": "New version 3 uploaded",
            "performed_by": "Sarah Johnson",
            "performed_at": "2024-12-20T14:45:00Z"
        },
        {
            "action": "analyzed",
            "description": "AI analysis completed",
            "performed_by": "System",
            "performed_at": "2024-12-20T14:46:00Z"
        },
        {
            "action": "approved",
            "description": "Document approved",
            "performed_by": "John Smith",
            "performed_at": "2024-12-20T15:00:00Z"
        }
    ]
    
    return {
        "document_id": document_id,
        "activities": activities[:limit],
        "total": len(activities)
    }


# ============== Search Endpoint ==============

@router.get("/search/", response_model=dict)
async def search_documents(
    q: str,
    document_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    tags: Optional[str] = None,
    include_content: bool = False
):
    """Full-text search across documents"""
    documents = get_mock_documents()
    
    # Simple search implementation
    q_lower = q.lower()
    results = []
    
    for doc in documents:
        score = 0
        matches = []
        
        if q_lower in doc["title"].lower():
            score += 10
            matches.append({"field": "title", "snippet": doc["title"]})
        
        if doc.get("description") and q_lower in doc["description"].lower():
            score += 5
            matches.append({"field": "description", "snippet": doc["description"]})
        
        if doc.get("ai_summary") and q_lower in doc["ai_summary"].lower():
            score += 3
            matches.append({"field": "ai_summary", "snippet": doc["ai_summary"][:200]})
        
        if any(q_lower in tag.lower() for tag in doc.get("tags", [])):
            score += 2
            matches.append({"field": "tags", "snippet": ", ".join(doc.get("tags", []))})
        
        if score > 0:
            results.append({
                **doc,
                "file_size_formatted": format_file_size(doc["file_size"]),
                "relevance_score": score,
                "matches": matches
            })
    
    # Sort by relevance
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return {
        "query": q,
        "results": results,
        "total": len(results),
        "filters_applied": {
            "document_type": document_type,
            "date_from": date_from,
            "date_to": date_to,
            "tags": tags
        }
    }
