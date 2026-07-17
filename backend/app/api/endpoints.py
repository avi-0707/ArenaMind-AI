from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import List
import pandas as pd
import io
import logging

from app.schemas import StadiumDataRow, RecommendationResponse
from app.services.gemini_service import generate_recommendations
from app.services.preprocessor import clean_dataframe

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


@router.post("/upload", response_model=List[StadiumDataRow])
async def upload_file(file: UploadFile = File(...)):
    """
    Upload pipeline:
    File → Pandas → Preprocess (NaN clean) → Pydantic validation → JSON response
    """
    try:
        logger.info(f"Received file upload: {file.filename!r} ({file.content_type})")
        contents = await file.read()
        filename = (file.filename or "").lower()

        # 1. Uploaded filename
        print(f"DEBUG [1]: Uploaded filename: {filename}")

        # ── Parse raw file ────────────────────────────────────────────────────
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            try:
                df = pd.read_excel(io.BytesIO(contents))
            except ImportError:
                logger.error("Excel engine openpyxl is missing")
                raise HTTPException(
                    status_code=400,
                    detail="Excel support is not installed on the server. Please contact the administrator."
                )
        elif filename.endswith(".json"):
            df = pd.read_json(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{filename}'"
            )

        # 2. DataFrame columns
        print(f"DEBUG [2]: DataFrame columns: {df.columns.tolist()}")

        # 3. DataFrame dtypes
        print(f"DEBUG [3]: DataFrame dtypes: {df.dtypes.to_dict()}")

        # 4. First 5 rows
        print(f"DEBUG [4]: First 5 rows:\n{df.head().to_dict(orient='records')}")

        # ── Preprocess: clean NaN, normalize types ───────────────────────────
        try:
            # Let's do a pure DataFrame level sanitization instead of row-by-row iteration
            df = df.fillna(value={
                'incident_type': 'None',
                'language': 'Unknown',
                'weather': 'Unknown',
                'gate': 'Unknown',
                'timestamp': '00:00'
            })
            # For numeric columns, fillna with 0
            for col in ['crowd_count', 'volunteers_available']:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

            # Replace any remaining NaN with None (Pydantic friendly)
            df = df.where(pd.notnull(df), None)

            records = df.to_dict(orient='records')
        except Exception as ve:
            logger.warning(f"Preprocessing validation error: {ve}")
            raise HTTPException(status_code=400, detail=str(ve))

        # ── Pydantic validation ───────────────────────────────────────────────
        validated: List[StadiumDataRow] = []
        validation_errors = []
        
        for i, record in enumerate(records):
            if i == 0:
                # 5. The exact record BEFORE creating StadiumDataRow
                print(f"DEBUG [5]: Record BEFORE StadiumDataRow (row 0): {record}")
                
            try:
                row_model = StadiumDataRow(**record)
                validated.append(row_model)
                if i == 0:
                    # 6. The sanitized record AFTER preprocessing (actually after Pydantic)
                    print(f"DEBUG [6]: Sanitized record AFTER Pydantic (row 0): {row_model.model_dump()}")
            except Exception as e:
                validation_errors.append(f"Row {i + 1}: {e}")
                logger.error(f"Pydantic validation failed at row {i + 1}: {e} | Record: {record}")

        if validation_errors:
            summary = "; ".join(validation_errors[:3])
            if len(validation_errors) > 3:
                summary += f" ... (+{len(validation_errors) - 3} more errors)"
            raise HTTPException(status_code=422, detail=f"Data validation failed: {summary}")

        logger.info(f"Successfully validated and processed {len(validated)} records")
        
        # 7. The response JSON returned to the frontend (printed in chunks if large)
        resp = [v.model_dump() for v in validated]
        print(f"DEBUG [7]: Returning JSON (first 2 records): {resp[:2]}")
        return validated

    except pd.errors.EmptyDataError:
        logger.error("The uploaded file is empty")
        raise HTTPException(status_code=400, detail="The file is empty. Please upload a file with data.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing file: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(data: List[StadiumDataRow] = Body(...)):
    if not data:
        logger.warning("Recommendations requested with empty data")
        raise HTTPException(status_code=400, detail="No data provided")

    logger.info(f"Generating AI recommendations for {len(data)} records")
    try:
        return generate_recommendations(data)
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

from app.schemas import CompanionRequest
from app.services.gemini_service import generate_companion_response, generate_copilot_response

@router.post("/companion")
def get_companion_response(request: CompanionRequest = Body(...)):
    if not request.query:
        raise HTTPException(status_code=400, detail="No query provided")
        
    try:
        response_text = generate_companion_response(request.query, request.context)
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Error generating companion response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate companion response")

@router.post("/copilot")
def get_copilot_response(request: CompanionRequest = Body(...)):
    if not request.query:
        raise HTTPException(status_code=400, detail="No query provided")
        
    try:
        response_text = generate_copilot_response(request.query, request.context)
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Error generating copilot response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate copilot response")

@router.get("/debug/gemini")
def debug_gemini():
    from app.services.gemini_service import _get_valid_model
    from google import genai
    from app.core.config import settings
    import traceback
    
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key or not api_key.strip():
            return {"success": False, "error": "GEMINI_API_KEY is empty or missing"}
            
        client = genai.Client(api_key=api_key.strip())
        model_name = _get_valid_model(client)
        
        response = client.models.generate_content(
            model=model_name,
            contents="Reply with OK"
        )
        return {
            "success": True,
            "model": model_name,
            "response": response.text,
            "api_key_prefix": api_key[:5] + "..." if api_key else None
        }
    except Exception as e:
        return {
            "success": False,
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc()
        }
