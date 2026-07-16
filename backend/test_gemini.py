import asyncio
from app.services.gemini_service import generate_companion_response

async def main():
    try:
        response = generate_companion_response("Where is the bathroom?", context="")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
