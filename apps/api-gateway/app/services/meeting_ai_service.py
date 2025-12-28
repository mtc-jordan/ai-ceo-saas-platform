"""AI service for meeting summarization and action item extraction."""
import os
import json
import re
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from openai import OpenAI


class MeetingAIService:
    """
    AI-powered service for analyzing meeting transcripts.
    
    Features:
    - Executive summary generation
    - Key points extraction
    - Action item identification
    - Decision tracking
    - Topic segmentation
    - Sentiment analysis
    """
    
    def __init__(self):
        self.client = None
        self._init_client()
        
        # Prompts for different analysis tasks
        self.summary_prompt = """You are an expert meeting analyst. Analyze the following meeting transcript and provide a comprehensive summary.

Meeting Transcript:
{transcript}

Provide your analysis in the following JSON format:
{{
    "executive_summary": "A 2-3 paragraph executive summary of the meeting",
    "key_points": ["List of 5-10 key discussion points"],
    "decisions": ["List of decisions made during the meeting"],
    "topics_discussed": [
        {{"topic": "Topic name", "summary": "Brief summary of discussion on this topic"}}
    ],
    "next_steps": ["List of agreed next steps"],
    "open_questions": ["Any unresolved questions or issues"]
}}

Be concise but comprehensive. Focus on business-relevant information."""

        self.action_items_prompt = """You are an expert at identifying action items from meeting transcripts. Analyze the following transcript and extract all action items.

Meeting Transcript:
{transcript}

For each action item, identify:
1. The specific task or action
2. Who is responsible (if mentioned)
3. The deadline (if mentioned)
4. Priority level (critical, high, medium, low)
5. Context from the meeting

Provide your response in the following JSON format:
{{
    "action_items": [
        {{
            "title": "Brief title of the action item",
            "description": "Detailed description of what needs to be done",
            "assignee": "Name of person responsible (or null if not specified)",
            "due_date_hint": "Any mentioned deadline or timeframe (or null)",
            "priority": "critical/high/medium/low",
            "context": "Relevant quote or context from the transcript",
            "confidence": 0.0-1.0
        }}
    ]
}}

Be thorough but only include genuine action items, not general discussion points."""

        self.sentiment_prompt = """Analyze the sentiment and tone of this meeting transcript.

Meeting Transcript:
{transcript}

Provide your analysis in the following JSON format:
{{
    "overall_sentiment": "positive/neutral/negative/mixed",
    "sentiment_score": -1.0 to 1.0,
    "tone": "collaborative/tense/productive/casual/formal",
    "engagement_level": "high/medium/low",
    "key_emotions": ["List of detected emotions"],
    "concerns_raised": ["Any concerns or frustrations expressed"],
    "positive_highlights": ["Positive moments or achievements mentioned"]
}}"""

    def _init_client(self):
        """Initialize OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL")
        
        if api_key:
            self.client = OpenAI(
                api_key=api_key,
                base_url=base_url if base_url else None
            )
    
    async def analyze_meeting(
        self,
        transcript: str,
        generate_summary: bool = True,
        extract_action_items: bool = True,
        identify_decisions: bool = True,
        track_topics: bool = True,
        analyze_sentiment: bool = False
    ) -> Dict[str, Any]:
        """
        Perform comprehensive analysis of a meeting transcript.
        
        Args:
            transcript: The meeting transcript text
            generate_summary: Whether to generate executive summary
            extract_action_items: Whether to extract action items
            identify_decisions: Whether to identify decisions
            track_topics: Whether to track topics discussed
            analyze_sentiment: Whether to analyze sentiment
        
        Returns:
            Dictionary with analysis results
        """
        if not self.client:
            return self._get_mock_analysis(transcript)
        
        results = {}
        
        # Generate summary (includes decisions and topics)
        if generate_summary or identify_decisions or track_topics:
            summary_result = await self._generate_summary(transcript)
            results.update(summary_result)
        
        # Extract action items
        if extract_action_items:
            action_items = await self._extract_action_items(transcript)
            results["action_items"] = action_items
        
        # Analyze sentiment
        if analyze_sentiment:
            sentiment = await self._analyze_sentiment(transcript)
            results["sentiment_analysis"] = sentiment
        
        return results
    
    async def _generate_summary(self, transcript: str) -> Dict[str, Any]:
        """Generate meeting summary using AI."""
        try:
            prompt = self.summary_prompt.format(transcript=transcript[:15000])  # Limit length
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert meeting analyst. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON from response
            result = self._parse_json_response(content)
            
            return {
                "executive_summary": result.get("executive_summary", ""),
                "key_points": result.get("key_points", []),
                "decisions": result.get("decisions", []),
                "topics": result.get("topics_discussed", []),
                "next_steps": result.get("next_steps", []),
                "open_questions": result.get("open_questions", [])
            }
        except Exception as e:
            print(f"Error generating summary: {e}")
            return self._get_mock_summary()
    
    async def _extract_action_items(self, transcript: str) -> List[Dict[str, Any]]:
        """Extract action items from transcript."""
        try:
            prompt = self.action_items_prompt.format(transcript=transcript[:15000])
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at identifying action items. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            result = self._parse_json_response(content)
            
            action_items = result.get("action_items", [])
            
            # Process and validate action items
            processed_items = []
            for item in action_items:
                processed_item = {
                    "title": item.get("title", "Untitled Action Item"),
                    "description": item.get("description", ""),
                    "assignee_name": item.get("assignee"),
                    "priority": item.get("priority", "medium"),
                    "context": item.get("context", ""),
                    "confidence_score": item.get("confidence", 0.8),
                    "ai_extracted": True
                }
                
                # Parse due date hint
                due_hint = item.get("due_date_hint")
                if due_hint:
                    processed_item["due_date"] = self._parse_due_date_hint(due_hint)
                
                processed_items.append(processed_item)
            
            return processed_items
        except Exception as e:
            print(f"Error extracting action items: {e}")
            return []
    
    async def _analyze_sentiment(self, transcript: str) -> Dict[str, Any]:
        """Analyze meeting sentiment."""
        try:
            prompt = self.sentiment_prompt.format(transcript=transcript[:10000])
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at sentiment analysis. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            return self._parse_json_response(content)
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return {
                "overall_sentiment": "neutral",
                "sentiment_score": 0.0,
                "tone": "professional",
                "engagement_level": "medium"
            }
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Parse JSON from AI response, handling markdown code blocks."""
        # Remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from the content
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return {}
    
    def _parse_due_date_hint(self, hint: str) -> Optional[datetime]:
        """Parse a due date hint into a datetime object."""
        if not hint:
            return None
        
        hint_lower = hint.lower()
        now = datetime.utcnow()
        
        # Common patterns
        if "today" in hint_lower:
            return now.replace(hour=17, minute=0, second=0, microsecond=0)
        elif "tomorrow" in hint_lower:
            return (now + timedelta(days=1)).replace(hour=17, minute=0, second=0, microsecond=0)
        elif "end of week" in hint_lower or "this week" in hint_lower:
            days_until_friday = (4 - now.weekday()) % 7
            return (now + timedelta(days=days_until_friday)).replace(hour=17, minute=0, second=0, microsecond=0)
        elif "next week" in hint_lower:
            days_until_next_monday = (7 - now.weekday()) % 7 + 7
            return (now + timedelta(days=days_until_next_monday)).replace(hour=17, minute=0, second=0, microsecond=0)
        elif "end of month" in hint_lower or "this month" in hint_lower:
            if now.month == 12:
                return datetime(now.year + 1, 1, 1) - timedelta(days=1)
            else:
                return datetime(now.year, now.month + 1, 1) - timedelta(days=1)
        elif "asap" in hint_lower or "urgent" in hint_lower:
            return now + timedelta(days=1)
        
        # Try to parse specific dates
        date_patterns = [
            r'(\d{1,2})/(\d{1,2})/(\d{2,4})',  # MM/DD/YYYY
            r'(\d{4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, hint)
            if match:
                try:
                    groups = match.groups()
                    if len(groups[0]) == 4:  # YYYY-MM-DD
                        return datetime(int(groups[0]), int(groups[1]), int(groups[2]))
                    else:  # MM/DD/YYYY
                        year = int(groups[2])
                        if year < 100:
                            year += 2000
                        return datetime(year, int(groups[0]), int(groups[1]))
                except:
                    pass
        
        # Default: 1 week from now
        return now + timedelta(weeks=1)
    
    def _get_mock_analysis(self, transcript: str) -> Dict[str, Any]:
        """Return mock analysis when AI is not available."""
        return {
            **self._get_mock_summary(),
            "action_items": [
                {
                    "title": "Review meeting notes",
                    "description": "Review and distribute meeting notes to all participants",
                    "assignee_name": None,
                    "priority": "medium",
                    "context": "From meeting transcript",
                    "confidence_score": 0.7,
                    "ai_extracted": True,
                    "due_date": datetime.utcnow() + timedelta(days=2)
                }
            ],
            "sentiment_analysis": {
                "overall_sentiment": "neutral",
                "sentiment_score": 0.0,
                "tone": "professional",
                "engagement_level": "medium"
            }
        }
    
    def _get_mock_summary(self) -> Dict[str, Any]:
        """Return mock summary when AI is not available."""
        return {
            "executive_summary": "Meeting transcript received. AI analysis is currently unavailable. Please configure the OpenAI API key to enable automatic summarization.",
            "key_points": ["Meeting recorded successfully", "Transcript available for review"],
            "decisions": [],
            "topics": [],
            "next_steps": ["Configure AI integration for automatic analysis"],
            "open_questions": []
        }
    
    async def generate_follow_up_email(
        self,
        meeting_title: str,
        summary: str,
        action_items: List[Dict[str, Any]],
        participants: List[str]
    ) -> str:
        """Generate a follow-up email for the meeting."""
        if not self.client:
            return self._get_mock_follow_up_email(meeting_title, summary, action_items)
        
        prompt = f"""Generate a professional follow-up email for a meeting.

Meeting Title: {meeting_title}
Summary: {summary}
Action Items: {json.dumps(action_items, indent=2)}
Participants: {', '.join(participants)}

The email should:
1. Thank participants for attending
2. Summarize key discussion points
3. List action items with owners and deadlines
4. Include any next steps

Keep the tone professional but friendly."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are a professional executive assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating follow-up email: {e}")
            return self._get_mock_follow_up_email(meeting_title, summary, action_items)
    
    def _get_mock_follow_up_email(
        self,
        meeting_title: str,
        summary: str,
        action_items: List[Dict[str, Any]]
    ) -> str:
        """Generate a basic follow-up email template."""
        action_items_text = "\n".join([
            f"- {item.get('title', 'Action item')}: {item.get('assignee_name', 'TBD')}"
            for item in action_items
        ]) or "- No action items recorded"
        
        return f"""Subject: Follow-up: {meeting_title}

Hi Team,

Thank you for attending today's meeting: {meeting_title}

Summary:
{summary}

Action Items:
{action_items_text}

Please let me know if you have any questions or need clarification on any items.

Best regards"""


# Singleton instance
meeting_ai_service = MeetingAIService()


async def analyze_meeting_transcript(
    transcript: str,
    generate_summary: bool = True,
    extract_action_items: bool = True,
    identify_decisions: bool = True,
    track_topics: bool = True,
    analyze_sentiment: bool = False
) -> Dict[str, Any]:
    """Convenience function to analyze a meeting transcript."""
    return await meeting_ai_service.analyze_meeting(
        transcript,
        generate_summary,
        extract_action_items,
        identify_decisions,
        track_topics,
        analyze_sentiment
    )
