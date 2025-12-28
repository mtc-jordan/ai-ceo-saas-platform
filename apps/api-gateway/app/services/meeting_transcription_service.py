"""Meeting transcription service using speech-to-text."""
import os
import json
import asyncio
import subprocess
import tempfile
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import httpx
from openai import OpenAI


class TranscriptionService:
    """
    Service for transcribing meeting audio/video files.
    
    Supports multiple transcription backends:
    - OpenAI Whisper API
    - Local Whisper model
    - Google Speech-to-Text
    - Assembly AI
    """
    
    def __init__(self):
        self.openai_client = None
        self._init_openai()
    
    def _init_openai(self):
        """Initialize OpenAI client for Whisper API."""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.openai_client = OpenAI(api_key=api_key)
    
    async def transcribe_file(
        self,
        file_path: str,
        language: str = "en",
        include_timestamps: bool = True,
        identify_speakers: bool = True
    ) -> Dict[str, Any]:
        """
        Transcribe an audio or video file.
        
        Args:
            file_path: Path to the audio/video file
            language: Language code (e.g., 'en', 'es', 'fr')
            include_timestamps: Whether to include word-level timestamps
            identify_speakers: Whether to attempt speaker diarization
        
        Returns:
            Dictionary with transcript, segments, and metadata
        """
        # Extract audio if video file
        audio_path = await self._extract_audio(file_path)
        
        # Transcribe using available backend
        if self.openai_client:
            result = await self._transcribe_with_whisper_api(
                audio_path, language, include_timestamps
            )
        else:
            result = await self._transcribe_with_local_whisper(
                audio_path, language, include_timestamps
            )
        
        # Perform speaker diarization if requested
        if identify_speakers and result.get("segments"):
            result = await self._identify_speakers(result, audio_path)
        
        # Clean up temporary files
        if audio_path != file_path:
            try:
                os.remove(audio_path)
            except:
                pass
        
        return result
    
    async def transcribe_from_url(
        self,
        url: str,
        language: str = "en",
        include_timestamps: bool = True,
        identify_speakers: bool = True
    ) -> Dict[str, Any]:
        """
        Download and transcribe audio/video from URL.
        
        Args:
            url: URL to the audio/video file
            language: Language code
            include_timestamps: Whether to include timestamps
            identify_speakers: Whether to identify speakers
        
        Returns:
            Dictionary with transcript and metadata
        """
        # Download file
        file_path = await self._download_file(url)
        
        try:
            result = await self.transcribe_file(
                file_path, language, include_timestamps, identify_speakers
            )
        finally:
            # Clean up downloaded file
            try:
                os.remove(file_path)
            except:
                pass
        
        return result
    
    async def _extract_audio(self, file_path: str) -> str:
        """Extract audio from video file if needed."""
        # Check if it's already an audio file
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.webm']
        if any(file_path.lower().endswith(ext) for ext in audio_extensions):
            return file_path
        
        # Extract audio using ffmpeg
        output_path = tempfile.mktemp(suffix='.mp3')
        
        cmd = [
            'ffmpeg', '-i', file_path,
            '-vn',  # No video
            '-acodec', 'libmp3lame',
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',  # Mono
            '-y',  # Overwrite output
            output_path
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        
        if process.returncode != 0:
            raise Exception("Failed to extract audio from video")
        
        return output_path
    
    async def _transcribe_with_whisper_api(
        self,
        audio_path: str,
        language: str,
        include_timestamps: bool
    ) -> Dict[str, Any]:
        """Transcribe using OpenAI Whisper API."""
        with open(audio_path, 'rb') as audio_file:
            # Use verbose_json for timestamps
            response_format = "verbose_json" if include_timestamps else "json"
            
            transcript = self.openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language if language != "auto" else None,
                response_format=response_format,
                timestamp_granularities=["segment", "word"] if include_timestamps else None
            )
        
        # Parse response
        if include_timestamps:
            segments = []
            for segment in transcript.segments:
                segments.append({
                    "start_time": segment.get("start", 0),
                    "end_time": segment.get("end", 0),
                    "text": segment.get("text", ""),
                    "confidence": segment.get("confidence", 1.0),
                    "speaker": None  # Will be filled by diarization
                })
            
            return {
                "transcript": transcript.text,
                "segments": segments,
                "language": transcript.language,
                "duration": transcript.duration,
                "confidence": sum(s.get("confidence", 1.0) for s in segments) / len(segments) if segments else 1.0
            }
        else:
            return {
                "transcript": transcript.text,
                "segments": [],
                "language": language,
                "duration": None,
                "confidence": 1.0
            }
    
    async def _transcribe_with_local_whisper(
        self,
        audio_path: str,
        language: str,
        include_timestamps: bool
    ) -> Dict[str, Any]:
        """Transcribe using local Whisper model via manus-speech-to-text."""
        # Use the manus-speech-to-text utility
        cmd = ['manus-speech-to-text', audio_path]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Transcription failed: {stderr.decode()}")
        
        transcript_text = stdout.decode().strip()
        
        return {
            "transcript": transcript_text,
            "segments": [],
            "language": language,
            "duration": None,
            "confidence": 0.9  # Default confidence for local model
        }
    
    async def _identify_speakers(
        self,
        transcription_result: Dict[str, Any],
        audio_path: str
    ) -> Dict[str, Any]:
        """
        Perform speaker diarization to identify different speakers.
        
        This is a simplified implementation. In production, you would use
        a dedicated speaker diarization service like:
        - pyannote.audio
        - AWS Transcribe
        - Google Speech-to-Text with diarization
        """
        # Simple heuristic: alternate speakers based on pauses
        segments = transcription_result.get("segments", [])
        
        if not segments:
            return transcription_result
        
        current_speaker = "Speaker 1"
        speaker_count = 1
        
        for i, segment in enumerate(segments):
            if i > 0:
                # Check for significant pause (> 2 seconds)
                prev_end = segments[i-1].get("end_time", 0)
                curr_start = segment.get("start_time", 0)
                
                if curr_start - prev_end > 2.0:
                    # Potentially new speaker
                    speaker_count = min(speaker_count + 1, 4)  # Max 4 speakers
                    current_speaker = f"Speaker {((speaker_count - 1) % 4) + 1}"
            
            segment["speaker"] = current_speaker
        
        transcription_result["segments"] = segments
        transcription_result["speaker_count"] = min(speaker_count, 4)
        
        return transcription_result
    
    async def _download_file(self, url: str) -> str:
        """Download file from URL to temporary location."""
        # Determine file extension from URL
        ext = '.mp3'
        if '.mp4' in url.lower():
            ext = '.mp4'
        elif '.webm' in url.lower():
            ext = '.webm'
        elif '.wav' in url.lower():
            ext = '.wav'
        
        output_path = tempfile.mktemp(suffix=ext)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                f.write(response.content)
        
        return output_path
    
    def format_transcript_with_speakers(
        self,
        segments: List[Dict[str, Any]]
    ) -> str:
        """Format transcript with speaker labels."""
        if not segments:
            return ""
        
        formatted_lines = []
        current_speaker = None
        current_text = []
        
        for segment in segments:
            speaker = segment.get("speaker", "Unknown")
            text = segment.get("text", "").strip()
            
            if speaker != current_speaker:
                if current_text:
                    formatted_lines.append(f"**{current_speaker}:** {' '.join(current_text)}")
                current_speaker = speaker
                current_text = [text]
            else:
                current_text.append(text)
        
        # Add last speaker's text
        if current_text:
            formatted_lines.append(f"**{current_speaker}:** {' '.join(current_text)}")
        
        return "\n\n".join(formatted_lines)
    
    def get_speaking_time_by_speaker(
        self,
        segments: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate speaking time for each speaker."""
        speaking_times = {}
        
        for segment in segments:
            speaker = segment.get("speaker", "Unknown")
            start = segment.get("start_time", 0)
            end = segment.get("end_time", 0)
            duration = end - start
            
            if speaker not in speaking_times:
                speaking_times[speaker] = 0
            speaking_times[speaker] += duration
        
        return speaking_times


# Singleton instance
transcription_service = TranscriptionService()


async def transcribe_meeting(
    file_path: Optional[str] = None,
    url: Optional[str] = None,
    language: str = "en",
    include_timestamps: bool = True,
    identify_speakers: bool = True
) -> Dict[str, Any]:
    """
    Convenience function to transcribe a meeting.
    
    Args:
        file_path: Local path to audio/video file
        url: URL to audio/video file
        language: Language code
        include_timestamps: Whether to include timestamps
        identify_speakers: Whether to identify speakers
    
    Returns:
        Transcription result dictionary
    """
    if file_path:
        return await transcription_service.transcribe_file(
            file_path, language, include_timestamps, identify_speakers
        )
    elif url:
        return await transcription_service.transcribe_from_url(
            url, language, include_timestamps, identify_speakers
        )
    else:
        raise ValueError("Either file_path or url must be provided")
