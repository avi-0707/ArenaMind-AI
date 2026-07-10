from pydantic import BaseModel, Field
from typing import List, Optional

class StadiumDataRow(BaseModel):
    timestamp: str
    gate: str
    crowd_count: int
    incident_type: Optional[str] = None
    volunteers_available: int
    language: Optional[str] = None
    weather: Optional[str] = None
    severity: Optional[str] = None
    accessibility_issue: Optional[str] = None
    medical_request: Optional[str] = None
    security_alert: Optional[str] = None
    transport_delay: Optional[str] = None
    notes: Optional[str] = None
    operator_name: Optional[str] = None
    status: Optional[str] = None

class Recommendation(BaseModel):
    Risk_Level: str = Field(description="High, Medium, or Low")
    Reasoning: str = Field(description="Explanation of why this recommendation is being made based on the data")
    Confidence: int = Field(description="Confidence percentage (0-100)")
    Recommended_Action: str = Field(description="Specific actionable advice for volunteers")
    Priority: str = Field(description="High, Medium, or Low")
    Status: str = Field(description="Pending Review or Action Taken")
    Expected_Improvement: str = Field(description="What will happen if this action is taken")
    Estimated_Resolution_Time: str = Field(description="Estimated time to resolve the issue (e.g., '15 mins')")

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]

class CompanionRequest(BaseModel):
    query: str
    context: Optional[str] = ""
