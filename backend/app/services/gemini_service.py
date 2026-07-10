import os
import json
from typing import List
from google import genai
from app.schemas import StadiumDataRow, RecommendationResponse, Recommendation
from app.core.config import settings

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
        print("No GEMINI_API_KEY found, using fallback engine.")
        return _get_fallback_recommendations(data)

    try:
        client = genai.Client(api_key=api_key)
        
        # Convert data to a compact summary for the prompt
        # We don't want to send huge arrays, so we summarize the latest/most relevant or send up to 50 rows.
        sample_data = [row.model_dump() for row in data[-50:]]
        
        prompt = f"""
        You are a Volunteer Co-Pilot AI expert for stadium operations.
        Analyze the following stadium data and generate actionable recommendations.
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
            model='gemini-2.5-flash',
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
        print(f"Gemini API Error: {e}")
        print("Falling back to local rule-based engine.")
        return _get_fallback_recommendations(data)

def generate_companion_response(query: str, context: str = "") -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return "I'm sorry, my AI features are currently offline because the Gemini API key is not configured. Please contact the administrator."

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a helpful, friendly MatchDay Companion AI for the FIFA World Cup 2026.
        Your job is to assist fans with navigation, accessibility, food, parking, and emergencies.
        Keep your responses concise, clear, and reassuring.
        If a fan reports a serious emergency, advise them to contact security immediately and stay safe.
        
        Context provided from the app (like their location/gate): {context}
        
        Fan Query: {query}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        print(f"Companion AI Error: {e}")
        return "I'm having trouble connecting to my brain right now. Please try asking again in a moment or find a nearby volunteer for immediate assistance."

def generate_copilot_response(query: str, context: str = "") -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return "Ops Copilot is currently offline. Missing API Key."

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an Ops Copilot AI for the FIFA World Cup 2026.
        Your job is to assist stadium staff, volunteers, and security personnel with Standard Operating Procedures (SOPs), dynamic resource allocation, translation, and incident management.
        Keep your responses professional, concise, and structured. Use bullet points where necessary.
        
        Live Operations Context (Recent operations data, staffing levels, etc.): {context}
        
        Staff Query: {query}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        print(f"Copilot AI Error: {e}")
        return "Error connecting to AI backend. Please refer to your physical handbook."
