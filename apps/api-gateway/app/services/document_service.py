"""
Document Management Service
Handles document operations, versioning, sharing, and AI analysis
"""
import os
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json
from openai import OpenAI


class DocumentService:
    """Service for document management operations"""
    
    def __init__(self):
        self.client = OpenAI()
        self.storage_base = "/home/ubuntu/ai-ceo-platform/storage/documents"
        os.makedirs(self.storage_base, exist_ok=True)
    
    def generate_storage_path(self, organization_id: int, file_name: str) -> str:
        """Generate unique storage path for document"""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        unique_id = uuid.uuid4().hex[:8]
        safe_name = "".join(c for c in file_name if c.isalnum() or c in ".-_")
        return f"{organization_id}/{timestamp}/{unique_id}_{safe_name}"
    
    def generate_share_token(self) -> str:
        """Generate secure share token"""
        return hashlib.sha256(uuid.uuid4().bytes).hexdigest()[:32]
    
    def get_file_type(self, mime_type: str, extension: str) -> str:
        """Determine document type from mime type and extension"""
        type_mapping = {
            "application/pdf": "report",
            "application/msword": "report",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "report",
            "application/vnd.ms-excel": "spreadsheet",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
            "application/vnd.ms-powerpoint": "presentation",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
            "text/plain": "other",
            "text/csv": "spreadsheet",
        }
        
        extension_mapping = {
            ".pdf": "report",
            ".doc": "report",
            ".docx": "report",
            ".xls": "spreadsheet",
            ".xlsx": "spreadsheet",
            ".ppt": "presentation",
            ".pptx": "presentation",
            ".txt": "other",
            ".csv": "spreadsheet",
        }
        
        return type_mapping.get(mime_type) or extension_mapping.get(extension.lower(), "other")
    
    def format_file_size(self, size_bytes: int) -> str:
        """Format file size for display"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"


class DocumentAIService:
    """AI-powered document analysis service"""
    
    def __init__(self):
        self.client = OpenAI()
        self.model = "gpt-4.1-mini"
    
    async def analyze_document(self, content: str, document_type: str = "general") -> Dict[str, Any]:
        """Perform comprehensive AI analysis on document content"""
        
        analysis_prompt = f"""Analyze the following {document_type} document and provide:

1. **Summary**: A concise 2-3 sentence summary of the document
2. **Key Points**: List 3-5 most important points or findings
3. **Entities**: Extract key entities including:
   - Dates mentioned
   - Monetary amounts
   - Person names
   - Company names
   - Locations
4. **Classification**: Categorize the document (e.g., financial report, legal contract, meeting notes, etc.)
5. **Sentiment**: Overall sentiment (positive, negative, neutral, mixed)
6. **Action Items**: Any action items or next steps mentioned
7. **Risk Indicators**: Any potential risks or concerns identified

Document Content:
{content[:8000]}

Respond in JSON format with these exact keys:
{{
    "summary": "...",
    "key_points": ["point1", "point2", ...],
    "entities": {{
        "dates": ["date1", ...],
        "amounts": ["$X", ...],
        "people": ["name1", ...],
        "companies": ["company1", ...],
        "locations": ["location1", ...]
    }},
    "classification": {{
        "primary_type": "...",
        "secondary_types": ["...", ...],
        "confidence": 0.95
    }},
    "sentiment": {{
        "overall": "positive/negative/neutral/mixed",
        "score": 0.8,
        "reasoning": "..."
    }},
    "action_items": ["action1", ...],
    "risk_indicators": ["risk1", ...]
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert document analyst. Analyze documents thoroughly and provide structured insights."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return {
                "success": True,
                "analysis": result,
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis": None
            }
    
    async def generate_document_summary(self, content: str, max_length: int = 200) -> str:
        """Generate a concise summary of document content"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"Summarize the following document in {max_length} words or less. Be concise and capture the key points."},
                    {"role": "user", "content": content[:6000]}
                ],
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Summary generation failed: {str(e)}"
    
    async def compare_document_versions(self, old_content: str, new_content: str) -> Dict[str, Any]:
        """Compare two versions of a document and highlight changes"""
        
        comparison_prompt = f"""Compare these two document versions and provide:

1. **Summary of Changes**: Brief overview of what changed
2. **Key Additions**: New content added
3. **Key Removals**: Content that was removed
4. **Modified Sections**: Sections that were changed
5. **Impact Assessment**: How significant are the changes (minor/moderate/major)

OLD VERSION:
{old_content[:4000]}

NEW VERSION:
{new_content[:4000]}

Respond in JSON format."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a document comparison expert. Analyze changes between document versions."},
                    {"role": "user", "content": comparison_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {"error": str(e)}
    
    async def extract_contract_details(self, content: str) -> Dict[str, Any]:
        """Extract specific details from contract documents"""
        
        contract_prompt = f"""Extract the following details from this contract:

1. **Parties Involved**: Names of all parties
2. **Effective Date**: When the contract takes effect
3. **Expiration Date**: When the contract ends
4. **Key Terms**: Main obligations and terms
5. **Payment Terms**: Any payment-related clauses
6. **Termination Clauses**: How the contract can be terminated
7. **Liability Clauses**: Liability and indemnification terms
8. **Confidentiality**: Any NDA or confidentiality provisions

Contract Content:
{content[:6000]}

Respond in JSON format."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a legal document analyst specializing in contract review."},
                    {"role": "user", "content": contract_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {"error": str(e)}


class DocumentSearchService:
    """Full-text search service for documents"""
    
    def __init__(self):
        pass
    
    def build_search_query(self, query: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Build search query with filters"""
        search_params = {
            "query": query,
            "filters": {}
        }
        
        if filters.get("document_type"):
            search_params["filters"]["document_type"] = filters["document_type"]
        
        if filters.get("date_from"):
            search_params["filters"]["created_at_gte"] = filters["date_from"]
        
        if filters.get("date_to"):
            search_params["filters"]["created_at_lte"] = filters["date_to"]
        
        if filters.get("tags"):
            search_params["filters"]["tags_contains"] = filters["tags"]
        
        if filters.get("created_by"):
            search_params["filters"]["created_by_id"] = filters["created_by"]
        
        return search_params
    
    def highlight_matches(self, content: str, query: str, context_length: int = 100) -> List[str]:
        """Extract snippets with highlighted matches"""
        snippets = []
        query_lower = query.lower()
        content_lower = content.lower()
        
        start = 0
        while True:
            pos = content_lower.find(query_lower, start)
            if pos == -1:
                break
            
            snippet_start = max(0, pos - context_length)
            snippet_end = min(len(content), pos + len(query) + context_length)
            
            snippet = content[snippet_start:snippet_end]
            if snippet_start > 0:
                snippet = "..." + snippet
            if snippet_end < len(content):
                snippet = snippet + "..."
            
            snippets.append(snippet)
            start = pos + 1
            
            if len(snippets) >= 3:
                break
        
        return snippets


# Mock data for demonstration
def get_mock_documents():
    """Return mock documents for demonstration"""
    return [
        {
            "id": 1,
            "title": "Q4 2024 Financial Report",
            "description": "Quarterly financial performance report for Q4 2024",
            "document_type": "financial",
            "status": "approved",
            "file_name": "Q4_2024_Financial_Report.pdf",
            "file_size": 2456789,
            "mime_type": "application/pdf",
            "current_version": 3,
            "ai_summary": "Q4 2024 showed strong revenue growth of 23% YoY, with operating margins improving to 18%. Key drivers include new enterprise contracts and reduced customer acquisition costs.",
            "ai_key_points": [
                "Revenue increased 23% year-over-year to $12.5M",
                "Operating margin improved from 15% to 18%",
                "Customer acquisition cost reduced by 12%",
                "Net new ARR of $2.1M added in Q4"
            ],
            "ai_sentiment": "positive",
            "tags": ["financial", "quarterly", "2024", "board-ready"],
            "is_confidential": True,
            "created_by": "Sarah Johnson",
            "created_at": "2024-12-15T10:30:00Z",
            "updated_at": "2024-12-20T14:45:00Z"
        },
        {
            "id": 2,
            "title": "Strategic Partnership Agreement - TechCorp",
            "description": "Partnership agreement with TechCorp for joint product development",
            "document_type": "contract",
            "status": "pending_review",
            "file_name": "TechCorp_Partnership_Agreement.docx",
            "file_size": 856432,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "current_version": 2,
            "ai_summary": "Three-year strategic partnership agreement with TechCorp covering joint product development, revenue sharing (60/40 split), and exclusive distribution rights in APAC region.",
            "ai_key_points": [
                "3-year term with automatic renewal",
                "60/40 revenue sharing arrangement",
                "Exclusive APAC distribution rights",
                "$500K minimum annual commitment",
                "Joint IP ownership for co-developed products"
            ],
            "ai_sentiment": "neutral",
            "tags": ["contract", "partnership", "legal", "techcorp"],
            "is_confidential": True,
            "created_by": "Mike Chen",
            "created_at": "2024-12-10T09:15:00Z",
            "updated_at": "2024-12-18T16:20:00Z"
        },
        {
            "id": 3,
            "title": "2025 Product Roadmap",
            "description": "Product development roadmap and feature priorities for 2025",
            "document_type": "presentation",
            "status": "approved",
            "file_name": "2025_Product_Roadmap.pptx",
            "file_size": 5234567,
            "mime_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "current_version": 5,
            "ai_summary": "Comprehensive 2025 product roadmap focusing on AI integration, mobile app launch, and enterprise features. Q1 priorities include Meeting Assistant and Document Management modules.",
            "ai_key_points": [
                "Q1: AI Meeting Assistant and Document Management",
                "Q2: Mobile app launch (iOS and Android)",
                "Q3: Enterprise SSO and advanced security",
                "Q4: International expansion features",
                "Total development investment: $2.5M"
            ],
            "ai_sentiment": "positive",
            "tags": ["roadmap", "product", "2025", "strategy"],
            "is_confidential": False,
            "created_by": "John Smith",
            "created_at": "2024-11-28T11:00:00Z",
            "updated_at": "2024-12-22T09:30:00Z"
        },
        {
            "id": 4,
            "title": "Employee Handbook 2025",
            "description": "Updated company policies and employee guidelines",
            "document_type": "policy",
            "status": "approved",
            "file_name": "Employee_Handbook_2025.pdf",
            "file_size": 1234567,
            "mime_type": "application/pdf",
            "current_version": 1,
            "ai_summary": "Updated employee handbook covering remote work policies, PTO changes, and new benefits including mental health support and professional development budget.",
            "ai_key_points": [
                "Hybrid work policy: 3 days in office minimum",
                "PTO increased to 25 days annually",
                "New $2,000 professional development budget",
                "Mental health support program added",
                "Updated parental leave to 16 weeks"
            ],
            "ai_sentiment": "positive",
            "tags": ["hr", "policy", "handbook", "2025"],
            "is_confidential": False,
            "created_by": "Emily Davis",
            "created_at": "2024-12-01T08:00:00Z",
            "updated_at": "2024-12-01T08:00:00Z"
        },
        {
            "id": 5,
            "title": "Board Meeting Minutes - December 2024",
            "description": "Minutes from the December 2024 board meeting",
            "document_type": "meeting_notes",
            "status": "approved",
            "file_name": "Board_Minutes_Dec_2024.pdf",
            "file_size": 456789,
            "mime_type": "application/pdf",
            "current_version": 1,
            "ai_summary": "December board meeting covered Q4 performance review, 2025 budget approval, and strategic initiatives. Key decisions include approval of $5M Series B extension and new advisory board member.",
            "ai_key_points": [
                "Q4 performance exceeded targets by 15%",
                "$5M Series B extension approved",
                "2025 budget of $18M approved",
                "New advisory board member: Jane Wilson",
                "Next board meeting: March 15, 2025"
            ],
            "ai_sentiment": "positive",
            "tags": ["board", "minutes", "december", "2024"],
            "is_confidential": True,
            "created_by": "Sarah Johnson",
            "created_at": "2024-12-20T15:00:00Z",
            "updated_at": "2024-12-20T15:00:00Z"
        }
    ]


def get_mock_document_versions(document_id: int):
    """Return mock version history for a document"""
    return [
        {
            "version_number": 3,
            "file_name": "Q4_2024_Financial_Report_v3.pdf",
            "file_size": 2456789,
            "change_summary": "Final approved version with board comments addressed",
            "created_by": "Sarah Johnson",
            "created_at": "2024-12-20T14:45:00Z"
        },
        {
            "version_number": 2,
            "file_name": "Q4_2024_Financial_Report_v2.pdf",
            "file_size": 2345678,
            "change_summary": "Updated projections based on December actuals",
            "created_by": "Sarah Johnson",
            "created_at": "2024-12-18T11:30:00Z"
        },
        {
            "version_number": 1,
            "file_name": "Q4_2024_Financial_Report_v1.pdf",
            "file_size": 2234567,
            "change_summary": "Initial draft",
            "created_by": "Sarah Johnson",
            "created_at": "2024-12-15T10:30:00Z"
        }
    ]


def get_mock_document_shares(document_id: int):
    """Return mock shares for a document"""
    return [
        {
            "id": 1,
            "shared_with": "Board Members",
            "shared_with_email": None,
            "permission": "view",
            "expires_at": "2025-01-31T23:59:59Z",
            "access_count": 5,
            "shared_by": "Sarah Johnson",
            "created_at": "2024-12-20T15:00:00Z"
        },
        {
            "id": 2,
            "shared_with": None,
            "shared_with_email": "investor@venture.com",
            "permission": "view",
            "expires_at": "2025-01-15T23:59:59Z",
            "access_count": 2,
            "shared_by": "John Smith",
            "created_at": "2024-12-21T09:00:00Z"
        }
    ]
