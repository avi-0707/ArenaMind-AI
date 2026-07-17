import os
import json
import logging
from typing import List, Optional
from google import genai
from app.schemas import StadiumDataRow, RecommendationResponse, Recommendation
from app.core.config import settings

logger = logging.getLogger(__name__)

_VALID_MODEL = None
_CLIENT = None

def _get_client() -> genai.Client:
    global _CLIENT
    if _CLIENT:
        return _CLIENT
        
    api_key = settings.GEMINI_API_KEY
    if api_key and api_key.strip():
        try:
            # Test if the API key works and has credits
            client = genai.Client(api_key=api_key.strip())
            # Quick test call
            client.models.generate_content(model='gemini-1.5-flash', contents='test')
            _CLIENT = client
            return _CLIENT
        except Exception as e:
            logger.warning(f"Developer API Key failed (possibly depleted credits). Falling back to Vertex AI: {e}")
            
    # Fallback to Vertex AI using Cloud Run ADC
    logger.info("Initializing Vertex AI Client using ADC...")
    _CLIENT = genai.Client(vertexai=True, location="us-central1", project="gen-lang-client-0391587001")
    return _CLIENT

def _get_valid_model(client: genai.Client) -> str:
    global _VALID_MODEL
    if _VALID_MODEL:
        return _VALID_MODEL
        
    try:
        models = client.models.list()
        for m in models:
            name = getattr(m, 'name', '').lower()
            if 'flash' in name and 'preview' not in name and 'gemini' in name:
                _VALID_MODEL = m.name
                logger.info(f"Dynamically selected model: {_VALID_MODEL}")
                return _VALID_MODEL
    except Exception as e:
        logger.warning(f"Could not list models: {e}")
        
    # Default Vertex AI models
    _VALID_MODEL = 'gemini-1.5-flash-002'
    logger.info(f"Fallback selected model: {_VALID_MODEL}")
    return _VALID_MODEL

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

def generate_recommendations(data: List[StadiumDataRow]) -> RecommendationResponse:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.info("No GEMINI_API_KEY found, will attempt Vertex AI fallback.")

    try:
        client = _get_client()
        
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
            model=_get_valid_model(client),
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
        logger.error(f"Gemini API Error in generate_recommendations: {e}", exc_info=True)
        return _get_fallback_recommendations(data)

def generate_companion_response(query: str, context: str = "") -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.info("No GEMINI_API_KEY found, will attempt Vertex AI fallback.")

    try:
        client = _get_client()
        
        prompt = f"""
        You are ArenaMind MatchDay Companion, the official intelligent assistant for fans at the FIFA World Cup 2026.
        Assist fans with navigation, accessibility, food, parking, and emergencies.
        Keep your responses concierge-like: premium, reassuring, clear, and extremely concise. 
        If a fan reports a serious emergency, assertively advise them to contact security immediately and stay safe.
        
        Context provided from the app (like their location/gate): {context}
        
        Fan Query: {query}
        """
        
        response = client.models.generate_content(
            model=_get_valid_model(client),
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Companion AI Error: {e}", exc_info=True)
        return "Credits expired"

def generate_copilot_response(query: str, context: str = "") -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.info("No GEMINI_API_KEY found, will attempt Vertex AI fallback.")

    try:
        client = _get_client()
        
        prompt = f"""
        You are ArenaMind Ops Copilot, an enterprise AI for FIFA World Cup 2026 Stadium Command.
        Assist stadium staff, volunteers, and security personnel with Standard Operating Procedures (SOPs), dynamic resource allocation, translation, and critical incident management.
        Your tone must be highly professional, structured, military-precise, and concise. Use bullet points for immediate readability in high-stress situations.
        
        Live Operations Context (Recent operations data, staffing levels, etc.): {context}
        
        Staff Query: {query}
        """
        
        response = client.models.generate_content(
            model=_get_valid_model(client),
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Copilot AI Error: {e}", exc_info=True)
        return "Credits expired"
