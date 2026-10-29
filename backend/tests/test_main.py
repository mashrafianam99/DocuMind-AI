
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_empty_question_is_rejected():
    response = client.post(
        "/api/chat",
        json={"question": ""},
    )

    assert response.status_code == 422



def test_missing_api_key(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = client.post(
        "/api/chat",
        json={
            "question": "What is AI?",
            "document_id": "be70bf5b-1098-4293-87d2-4877fa483000",
        },
    )

    assert response.status_code == 503

