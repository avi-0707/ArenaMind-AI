import os
import json
from typing import List, Optional
from google import genai
from app.schemas import StadiumDataRow, RecommendationResponse, Recommendation
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)

def _get_api_key(user_api_key: Optional[str]) -> str:
    """Determine which API key to use. Priority: User > Server"""
    logger.info(f"API Provider Selection: Evaluating keys. User Key Present: {bool(user_api_key)}, Server Key Present: {bool(settings.GEMINI_API_KEY)}")
    if user_api_key and user_api_key.strip():
        logger.info("API Provider Selection: Using Personal User API Key")
        return user_api_key.strip()
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        logger.info("API Provider Selection: Using Server-side Fallback (Complimentary) API Key")
        return settings.GEMINI_API_KEY.strip()
    logger.error("API Provider Selection Failed: No API keys available in environment or request.")
    raise ValueError("No Gemini API key available. Configure server API key or provide a personal key.")

def _get_fallback_recommendations(data: List[StadiumDataRow]) -> RecommendationResponse:
    recs = []
    
    total_crowd = sum(row.crowd_count for row in data)
    avg_crowd = total_crowd / len(data) if data else 0

    incidents = [row for row in data if row.incident_type and row.incident_type.lower() != 'none']
    
    for incident in incidents:
        recs.append(Recommendation(
            Risk_Level="High",
            Reasoning=f"Incident '{incident.incident_type}' detected at {incident.gate} with crowd of {incident.crowd_count}.",
            Confidence=90,
            Recommended_Action=f"Deploy medical/security personnel to {incident.gate} immediately.",
            Priority="High",
            Status="Pending Review",
            Expected_Improvement="Immediate de-escalation of the incident and crowd safety ensured.",
            Estimated_Resolution_Time="10 mins"
        ))
        
    for row in data:
        if row.crowd_count > avg_crowd * 1.5:
            recs.append(Recommendation(
                Risk_Level="Medium",
                Reasoning=f"Crowd at {row.gate} is {row.crowd_count}, which is 50% above average.",
                Confidence=85,
                Recommended_Action=f"Deploy 2 additional volunteers to {row.gate} for crowd control.",
                Priority="Medium",
                Status="Pending Review",
                Expected_Improvement="Reduced bottleneck and improved flow at the gate.",
                Estimated_Resolution_Time="15 mins"
            ))

    if not recs:
        recs.append(Recommendation(
            Risk_Level="Low",
            Reasoning="All metrics are within normal operational limits.",
            Confidence=95,
            Recommended_Action="Continue normal monitoring schedule.",
            Priority="Low",
            Status="Pending Review",
            Expected_Improvement="Operations remain stable.",
            Estimated_Resolution_Time="N/A"
        ))

    return RecommendationResponse(recommendations=recs[:5]) # limit to 5

def generate_recommendations(data: List[StadiumDataRow], user_api_key: Optional[str] = None) -> RecommendationResponse:
    try:
        api_key = _get_api_key(user_api_key)
    except ValueError as e:
        print(f"Error: {e}")
        return _get_fallback_recommendations(data)

    try:
        client = genai.Client(api_key=api_key)
        
        # Convert data to a compact summary for the prompt
        # We don't want to send huge arrays, so we summarize the latest/most relevant or send up to 50 rows.
        sample_data = [row.model_dump() for row in data[-50:]]
        
        prompt = f"""
        You are ArenaMind Decision Intelligence, a highly advanced AI operating the FIFA World Cup 2026.
        Analyze the following stadium operations data and generate authoritative, executive-level strategic directives.
        Your tone must be professional, decisive, and data-driven—like a senior operational director briefing FIFA executives.
        Always return a valid JSON object matching this schema:
        {{
            "recommendations": [
                {{
                    "Risk_Level": "High|Medium|Low",
                    "Reasoning": "Explanation string",
                    "Confidence": int,
                    "Recommended_Action": "Action string",
                    "Priority": "High|Medium|Low",
                    "Status": "Pending Review",
                    "Expected_Improvement": "Improvement string",
                    "Estimated_Resolution_Time": "Time string"
                }}
            ]
        }}
        
        Data to analyze: {json.dumps(sample_data)}
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        
        # Clean the markdown formatting if present
        text = response.text
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        parsed_json = json.loads(text.strip())
        
        # Validate through pydantic
        return RecommendationResponse(**parsed_json)
        
    except Exception as e:
        logger.error(f"Gemini API Error (Recommendations): {e}", exc_info=True)
        # If it's a 401/403 or quota error and it's the user's key, we should let the frontend know, 
        # but the fallback engine covers failures smoothly for now. To strictly bubble up the auth error:
        if "API key not valid" in str(e) or "401" in str(e) or "403" in str(e):
            raise ValueError(f"Invalid API Key: {e}")
        logger.info("Falling back to local rule-based engine.")
        return _get_fallback_recommendations(data)

def generate_companion_response(query: str, context: str = "", user_api_key: Optional[str] = None) -> str:
    try:
        api_key = _get_api_key(user_api_key)
    except ValueError as e:
        return "I'm sorry, my AI features are currently offline because the Gemini API key is not configured."

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are ArenaMind MatchDay Companion, the official intelligent assistant for fans at the FIFA World Cup 2026.
        Assist fans with navigation, accessibility, food, parking, and emergencies.
        Keep your responses concierge-like: premium, reassuring, clear, and extremely concise. 
        If a fan reports a serious emergency, assertively advise them to contact security immediately and stay safe.
        
        Context provided from the app (like their location/gate): {context}
        
        Fan Query: {query}
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Companion AI Error: {e}", exc_info=True)
        if "API key not valid" in str(e) or "401" in str(e) or "403" in str(e):
            raise ValueError(f"Invalid API Key: {e}")
        return "I'm having trouble connecting to my brain right now. Please try asking again in a moment or find a nearby volunteer for immediate assistance."

def generate_copilot_response(query: str, context: str = "", user_api_key: Optional[str] = None) -> str:
    try:
        api_key = _get_api_key(user_api_key)
    except ValueError as e:
        return "Ops Copilot is currently offline. Missing API Key."

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are ArenaMind Ops Copilot, an enterprise AI for FIFA World Cup 2026 Stadium Command.
        Assist stadium staff, volunteers, and security personnel with Standard Operating Procedures (SOPs), dynamic resource allocation, translation, and critical incident management.
        Your tone must be highly professional, structured, military-precise, and concise. Use bullet points for immediate readability in high-stress situations.
        
        Live Operations Context (Recent operations data, staffing levels, etc.): {context}
        
        Staff Query: {query}
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Copilot AI Error: {e}", exc_info=True)
        if "API key not valid" in str(e) or "401" in str(e) or "403" in str(e):
            raise ValueError(f"Invalid API Key: {e}")
        return "Error connecting to AI backend. Please refer to your physical handbook."

def verify_api_key(user_api_key: str) -> bool:
    """Verifies if the provided API key is valid by making a lightweight request."""
    try:
        client = genai.Client(api_key=user_api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents="Respond with 'OK'",
        )
        return True
    except Exception as e:
        logger.error(f"Verify API Key Error: {e}", exc_info=True)
        return False
